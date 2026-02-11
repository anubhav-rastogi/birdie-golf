# Birdie — UI Guidelines

_The single source of truth for every screen, component, and pixel._

_Last updated: February 11, 2026_

---

## 1. Design Philosophy

Birdie looks like a tool built by a caddie, not a toy built by a startup. The aesthetic is **warm, earthy, professional, and dense**. Every pixel serves the golfer's need to enter data fast and read it at a glance — on a bright fairway with one hand free.

### Guiding Principles

1. **Numbers are the UI.** Scores, putts, percentages — they're the content, not decoration around content. Make them big, bold, and unmissable.
2. **Density over whitespace.** Serious golfers want to see more data, not more padding. Compact layouts with clear hierarchy beat airy layouts with one stat per screen.
3. **Touch-first, thumb-optimized.** Every interactive element is designed for a thumb in sunlight, possibly with a golf glove on the other hand. Large targets, generous hit areas.
4. **One palette, no exceptions.** Five colors. Every element on every screen uses these five and only these five (plus computed opacities). No off-palette grays, no accent blues, no one-off colors.
5. **No decoration.** No gradients, no drop shadows on cards, no background patterns, no illustrations. The data is the decoration.

---

## 2. Color System

### 2.1 Palette

| Token | Name | Hex | RGB | Tailwind Class |
|---|---|---|---|---|
| `forest` | Black Forest | `#283618` | `40, 54, 24` | `bg-forest`, `text-forest`, `border-forest` |
| `olive` | Olive Leaf | `#606C38` | `96, 108, 56` | `bg-olive`, `text-olive`, `border-olive` |
| `cornsilk` | Cornsilk | `#FEFAE0` | `254, 250, 224` | `bg-cornsilk`, `text-cornsilk`, `border-cornsilk` |
| `clay` | Sunlit Clay | `#DDA15E` | `221, 161, 94` | `bg-clay`, `text-clay`, `border-clay` |
| `copper` | Copperwood | `#BC6C25` | `188, 108, 37` | `bg-copper`, `text-copper`, `border-copper` |

### 2.2 Tailwind Configuration

```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  /* Core palette */
  --color-forest: #283618;
  --color-olive: #606C38;
  --color-cornsilk: #FEFAE0;
  --color-clay: #DDA15E;
  --color-copper: #BC6C25;

  /* Semantic aliases */
  --color-background: #283618;
  --color-surface: #606C38;
  --color-foreground: #FEFAE0;
  --color-accent: #DDA15E;
  --color-emphasis: #BC6C25;
}
```

### 2.3 Semantic Color Roles

| Role | Token | Usage |
|---|---|---|
| **Background** | `forest` | Page background. The default surface of every screen. |
| **Surface** | `olive` | Elevated elements: cards, input groups, scorecard rows, modal backgrounds, secondary panels. Always sits on top of `forest`. |
| **Foreground** | `cornsilk` | Primary text. All readable content — scores, labels, stat values, navigation text. |
| **Accent** | `clay` | Interactive elements and highlights. Buttons, active toggles, stepper controls, links, focus rings, CTAs. |
| **Emphasis** | `copper` | Sparingly used for weight. Hover/pressed states on accent elements, important callouts, scorecard birdie markers, active nav indicator. |

### 2.4 Opacity Variants

Derived from the five base colors using Tailwind opacity utilities. These are the **only** way to create lighter/darker shades — never introduce new hex values.

| Variant | Usage | Example |
|---|---|---|
| `cornsilk/60` | Secondary text, de-emphasized labels | `text-cornsilk/60` |
| `cornsilk/30` | Tertiary text, placeholders, disabled states | `text-cornsilk/30` |
| `olive/50` | Subtle borders, dividers between sections | `border-olive/50` |
| `clay/20` | Faint accent backgrounds (e.g., selected row highlight) | `bg-clay/20` |
| `forest/80` | Overlay backdrop (behind modals/sheets) | `bg-forest/80` |

### 2.5 Contrast Requirements

