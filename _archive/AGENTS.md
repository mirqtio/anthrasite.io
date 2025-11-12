# Repository Guidelines

## Core Orientation

- Treat `SYSTEM.md`, `METHOD.md`, and `docs/adr/` as the single source of truth; reconcile conflicts in code by updating those records first.
- `SCRATCHPAD.md` captures the current working plan. Confirm the active issue in Plane before coding, then append progress notes there.
- `ISSUES.md` is a generated snapshot—read for context, never mutate manually.
- Legacy assets live in `/_archive`; do not resurrect files without documenting the rationale in an ADR or `SYSTEM.md`.

## Project Structure & Module Organization

- Runtime code follows the stack described in `SYSTEM.md`: Next.js App Router in `app/`, reusable React in `components/`, domain services in `lib/`, data models in `prisma/`.
- End-to-end and visual tests reside in `e2e/` and `visual-tests/`; keep helpers under `e2e/_utils`.
- Documentation lives in `docs/` (ADRs, runbooks) and root-level reports. Consolidate new guides under `docs/` unless they replace canonical files.

## Build, Test, and Development Commands

- Install Node `20.16.0`, pnpm `9`, and Postgres (see `docker-compose.*.yml` defaults).
- `pnpm dev` starts Next.js on port 3333; set `DATABASE_URL` or `USE_FALLBACK_STORAGE=true`.
- `pnpm build` runs Prisma codegen plus `next build`; pair with `pnpm start` for production smoke tests.
- Quality gates: `pnpm check:all` (typecheck + lint + unit), `pnpm test:e2e[:ci]`, `pnpm test:visual[:update]`, `pnpm test:coverage` before large refactors.
- Follow ADR-P10: treat red CI as stop signal and quarantine flaky tests instead of rerunning.

## Coding Style & Naming Conventions

- Use TypeScript everywhere (`.tsx` for React, `.ts` for utilities). Align with Prettier defaults (`pnpm format`) and Next.js ESLint config (`pnpm lint`).
- Apply modal and dynamic rendering patterns from ADR-P08/P09; add `export const dynamic = 'force-dynamic'` when routes use runtime data.
- Components use PascalCase, hooks/utilities camelCase, route segments kebab-case. Keep Tailwind tokens in `tailwind.config.ts`.

## Testing Guidelines

- Mirror source filenames for Jest specs in `components/**/__tests__` or `tests/`; rely on React Testing Library and `@testing-library/jest-dom`.
- Playwright helpers belong in `e2e/_utils/ui.ts`; update shared navigation utilities before duplicating flows.
- For CI parity, run `pnpm test:e2e:local-ci`; capture failures in `CI_logs/` and summarize learnings in `SCRATCHPAD.md`.

## Commit & Pull Request Guidelines

- Use Conventional Commits (`fix(ci): …`, `feat(waitlist): …`). Each issue should map to focused commits with regenerated artifacts (Prisma, Playwright reports) included.
- PR descriptions must reference the Plane issue, list validation commands, and attach screenshots or visual diffs for UI changes.
- After merge, update `SYSTEM.md`, relevant ADRs, and regenerate any dashboards before closing the Plane ticket.
