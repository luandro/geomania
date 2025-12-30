# Deployment Guide

This document explains how to deploy Geomania to GitHub Pages and Cloudflare Pages using the automated CI/CD pipeline.

## Overview

The CI/CD pipeline automatically:
- ✅ Runs quality gates (lint, typecheck, unit tests)
- ✅ Runs E2E tests with Playwright
- ✅ Builds the production bundle
- 🚀 Deploys to GitHub Pages (on main branch)
- 🚀 Deploys to Cloudflare Pages (on main branch)

## Prerequisites

### For GitHub Pages Deployment

1. **Enable GitHub Pages in repository settings:**
   - Go to: Settings → Pages
   - Source: GitHub Actions
   - No additional configuration needed

2. **Repository must have GitHub Pages enabled**
   - The workflow will automatically deploy on push to `main`

### For Cloudflare Pages Deployment

1. **Create a Cloudflare Pages project:**
   - Go to Cloudflare Dashboard → Pages
   - Create a new project named `geomania` (or update workflow with your project name)
   - You can create it manually or let the first deployment create it

2. **Add required GitHub secrets:**

   Go to: GitHub Repository → Settings → Secrets and variables → Actions

   Add these secrets:

   - `CLOUDFLARE_API_TOKEN`
     - Get from: Cloudflare Dashboard → My Profile → API Tokens
     - Create token with "Cloudflare Pages" permissions
     - Or use "Edit Cloudflare Workers" template

   - `CLOUDFLARE_ACCOUNT_ID`
     - Get from: Cloudflare Dashboard → Pages (URL contains your account ID)
     - Or go to: Workers & Pages → Account ID

## Deployment URLs

After successful deployment, your app will be available at:

- **GitHub Pages**: `https://<username>.github.io/geomania/`
- **Cloudflare Pages**: `https://geomania.pages.dev` (or your custom domain)

## CI/CD Pipeline

### On Pull Requests

When you open a PR, the pipeline will:
1. Run quality gates (lint, typecheck, unit tests)
2. Run E2E tests (Playwright)
3. ❌ Block merge if any check fails
4. ✅ No deployment (only validation)

### On Push to Main

When you push to `main` branch:
1. Run all quality gates
2. Run all E2E tests
3. Build production bundle
4. Deploy to GitHub Pages
5. Deploy to Cloudflare Pages

## Manual Deployment

### Local Build

```bash
# Build for GitHub Pages
VITE_BASE_PATH=/geomania/ npm run build

# Build for Cloudflare Pages (root path)
npm run build

# Preview the build locally
npm run preview
```

### Manual Deploy to Cloudflare

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy manually
npm run build
wrangler pages deploy dist --project-name=geomania
```

## Testing the Pipeline

### Test Locally Before Pushing

```bash
# Run all checks that CI will run
npm run lint
npm run typecheck
npm run test:run
npm run test:e2e:chromium
```

### Test E2E in Different Browsers

```bash
# Install all browsers
npm run playwright:install

# Run in all browsers
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run with browser visible
npm run test:e2e:headed
```

## Troubleshooting

### GitHub Pages 404 Error

If you get 404 errors on GitHub Pages:
- Ensure `VITE_BASE_PATH` matches your repository name
- Check that GitHub Pages is enabled in repository settings
- Wait a few minutes for deployment to complete

### Cloudflare Deployment Fails

If Cloudflare deployment fails:
- Verify `CLOUDFLARE_API_TOKEN` has correct permissions
- Verify `CLOUDFLARE_ACCOUNT_ID` is correct
- Check that project name in workflow matches Cloudflare Pages project

### E2E Tests Failing

If E2E tests fail in CI but pass locally:
- Check Playwright report artifact in GitHub Actions
- Tests run only in Chromium in CI (faster)
- Increase timeout for slower CI environment if needed

### Build Fails

If build fails:
- Check that all scripts (prebuild) complete successfully
- Verify all dependencies are in `package.json`
- Check build logs in GitHub Actions

## Environment Variables

The following environment variables are used:

- `VITE_BASE_PATH`: Base path for the app (set in CI for GitHub Pages)
- `VITE_DISABLE_PWA`: Set to `"true"` to disable PWA features
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token (GitHub secret)
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID (GitHub secret)

## Custom Domain

### GitHub Pages Custom Domain

1. Go to: Settings → Pages → Custom domain
2. Add your domain (e.g., `geomania.example.com`)
3. Update DNS records as instructed
4. Update `VITE_BASE_PATH` in workflow to `/`

### Cloudflare Pages Custom Domain

1. Go to: Cloudflare Pages → Your Project → Custom domains
2. Add your domain
3. Cloudflare will automatically configure DNS

## Monitoring Deployments

- **GitHub Actions**: Check workflow runs in the Actions tab
- **GitHub Pages**: Settings → Pages shows deployment status
- **Cloudflare Pages**: Dashboard shows deployment history and logs

## Rollback

### GitHub Pages Rollback

GitHub Pages keeps deployment history. To rollback:
1. Find the successful workflow run you want to restore
2. Re-run the deployment job
3. Or revert the commit and push to `main`

### Cloudflare Pages Rollback

1. Go to Cloudflare Pages → Your Project → Deployments
2. Find the deployment you want to restore
3. Click "Rollback to this deployment"

## Additional Notes

- Deployments happen only on `main` branch pushes
- PR checks run on every PR but don't deploy
- GitHub Pages and Cloudflare Pages are built separately with different `VITE_BASE_PATH` values
- E2E tests must pass before deployment
- Failed deployments don't affect the current live site
