# Tailwind CSS v3 → v4 Migration Plan

**Project**: Geomania
**Current Version**: Tailwind CSS v3.4.17
**Target Version**: Tailwind CSS v4.0+
**Date**: December 27, 2025

---

## Executive Summary

This migration plan outlines the strategy for upgrading Geomania from Tailwind CSS v3.4.17 to v4.0. The project has moderate complexity with 113 TypeScript/TSX files, custom theme configuration, and extensive use of custom utilities in `@layer` directives.

**Migration Complexity**: ⚠️ **Moderate-High**
**Estimated Time**: 4-6 hours
**Risk Level**: Medium (manageable with proper testing)
**Recommended Approach**: Automated tool + manual refinement

---

## Current State Analysis

### Dependencies & Configuration
- **Build Tool**: Vite 7.3.0
- **PostCSS**: v8.5.6 (currently using PostCSS plugin)
- **Tailwind Plugins**:
  - `tailwindcss-animate` v1.0.7
  - `@tailwindcss/typography` v0.5.19
- **Custom Config**: `tailwind.config.ts` with:
  - Dark mode: `["class"]`
  - Custom breakpoints (xs: 380px, 2xl: 1400px)
  - Custom font family (Poppins)
  - Extensive color system using HSL variables
  - Custom border radius variables
  - Custom animations (accordion-down, accordion-up)
  - Container customization (center: true, padding: "2rem")

### CSS Architecture
- **Main File**: `src/index.css` (579 lines)
- **Custom Layers**: Heavy use of `@layer base`, `@layer utilities`, `@layer components`
- **Custom Utilities**:
  - `.touch-target` - accessibility helper
  - `.quiz-gradient` - gradient backgrounds
  - `.quiz-card-shadow`, `.flag-shadow` - custom shadows
  - `.answer-btn-hover` - interactive states
  - `.arcade-*` classes - arcade-style buttons
  - `.kuromi-*` classes - Kuromi theme utilities
  - Custom animations (pulse-correct, pulse-incorrect, bounce-in, slide-up, fade-in, scale-in, letter-wave, level-icon-pulse)
- **@apply Usage**: Extensive use for applying Tailwind utilities in custom CSS

### Breaking Changes Impact Assessment

| Breaking Change | Occurrences | Impact | Effort |
|----------------|-------------|--------|--------|
| `@tailwind` → `@import` | 1 file | HIGH | Low |
| PostCSS plugin migration | 2 files | HIGH | Low |
| `outline-hidden` → `outline-hidden` | 43 instances in 25 files | MEDIUM | Medium |
| Space/divide selector changes | 32 instances | MEDIUM | Low |
| Custom utilities → `@utility` | ~15 classes | MEDIUM | Medium |
| Config → CSS-first | 100 lines | HIGH | High |
| Container config | 1 setting | MEDIUM | Low |
| Default border color | Implicit | LOW | Low |
| Ring width changes | Implicit | LOW | Low |

---

## Migration Strategy

### Phase 1: Preparation & Backup ⏱️ 30 min

**Steps:**
1. Create a dedicated migration branch
   ```bash
   git checkout -b feature/tailwind-v4-migration
   ```

2. Review and commit any pending changes
   ```bash
   git add .
   git commit -m "Pre-migration commit: Tailwind v3.4.17 baseline"
   ```

3. Verify current build works
   ```bash
   npm run build
   npm run preview
   ```

4. Check browser support requirements
   - Safari 16.4+
   - Chrome 111+
   - Firefox 128+
   - ✅ **Geomania targets modern browsers**, so this is acceptable

---

### Phase 2: Automated Migration ⏱️ 1 hour

**Use Official Upgrade Tool**

1. Run the automated upgrade tool
   ```bash
   npx @tailwindcss/upgrade
   ```

2. Review the generated changes
   - The tool will handle:
     - ✅ Updating dependencies
     - ✅ Migrating `@tailwind` directives to `@import`
     - ✅ Converting most config to CSS variables
     - ✅ Replacing deprecated utilities
     - ✅ Updating PostCSS configuration
     - ✅ Fixing most `outline-hidden` → `outline-hidden` occurrences