| Pair | Contrast Ratio | WCAG | Use |
|---|---|---|---|
| Cornsilk on Forest | **11.8:1** | AAA | Primary text on background |
| Cornsilk on Olive | **6.7:1** | AA | Primary text on surface/cards |
| Clay on Forest | **5.2:1** | AA | Accent text/icons on background |
| Clay on Olive | **3.0:1** | — | Accent on surface — icons only, not body text |
| Copper on Forest | **3.8:1** | — | Large text/icons only (24px+) |
| Cornsilk on Copper | **4.6:1** | AA (large) | Button text on copper backgrounds |

**Rules:**
- Body text (< 24px) must be `cornsilk` on `forest` or `olive`. Never `clay` or `copper` for small text.
- `clay` text is acceptable at 16px+ for labels and links.
- `copper` text is acceptable at 24px+ only (headings, large icons, score numbers).
- Interactive elements using `clay` background must have `forest` text for sufficient contrast.

---

## 3. Typography

### 3.1 Font Stack

```css
--font-sans: "Inter", ui-sans-serif, system-ui, -apple-system,
  BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial,
  sans-serif;
```

**Inter** is the sole typeface. It has:
- Variable weight (100–900) for precise hierarchy
- Tabular figures (`font-variant-numeric: tabular-nums`) for aligned numbers
- Excellent legibility at all sizes, including small (12px) and large (72px)
- Native availability on most modern devices; bundled as a subset for guaranteed availability

No secondary or decorative fonts. One family, multiple weights.

### 3.2 Type Scale

| Token | Size | Weight | Line Height | Tracking | Usage |
|---|---|---|---|---|---|
| `score-hero` | 72px | 800 (ExtraBold) | 1.0 | -0.02em | The big score number on the score entry screen |
| `score-lg` | 48px | 700 (Bold) | 1.0 | -0.02em | Running total score in header, dashboard headline score |
| `score-md` | 32px | 700 (Bold) | 1.1 | -0.01em | Per-hole score in scorecard grid cells |
| `score-sm` | 20px | 600 (SemiBold) | 1.2 | 0 | Stepper value (putts), sub-stats in running total |
| `heading-lg` | 24px | 700 (Bold) | 1.3 | -0.01em | Section headings (e.g., "Post-Round Dashboard") |
| `heading-md` | 18px | 600 (SemiBold) | 1.3 | 0 | Sub-section headings (e.g., "Club Performance") |
| `body` | 16px | 400 (Regular) | 1.5 | 0 | Standard body text, form labels, notes |
| `body-sm` | 14px | 400 (Regular) | 1.4 | 0.01em | Secondary labels, table headers, metadata |
| `caption` | 12px | 500 (Medium) | 1.3 | 0.02em | Timestamps, helper text, abbreviated labels |
| `mono` | 14px | 500 (Medium) | 1.4 | 0.05em | Export data, debug info (if ever shown) |

### 3.3 Numeric Typography

All numeric values (scores, putts, percentages, stats) use:

```css
font-variant-numeric: tabular-nums;
```

This ensures digits are equal-width — critical for alignment in the scorecard grid and stat tables. Tailwind class: `tabular-nums`.

Score numbers (`score-hero`, `score-lg`, `score-md`) also use:

```css
font-feature-settings: "tnum" 1, "ss01" 1;
```

### 3.4 Relative-to-Par Display

When showing score relative to par, use a compact format with color:

| Value | Display | Color |
|---|---|---|
| -3 or better | `-3` | `copper` |
| -2 | `-2` | `copper` |
| -1 | `-1` | `clay` |
| E (even) | `E` | `cornsilk` |
| +1 | `+1` | `cornsilk/60` |
| +2 or worse | `+2` | `cornsilk/40` |

Always prefix with `+` or `-`. Even par displays as `E`, not `0` or `+0`.

---

## 4. Spacing

### 4.1 Base Scale

Built on a **4px base unit**. All spacing values are multiples of 4.

