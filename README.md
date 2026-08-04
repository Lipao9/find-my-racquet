# Find My Racquet

Quiz bilíngue (pt-BR/en) para tenistas: responda 12 perguntas e receba 3 raquetes recomendadas pelo Claude, com justificativas no seu idioma.

## Como funciona

1. O quiz codifica suas respostas na URL (`/results?skill=...`) — o link do resultado é compartilhável, nada é persistido.
2. `src/lib/prefilter.ts` reduz o catálogo (`data/rackets.json`) a ~25 candidatas por regras (orçamento, nível, peso, lesão no braço).
3. `/api/recommend` envia perfil + candidatas para o **Claude Haiku 4.5**, que escolhe 3 e justifica (tool use estrito; IDs validados server-side com retry corretivo).

## Rodando

```bash
npm install
cp .env.example .env.local   # preencha ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

Sem `ANTHROPIC_API_KEY`, a API retorna 502 e a UI mostra o estado de erro.

## Catálogo / Scraper

`data/rackets.json` é versionado no git. Para atualizá-lo a partir do Tennis Warehouse:

```bash
npm run scrape -- --limit 5   # teste: imprime sem escrever
npm run scrape                # run completo: substitui o arquivo atomicamente (mínimo 40 raquetes)
```

Playwright é devDependency — não entra no bundle da Vercel. Seletores/URLs do site ficam no const `SELECTORS` em `scripts/scrape.ts`.

## Deploy (Vercel)

1. Importe o repo na Vercel.
2. Configure `ANTHROPIC_API_KEY` nas env vars do projeto.
3. `git push` — build automático.

## Stack

Next.js (App Router) + TypeScript · Tailwind + shadcn/ui (Base UI) · next-intl (`/[locale]/`, pt-BR default) · zod · @anthropic-ai/sdk · Playwright (scraper offline)