3. Test the build
   ```bash
   npm install
   npm run build
   npm run dev
   ```

**Expected Changes:**
- `package.json`: Updated dependencies
- `postcss.config.js`: Updated to use `@tailwindcss/postcss`
- `src/index.css`: Migrated to `@import "tailwindcss"` and `@theme` block
- `vite.config.ts`: May suggest using `@tailwindcss/vite` plugin

---

### Phase 3: Manual Adjustments - Configuration ⏱️ 1 hour

**3.1 Update PostCSS Configuration**

`postcss.config.js`:
```javascript
export default {
  plugins: {
    // Remove these (no longer needed):
    // "tailwindcss": {},
    // "autoprefixer": {},  // Now built-in

    // Add this:
    "@tailwindcss/postcss": {},
  },
};
```

**3.2 Migrate Configuration to CSS-First Approach**

Update `src/index.css`:

**Current** (`tailwind.config.ts`):
```typescript
export default {
  darkMode: ["class"],
  theme: {
    extend: {
      screens: {
        'xs': '380px',
        '2xl': '1400px',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      // ... colors, borderRadius, keyframes, animation
    },
  },
  plugins: [tailwindcssAnimate],
}
```

**New** (`src/index.css`):
```css
@import "tailwindcss";

@theme {
  /* Dark mode configuration */
  --default-color-scheme: light;

  /* Custom breakpoints */
  --breakpoint-xs: 380px;
  --breakpoint-2xl: 1400px;

  /* Custom font family */
  --font-sans: 'Poppins', 'system-ui', 'sans-serif';

  /* Colors - migrate from HSL var() references to OKLCH or keep HSL */
  --color-background: oklch(0.97 0.01 32);
  --color-foreground: oklch(0.12 0 0);
  --color-primary: oklch(0.54 0.22 328);
  /* ... all other color tokens */

  /* Border radius */
  --radius-lg: 1rem;
  --radius-md: calc(1rem - 2px);
  --radius-sm: calc(1rem - 4px);

  /* Animations */
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
}

/* Migrate custom keyframes */
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}
```

**3.3 Handle Container Configuration**

In v4, container customization requires a different approach:

```css
@utility container {
  margin-inline: auto;
  padding-inline: 2rem;
}

/* Or if you need the old center behavior specifically */
@utility container {
  margin-left: auto;
  margin-right: auto;
  padding-left: 2rem;
  padding-right: 2rem;
}
```

---

### Phase 4: Manual Adjustments - CSS & Utilities ⏱️ 1.5 hours

**4.1 Update Custom Utilities**

Migrate from `@layer utilities` to `@utility` directive:

**Current**:
```css
@layer utilities {
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
}
```

**New**:
```css
@utility touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

**4.2 Update @apply Usage**

No changes needed - `@apply` still works, but ensure theme variables are referenced correctly:

```css
/* Current */
@apply border-border;