| Token | Value | Tailwind | Usage |
|---|---|---|---|
| `space-0` | 0px | `p-0`, `m-0` | — |
| `space-1` | 4px | `p-1`, `m-1` | Tight internal padding (icon-to-text) |
| `space-2` | 8px | `p-2`, `m-2` | Inline spacing, gap between small elements |
| `space-3` | 12px | `p-3`, `m-3` | Internal card padding (compact) |
| `space-4` | 16px | `p-4`, `m-4` | Standard card padding, gap between form fields |
| `space-5` | 20px | `p-5`, `m-5` | Section padding on mobile |
| `space-6` | 24px | `p-6`, `m-6` | Section spacing, gap between cards |
| `space-8` | 32px | `p-8`, `m-8` | Page-level vertical rhythm |
| `space-10` | 40px | `p-10`, `m-10` | Large section breaks |
| `space-12` | 48px | `p-12`, `m-12` | Page top/bottom padding |

### 4.2 Component-Level Spacing

| Context | Spec |
|---|---|
| Page padding (horizontal) | `16px` (mobile), `24px` (tablet+) |
| Page padding (vertical) | `16px` top (below header), `48px` bottom (scroll clearance) |
| Card internal padding | `12px` (compact cards like hole entry), `16px` (standard cards) |
| Gap between form fields | `12px` vertical |
| Gap between cards in a list | `8px` |
| Gap between sections | `24px` |
| Header height | `56px` |
| Running totals bar height | `48px` |
| Bottom safe area (mobile) | `env(safe-area-inset-bottom)` + `16px` |

---

## 5. Border Radius

| Token | Value | Tailwind | Usage |
|---|---|---|---|
| `radius-sm` | 4px | `rounded-sm` | Small elements: chips, pills, badges |
| `radius-md` | 8px | `rounded-lg` | Standard: cards, input fields, buttons, toggles |
| `radius-lg` | 12px | `rounded-xl` | Prominent cards: hole entry card, modal/sheet content |
| `radius-full` | 9999px | `rounded-full` | Circular: score stepper buttons, player avatar dots, miss-map dots |

**Default border radius for all components is `radius-md` (8px).** Override explicitly when needed.

No sharp corners (0px radius) anywhere in the app except divider lines and table borders.

---

## 6. Shadows

Minimal shadow usage. The dark palette provides contrast through color, not elevation.

| Token | Value | Tailwind | Usage |
|---|---|---|---|
| `shadow-none` | `none` | `shadow-none` | Default for all elements. Cards are distinguished by background color (`olive` on `forest`), not shadow. |
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | `shadow-sm` | Floating elements only: dropdown overlays, hole picker popup |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` | `shadow-md` | Modal/sheet backdrop overlay elements |

**Rule: No box shadows on cards, buttons, or static UI.** The dark-on-dark color system provides visual separation. Shadows are reserved for elements that float above the page (dropdowns, modals).

---

## 7. Borders

| Usage | Spec |
|---|---|
| Card borders | `1px solid olive/50`. Subtle delineation between `olive` cards on `forest` background. |
| Input field borders | `1px solid olive`. On focus: `2px solid clay` (focus ring). |
| Divider lines | `1px solid olive/30`. Horizontal separators between sections or list items. |
| Scorecard grid lines | `1px solid olive/50`. Both horizontal and vertical, forming the grid. |
| Active/selected border | `2px solid clay`. Used on active toggle segments, selected player tab. |
| Table borders | `1px solid olive/30` between rows. No vertical cell borders (clean look). |

No border on buttons — buttons are distinguished by background color.

---

## 8. Component Patterns

### 8.1 Score Stepper

The primary input component. Used for score and putts entry.

```
┌──────────────────────────────┐
│  [ − ]      4      [ + ]    │   ← Score stepper
│           PAR 4              │   ← Context label
└──────────────────────────────┘
```

| Property | Spec |
|---|---|
| Container | `bg-olive`, `rounded-xl`, `p-3`, full width |
| Number display | `score-hero` (72px) for score, `score-sm` (20px) for putts. `text-cornsilk`, `tabular-nums`, centered |
| +/− buttons | 56×56px circles (`rounded-full`). `bg-clay`, `text-forest`. Active/pressed: `bg-copper`. |
| Button icon | `−` and `+` symbols, 24px, `font-bold`, centered |
| Label | `caption` (12px), `text-cornsilk/60`, centered below number |
| Tap area | Buttons have a minimum 56×56px touch target. The entire left/right half of the container also triggers −/+ respectively (extended hit area). |
| Haptic | Trigger `navigator.vibrate(10)` on each tap (if supported) |

### 8.2 Toggle Group (3-way)

Used for Fairway (← HIT →), Pin Position (Front / Center / Back), and GIR (HIT / MISS).

```
┌─────────┬─────────┬─────────┐
│  LEFT   │   HIT   │  RIGHT  │   ← Fairway toggle
└─────────┴─────────┴─────────┘
```

| Property | Spec |
|---|---|
| Container | `bg-olive`, `rounded-lg`, `p-1`, flex row, full width |
| Segments | Equal-width flex children. `rounded-md` (6px inner radius). |
| Unselected segment | `bg-transparent`, `text-cornsilk/60` |
| Selected segment | `bg-clay`, `text-forest`, `font-semibold` |
| Segment height | 44px minimum |
| Segment text | `body-sm` (14px), `font-medium`, centered |
| Transition | Background and text color transition over `150ms ease` |
| Haptic | Trigger on selection change |

### 8.3 Miss Direction Diamond

The 4-way GIR miss direction selector. Appears only when GIR = MISS.

```
           [ LONG ]
              │
     [ LEFT ]─┼─[ RIGHT ]
              │
          [ SHORT ]
