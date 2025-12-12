# Repository Guidelines

## Project Structure & Module Organization
- `src/main.tsx` mounts the app; `src/App.tsx` wires providers (Language, React Query, Router).
- Feature code lives under `src/pages` (routes) and `src/components` (`quiz` domain widgets, `ui` shadcn primitives).
- Shared utilities: `src/hooks`, `src/lib`, `src/types`; localization in `src/i18n`.
- Static assets sit in `public/`; Vite config in `vite.config.ts`; Tailwind in `tailwind.config.ts`.
- Supabase project files are under `supabase/` (config and migrations).

## Build, Test, and Development Commands
- `npm run dev` (or `bun dev`): start Vite dev server with HMR.
- `npm run build`: production build output to `dist/`.
- `npm run build:dev`: dev-mode build useful for quicker bundle checks.
- `npm run preview`: serve the built `dist/` locally to verify prod output.
- `npm run lint`: run ESLint across the repo.
_Note: no automated test script is defined yet._

## Coding Style & Naming Conventions
- TypeScript + React 18; prefer function components with hooks.
- Path alias `@/*` resolves to `src/*`.
- Styling uses Tailwind; follow utility-first classes and keep component-specific styles close to the component.
- ESLint config in `eslint.config.js`; run `npm run lint` before PRs.
- Names: components PascalCase, hooks use `useX`, files match default export (e.g., `LanguageContext.tsx`).
- UI theme: Kuromi pastel-goth arcade. See `STYLEGUIDE.md` for palette, button styles (`.arcade-round`, `.stroke-text`), and layout utilities (`.kuromi-grid`, `.kuromi-spotlight`).

## Testing Guidelines
- No test harness is present; when adding tests, use Vitest + React Testing Library for components.
- Co-locate tests as `<name>.test.tsx` near the file or in `__tests__/`.
- Aim to cover rendering of quiz flows, i18n text selection, and API/query behaviors.

## Commit & Pull Request Guidelines
- Commits: concise imperative subject (≤72 chars), e.g., `Add population question metrics`; group related changes.
- PRs should include: brief summary, linked issue (if any), screenshots/GIFs for UI changes, and steps to reproduce or verify.
- Keep diffs small and focused; note any config or schema changes (e.g., Supabase migrations).
- Ensure the app still runs with `npm run dev` and lints cleanly before requesting review.

## Security & Configuration Tips
- Do not commit secrets; use environment variables for API keys and Supabase credentials.
- Verify any new external calls route through approved clients (e.g., `@supabase/supabase-js`).
- When adding i18n text, update `src/i18n/translations.ts` and ensure components remain wrapped in `LanguageProvider`.
