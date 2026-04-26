# AGENTS.md

## Environment

- Use Node 20 only: `package.json` sets `engines.node` to `>=20 <21`.
- Install with `npm ci`; do not use `npm install` for routine setup unless intentionally changing dependencies.

## Commands agents usually need

- Typecheck both Node and web projects: `npm run typecheck`.
- Build Node CLI/library output: `npm run build:node` -> `dist/`.
- Build web/report assets: `npm run build:web` -> `dist_web/`.
- Run all tests with coverage: `npm run test`.
- Run formatting check: `npm run format-check`.
- Focused parser regression test: `npx jest tests/parse/Parsers.test.ts --runInBand --verbose`.
- Generate local Telegram report after web+node builds: `node dist/lib/CLI.js -p telegram -i "IN/telegram_export_2026-04-18/result.json" -o OUT/report.html`.

## Build order and output gotchas

- Build `dist_web/` before using the Node CLI to generate reports; `generateReport()` loads `/report.html` from web assets.
- Webpack has three entries: `app`, `report`, `reportWorker`; production inlines report CSS and the report worker into `report.html`.
- Keep path aliases aligned across `tsconfig.json`, `webpack.config.js`, and Jest `moduleNameMapper` in `package.json`.
- `tsconfig.web.json` uses `skipLibCheck: true` to avoid third-party Popper/Tippy declaration failures during web typecheck.

## Architecture map

- Library entrypoints: `pipeline/index.ts` (`generateDatabase`, `generateReport`) and `lib/CLI.ts`.
- Parser layer: `pipeline/parse/*`; platform parsers live in `pipeline/parse/parsers/*` and emit `P*` interfaces from `pipeline/parse/Types.ts`.
- Processing layer: `pipeline/process/*`; `DatabaseBuilder` orchestrates parser events, message grouping, NLP, indexing, and final DB construction.
- Message storage is custom binary serialization in `pipeline/serialization/*`, compressed/encoded by `pipeline/compression/*`.
- Aggregation blocks live in `pipeline/aggregate/blocks/*` and must be registered in `pipeline/aggregate/Blocks.ts`.
- Report viewer UI is `report/*`; report block computation runs in `report/WorkerReport.ts`.
- Report-builder web UI is `app/*`; CLI generation is in `lib/CLI.ts`.

## Tests and coverage

- Tests live only in `tests/`, usually mirroring source structure.
- Current coverage targets `pipeline/**`, `lib/**`, and `assets/Plausible.ts`; React UI under `app/` and `report/` is not covered.
- When touching Telegram parsing, keep regression coverage for nested text entities, poll question text entities, and reactions.

## Private data and generated files

- Private chat exports belong in `IN/`; generated reports belong in `OUT/`.
- `.gitignore` ignores `IN/*` and `OUT/*` except `IN/README.md` and `OUT/README.md`.
- Never commit real chat exports or generated `OUT/report.html`; report HTML embeds sensitive message data.
- Do not paste private chat text into docs, tests, commits, or summaries; use synthetic Telegram JSON in tests.

## Workflow rules

- Before edits, branch switches, pulls, or rebases, run `git status --short --branch` and `git fetch --all --prune`.
- Do not start active work directly on `main`; one task should map to one branch.
- Prefer git worktrees for parallel or risky work, especially when the existing workspace is dirty.
- Do not mix unrelated local edits into the same branch, PR, or commit.
- Stop if staged changes include secrets, auth state, private chat data, generated reports, or unrelated runtime files.
- Treat `todo.md` as the in-repo operator surface; update it when task status or verification evidence changes.