```

| Property | Spec |
|---|---|
| Layout | CSS Grid, 3×3. Center cell empty. Four direction buttons in cross pattern. |
| Container | 160×160px max, centered within parent |
| Direction buttons | 48×48px circles (`rounded-full`). Unselected: `bg-olive`, `text-cornsilk/60`, `border border-olive/50`. Selected: `bg-clay`, `text-forest`, `border-clay`. |
| Multi-select | Tapping "Short" + "Right" selects both (short-right miss). Each button is independently togglable. |
| Labels | `caption` (12px), `font-medium`, positioned outside each button (above/below/left/right) |
| Transition | Background color `150ms ease` |
| Haptic | Trigger on each toggle |

### 8.4 Club Selector

Horizontal scrollable pill row for approach club.

```
[ W ] [ 3i ] [ 4i ] [ 5i ] [ 6i ] [ 7i ] [ 8i ] [ 9i ] [ PW ] [ GW ] [ SW ] [ LW ]
                                     ↑ selected
```

| Property | Spec |
|---|---|
| Container | Horizontal scroll (`overflow-x: auto`), `gap-2`, `py-2`, hide scrollbar (`scrollbar-hide`) |
| Pills | `rounded-full`, `px-4`, `h-9`. Unselected: `bg-olive`, `text-cornsilk/60`. Selected: `bg-clay`, `text-forest`, `font-semibold`. |
| Scroll behavior | `scroll-snap-type: x mandatory`, `scroll-snap-align: center` per pill |
| Tap area | Full pill is tappable. Min width 40px per pill. |

### 8.5 Hole Card (Score Entry Screen)

The container for all per-hole inputs. One card per hole, swipeable.

| Property | Spec |
|---|---|
| Container | `bg-olive`, `rounded-xl`, `p-3`, full width. `border border-olive/50`. |
| Hole number badge | Top-left. `bg-clay`, `text-forest`, `rounded-full`, 32×32px circle, `score-sm` (20px, bold), centered. |
| Par label | Next to hole number. `caption` (12px), `text-cornsilk/60`. "Par 4" |
| Field stacking | Vertical, `gap-3` (12px). Score stepper → Putts stepper → Fairway toggle → GIR toggle → (conditional: Miss Direction) → Pin Position |
| Secondary fields | Collapsed by default. Expand button: `text-clay`, `body-sm`, "More details ▾". Expanded: animates open with `200ms ease-out`. Contains Penalty, Club, Up-and-down, Sand save, Notes. |

### 8.6 Running Totals Bar

Sticky bar below the header showing live stats during scoring.

```
┌──────────────────────────────────────────────────────┐
│  74 (+2)    │  30 putts  │  7/12 GIR  │  5/8 FW    │
└──────────────────────────────────────────────────────┘
```

| Property | Spec |
|---|---|
| Container | `bg-forest`, `border-b border-olive/30`, `h-12`, `px-4`, `sticky top-14` (below header), flex row, items-center, `justify-between` |
| Stat items | `score-sm` (20px) for the number, `caption` (12px) for the label below. `text-cornsilk`. |
| Score vs. par | Colored per §3.4 relative-to-par rules |
| Dividers | `1px solid olive/30` between each stat, `h-6`, vertical |

### 8.7 Scorecard Grid

Landscape-oriented table mimicking a paper scorecard.

| Property | Spec |
|---|---|
| Container | Horizontal scroll on narrow screens. `overflow-x: auto`. |
| Header row | `bg-forest`, `text-cornsilk/60`, `caption` (12px), `font-medium`. Columns: Hole 1–9, OUT, 10–18, IN, TOT. |
| Player rows | `bg-olive` (alternating `bg-olive/70` for stripe). `text-cornsilk`. |
| Score cells | `score-md` (32px) if space allows, `score-sm` (20px) on compact. `tabular-nums`, centered. Minimum cell width: 40px. |
| Stat sub-rows | Below each player's score row. `caption` (12px). GIR: ✓ in `clay`, ✗ in `cornsilk/40`. FW: ← / ✓ / → symbols. Putts: number. |
| Cell padding | `4px` horizontal, `6px` vertical |
| Grid lines | `1px solid olive/30` |
| Subtotal columns (OUT, IN, TOT) | `bg-forest`, `font-bold`, `border-l-2 border-olive/50` |

#### Score Cell Color Coding

| Result | Background | Text | Border |
|---|---|---|---|
| Eagle or better | `bg-copper` | `text-cornsilk` | Double ring (`box-shadow: inset 0 0 0 2px cornsilk`) |
| Birdie | `bg-clay/30` | `text-clay` | Single ring (`border-2 border-clay`) |
| Par | `bg-transparent` | `text-cornsilk` | None |
| Bogey | `bg-olive/50` | `text-cornsilk/70` | None |
| Double bogey+ | `bg-forest` | `text-cornsilk/40` | None |

### 8.8 Buttons

Three variants, one size each.

#### Primary Button

| Property | Spec |
|---|---|
| Background | `bg-clay` |
| Text | `text-forest`, `body` (16px), `font-semibold` |
| Padding | `px-6 py-3` (24px horizontal, 12px vertical) |
| Radius | `rounded-lg` (8px) |
| Height | 48px minimum |
| Hover | `bg-copper` |
| Active/Pressed | `bg-copper`, scale `0.98` |
| Disabled | `bg-clay/30`, `text-forest/50`, `cursor-not-allowed` |
| Focus | `ring-2 ring-clay ring-offset-2 ring-offset-forest` |

#### Secondary Button

| Property | Spec |
|---|---|
| Background | `bg-transparent` |
| Border | `border-2 border-clay` |
| Text | `text-clay`, `body` (16px), `font-semibold` |
| Padding | `px-6 py-3` |
| Radius | `rounded-lg` (8px) |
| Height | 48px minimum |
| Hover | `bg-clay/10` |
| Active/Pressed | `bg-clay/20` |

#### Ghost Button

| Property | Spec |
|---|---|
| Background | `bg-transparent` |
| Border | None |
| Text | `text-clay`, `body` (16px), `font-medium` |
| Padding | `px-4 py-2` |
| Hover | `bg-olive/50` |
| Active/Pressed | `bg-olive` |
| Use | Navigation links, "More details" expander, secondary actions |

### 8.9 Input Fields

Text inputs (course name, player names, notes).

| Property | Spec |
|---|---|
| Background | `bg-forest` |
| Border | `border border-olive`. Focus: `border-2 border-clay` |
| Text | `text-cornsilk`, `body` (16px) |
| Placeholder | `text-cornsilk/30` |
| Padding | `px-4 py-3` |
| Radius | `rounded-lg` (8px) |
| Height | 48px |
| Focus ring | `ring-2 ring-clay/30 ring-offset-0` |
| Label | `body-sm` (14px), `text-cornsilk/60`, `font-medium`, 4px gap above input |

### 8.10 Stat Card (Dashboard)

Used in the post-round dashboard for individual stat values.

```
┌───────────────┐
│  61%          │  ← Value
│  GIR          │  ← Label
│  11/18        │  ← Detail
└───────────────┘
```

| Property | Spec |
|---|---|
| Container | `bg-olive`, `rounded-lg`, `p-4`, flex column |
| Value | `score-lg` (48px) or `heading-lg` (24px) depending on importance. `text-cornsilk`. |
| Label | `caption` (12px), `text-cornsilk/60`, `font-medium`, uppercase, `tracking-wider` |
| Detail | `body-sm` (14px), `text-cornsilk/60` |
| Grid | Stat cards in a 2-column grid on mobile, 3-column on tablet+. `gap-3`. |

### 8.11 Miss Map (Green Oval)

The signature visualization. SVG-based.

| Property | Spec |
|---|---|
| Container | `bg-olive`, `rounded-xl`, `p-6`, centered. Max width 320px. |
| Green oval | SVG ellipse. Fill: `olive` with a lighter inner stroke. Stroke: `cornsilk/20`, 1.5px. Width: ~240px, height: ~200px. Oriented vertically (longer from short to long). |
| Pin marker | Small `+` marker at center of oval. `cornsilk/30`, 8px. |
| Miss dots | 12px circles. Positioned relative to center based on miss direction. Offset: ~60px from center in the miss direction. For diagonal misses (e.g., short-right), offset at 45°. |
| Dot colors by pin | Front pin: `clay`. Center pin: `cornsilk`. Back pin: `copper`. |
| Dot border | `1px solid forest` (helps dots stand out on the olive background) |
| Labels | "SHORT" / "LONG" / "LEFT" / "RIGHT" outside the oval edges. `caption` (12px), `text-cornsilk/30`. |
| Legend | Below the oval. Three dots with labels: "Front", "Center", "Back" pin colors. `caption`. |

### 8.12 Navigation Header

Fixed top bar across all views.

| Property | Spec |
|---|---|
| Container | `bg-forest`, `h-14` (56px), `px-4`, flex row, items-center, `border-b border-olive/30`, `sticky top-0`, `z-50` |
| Logo/title | "Birdie" or current view name. `heading-md` (18px), `text-cornsilk`, `font-bold`. Left-aligned. |
| Nav tabs | Right-aligned row of tab labels: Score, Card, Stats. `body-sm` (14px). Inactive: `text-cornsilk/50`. Active: `text-clay`, `font-semibold`, with a `2px` bottom border in `clay`. |
| Back button | Left side when in a sub-view. `text-clay`, 24px chevron icon. Ghost button behavior. |
| Player selector | When scoring: horizontally scrollable name tabs below the main nav. `h-10`, `bg-forest`, `border-b border-olive/30`. Active player: `text-clay`, `border-b-2 border-clay`. Inactive: `text-cornsilk/50`. |

### 8.13 Round History List

Vertical list of completed rounds on the home screen.

| Property | Spec |
|---|---|
| List item | `bg-olive`, `rounded-lg`, `p-4`, full width. `border border-olive/50`. `gap-3` between items. |
| Primary line | Course name (`heading-md`, `text-cornsilk`) + date (`caption`, `text-cornsilk/40`), right-aligned |
| Score line | Score vs. par (`score-sm`, colored per §3.4) + key stats (GIR%, FW%, putts) in `caption`, `text-cornsilk/60`, separated by `·` |
| Swipe action | Swipe left reveals delete zone: `bg-red-600` (exception: this is the one functional color outside the palette, used only for destructive actions). |
| Empty state | Centered: "No rounds yet" in `heading-md`, `text-cornsilk/40`. "Start your first round" as a primary button below. |

### 8.14 Trend Chart

Line charts for multi-round trends (custom SVG).

| Property | Spec |
|---|---|
| Container | `bg-olive`, `rounded-xl`, `p-4` |
| Chart background | Transparent (inherits `bg-olive`) |
| Grid lines | `stroke: olive/30`, `strokeWidth: 1`, dashed |
| Axis labels | `caption` (12px), `fill: cornsilk/50` |
| Axis lines | `stroke: olive/50`, `strokeWidth: 1` |
| Primary line | `stroke: clay`, `strokeWidth: 2.5` |
| Secondary line | `stroke: copper`, `strokeWidth: 2`, `strokeDasharray: 6 3` |
| Data points | `fill: clay`, `r: 4`. Hover: `r: 6`, `stroke: cornsilk`, `strokeWidth: 2` |
| Tooltip | `bg-forest`, `border border-olive`, `rounded-lg`, `p-3`, `shadow-sm`. Text: `body-sm`, `text-cornsilk`. |
| Legend | Below chart. Colored circles + labels. `caption`, `text-cornsilk/60`. |

---

## 9. Layout

### 9.1 Breakpoints

| Name | Width | Usage |
|---|---|---|
| `mobile` | < 640px | Default. Single-column. All scoring UI optimized here first. |
| `tablet` | 640–1024px | Scorecard shows without horizontal scroll. Stat cards 3-column. |
| `desktop` | > 1024px | Side-by-side layouts where useful (dashboard + miss map). Not a priority — this is a phone-first app. |

### 9.2 Page Layouts

**Scoring page:** Single column, full-width hole card. Running totals bar sticks below header. Swipe horizontal to navigate holes.

**Scorecard page:** Full-width table, horizontal scroll on mobile. Force landscape orientation hint on narrow screens.

**Dashboard page:** Stat cards grid (2-col mobile, 3-col tablet) at top. Miss map centered below. Club table full-width below that.

**History page:** Full-width list of round cards. "New Round" primary button fixed at bottom or at top.

**Trends page:** Stacked trend charts, one per stat. Full width. Cumulative miss map at the bottom.

### 9.3 Safe Areas

```css
padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
padding-top: calc(env(safe-area-inset-top, 0px));
```

Applied to the root layout to handle notches and home indicators on modern phones.

---

## 10. Animation & Transitions

### 10.1 Core Principle

Animations serve **feedback**, not decoration. Every animation confirms an action or guides attention. Nothing animates for aesthetics alone.

### 10.2 Timing Tokens

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `instant` | 0ms | — | State changes that must feel instantaneous (score number update) |
| `fast` | 100ms | `ease-out` | Button press feedback, toggle highlight shift |
| `normal` | 150ms | `ease-out` | Background color transitions, border color transitions |
| `smooth` | 200ms | `ease-out` | Expand/collapse secondary fields, sheet open |
| `slide` | 250ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Hole-to-hole swipe transition, page transitions |
| `slow` | 300ms | `ease-in-out` | Modal overlay fade, miss map dot appearance |

### 10.3 Transition Defaults

Every interactive element includes:

```css
transition: background-color 150ms ease-out,
            border-color 150ms ease-out,
            color 150ms ease-out,
            transform 100ms ease-out;
