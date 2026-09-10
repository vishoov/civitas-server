# UI/UX Design System

**Project:** [Project Name]
**Version:** 1.0.0
**Last updated:** [Date]

This document defines the visual language for the project — color, typography,
spacing, layout, components, and interaction patterns — so contributors build
a consistent interface regardless of who writes the code.

---

## 1. Design Principles

Before any visual decisions, agree on the values driving them. Example set —
edit to match your product:

- **Clarity first** — every screen should communicate its primary action within 3 seconds.
- **Consistency over novelty** — reuse existing patterns before inventing new ones.
- **Accessible by default** — WCAG 2.1 AA is the minimum bar, not a stretch goal.
- **Performance-conscious** — visual choices (images, animations, fonts) must not bloat load time.
- **Responsive-first** — design for mobile viewport, then scale up.

---

## 2. Color System

### 2.1 The 60-30-10 Rule

Split your palette by usage frequency, not personal preference: 60% neutral
(backgrounds/canvas), 30% secondary (structure — nav, cards, sidebars), 10%
accent (primary buttons, links, key actions).

### 2.2 Core Palette

| Token | Hex | Usage |
|---|---|---|
| `color-primary-600` | `#2563EB` | Primary buttons, active links, key CTAs |
| `color-primary-700` | `#1D4ED8` | Primary hover/pressed state |
| `color-primary-100` | `#DBEAFE` | Primary-tinted backgrounds, badges |
| `color-secondary-600` | `#7C3AED` | Secondary actions, highlights |
| `color-accent-500` | `#F59E0B` | Notifications, warnings, highlights |
| `color-success-600` | `#16A34A` | Success states, confirmations |
| `color-danger-600` | `#DC2626` | Errors, destructive actions |
| `color-warning-500` | `#EAB308` | Caution states |
| `color-info-600` | `#0891B2` | Informational banners |

### 2.3 Neutral / Grayscale Palette

| Token | Hex | Usage |
|---|---|---|
| `color-gray-50` | `#F9FAFB` | Page background (light mode) |
| `color-gray-100` | `#F3F4F6` | Card/surface background |
| `color-gray-200` | `#E5E7EB` | Borders, dividers |
| `color-gray-400` | `#9CA3AF` | Disabled text, placeholders |
| `color-gray-600` | `#4B5563` | Secondary body text |
| `color-gray-900` | `#111827` | Primary text (light mode) |
| `color-gray-950` | `#030712` | Page background (dark mode) |

### 2.4 Dark Mode Mapping

Define token equivalence, don't just invert:

| Token | Light Mode | Dark Mode |
|---|---|---|
| `bg-page` | `color-gray-50` | `color-gray-950` |
| `bg-surface` | `#FFFFFF` | `color-gray-900` |
| `text-primary` | `color-gray-900` | `color-gray-50` |
| `text-secondary` | `color-gray-600` | `color-gray-400` |
| `border-default` | `color-gray-200` | `color-gray-700` |

### 2.5 Accessibility Rules (Non-Negotiable)

- **Normal text**: minimum contrast ratio **4.5:1** against its background (WCAG AA).
- **Large text** (18pt+/14pt bold+): minimum **3:1**.
- **UI components & icons** (borders, buttons, focus rings): minimum **3:1**.
- Never use color as the *only* signal for meaning (e.g., pair red error text with an icon and message, not just red).
- Test every palette pairing with a contrast checker (WebAIM, Stark, or browser DevTools) before shipping.
- Simulate color-blindness (protanopia/deuteranopia) on key screens.

---

## 3. Typography

### 3.1 Typeface

| Role | Typeface | Fallback stack |
|---|---|---|
| UI / body | Inter | `-apple-system, "Segoe UI", Roboto, sans-serif` |
| Headings | Inter (or a distinct display face) | same as above |
| Monospace (code) | JetBrains Mono | `"Fira Code", Consolas, monospace` |

Limit the project to **one primary typeface family** (plus one monospace for code) — avoid mixing more than two type families.

### 3.2 Type Scale

Use a modular scale so every size relates mathematically to a base (16px). A
**Perfect Fourth (×1.333)** ratio gives a versatile 7-step scale:

| Token | Size (px / rem) | Line height | Usage |
|---|---|---|---|
| `text-xs` | 12px / 0.75rem | 16px | Captions, helper text |
| `text-sm` | 14px / 0.875rem | 20px | Secondary body, labels |
| `text-base` | 16px / 1rem | 24px | Body text (default) |
| `text-lg` | 21px / 1.3125rem | 28px | Sub-headings, lead paragraphs |
| `text-xl` | 28px / 1.75rem | 36px | H3 |
| `text-2xl` | 38px / 2.375rem | 46px | H2 |
| `text-3xl` | 51px / 3.1875rem | 60px | H1 / hero headline |

Alternative ratios if you need more/fewer steps: **Major Third (×1.25)** for
denser UIs like dashboards, **Perfect Fifth (×1.5)** for bold marketing pages.

### 3.3 Font Weights

| Token | Weight | Usage |
|---|---|---|
| `font-regular` | 400 | Body text |
| `font-medium` | 500 | Emphasized body, labels |
| `font-semibold` | 600 | Sub-headings, buttons |
| `font-bold` | 700 | Headings |

### 3.4 Rules

- Body text minimum size: **16px** (never go below 14px for primary reading content).
- Line length: aim for **50–75 characters** per line for readability.
- Line height: **1.5×** font size for body text, **1.2–1.3×** for headings.
- Don't justify text; left-align (or right-align for RTL languages).

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