/* New (v4) - still works, but uses CSS variables */
@apply border-color: hsl(var(--border));
```

**4.3 Fix Space/Divide Selectors (If Needed)**

The `space-y-*` and `space-x-*` utilities changed in v4:

**Old selector**: `> :not([hidden]) ~ :not([hidden])`
**New selector**: `> :not(:last-child)`

This typically doesn't require changes unless you're using inline elements or have specific edge cases. Review the 32 instances:
- `src/pages/Index.tsx:375`
- `src/pages/Scoreboards.tsx:140, 179, 200, 218`
- `src/components/quiz/ResultsScreen.tsx:341, 367`
- `src/components/quiz/CapitalQuestion.tsx:124`
- `src/components/quiz/FlagQuestion.tsx:120`
- And 23 more in UI components

**Action**: Test these visually during validation phase.

---

### Phase 5: Plugin Migration ⏱️ 30 min

**5.1 tailwindcss-animate Plugin**

This plugin is **fully compatible** with v4. Keep it in `package.json`:

```json
{
  "dependencies": {
    "tailwindcss-animate": "^1.0.7"
  }
}
```

However, the recommended approach in v4 is to define animations directly in your CSS:

```css
/* Instead of using the plugin, define animations in @theme */
@theme {
  --animate-fade-in: fade-in 0.3s ease-out;
  --animate-slide-up: slide-up 0.4s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

**Decision**: Keep `tailwindcss-animate` for now (it works), but consider migrating custom animations to CSS for better performance.

**5.2 @tailwindcss/typography Plugin**

Update to the v4-compatible version:

```bash
npm install @tailwindcss/typography@latest
```

The typography plugin now uses the `@plugin` directive:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

---

### Phase 6: Manual Code Updates ⏱️ 1.5 hours

**6.1 Replace `outline-hidden` with `outline-hidden`**

The upgrade tool should handle most of these, but verify all 43 instances:

**Find all occurrences**:
```bash
grep -r "outline-hidden" src/ --include="*.tsx" --include="*.ts"
```

**Manual replacement pattern**:
```tsx
// Before
className="focus:outline-hidden"

// After
className="focus:outline-hidden"
```

**Affected files**:
- `src/components/quiz/ResultsScreen.tsx`
- `src/components/ui/sidebar.tsx` (5 instances)
- `src/components/ui/hover-card.tsx`
- `src/components/ui/button-variants.ts`
- `src/components/ui/menubar.tsx` (5 instances)
- And 20 more UI components

**6.2 Review Ring Usage**

The default `ring-3` width changed from 3px to 1px:

```tsx
{/* If you were using ring without a width, add -3 */}
<button className="focus:ring-3 focus:ring-blue-500">
```

**6.3 Check Border Colors**

In v4, borders default to `currentColor` instead of `gray-200`:

```tsx
{/* Ensure all borders have explicit colors */}
<div className="border border-gray-200">
```

---

### Phase 7: Vite Plugin Optimization (Optional) ⏱️ 30 min

**For better performance**, consider migrating from PostCSS to the native Vite plugin:

**vite.config.ts**:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite"; // Add this

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add this before other plugins
    // ... rest of plugins
  ],
});
```

**If using Vite plugin**:
- Remove PostCSS configuration (or keep it as fallback)
- Update `src/index.css` to still use `@import "tailwindcss"`
- Better performance and faster HMR

---

## Testing & Validation Strategy

### Test Checklist

#### Build Verification ✅
- [ ] `npm run build` succeeds
- [ ] `npm run build:dev` succeeds
- [ ] No TypeScript errors
- [ ] No ESLint errors related to Tailwind
- [ ] Bundle size is reasonable (check for regressions)

#### Visual Regression Testing ✅
- [ ] Test all pages:
  - [ ] Index page
  - [ ] Scoreboards page
  - [ ] Quiz pages (Flag, Capital, Population)
  - [ ] Settings/Profile pages
- [ ] Test dark mode toggle
- [ ] Test responsive breakpoints (xs, sm, md, lg, xl, 2xl)
- [ ] Test all UI components:
  - [ ] Buttons (arcade-round, arcade-button)
  - [ ] Dialogs/Modals
  - [ ] Forms (inputs, selects, checkboxes)
  - [ ] Toasts/Alerts
  - [ ] Navigation components
  - [ ] Sidebar

#### Functionality Testing ✅
- [ ] Quiz flows work correctly
- [ ] Map integration (Leaflet) displays properly
- [ ] PWA functionality intact
- [ ] Animations trigger correctly
- [ ] Hover/focus states work
- [ ] Keyboard navigation works
- [ ] Screen readers still work (accessibility)

#### Performance Testing ✅
- [ ] Build time improved (should be 2-5x faster)
- [ ] HMR is faster in dev mode
- [ ] No layout shifts
- [ ] CSS bundle size is reasonable

### Browser Testing Matrix

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 111+ | ✅ Required | Primary target |
| Safari | 16.4+ | ✅ Required | Test on iOS/macOS |
| Firefox | 128+ | ✅ Required | Test on desktop |
| Edge | 111+ | ✅ Compatible | Chromium-based |

### Rollback Strategy

If critical issues arise:
1. Revert to backup branch
2. Document specific issues
3. Check for v4.1+ updates that may fix issues
4. Consider staying on v3.4 if blockers persist

```bash
# Rollback command
git checkout main
git branch -D feature/tailwind-v4-migration
```

---

## Risk Assessment

### High-Risk Areas 🔴
1. **Custom @layer utilities** → May need manual `@utility` conversion
2. **Complex animations** → Verify all custom keyframes work
3. **Leaflet map styles** → Test map controls and overlays
4. **Arcade/Kuromi theme** → Complex custom styles may break

### Medium-Risk Areas 🟡
1. **outline-none replacement** → 43 instances, auto-fix should handle most
2. **Space-between utilities** → May need visual inspection
3. **Dark mode** → Theme variable migration needs testing
4. **Typography plugin** → Ensure prose styles work

### Low-Risk Areas 🟢
1. **Basic utility classes** → Should work without changes
2. **Responsive utilities** → No breaking changes
3. **Color utilities** → New OKLCH palette is backward compatible

---

## Post-Migration Benefits

After successful migration, Geomania will gain:

### Performance Improvements ⚡
- **3.78x faster full builds** (378ms → 100ms)
- **8.8x faster incremental builds with CSS changes** (44ms → 5ms)
- **182x faster builds with no new CSS** (35ms → 0.192ms)
- Faster HMR in development

### Developer Experience ✨
- **CSS-first configuration** - No more JavaScript config for customizations
- **Automatic content detection** - No need to configure content paths
- **Built-in import support** - No extra PostCSS plugins needed
- **Modern CSS features** - Cascade layers, @property, color-mix()

### New Capabilities 🎨
- **Container queries** - Built-in (`@container`, `@sm`, `@lg`)
- **3D transforms** - New utilities (`rotate-x-*`, `scale-z-*`)
- **Enhanced gradients** - Radial, conic, interpolation modes
- **Dynamic utilities** - Use any value without configuration
- **Not-* variant** - Negate any variant
- **@starting-style** - Animate element appearance

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Preparation | 30 min | None |
| Phase 2: Automated Migration | 1 hour | Phase 1 |
| Phase 3: Manual Config Updates | 1 hour | Phase 2 |
| Phase 4: CSS & Utilities | 1.5 hours | Phase 3 |
| Phase 5: Plugin Migration | 30 min | Phase 3 |
| Phase 6: Code Updates | 1.5 hours | Phase 3 |
| Phase 7: Vite Plugin (Optional) | 30 min | Phase 6 |
| Testing & Validation | 2 hours | All phases |
| **Total** | **9 hours** | |

**Recommended**: Complete in 2-3 sessions to allow for testing between phases.

---

## Migration Command Reference

```bash
# Quick reference for key commands

