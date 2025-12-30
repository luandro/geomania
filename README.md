# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Leaderboards API

Set `VITE_LEADERBOARD_ENDPOINT` (or `VITE_LEADERBOARD_API`) to override the leaderboard API route.
Default is `/api/scores`. Example: `VITE_LEADERBOARD_ENDPOINT=https://geomania-leaderboards.pages.dev/api/scores`

## Country data

All country-related data (base fields + localizations + enrichments) lives in `src/data/countries.ts`.

- Update/regenerate the dataset: `npm run update:countries`
- Also refresh local flag assets (fallback downloads): `npm run update:countries -- --download-flags`

### Flags

- **Shipped flags (public):** `public/flags/` must contain only hashed filenames like `<12hex>.svg` (these are copied to `dist/flags/` on build).
- **Source material (non-public):** ISO2 SVGs live in `scripts/assets/flags-iso2/` (e.g. `US.svg`, `gb-eng.svg`, `xk.svg`) and are used by the generator to populate missing hashed outputs.
- **Verification:** `npm run verify:public-flags` and `npm run verify:dist-flags`

Optional:
- Set `COUNTRY_DATA_USER_AGENT` when running the updater (Wikidata Query Service etiquette).

Data sources used by the updater script:
- REST Countries (base country fields + translations)
- World Bank API (economics like GDP)
- Wikidata SPARQL (politics/culture enrichments)

## CI/CD Pipeline

This project uses GitHub Actions for automated testing and deployment.

### Automated Checks (runs on every PR and push to main)

- ✅ **ESLint** - Code quality and style checks
- ✅ **TypeScript** - Type checking
- ✅ **Vitest** - Unit tests
- ✅ **Playwright** - E2E tests (Chromium in CI)

### Automated Deployments (only on push to main)

- 🚀 **GitHub Pages** - `https://<username>.github.io/geomania/` (enabled by default)
- 🚀 **Cloudflare Pages** - `https://geomania.pages.dev` (optional, requires setup)
- ✅ Deployments are gated by CI checks and run from the same workflow
- 📦 Playwright HTML reports are uploaded as CI artifacts for debugging

> **Note**: Cloudflare Pages deployment is disabled by default. See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) to enable it.

### Running Tests Locally

```bash
# Unit tests
npm run test          # Watch mode
npm run test:run      # Run once

# E2E tests (uses production build via `vite preview` on an auto-selected port)
npm run test:e2e              # Run all E2E tests
npm run test:e2e:ui           # Interactive UI mode
npm run test:e2e:headed       # Run with visible browser
npm run test:e2e:chromium     # Run in Chromium only (faster)

# Install Playwright browsers (first time only)
npm run playwright:install
```

### Quality Gates

All PRs must pass:
- Lint checks
- Type checking
- Unit tests
- E2E tests

Failed checks will block PR merging.

### Deployment Setup

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment configuration and troubleshooting.

**Quick setup (GitHub Pages only):**
1. Enable GitHub Pages in repository settings (Source: GitHub Actions)
2. That's it! GitHub Pages deployment works out of the box

**Optional (Cloudflare Pages):**
To enable dual deployment to Cloudflare Pages, see [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for setup instructions.

## How can I deploy this project?

### Via Lovable

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share → Publish.

### Via GitHub Actions (Automated)

The CI/CD pipeline automatically deploys to GitHub Pages and Cloudflare Pages when you push to `main`.

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for setup instructions.

**Important for CI/CD builds:**
- The build process automatically generates required runtime assets via the `prebuild` script:
  - `public/data/countries.json` and `public/data/data-version.json` (from `npm run export:countries-json`)
  - PWA icons in `public/icons/` (from `npm run generate:pwa-icons`)
  - PWA manifest at `public/manifest.webmanifest` (generated by vite-plugin-pwa)
- These files are gitignored and must be generated during the build process
- No additional CI configuration needed—`npm run build` handles everything

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
