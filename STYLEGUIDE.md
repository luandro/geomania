# GeoMania UI Style Guide (Kuromi Pastel-Goth)

## Core Theme
- **Vibe:** Cute-goth, playful + mischievous. Pastel goth meets arcade cabinet.
- **Brand assets:** `public/kuromi.svg` for branding; checkered / spotlight backdrops via `.kuromi-grid`, `.kuromi-spotlight`.

## Color Tokens (HSL)
- Primary hot pink: `#FF1493` (328 100% 54%)
- Accent magenta: `#E85494`
- Deep purple: `#6B3BA0`
- Charcoal / black: `#0D0D0D`–`#1A1A1A`
- Cream background: `#FFF8F0`
- Lavender highlight: `#E6D5E8`
- Success: `#22C55E`, Destructive: `#EF4444`

These map to CSS variables in `src/index.css` (light & dark) and Tailwind via `tailwind.config.ts`.

## Typography
- Primary: Poppins; Accent: Fredoka (loaded in `src/index.css`).
- Weights: 400/600/700. Uppercase for arcade labels.

## Key Utilities
- `.kuromi-grid`, `.kuromi-spotlight`: patterned and glow backgrounds.
- `.arcade-round`, `.arcade-round-lg`, `.arcade-round-md`: skeuomorphic arcade push buttons with press states.
- `.stroke-text`: dark outline for high-contrast labels.
- `.quiz-gradient`, `.quiz-card-shadow`: quiz headers/cards.

## Components
- **Game mode selection:** Big circular arcade buttons (220–240px) showing only the game name with stroked text.
- **Difficulty selection:** Same arcade buttons, keep emoji above label; brief description beneath.
- **Headers:** Use Kuromi SVG + gradient header (`QuizHeader`).

## Interaction & Motion
- Subtle lift on hover, pressed state on active for buttons.
- Existing `bounce-in`, `slide-up`, `fade-in` animations retained.

## Content Updates
- When adding i18n text, update `src/i18n/translations.ts` and keep branding as “GeoMania”.
- Keep new styles within Tailwind/CSS utilities (avoid inline colors—use theme tokens).

## Accessibility
- Arcade buttons include sr-only descriptions. Maintain sufficient contrast; use `.stroke-text` for light-on-glow labels.

