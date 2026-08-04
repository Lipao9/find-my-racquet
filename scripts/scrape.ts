/**
 * Tennis Warehouse racquet scraper.
 *
 * Usage:
 *   npm run scrape                 # full run, atomically replaces data/rackets.json
 *   npm run scrape -- --limit 5    # scrape only 5 products, print instead of write
 *   npm run scrape -- --headful    # visible browser for debugging
 */
import fs from "node:fs";
import path from "node:path";
import { chromium, type Page } from "playwright";
import { racketSchema, type Racket } from "../src/lib/catalog";

// All site-specific bits live here for easy patching when TW changes markup.
const SELECTORS = {
  listingUrls: [
    "https://www.tennis-warehouse.com/catpage-BABRACS.html",
    "https://www.tennis-warehouse.com/catpage-WILSONRACS.html",
    "https://www.tennis-warehouse.com/catpage-HEADRACS.html",
    "https://www.tennis-warehouse.com/catpage-YONEXRACS.html",
    "https://www.tennis-warehouse.com/catpage-PRINCERACS.html",
    "https://www.tennis-warehouse.com/catpage-TECRACS.html",
    "https://www.tennis-warehouse.com/catpage-DUNLOPRACS.html",
    "https://www.tennis-warehouse.com/catpage-VOLKLRACS.html",
  ],
  productLink: 'a[href*="descpageRC"]',
  title: "h1",
  productImage: 'img[src*="img.tennis-warehouse.com"]',
  price: "[itemprop=price]",
  specsMarker: /Head Size:/i,
  // bundles and kids' frames are not quiz material
  excludeTitle: /2-pack|junior|\bjr\b|mini/i,
};

const MIN_COUNT = 40; // never overwrite the catalog with fewer rackets than this
const OUT_FILE = path.join(__dirname, "..", "data", "rackets.json");

const args = process.argv.slice(2);
const limitArg = args.indexOf("--limit");
const LIMIT = limitArg !== -1 ? Number(args[limitArg + 1]) : Infinity;
const HEADFUL = args.includes("--headful");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const politeDelay = () => sleep(1500 + Math.random() * 1000);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ouncesToGrams(oz: number): number {
  return Math.round(oz * 28.3495);
}

/** "4 pts HL" → -4, "2 pts HH" → 2, "Even" → 0 */
function parseBalancePoints(balance: string): number | null {
  if (/even/i.test(balance)) return 0;
  const m = balance.match(/([\d.]+)\s*pts?\s*(HL|HH)/i);
  if (!m) return null;
  const pts = Number(m[1]);
  return m[2].toUpperCase() === "HL" ? -pts : pts;
}

interface ParsedSpecs {
  headSizeIn2: number | null;
  weightGrams: number | null;
  balance: string;
  swingweight: number | null;
  stiffnessRA: number | null;
  stringPattern: string;
  priceUSD: number | null;
}

/** Regex over the page's visible text — survives most markup reshuffles. */
function parseSpecs(text: string): ParsedSpecs {
  const num = (re: RegExp): number | null => {
    const m = text.match(re);
    return m ? Number(m[1]) : null;
  };

  // e.g. "Head Size: 100 in² / 645.16 cm²"
  const headSizeIn2 = num(/Head Size:\s*([\d.]+)\s*(?:in²|sq\.?\s*in)/i);
  // e.g. "Strung Weight: 11.2oz / 318g" — prefer the grams figure
  const strungGrams = num(/Strung Weight:\s*[\d.]+\s*oz\s*\/\s*([\d.]+)\s*g/i);
  const strungOz = num(/Strung Weight:\s*([\d.]+)\s*oz/i);
  // e.g. "Balance: 12.79in / 32.49cm / 6 pts HL"
  const balanceMatch = text.match(/([\d.]+\s*pts?\s*(?:HL|HH))/i);
  const swingweight = num(/Swingweight:\s*([\d.]+)/i);
  const stiffnessRA = num(/Stiffness:\s*([\d.]+)/i);
  // e.g. "String Pattern:\n\n16 Mains / 19 Crosses"
  const patternMatch = text.match(
    /String Pattern:\s*(\d+)\s*Mains?\s*\/\s*(\d+)/i,
  );
  // fallback only — the itemprop=price element is preferred (see scrapeProduct)
  const priceUSD = num(/\$\s*([\d,]+\.\d{2})/);

  return {
    headSizeIn2,
    weightGrams:
      strungGrams ?? (strungOz !== null ? ouncesToGrams(strungOz) : null),
    balance: balanceMatch
      ? balanceMatch[1].trim()
      : /Balance:.*Even/i.test(text)
        ? "Even"
        : "",
    swingweight,
    stiffnessRA,
    stringPattern: patternMatch
      ? `${patternMatch[1]}x${patternMatch[2]}`
      : "",
    priceUSD,
  };
}

const KNOWN_BRANDS = [
  "Babolat",
  "Wilson",
  "Head",
  "Yonex",
  "Prince",
  "Tecnifibre",
  "Dunlop",
  "ProKennex",
  "Volkl",
  "Solinco",
];

