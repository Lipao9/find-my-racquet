import type { Answers } from "./answers";
import type { Racket } from "./catalog";

const MAX_CANDIDATES = 25;
const MIN_BEFORE_RELAX = 10;
const MAX_PER_BRAND = 2;

export class InsufficientCandidatesError extends Error {
  constructor() {
    super("Prefilter found fewer than 3 candidate rackets");
    this.name = "InsufficientCandidatesError";
  }
}

type HardFilter = {
  name: string;
  relaxable: boolean;
  test: (r: Racket, a: Answers) => boolean;
};

const BUDGET_CAPS: Record<string, number> = {
  "under-150": 150,
  "150-250": 250,
};

const WEIGHT_BANDS: Record<string, [number, number]> = {
  light: [0, 290],
  medium: [285, 310],
  heavy: [305, Infinity],
};

const SKILL_BANDS: Record<string, [number, number]> = {
  beginner: [0, 300],
  intermediate: [285, 315],
  advanced: [295, Infinity],
  competitive: [295, Infinity],
};

// Ordered: the LAST relaxable filter is dropped first when candidates run low.
const HARD_FILTERS: HardFilter[] = [
  {
    name: "budget",
    relaxable: false,
    test: (r, a) => {
      const cap = BUDGET_CAPS[a.budget];
      return cap === undefined || r.priceUSD <= cap;
    },
  },
  {
    name: "armInjury",
    relaxable: false,
    test: (r, a) =>
      a.armInjury !== "current" ||
      (r.stiffnessRA !== null && r.stiffnessRA <= 65),
  },
  {
    name: "beginnerHeadSize",
    relaxable: true,
    test: (r, a) => a.skill !== "beginner" || r.headSizeIn2 >= 100,
  },
  {
    name: "skillWeight",
    relaxable: true,
    test: (r, a) => {
      const band = SKILL_BANDS[a.skill];
      if (!band) return true;
      return r.weightGrams >= band[0] && r.weightGrams <= band[1];
    },
  },
  {
    name: "weightPref",
    relaxable: true,
    test: (r, a) => {
      const band = WEIGHT_BANDS[a.weightPref];
      if (!band) return true; // no-preference
      return r.weightGrams >= band[0] && r.weightGrams <= band[1];
    },
  },
];

function score(r: Racket, a: Answers): number {
  let s = 0;
  const open = /16x1[89]/.test(r.stringPattern);
  const dense = /18x20|16x20/.test(r.stringPattern);

  // Keep relaxed-away hard constraints influencing the ranking.
  const weightBand = WEIGHT_BANDS[a.weightPref];
  if (weightBand && r.weightGrams >= weightBand[0] && r.weightGrams <= weightBand[1]) {
    s += 3;
  }
  const skillBand = SKILL_BANDS[a.skill];
  if (skillBand && r.weightGrams >= skillBand[0] && r.weightGrams <= skillBand[1]) {
    s += 2;
  }

  if (a.powerControl === "power") {
    if (r.headSizeIn2 >= 102) s += 2;
    if (open) s += 1;
    if (r.stiffnessRA !== null && r.stiffnessRA >= 67) s += 1;
  } else if (a.powerControl === "control") {
    if (r.headSizeIn2 <= 100) s += 2;
    if (dense) s += 1;
    if (r.stiffnessRA !== null && r.stiffnessRA <= 65) s += 1;
  }

  if (a.headSizePref === "midsize" && r.headSizeIn2 <= 98) s += 2;
  if (a.headSizePref === "midplus" && r.headSizeIn2 >= 99 && r.headSizeIn2 <= 102) s += 2;
  if (a.headSizePref === "oversize" && r.headSizeIn2 >= 104) s += 2;

  if (a.stringPattern === "open" && open) s += 2;
  if (a.stringPattern === "dense" && dense) s += 2;

  if (a.style === "baseline" && r.swingweight !== null && r.swingweight >= 320) s += 1;
  if (a.style === "serve-volley" && r.balancePoints !== null && r.balancePoints <= -5) s += 1;
  if (a.style === "counterpuncher" && r.weightGrams <= 315) s += 1;

  if (a.armInjury === "past" && r.stiffnessRA !== null && r.stiffnessRA <= 67) s += 2;

  return s;
}

function applyFilters(
  rackets: Racket[],
  answers: Answers,
  filters: HardFilter[],
): Racket[] {
  return rackets.filter((r) => filters.every((f) => f.test(r, answers)));
}

export function prefilter(answers: Answers, rackets: Racket[]): Racket[] {
  const filters = [...HARD_FILTERS];
  let survivors = applyFilters(rackets, answers, filters);

  // Relax the least important constraints until enough candidates remain.
  while (survivors.length < MIN_BEFORE_RELAX) {
    const idx = filters.map((f) => f.relaxable).lastIndexOf(true);
    if (idx === -1) break;
    filters.splice(idx, 1);
    survivors = applyFilters(rackets, answers, filters);
  }

  if (survivors.length < 3) {
    throw new InsufficientCandidatesError();
  }

  const ranked = survivors
    .map((r) => ({ r, s: score(r, answers) }))
    .sort((a, b) => b.s - a.s);

  // Cap per brand so the LLM sees variety.
  const perBrand = new Map<string, number>();
  const diverse: Racket[] = [];
  for (const { r } of ranked) {
    const count = perBrand.get(r.brand) ?? 0;
    if (count < MAX_PER_BRAND) {
      perBrand.set(r.brand, count + 1);
      diverse.push(r);
    }
    if (diverse.length >= MAX_CANDIDATES) break;
  }

  // If the brand cap cut below 3 (tiny catalogs), fall back to the raw ranking.
  return diverse.length >= 3 ? diverse : ranked.slice(0, MAX_CANDIDATES).map((x) => x.r);
}