```

Tailwind: `transition-colors duration-150` for color-only transitions.

### 10.4 Specific Animations

| Element | Animation | Spec |
|---|---|---|
| **Score number change** | Number ticks instantly (no interpolation). A subtle scale pulse confirms the change. | `scale(1.05)` → `scale(1)` over `100ms ease-out` |
| **Toggle selection** | Background slides to the selected segment. | `transform: translateX` over `150ms ease-out` |
| **Hole swipe** | Current card slides out, next card slides in from the edge. | `translateX(100%)` → `translateX(0)` over `250ms cubic-bezier(0.16, 1, 0.3, 1)` |
| **Secondary fields expand** | Container height animates from 0 to auto. Content fades in. | `max-height` transition `200ms ease-out`, content `opacity 0→1` over `150ms` with `50ms` delay |
| **Miss direction dot (dashboard)** | Dots appear with a slight scale-in. | `scale(0) → scale(1)` over `300ms ease-out`, staggered 50ms per dot |
| **Modal/sheet open** | Backdrop fades in, sheet slides up from bottom. | Backdrop: `opacity 0→1` over `200ms`. Sheet: `translateY(100%)→0` over `250ms cubic-bezier(0.16, 1, 0.3, 1)` |
| **List item swipe-to-delete** | Item slides left, delete zone revealed. On confirm, item collapses vertically. | Slide: gesture-driven. Collapse: `max-height` to `0` over `200ms ease-out` |
| **Page navigation** | Crossfade between pages. | `opacity` transition `150ms ease-out` |

### 10.5 Reduced Motion

Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

All animations degrade to instant state changes. Functionality is never gated behind animation.

### 10.6 Haptic Feedback

On supported devices (`navigator.vibrate`), trigger a short pulse (10ms) on:
- Score stepper tap (+/−)
- Toggle selection change
- Hole swipe completion
- Round completion

Not on: page navigation, scrolling, text input, passive interactions.

---

## 11. Icons

No icon library. Birdie uses a minimal set of inline SVG icons, hand-built or pulled from Lucide (the shadcn/ui default icon set).

| Icon | Usage | Size |
|---|---|---|
| `plus` / `minus` | Stepper buttons | 24px stroke, 2px weight |
| `chevron-left` / `chevron-right` | Navigation, back button | 20px |
| `chevron-down` | Expand secondary fields | 16px |
| `check` | GIR hit indicator, fairway hit | 16px |
| `x` | GIR miss indicator | 16px |
| `arrow-left` / `arrow-right` | Fairway miss direction indicators | 16px |
| `trash-2` | Delete round | 20px |
| `download` | Export round | 20px |
| `more-horizontal` | Overflow menu (if needed) | 20px |

All icons: `stroke-current`, `strokeWidth: 2`, `fill: none`. Color inherits from parent text color.

---

## 12. Accessibility

| Requirement | Implementation |
|---|---|
| **Color alone never conveys meaning** | Scorecard scores use color + shape (ring, double ring, no ring) to distinguish birdie/eagle/bogey. Miss map uses color + position. |
| **WCAG AA contrast** | All text meets AA ratios per §2.5. Body text on all backgrounds ≥ 4.5:1. Large text ≥ 3.0:1. |
| **Focus indicators** | Every interactive element has a visible `ring-2 ring-clay ring-offset-2 ring-offset-forest` focus ring. |
| **Touch targets** | All tappable elements ≥ 48×48px per WCAG 2.5.5. Score stepper buttons are 56×56px. |
| **Screen reader labels** | All icons have `aria-label`. Toggles use `role="radiogroup"` with `aria-checked`. Steppers use `role="spinbutton"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`. |
| **Reduced motion** | See §10.5. All animations honor `prefers-reduced-motion`. |
| **Keyboard navigation** | Tab through all controls in logical order. Stepper responds to Arrow Up/Down. Toggles respond to Arrow Left/Right. Enter/Space activates buttons. |

---

## 13. Quick Reference: Tailwind Class Cheatsheet

Common class combinations used across the app:

```
Page background:        bg-forest text-cornsilk min-h-screen
Card:                   bg-olive rounded-xl p-3 border border-olive/50
Primary button:         bg-clay text-forest font-semibold px-6 py-3 rounded-lg
                        hover:bg-copper active:scale-[0.98] transition-colors
Secondary button:       border-2 border-clay text-clay font-semibold px-6 py-3 rounded-lg
                        hover:bg-clay/10 transition-colors
Ghost button:           text-clay font-medium px-4 py-2 hover:bg-olive/50 rounded-lg
Input field:            bg-forest border border-olive text-cornsilk px-4 py-3 rounded-lg
                        focus:border-clay focus:ring-2 focus:ring-clay/30
Toggle (unselected):    text-cornsilk/60 rounded-md px-4 py-2
Toggle (selected):      bg-clay text-forest font-semibold rounded-md px-4 py-2
Stepper button:         bg-clay text-forest rounded-full w-14 h-14
                        hover:bg-copper active:scale-95 transition-all
Score number:           text-7xl font-extrabold text-cornsilk tabular-nums
Section heading:        text-2xl font-bold text-cornsilk
Secondary text:         text-sm text-cornsilk/60
Divider:                border-t border-olive/30
```

---

_Every screen. Every component. One palette. No exceptions._
