# Cloudflare Pages Setup Instructions

This guide walks you through deploying geomania.lol to Cloudflare Pages using GitHub Actions.

## Prerequisites

- Cloudflare account
- Domain `geomania.lol` added to Cloudflare
- GitHub repository access

## Step 1: Get Cloudflare Credentials

### 1.1 Get Account ID

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click on your domain `geomania.lol`
3. Scroll down on the Overview page - you'll see **Account ID** on the right sidebar
4. Copy this ID (format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### 1.2 Create API Token

1. Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use **Edit Cloudflare Workers** template or create custom token
4. For custom token, set these permissions:
   - **Account** → **Cloudflare Pages** → **Edit**
5. Continue to summary and create token
6. **IMPORTANT**: Copy the token immediately - you won't see it again!

## Step 2: Add Secrets to GitHub

1. Go to your GitHub repository: `https://github.com/luandro/geomania`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add two secrets:

   **Secret 1:**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: (paste the API token from Step 1.2)

   **Secret 2:**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: (paste the Account ID from Step 1.1)

## Step 3: Create Cloudflare Pages Project

### Option A: Via Cloudflare Dashboard (Recommended First Time)

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Click **Create a project**
3. Click **Connect to Git**
4. Select **GitHub** and authorize Cloudflare
5. Select repository: `luandro/geomania`
6. Configure build settings:
   - **Project name**: `geomania` (MUST match the name in workflow file)
   - **Production branch**: `main`
   - **Framework preset**: None (we're using GitHub Actions)
   - **Build command**: Leave empty (GitHub Actions handles this)
   - **Build output directory**: Leave empty
7. Click **Save and Deploy**
8. **IMPORTANT**: Cancel the first build - we'll use GitHub Actions instead

### Option B: Let GitHub Actions Create It (Alternative)

If you prefer, you can skip the dashboard setup. When you push to `main`, the GitHub Actions workflow will automatically create the Pages project on first run.

## Step 4: Configure Custom Domain

1. In Cloudflare Pages, go to your `geomania` project
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter: `geomania.lol`
5. Cloudflare will automatically configure DNS records
6. Wait for DNS propagation (usually instant, can take up to 24h)
7. SSL/TLS certificate will be provisioned automatically

## Step 5: Commit and Push

Now that secrets are set up, commit the new files:

```bash
git add .github/workflows/cloudflare-pages.yml public/_redirects public/_headers
git commit -m "Add Cloudflare Pages deployment"
git push origin main
```

## Step 6: Verify Deployment

### Check GitHub Actions

1. Go to **Actions** tab in GitHub
2. You should see two workflows running:
   - ✅ **Deploy to Cloudflare Pages** (new)
   - ✅ **Deploy to GitHub Pages** (existing)
3. Both should complete successfully

### Check Cloudflare Pages

1. Go to your [Cloudflare Pages project](https://dash.cloudflare.com/?to=/:account/pages)
2. Click on `geomania` project
3. You should see the deployment in progress/completed
4. Click **View deployment** to see your site

### Test Both Deployments

1. **Cloudflare Pages**: Visit `https://geomania.lol/`
   - ✅ Root path URLs (e.g., `/quiz`)
   - ✅ All routes work with direct access
   - ✅ Refresh on any route works
   - ✅ Assets load correctly

2. **GitHub Pages**: Visit `https://luandro.github.io/geomania/`
   - ✅ Base path URLs (e.g., `/geomania/quiz`)
   - ✅ Continues working as before
   - ✅ All features work

## Troubleshooting

### Workflow fails with "Unauthorized"
- Check that `CLOUDFLARE_API_TOKEN` is set correctly in GitHub secrets
- Verify API token has correct permissions (Cloudflare Pages Edit)
- Token may have expired - create a new one

### Workflow fails with "Account not found"
- Check that `CLOUDFLARE_ACCOUNT_ID` is correct
- Make sure there are no extra spaces in the secret value

### Pages project not found
- Project name in workflow MUST match Cloudflare Pages project name
- Default is `geomania` - if you used a different name, update line 44 in workflow:
  ```yaml
  command: pages deploy dist --project-name=YOUR_PROJECT_NAME
  ```

### DNS not resolving
- Check DNS records in Cloudflare DNS dashboard
- For `geomania.lol`, you should see:
  - CNAME record pointing to Cloudflare Pages
  - Wait up to 24h for propagation (usually much faster)

### SPA routing not working (404 on refresh)
- Verify `public/_redirects` file exists
- Content should be: `/* /index.html 200`
- This file must be in the `dist/` folder after build

### Assets not loading
- Check browser console for errors
- Verify base path is `/` for Cloudflare deployment
- Check `_headers` file for CORS/CSP issues

## Architecture Overview

### Dual Deployment Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Push to main                   │
└────────────────┬───────────────────────┬────────────────┘
                 │                       │
        ┌────────▼─────────┐    ┌───────▼────────┐
        │ GitHub Actions   │    │ GitHub Actions  │
        │ (Cloudflare)     │    │ (GitHub Pages)  │
        └────────┬─────────┘    └───────┬────────┘
                 │                       │
        VITE_BASE_PATH: /      VITE_BASE_PATH: /geomania/
                 │                       │
        ┌────────▼─────────┐    ┌───────▼────────┐
        │ Cloudflare Pages │    │ GitHub Pages    │
        │ geomania.lol     │    │ *.github.io     │
        └──────────────────┘    └─────────────────┘
```

### File Structure

```
geomania/
├── .github/workflows/
│   ├── cloudflare-pages.yml    # New: Cloudflare deployment
│   ├── deploy.yml              # Existing: GitHub Pages
│   └── update-countries.yml    # Existing: Data updates
├── public/
│   ├── _redirects              # New: Cloudflare SPA routing
│   ├── _headers                # New: Cloudflare headers
│   └── ...                     # Existing assets
├── src/
│   └── App.tsx                 # Uses import.meta.env.BASE_URL
└── vite.config.ts              # Reads VITE_BASE_PATH env var
```

## Maintenance

### Updating Content

Both deployments trigger automatically on push to `main`:

```bash
git add .
git commit -m "Update content"
git push origin main
```

Within minutes, both sites will be updated:
- `geomania.lol` (Cloudflare Pages)
- `luandro.github.io/geomania` (GitHub Pages)

### Monitoring Deployments

- **Cloudflare**: Check [Pages Dashboard](https://dash.cloudflare.com/?to=/:account/pages)
- **GitHub**: Check [Actions tab](https://github.com/luandro/geomania/actions)
- **Logs**: Each workflow run shows detailed logs

### Rollback

If a deployment breaks:

1. **Cloudflare**: Dashboard → Pages → geomania → Deployments → Select previous deployment → Rollback
2. **GitHub**: Revert commit and push, or manually redeploy previous version

## Best Practices

1. **Always test locally first**: `npm run build && npm run preview`
2. **Check both deployments** after each push
3. **Monitor logs** for errors or warnings
4. **Keep secrets secure** - never commit them
5. **Update dependencies** regularly for security

## Support Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deployment](https://reactrouter.com/en/main/guides/spa)

---

## Quick Reference

### URLs

- **Production (Cloudflare)**: https://geomania.lol/
- **Staging (GitHub Pages)**: https://luandro.github.io/geomania/
- **Cloudflare Dashboard**: https://dash.cloudflare.com/?to=/:account/pages
- **GitHub Actions**: https://github.com/luandro/geomania/actions

### Key Files

- **Cloudflare Workflow**: `.github/workflows/cloudflare-pages.yml`
- **SPA Routing**: `public/_redirects`
- **Security Headers**: `public/_headers`
- **Vite Config**: `vite.config.ts`

### Environment Variables

- **Cloudflare Build**: `VITE_BASE_PATH=/`
- **GitHub Pages Build**: `VITE_BASE_PATH=/geomania/`