function splitBrandModel(title: string): { brand: string; model: string } {
  for (const brand of KNOWN_BRANDS) {
    if (title.toLowerCase().startsWith(brand.toLowerCase())) {
      return { brand, model: title.slice(brand.length).trim() };
    }
  }
  const [brand, ...rest] = title.split(" ");
  return { brand, model: rest.join(" ") };
}

async function scrapeProduct(page: Page, url: string): Promise<Racket | null> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

  // The spec block renders after initial load — wait for it to appear.
  await page
    .waitForFunction(
      (marker) => new RegExp(marker, "i").test(document.body.innerText),
      SELECTORS.specsMarker.source,
      { timeout: 10000 },
    )
    .catch(() => {}); // parseSpecs will fail loudly if it truly never loaded

  const title = (await page.locator(SELECTORS.title).first().textContent())
    ?.trim()
    ?.replace(/\s+Racquets?$/i, "");
  if (!title) throw new Error("no title");
  if (SELECTORS.excludeTitle.test(title)) return null;

  const bodyText = (await page.locator("body").innerText()) ?? "";
  const specs = parseSpecs(bodyText);
  const itempropPrice = await page
    .locator(SELECTORS.price)
    .first()
    .getAttribute("content")
    .catch(() => null);
  if (itempropPrice && Number(itempropPrice) > 0) {
    specs.priceUSD = Number(itempropPrice);
  }
  const imageUrl =
    (await page
      .locator(SELECTORS.productImage)
      .first()
      .getAttribute("src")
      .catch(() => null)) ?? "";

  const { brand, model } = splitBrandModel(title);

  const candidate = {
    id: slugify(`${brand} ${model}`),
    brand,
    model,
    headSizeIn2: specs.headSizeIn2,
    weightGrams: specs.weightGrams,
    balance: specs.balance,
    balancePoints: specs.balance ? parseBalancePoints(specs.balance) : null,
    stiffnessRA: specs.stiffnessRA,
    stringPattern: specs.stringPattern,
    swingweight: specs.swingweight,
    priceUSD: specs.priceUSD,
    imageUrl,
    productUrl: url,
  };

  const parsed = racketSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new Error(
      `spec validation failed: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`,
    );
  }
  return parsed.data;
}

async function main() {
  const browser = await chromium.launch({ headless: !HEADFUL });
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    viewport: { width: 1280, height: 900 },
  });

  // 1. Collect product URLs from brand listing pages.
  const productUrls = new Set<string>();
  for (const listing of SELECTORS.listingUrls) {
    try {
      await page.goto(listing, { waitUntil: "domcontentloaded", timeout: 30000 });
      const hrefs = await page
        .locator(SELECTORS.productLink)
        .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
      for (const href of hrefs) {
        productUrls.add(href.split("?")[0].split("#")[0]);
      }
      console.log(`${listing} → ${hrefs.length} links (total ${productUrls.size})`);
    } catch (error) {
      console.warn(`listing failed: ${listing}: ${(error as Error).message}`);
    }
    await politeDelay();
  }

  // 2. Scrape each product page.
  const rackets: Racket[] = [];
  const seen = new Set<string>();
  const failures: { url: string; reason: string }[] = [];
  const urls = [...productUrls].slice(0, LIMIT);

  for (const [i, url] of urls.entries()) {
    try {
      let racket: Racket | null = null;
      try {
        racket = await scrapeProduct(page, url);
      } catch {
        await sleep(3000); // one retry with backoff
        racket = await scrapeProduct(page, url);
      }
      if (racket && !seen.has(racket.id)) {
        seen.add(racket.id);
        rackets.push(racket);
        console.log(`[${i + 1}/${urls.length}] ✓ ${racket.id}`);
      }
    } catch (error) {
      failures.push({ url, reason: (error as Error).message });
      console.warn(`[${i + 1}/${urls.length}] ✗ ${url}: ${(error as Error).message}`);
    }
    await politeDelay();
  }

  await browser.close();

  console.log(`\nScraped ${rackets.length} rackets, ${failures.length} failures.`);

  // 3. Write atomically, only when the run looks healthy.
  if (LIMIT !== Infinity) {
    console.log("--limit set: printing instead of writing.\n");
    console.log(JSON.stringify(rackets, null, 2));
    return;
  }
  if (rackets.length < MIN_COUNT) {
    console.error(
      `Refusing to write: only ${rackets.length} rackets (< ${MIN_COUNT}). Existing catalog untouched.`,
    );
    process.exit(1);
  }

  const previous = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
  const output = {
    version: (previous.version ?? 0) + 1,
    updatedAt: new Date().toISOString(),
    source: "tennis-warehouse",
    rackets,
  };
  const tmp = `${OUT_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(output, null, 2) + "\n");
  fs.renameSync(tmp, OUT_FILE);
  console.log(
    `Wrote ${OUT_FILE}: ${rackets.length} rackets (was ${previous.rackets?.length ?? 0}).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