# Start migration
git checkout -b feature/tailwind-v4-migration
npx @tailwindcss/upgrade

# Install dependencies
npm install

# Build and test
npm run build
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Search for remaining issues
grep -r "outline-hidden" src/
grep -r "bg-opacity-\|text-opacity-" src/
grep -r "@tailwind" src/

# View changes
git diff

# Commit successful migration
git add .
git commit -m "Migrate to Tailwind CSS v4"
```

---

## Additional Resources

- [Official Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [v4.0 Announcement](https://tailwindcss.com/blog/tailwindcss-v4)
- [Migration Guide on Dev.to](https://dev.to/ippatev/migration-guide-tailwind-css-v3-to-v4-f5h)
- [GitHub Discussions](https://github.com/tailwindlabs/tailwindcss/discussions/13813)
- [Community Migration Stories](https://github.com/tailwindlabs/tailwindcss/discussions/16517)

---

## Questions & Support

If issues arise during migration:

1. **Check browser console** - Look for CSS parsing errors
2. **Review generated CSS** - Inspect the built CSS file
3. **Test in isolation** - Create minimal reproduction
4. **Check GitHub issues** - See if others have similar problems
5. **Roll back if needed** - Don't be afraid to stay on v3.4 if blockers exist

---

**Last Updated**: December 27, 2025
**Status**: Ready for Migration
**Next Step**: Execute Phase 1 (Preparation)