Base unit of **4px**, scaling geometrically so margins/padding stay consistent
across components:

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Icon-to-text gaps |
| `space-2` | 8px | Tight internal padding |
| `space-3` | 12px | Form field padding |
| `space-4` | 16px | Default component padding |
| `space-6` | 24px | Card padding, section gaps |
| `space-8` | 32px | Section margins |
| `space-12` | 48px | Major section breaks |
| `space-16` | 64px | Page-level vertical rhythm |

### 4.2 Grid System

- **Desktop**: 12-column grid, max content width **1280px**, gutter **24px**.
- **Tablet**: 8-column grid, gutter **16px**.
- **Mobile**: 4-column grid, gutter **16px**, side margins **16px**.

### 4.3 Breakpoints

| Name | Width | Target |
|---|---|---|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large monitors |

### 4.4 Layout Patterns

- **App shell**: fixed top nav (64px height) + collapsible sidebar (240px expanded / 64px collapsed) + scrollable main content area.
- **Content pages**: single-column, max-width 720px for reading-focused text; full-width grid for dashboards/data tables.
- **Cards**: 8px corner radius, 1px border in `border-default`, `space-6` internal padding.
- **Modals**: max-width 480px (small), 640px (medium), 960px (large); always dismissible via Esc key and overlay click.

---

## 5. Component Guidelines

### 5.1 Buttons

| Variant | Background | Text | Use case |
|---|---|---|---|
| Primary | `color-primary-600` | White | One per screen — the main action |
| Secondary | Transparent, border `color-gray-200` | `color-gray-900` | Alternative actions |
| Ghost | Transparent | `color-primary-600` | Low-emphasis actions |
| Destructive | `color-danger-600` | White | Delete/irreversible actions |

- Minimum touch target: **44×44px** (mobile accessibility standard).
- States required for every interactive element: default, hover, active/pressed, focus (visible ring), disabled.
- Disabled buttons: 40% opacity, no hover effects, `cursor: not-allowed`.

### 5.2 Form Elements

- Input height: **40px** (default), **48px** (mobile-friendly touch target).
- Always pair inputs with a visible `<label>` — never rely on placeholder text alone.
- Error state: red border (`color-danger-600`) + inline error message + icon, not color alone.
- Focus state: **2px** visible outline in `color-primary-600`, offset 2px from the element.

### 5.3 Icons

- Icon set: use a single consistent library (e.g., Lucide, Heroicons, Phosphor) — don't mix icon styles.
- Standard sizes: 16px (inline with text), 20px (buttons/inputs), 24px (standalone nav/action icons).
- Icons conveying meaning (success/error/warning) must always be paired with text, never standalone.

### 5.4 Elevation / Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards, subtle separation |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Dropdowns, popovers |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dialogs |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Toasts, high-priority overlays |

### 5.5 Motion

- Default transition duration: **150–200ms** for micro-interactions (hover, focus), **250–300ms** for larger UI shifts (modals, drawers).
- Easing: `ease-in-out` for most transitions; `ease-out` for elements entering the screen.
- Respect `prefers-reduced-motion` — disable non-essential animation for users who request it.

---

## 6. Imagery & Iconography

- **Photography**: consistent aspect ratios (16:9 for hero banners, 1:1 for avatars/thumbnails), avoid low-contrast overlays behind text.
- **Illustrations**: pick one style (flat, line-art, isometric) and apply consistently across empty states, onboarding, and error pages.
- **Alt text**: every meaningful image requires descriptive alt text; decorative images use `alt=""`.
- **Logo usage**: define minimum clear space (equal to the logo's height) and minimum size (24px height on digital) to prevent distortion or crowding.

---

## 7. Accessibility Checklist

- [ ] All text meets minimum WCAG AA contrast ratios (4.5:1 normal, 3:1 large).
- [ ] All interactive elements reachable and operable via keyboard alone (Tab, Enter, Esc).
- [ ] Visible focus indicators on every focusable element.
- [ ] Form errors announced via `aria-live` regions for screen readers.
- [ ] No information conveyed by color alone.
- [ ] Minimum touch target size 44×44px on mobile.
- [ ] Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- [ ] All images have appropriate alt text.

---

## 8. File & Naming Conventions

- Design tokens stored in `design-tokens.json` (or `tokens.css` / `tailwind.config.js` if using Tailwind) as the **single source of truth** — code should reference tokens, never hardcoded hex values.
- Component naming: `PascalCase` for component files (`PrimaryButton.tsx`), kebab-case for CSS classes (`btn-primary`).
- Figma (or design tool) file structure: `Cover → Foundations (color/type/spacing) → Components → Patterns → Screens`.

---

## 9. Tools & References

- **Design**: Figma (or Sketch/Adobe XD) as source of truth for mockups.
- **Contrast checking**: WebAIM Contrast Checker, Stark plugin.
- **Handoff**: Figma Dev Mode / Zeplin for spec extraction.
- **Icon library**: [choose one — Lucide, Heroicons, Phosphor].
- **Component library base** (optional): Radix UI, shadcn/ui, or Material UI as an unstyled/styled foundation.

---

## 10. Governance

- Any new color, type size, or spacing value must be proposed as a PR to this document before being used in code.
- Design changes affecting this system require sign-off from [design lead / maintainer].
- Review this document quarterly or whenever a major visual redesign is proposed.
