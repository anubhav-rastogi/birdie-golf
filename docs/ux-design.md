# Birdie — UX Design Specification

_Every screen, every state, every interaction._

_Last updated: February 11, 2026_

All visual styling (colors, typography, spacing, component specs, animations) follows **docs/ui-guidelines.md**. This document defines **what** appears on each screen, **how** the user interacts with it, and **what happens** in every state. It does not redefine visual tokens — it references them.

---

## 1. Screen Inventory & Navigation Map

Birdie has seven distinct screens organized into three modes:

**Public**
0. Landing Page (`/`) — marketing / onboarding. CTA leads to the app.

**Off-Course Mode** (data review)
1. Home — Round History (`/rounds`)
2. Post-Round Dashboard (`/rounds/[id]`)
3. Trends (`/trends`)

**On-Course Mode** (active scoring) — separate layout, no sidebar/tabs
4. New Round Setup (`/new-round`)
5. Score Entry (`/round/[id]`)
6. Scorecard View (`/round/[id]/scorecard`)
7. On-Course Stats (`/round/[id]/stats`) — live dashboard during play

### Navigation Flow

```
Landing Page (/)
  └─ [Open App / CTA] → Home (Round History)

Home (Round History)
  ├─ [New Round] → New Round Setup → Score Entry ⟷ Scorecard View ⟷ On-Course Stats
  │                                       │
  │                                       └─ [Finish Round] → Post-Round Dashboard
  │
  ├─ [Tap round] → Post-Round Dashboard
  │
  └─ [Trends tab] → Trends
```

### Top Navigation

A persistent header (per UI guidelines §8.12) with context-dependent tabs:

| Context | Left | Center/Right Tabs |
|---|---|---|
| **Off-course** | "Birdie" wordmark | Rounds · Trends |
| **On-course** | Back arrow (exits to Home with confirmation) | Score · Card · Stats |

Tab switching is instantaneous — crossfade per UI guidelines §10.4.

---

## 2. Home (Round History)

The landing screen. Shows all completed rounds and the primary CTA to start a new one.

### Layout

```
┌─────────────────────────────────┐
│  Birdie              Rounds Trends│  ← Header (56px)
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │ Pebble Beach     Feb 9, 2026││  ← Round card
│  │ 74 (+2) · 61% GIR · 30 putts││
│  └─────────────────────────────┘│
│                                 │  ← 8px gap between cards
│  ┌─────────────────────────────┐│
│  │ Home Course      Feb 5, 2026││
│  │ 78 (+6) · 50% GIR · 33 putts││
│  └─────────────────────────────┘│
│                                 │
│  ...                            │
│                                 │
│  ┌─────────────────────────────┐│
│  │       + New Round            ││  ← Primary button, bottom
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

- **"New Round" button**: Fixed at the bottom of the viewport on mobile, `16px` from the bottom safe area. Full-width minus page padding. Primary button style. On desktop, positioned at the top-right of the list instead.
- **Round list**: Scrollable vertical list. Cards per UI guidelines §8.13. Sorted by date, most recent first.

### Round Card Content

Each card displays:
- **Line 1**: Course name (left, `heading-md`), date (right, `caption`, `text-cornsilk/40`). If no course name, show "Round" with the date.
- **Line 2**: Score vs. par (colored per UI guidelines §3.4, `score-sm`), then key stats separated by ` · `: GIR% (`"61% GIR"`), FW% (`"64% FW"`), total putts (`"30 putts"`). All in `caption`, `text-cornsilk/60`.

### States

**Empty state** (no rounds):
```
┌─────────────────────────────────┐
│                                 │
│          No rounds yet          │  ← heading-md, text-cornsilk/40
│                                 │
│     [ Start Your First Round ]  │  ← Primary button
│                                 │
└─────────────────────────────────┘
```
Centered vertically and horizontally within the content area.

**Active round exists** (in-progress):
A banner appears above the round list:

```
┌─────────────────────────────────┐
│ ▶ Round in progress             │  ← bg-clay/20, rounded-lg
│   Pebble Beach · Hole 7 of 18  │
│                    [ Continue ] │  ← Ghost button, text-clay
└─────────────────────────────────┘
```

Tapping the banner or "Continue" resumes the active scoring session. The "New Round" button is hidden while a round is in progress (one active round at a time).

**Swipe-to-delete**:
- Swipe a card left to reveal a red delete zone (per UI guidelines §8.13).
- Delete zone width: 80px. Contains a trash icon centered vertically.
- Releasing with > 50% of delete zone exposed commits the delete.
- A confirmation dialog appears: "Delete this round? This can't be undone." with "Cancel" (ghost) and "Delete" (destructive, `bg-red-600 text-cornsilk`) buttons.
- On confirm, card collapses vertically over `200ms ease-out`.

### Keyboard Shortcuts (Desktop)

| Key | Action |
|---|---|
| `N` | Start new round |
| `↑` / `↓` | Navigate round list |
| `Enter` | Open selected round's dashboard |
| `Delete` / `Backspace` | Delete selected round (with confirmation) |

---

## 3. New Round Setup

A single-page form to configure the round before going to the course.

### Layout

```
┌─────────────────────────────────┐
│  ← Back                  Birdie │  ← Header
├─────────────────────────────────┤
│                                 │
│  Course Name                    │  ← Label (body-sm, cornsilk/60)
│  ┌─────────────────────────────┐│
│  │ Pebble Beach               ││  ← Text input
│  └─────────────────────────────┘│
│                                 │  ← 12px gap
│  Slope          Course Rating   │
│  ┌────────────┐ ┌──────────────┐│  ← Two inputs side by side
│  │ 142        │ │ 72.3         ││
│  └────────────┘ └──────────────┘│
│                                 │
│  Players                        │
│  ┌─────────────────────────────┐│
│  │ Me                      [×] ││  ← Player 1 (default)
│  ├─────────────────────────────┤│
│  │ Dave                    [×] ││  ← Player 2
│  ├─────────────────────────────┤│
│  │ + Add Player                ││  ← Ghost button
│  └─────────────────────────────┘│
│                                 │
│  Holes                          │
│  ┌──────────┬──────────────────┐│
│  │    9     │  ██ 18 ██        ││  ← Toggle, 18 selected
│  └──────────┴──────────────────┘│
│                                 │
│  Pars                           │
│  ┌─────────────────────────────┐│
│  │ Total Par:  [ 70 ] [72] [71]││  ← Quick-set pills
│  │                             ││
│  │ 1  2  3  4  5  6  7  8  9  ││  ← Hole-by-hole par grid
│  │ 4  4  3  4  5  4  4  3  4  ││    Tap to cycle 3→4→5
│  │                             ││
│  │ Presets: ▸ Standard (4×3,   ││  ← Collapsible preset list
│  │   4×5, 10×4)                ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │           GO →              ││  ← Primary button, large
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

### Field Behavior

**Course Name**
- Text input per UI guidelines §8.9.
- Optional. Placeholder: `"Course name (optional)"`.
- No validation. Freeform text.

**Slope / Course Rating**
- Two numeric inputs, side-by-side, each taking 50% width minus gap.
- Slope: integer, placeholder `"Slope"`. Course Rating: decimal, placeholder `"Rating"`.
- Both optional. If entered, stored for handicap context.
- Input type: `inputmode="decimal"` to show numeric keyboard on mobile.

**Players**
- Default: one player named "Me". Name is pre-filled but editable.
- "Add Player" adds a new row with an empty name input. Auto-focuses the new input.
- Maximum 4 players. "Add Player" button disappears at 4.
- Each player row has an `×` button to remove (except when only 1 player remains — `×` is hidden).
- Removing a player: no confirmation needed at setup.

**Holes Toggle**
- 2-way toggle: `9` | `18`. Default: `18`.
- UI guidelines §8.2 toggle group style, but 2 segments.
- Switching from 18 to 9 after setting pars: keeps holes 1-9 pars, discards 10-18.

**Pars Section**
- **Quick-set row**: Three pill buttons for total par: `70`, `71`, `72`. Tapping one fills all holes with par 4, then the user taps individual holes to make them par 3 or par 5.
  - `72` selected by default on first load.
  - Pill style: same as club selector pills (UI guidelines §8.4).
- **Hole-by-hole grid**: A compact row of numbers. Each cell shows the hole number (top, `caption`) and its par (bottom, `body`, `font-semibold`). Tapping a cell cycles: `3 → 4 → 5 → 3`.
  - Cell size: 36×48px minimum.
  - Active (being tapped): brief `bg-clay/20` flash.
  - For 18 holes: two rows of 9.
- **Presets**: A collapsible section below the grid. "Presets ▾" ghost button. Expands to show common layouts:
  - "Standard" — 4 par 3s, 4 par 5s, 10 par 4s
  - "Par 70" — 4 par 3s, 2 par 5s, 12 par 4s
  - "Par 71" — 3 par 3s, 4 par 5s, 11 par 4s (or other common variant)
  - Tapping a preset fills the grid. Preset doesn't assign specific holes — it sets the distribution. User then taps to reposition par 3s and 5s.

**GO Button**
- Primary button, full-width, `py-4` (taller than standard).
- Text: "GO" or "Let's Go" — `heading-md`, `font-bold`.
- Disabled state if: no players have a name (at least one name required).
- On tap: creates the round, transitions to Score Entry, Hole 1.

### Validation

Minimal. This form is designed to be fast, not thorough.
- Course name, slope, rating: no validation. All optional.
- Players: at least one player with a non-empty name.
- Pars: always valid (default is all par 4s).
- The GO button remains enabled in all realistic scenarios.

### Responsive Behavior

- **Mobile**: Single column. All fields full-width. Slope/Rating go full-width stacked below 360px viewport.
- **Tablet+**: Slope/Rating stay side-by-side. Par grid may show in a single row of 18. Max content width: 560px centered.

---

## 4. Score Entry (The Core Loop)

The most important screen. Where the golfer spends 95% of on-course time. Every design decision optimizes for speed and one-thumb use.

### Screen Structure

```
┌─────────────────────────────────┐
│  ← Home    Score  Card  Stats   │  ← Header (56px)
├─────────────────────────────────┤
│  Me   Dave   Chris   Pat        │  ← Player selector (40px)
├─────────────────────────────────┤
│  74(+2) │ 30 putts │ 7/12 │ 5/8│  ← Running totals bar (48px)
├─────────────────────────────────┤
│                                 │
│  ┌─── Hole Card ──────────────┐ │
│  │ ⑤  Par 4            5/18  │ │  ← Hole number + par + progress
│  │                            │ │
│  │      [ − ]   4   [ + ]    │ │  ← Score stepper (hero)
│  │            PAR 4           │ │
│  │                            │ │
│  │      [ − ]   2   [ + ]    │ │  ← Putts stepper
│  │            PUTTS           │ │
│  │                            │ │
│  │  ┌───────┬───────┬───────┐ │ │
│  │  │ LEFT  │  HIT  │ RIGHT │ │ │  ← Fairway toggle
│  │  └───────┴───────┴───────┘ │ │
│  │                            │ │
│  │  ┌────────────┬───────────┐│ │
│  │  │    HIT     │   MISS    ││ │  ← GIR toggle
│  │  └────────────┴───────────┘│ │
│  │                            │ │
│  │         [ LONG ]           │ │  ← Miss direction diamond
│  │    [LEFT]  ·  [RIGHT]      │ │    (only if GIR = MISS)
│  │        [ SHORT ]           │ │
│  │                            │ │
│  │  ┌───────┬───────┬───────┐ │ │
│  │  │ FRONT │CENTER │ BACK  │ │ │  ← Pin position toggle
│  │  └───────┴───────┴───────┘ │ │
│  │                            │ │
│  │  ▾ More details            │ │  ← Expand secondary fields
│  └────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### Player Selector Bar

- Positioned directly below the header, above the running totals bar.
- Horizontally scrollable row of player name tabs.
- Per UI guidelines §8.12 player selector spec.
- **Single player**: bar is hidden entirely. No selector needed.
- **Tapping a name**: switches all displayed data (score, putts, fairway, etc.) to that player's data for the current hole. Transition is instant (no animation — data swap only).
- Active player tab: `text-clay`, `border-b-2 border-clay`.
- Inactive player tab: `text-cornsilk/50`.

### Running Totals Bar

Per UI guidelines §8.6. Always visible, sticky below the header (and player selector if present).

**Stats displayed** (left to right):
1. Total score with vs. par: e.g., `"74 (+2)"`. Score in `score-sm`, vs. par colored per UI guidelines §3.4.
2. Total putts: e.g., `"30 putts"`.
3. GIR: e.g., `"7/12 GIR"`. Denominator is holes played so far.
4. Fairways: e.g., `"5/8 FW"`. Denominator is par 4/5 holes played.

Stats update instantly on every input change.

**Tap behavior**: Tapping a stat in the running totals bar does nothing (no drill-down from here — stats detail is on the Dashboard tab).

### Hole Card

The main content area. One card per hole. Per UI guidelines §8.5.

**Hole indicator** (top of card):
- Left: Hole number in a `bg-clay` circle badge (32px), `text-forest`. Par label beside it: "Par 4" in `caption`, `text-cornsilk/60`.
- Right: Progress indicator: "5/18" in `caption`, `text-cornsilk/60`.

#### Primary Fields

All fields render vertically stacked with `gap-3` (12px).

**Score Stepper**
- Per UI guidelines §8.1.
- Default value: the hole's par.
- Range: 1 to 15.
- Reaching the boundary: stepper button becomes `bg-clay/30`, `text-forest/50` (disabled state). Tapping a disabled stepper does nothing.
- The score number (`score-hero`, 72px) pulses on change (scale 1.05 → 1 over 100ms).
- The vs-par label below the number updates contextually: shows "BIRDIE", "PAR", "BOGEY", "DOUBLE", etc. in `caption`, colored per UI guidelines §3.4 relative-to-par rules.

**Putts Stepper**
- Same mechanics as score stepper but smaller: number at `score-sm` (20px).
- Default: 2. Range: 0–6.
- Label: "PUTTS" below the number.

**Fairway Toggle**
- 3-way toggle: `← LEFT` | `HIT` | `RIGHT →`.
- Per UI guidelines §8.2.
- **Hidden on par 3s**. The entire row does not render for par 3 holes.
- Default: no selection (all segments unselected). This is a required field — but no enforcement prevents advancing. The field simply remains empty if the golfer skips it.
- Arrow icons (← →) accompany the LEFT/RIGHT labels for quick visual parsing.

**GIR Toggle**
- 2-way toggle: `HIT` | `MISS`.
- **Auto-derivation**: When the golfer enters score and putts, GIR is auto-calculated:
  - If `score - putts ≤ par - 2` → GIR = HIT.
  - Otherwise → GIR = MISS.
  - Auto-derived value is applied visually but the toggle remains interactive. Tapping overrides the auto value.
- When GIR = MISS: the Miss Direction Diamond appears below (animated expand, `200ms ease-out`).
- When GIR = HIT: the Miss Direction Diamond is hidden (animated collapse).

**Miss Direction Diamond**
- Per UI guidelines §8.3.
- Only visible when GIR = MISS.
- 4 circular buttons in a cross/diamond layout: SHORT (bottom), LONG (top), LEFT (left), RIGHT (right).
- **Multi-select**: Each button toggles independently. "Short" + "Right" = short-right miss.
- Visual feedback: selected buttons use `bg-clay text-forest`, unselected use `bg-olive text-cornsilk/60`.
- Haptic on each toggle.

**Pin Position Toggle**
- 3-way toggle: `FRONT` | `CENTER` | `BACK`.
- Default: CENTER (pre-selected on every hole).
- Always visible, always interactive.

#### Secondary Fields (Collapsed)

Below the pin position toggle, a ghost button: `"More details ▾"`.

**Expand/Collapse behavior**:
- Tapping "More details ▾" expands the section. Arrow rotates to ▴.
- Animation: `max-height` transition `200ms ease-out`, content opacity `0 → 1` over `150ms` with `50ms` delay (per UI guidelines §10.4).
- The expanded state persists per-session — if the golfer expands on Hole 3, it stays expanded on Hole 4. Collapse is manual.

**Fields when expanded** (stacked vertically, `gap-3`):

| Field | Component | Visibility |
|---|---|---|
| Penalties | Stepper (min 0, max 10, default 0). `score-sm` size. | Always |
| Club into green | Horizontal scrollable pill row (UI guidelines §8.4). Options: W, 3W, 3i, 4i, 5i, 6i, 7i, 8i, 9i, PW, GW, SW, LW. | Always |
| Up and down | 2-way toggle: YES / NO. Auto-derived: if GIR = MISS and score ≤ par → YES. | Only when GIR = MISS |
| Sand save | 2-way toggle: YES / NO. | Only when GIR = MISS |
| Notes | Single-line text input. Placeholder: `"Wind, lie, mental note..."`. | Always |

### Hole Navigation

**Swipe gesture**:
- Swipe left → next hole. Swipe right → previous hole.
- Threshold: 40% of viewport width or velocity > 0.5px/ms.
- Animation: current card slides out, next slides in per UI guidelines §10.4 (250ms, `cubic-bezier(0.16, 1, 0.3, 1)`).
- At Hole 1: swipe right does nothing (subtle bounce-back, 100ms).
- At last hole (9 or 18): swipe left shows a "Finish Round" prompt (see below).
- Haptic on swipe completion.

**Hole picker**:
- Tapping the hole number badge opens a hole picker overlay.
- **Overlay**: A compact grid of numbered circles (1–18 or 1–9) in a bottom sheet.
  - Sheet slides up from bottom per UI guidelines §10.4.
  - Backdrop: `bg-forest/80`.
  - Each hole number is a 40×40px circle.
  - Holes with data entered: `bg-olive`, `text-cornsilk`.
  - Holes without data: `bg-olive/50`, `text-cornsilk/30`.
  - Current hole: `bg-clay`, `text-forest`.
  - Tapping a hole jumps directly to it (no swipe animation — instant).
- **Close**: tap outside the sheet, or tap a hole.

**Keyboard shortcuts (desktop)**:

| Key | Action |
|---|---|
| `←` / `→` | Previous / next hole |
| `↑` / `↓` | Increment / decrement score |
| `P` then `↑` / `↓` | Increment / decrement putts |
| `F` then `1` / `2` / `3` | Fairway: left / hit / right |
| `G` | Toggle GIR hit/miss |
| `1`–`9`, `0` | Jump to hole 1–9, 10. Hold Shift for 11–18. |

### Auto-Save

Every input change triggers:
1. **Zustand store update** — instant, in-memory.
2. **localStorage persist** — synchronous, via Zustand persist middleware.
3. **Server Action (Postgres)** — debounced, 2-second delay after last input. Silent. No save indicator shown to the user.

No save button. No save confirmation. The golfer never thinks about saving.

**Crash recovery**: If the app restarts (tab close, phone restart, crash), Zustand restores from localStorage. The golfer returns to the exact hole and data they left.

### Finish Round

When the golfer navigates past the last hole (swipe left on Hole 18), or taps a "Finish Round" button in the running totals overflow menu:

**Confirmation dialog** (modal):
```
┌─────────────────────────────────┐
│                                 │
│        Finish this round?       │  ← heading-lg
│                                 │
│   74 (+2) · 11/18 GIR · 30 putts│  ← Summary line
│                                 │
│   ┌────────────┐ ┌─────────────┐│
│   │   Cancel   │ │ Finish Round││  ← Secondary + Primary buttons
│   └────────────┘ └─────────────┘│
└─────────────────────────────────┘
```

- Modal per UI guidelines §10.4 (backdrop fade + sheet slide).
- "Cancel" returns to scoring.
- "Finish Round": writes all data to Postgres, sets round status to "completed", clears localStorage for this round, navigates to Post-Round Dashboard with a brief celebratory haptic buzz (50ms).

**Incomplete data warning**: If more than 3 holes have no score entered, the dialog adds:
```
│   ⚠ 5 holes have no score entered.    │
│   You can always edit later.           │
```
This is informational, not blocking. The golfer can still finish.

### Back / Exit During Round

Tapping `← Home` in the header during an active round:

**Confirmation dialog**:
```
"Leave this round? Your progress is saved. You can continue from the home screen."
[ Stay ] [ Leave ]
```

"Leave" returns to Home. The round stays in "active" status. The in-progress banner appears on Home.

---

## 5. Scorecard View

Accessed via the "Card" tab during or after a round.

### Layout

The scorecard is a dense grid mimicking a traditional paper scorecard. It prioritizes landscape orientation.

**Landscape hint** (portrait mobile only):
When viewport width < 640px and the device is in portrait, show a subtle prompt:
```
┌─────────────────────────────────┐
│  📱↔ Rotate for best view       │  ← caption, text-cornsilk/40
└─────────────────────────────────┘
```
Dismisses on rotate or tap. Does not block usage — the scorecard still works in portrait with horizontal scroll.

### Grid Structure

```
┌────┬───┬───┬───┬───┬───┬───┬───┬───┬───┬─────┐
│Hole│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │ OUT │
├────┼───┼───┼───┼───┼───┼───┼───┼───┼───┼─────┤
│Par │ 4 │ 4 │ 3 │ 4 │ 5 │ 4 │ 4 │ 3 │ 4 │  35 │
├────┼───┼───┼───┼───┼───┼───┼───┼───┼───┼─────┤
│ Me │ 4 │ 5 │ 3 │ 3 │ 5 │ 4 │ 6 │ 2 │ 4 │  36 │
│ P  │ 2 │ 2 │ 2 │ 1 │ 2 │ 2 │ 3 │ 1 │ 2 │  17 │
│GIR │ ✓ │ ✗ │ ✓ │ ✓ │ ✓ │ ✓ │ ✗ │ ✓ │ ✓ │ 7/9 │
│ FW │ ✓ │ ← │   │ → │ ✓ │ ✓ │ ← │   │ ✓ │ 4/7 │
├────┼───┼───┼───┼───┼───┼───┼───┼───┼───┼─────┤
│Dave│ 5 │ 4 │ 4 │ 4 │ 6 │ 5 │ 4 │ 3 │ 5 │  40 │
│ ... │
```

(Repeats for holes 10–18 with IN and TOT columns.)

- Per UI guidelines §8.7 for all styling.
- Score cells use color coding per UI guidelines §8.7 score cell table.
- GIR row: `✓` in `text-clay`, `✗` in `text-cornsilk/40`.
- FW row: `✓` in `text-clay`, `←` in `text-cornsilk/60`, `→` in `text-cornsilk/60`. Empty for par 3s.
- Putts row: number in `text-cornsilk/60`.

### Interaction

**Cell tap** (during active round):
- Tapping any score cell navigates to that hole in Score Entry view. Switches to the "Score" tab with that hole active.
- Feedback: cell briefly highlights with `bg-clay/20` on tap.

**Cell tap** (completed round):
- Same behavior — opens Score Entry in edit mode for that hole.

**Scroll behavior**:
- Horizontal scroll on mobile. The "Hole" column is sticky-left (`sticky left-0`, `bg-forest`, `z-10`) so player names and row labels stay visible while scrolling.
- Subtotal columns (OUT, IN, TOT) are styled as visual breaks: `bg-forest`, `border-l-2 border-olive/50`.

### 18-Hole Layout

For 18 holes, the grid can be presented as:
- **Single wide table** (default on tablet/desktop): All 18 holes + OUT/IN/TOT in one row. Horizontal scroll on mobile.
- **Stacked tables** (option on mobile): Front 9 table above Back 9 table. Each is full-width without needing horizontal scroll. Toggle between layouts via a small icon button top-right of the card.

### Responsive Behavior

| Viewport | Layout |
|---|---|
| < 640px (mobile) | Horizontal scroll, sticky first column. Suggest landscape. Score cells use `score-sm` (20px). |
| 640–1024px (tablet) | Full 9-hole table visible without scroll. 18-hole still scrolls. `score-md` (32px) cells. |
| > 1024px (desktop) | Full 18-hole table visible. No scroll needed. |

---

## 6. Post-Round Dashboard

The parking-lot screen. Answers "what should I practice?" with data and visualization.

Accessed by:
- Finishing a round (auto-navigate).
- Tapping a round from the Home screen.
- "Stats" tab during an active round (shows live stats, not just completed).

### Layout

```
┌─────────────────────────────────┐
│  ← Rounds    Dashboard         │  ← Header
├─────────────────────────────────┤
│                                 │
│  Pebble Beach · Feb 9, 2026    │  ← Course + date
│                                 │
│  ┌──────┐  ┌──────┐            │
│  │  74  │  │  30  │            │  ← Stat cards row 1
│  │Score │  │Putts │            │
│  │ (+2) │  │1.67/h│            │
│  └──────┘  └──────┘            │
│  ┌──────┐  ┌──────┐            │  ← Stat cards row 2
│  │  61% │  │  64% │            │
│  │ GIR  │  │  FW  │            │
│  │11/18 │  │ 9/14 │            │
│  └──────┘  └──────┘            │
│  ┌──────┐  ┌──────┐            │  ← Stat cards row 3
│  │  57% │  │  2   │            │
│  │Scramb│  │Penal.│            │
│  │ 4/7  │  │strks │            │
│  └──────┘  └──────┘            │
│                                 │
│  ─── Miss Pattern ───          │  ← Section heading
│                                 │
│      ┌───────────────┐         │
│      │    LONG        │         │
│      │   ●            │         │  ← Miss map (green oval)
│      │     ●  ·   ●  │         │    Dots colored by pin
│      │  ●      ●     │         │
│      │    SHORT       │         │
│      └───────────────┘         │
│      ● Front ● Center ● Back  │  ← Legend
│                                 │
│  ─── Club Performance ───      │
│                                 │
│  ┌─────────────────────────────┐│
│  │Club │ App │ GIR │ GIR%│Miss││  ← Club table
│  │ 7i  │  5  │  3  │ 60% │ S  ││
│  │ 8i  │  4  │  3  │ 75% │ —  ││
│  │ PW  │  3  │  2  │ 67% │ L  ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │  Export: [CSV]  [JSON]      ││  ← Export buttons
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

### Stat Cards Grid

- Per UI guidelines §8.10.
- 2-column grid on mobile (`gap-3`). 3-column on tablet+.
- Each card: `bg-olive`, `rounded-lg`, `p-4`.
- Primary value at `heading-lg` (24px) or `score-lg` (48px) for the score card.
- Cards displayed in order: Score, Putts, GIR, Fairways, Scrambling, Penalties.
- Sand Saves card appears only if any sand save attempt was recorded.

**Score card** (featured):
- The score card is the largest — spans full width on mobile (or uses `score-lg` for the number).
- Shows: `"74"` in `score-lg`, `"(+2)"` colored per UI guidelines §3.4, course name in `body-sm text-cornsilk/60`.

### Miss Pattern Visualization (Miss Map)

The signature feature. Per UI guidelines §8.11.

**Rendering logic**:
- One dot per GIR miss in the round.
- Dot position is calculated from the miss direction:
  - `SHORT` → bottom center of oval.
  - `LONG` → top center.
  - `LEFT` → left center.
  - `RIGHT` → right center.
  - `SHORT + RIGHT` → bottom-right (45-degree offset).
  - `SHORT + LEFT` → bottom-left.
  - `LONG + RIGHT` → top-right.
  - `LONG + LEFT` → top-left.
- Dots within the same direction get slight random jitter (±8px) to avoid perfect overlap.
- Dot color is based on pin position for that hole: Front = `clay`, Center = `cornsilk`, Back = `copper`.

**Dot entrance animation**: Each dot scales in from 0 → 1 over `300ms ease-out`, staggered 50ms per dot (per UI guidelines §10.4).

**Empty state** (no GIR misses — all greens hit):
```
┌───────────────────────┐
│                       │
│   All greens in       │  ← heading-md, text-clay
│   regulation!         │
│                       │
│   No miss pattern     │  ← body-sm, text-cornsilk/60
│   to show.            │
│                       │
└───────────────────────┘
```

**Interaction**: The miss map is read-only. No tap interactions.

### Club Performance Table

- Standard table per UI guidelines §8.14 (table borders per §7).
- Columns: Club, Approaches, GIR, GIR%, Avg Miss Direction.
- Sorted by number of approaches, descending.
- Avg Miss shows the most common miss direction for that club, or `"—"` if no misses.
- **Hidden entirely** if no club data was entered during the round.

### Export Buttons

Two secondary buttons, side by side:
- **CSV**: Downloads a `.csv` file with all hole data for this round.
- **JSON**: Downloads a `.json` file with the full round data structure.

File naming: `birdie-{course-name}-{date}.csv` or `.json`. Course name is slugified. If no course name: `birdie-round-{date}`.

### Responsive Behavior

| Viewport | Layout |
|---|---|
| < 640px | Stat cards: 2-column. Miss map: full width (max 320px centered). Club table: horizontal scroll if needed. |
| 640–1024px | Stat cards: 3-column. Miss map: inline beside stat cards. Club table: full width. |
| > 1024px | Side-by-side: stat cards + miss map on left, club table on right. Max content width: 960px. |

---

## 7. Trends (Multi-Round)

Available when the golfer has 2+ rounds. Full value at 5+ rounds.

### Layout

```
┌─────────────────────────────────┐
│  Birdie              Rounds Trends│  ← Trends tab active
├─────────────────────────────────┤
│                                 │
│  ─── Score Over Time ───       │
│  ┌─────────────────────────────┐│
│  │  📈  (line chart)           ││  ← Score trend
│  │  Primary line: total score  ││
│  │  Secondary line: vs. par    ││
│  └─────────────────────────────┘│
│                                 │
│  ─── GIR % ───                 │
│  ┌─────────────────────────────┐│
│  │  📈  (line chart)           ││  ← GIR trend
│  └─────────────────────────────┘│
│                                 │
│  ─── Putts per GIR ───         │
│  ┌─────────────────────────────┐│
│  │  📈  (line chart)           ││  ← Putts per GIR trend
│  └─────────────────────────────┘│
│                                 │
│  ─── Fairway % ───             │
│  ┌─────────────────────────────┐│
│  │  📈  (line chart)           ││  ← FW% trend
│  └─────────────────────────────┘│
│                                 │
│  ─── Scrambling % ───          │
│  ┌─────────────────────────────┐│
│  │  📈  (line chart)           ││  ← Scrambling trend
│  └─────────────────────────────┘│
│                                 │
│  ─── Career Miss Pattern ───   │
│  ┌─────────────────────────────┐│
│  │                             ││  ← Cumulative miss map
│  │   (green oval with all      ││    All rounds aggregated
│  │    misses from all rounds)  ││
│  │                             ││
│  └─────────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

### Trend Charts

Per UI guidelines §8.14.

Each chart is a custom SVG line chart inside an olive card.

**Common chart properties**:
- X-axis: round date (formatted `"MM/DD"` or `"MMM D"` if space allows).
- Y-axis: the stat value.
- Both axes use `caption` (12px), `text-cornsilk/50`.
- Grid lines: dashed, `olive/30`.
- Data points: `fill-clay`, 4px radius. Hover: 6px with cornsilk stroke.
- Primary line: `stroke-clay`, 2.5px.
- Tooltip on hover/tap: `bg-forest`, `border-olive`, `rounded-lg`, `p-3`, `shadow-sm`. Shows date, value, and course name.

**Score chart specifics**:
- Primary line: total score.
- Secondary line: vs. par (dashed, `stroke-copper`).
- Y-axis inverted conceptually (lower = better) but displayed normally. A reference line at par (e.g., 72) drawn as a dashed `cornsilk/20` line.

**GIR % chart**: Single line. Y-axis 0–100%.

**Putts per GIR chart**: Single line. Y-axis from ~1.0 to ~3.0. Computes average putts only on holes where GIR was hit (per PRD §3.6: "Are you converting better when you do hit greens?"). This is NOT total putts per hole — it specifically measures putting after reaching the green in regulation.

**Fairway % chart**: Single line. Y-axis 0–100%. Fairways hit / fairway-eligible holes (par 4s and 5s).

**Scrambling % chart**: Single line. Y-axis 0–100%.

### Cumulative Miss Map

Same rendering as the per-round miss map (UI guidelines §8.11), but aggregating all GIR misses across all rounds.

- Dots may overlap significantly. Apply increased jitter (±15px) for readability.
- If more than 30 dots, use smaller dots (8px instead of 12px).
- Consider dot opacity: `opacity: 0.7` to show density through overlap.
- The legend adds round count: "Across 12 rounds".

### States

**Fewer than 2 rounds**:
```
┌─────────────────────────────────┐
│                                 │
│   Play a few more rounds       │  ← heading-md, text-cornsilk/40
│   to see trends.               │
│                                 │
│   Trends appear after          │  ← body-sm, text-cornsilk/60
│   2+ completed rounds.         │
│                                 │
└─────────────────────────────────┘
```

**Single stat has no data** (e.g., scrambling is 0/0 across all rounds): That chart card is hidden.

### Responsive Behavior

- **Mobile**: Charts are full-width, stacked vertically. Chart height: 200px.
- **Tablet**: Charts in a 2-column grid. Chart height: 240px.
- **Desktop**: Charts in a 2-column grid. Max content width: 960px centered. Chart height: 280px.

---

## 8. Global Patterns

### 8.1 Data Loading

Since Birdie uses Next.js Server Components for data views:

- **Server-rendered pages** (Dashboard, Trends, History): No loading spinners. Data is available on first paint via server fetch. If the server is slow, the browser shows its native loading indicator.
- **Client-side scoring**: Data is local (Zustand + localStorage). Instant. No loading states needed.
- **Revalidation** (e.g., after finishing a round and returning to History): Use Next.js `revalidatePath` so the page is fresh on next navigation. No stale-while-revalidate indicators needed for MVP.

### 8.2 Error States

Errors are rare in MVP (mostly local-only). But cover them:

**Server Action failure** (Postgres write fails during scoring):
- Silent retry on next trigger (2-second debounce). No user-visible error.
- Data is safe in localStorage.
- If the user finishes a round and the final write fails: show a toast at the bottom of the screen:
  ```
  "Couldn't save to database. Your round is saved locally and will sync when the connection is restored."
  ```
  Toast: `bg-olive`, `text-cornsilk`, `rounded-lg`, `p-3`, `shadow-sm`. Auto-dismiss after 5 seconds. Dismissable on tap.

**localStorage full** (extremely unlikely):
- Catch the error. Show toast: "Storage full. Some data may not be saved. Try exporting and clearing old rounds."

### 8.3 Toast Notifications

Toasts appear at the bottom of the viewport, `16px` above the safe area.

| Property | Spec |
|---|---|
| Container | `bg-olive`, `text-cornsilk`, `rounded-lg`, `p-3 px-4`, `shadow-sm`, max-width 400px, centered |
| Animation | Slide up from below viewport over `200ms ease-out`. Slide back down on dismiss. |
| Duration | 5 seconds, then auto-dismiss |
| Interaction | Tap to dismiss immediately |
| Stacking | Maximum 1 toast visible at a time. New toast replaces old one. |

### 8.4 Offline Behavior

Birdie assumes offline is the default. The app never shows "offline" indicators or connectivity warnings.

- **Scoring**: Fully functional offline. All data is in Zustand + localStorage.
- **Server writes**: Queued silently. Execute when connectivity returns.
- **Server-rendered pages** (History, Dashboard, Trends): If the app is already loaded (PWA), cached pages are shown. If no cache exists and the user tries to navigate to a data page offline, show:
  ```
  "You're offline. Score entry works without a connection — your data will sync when you're back online."
  ```

### 8.5 PWA Install Prompt

On second visit (or after first completed round), show a dismissable banner at the top of the Home screen:

```
┌─────────────────────────────────┐
│  Add Birdie to your home screen │
│  for instant access on-course.  │
│              [ Install ]  [ × ] │
└─────────────────────────────────┘
```

- `bg-clay/20`, `text-cornsilk`, `rounded-lg`, `p-3`.
- "Install" triggers the browser's native install prompt.
- Dismissed state stored in localStorage. Don't show again after dismiss.

### 8.6 Haptic Feedback Map

Summary of all haptic triggers (per UI guidelines §10.6):

| Action | Vibration |
|---|---|
| Score stepper tap | 10ms pulse |
| Putts stepper tap | 10ms pulse |
| Toggle selection change | 10ms pulse |
| Miss direction button toggle | 10ms pulse |
| Hole swipe completion | 10ms pulse |
| Round completion | 50ms pulse |

No haptic on: page navigation, scrolling, text input, sheet open/close, tab switching.

### 8.7 Keyboard Navigation (Global)

Tab order follows visual top-to-bottom, left-to-right order on every screen. All interactive elements are focusable. Focus ring per UI guidelines §12.

**Score Entry keyboard flow**:
`Score − → Score value → Score + → Putts − → Putts value → Putts + → Fairway Left → Fairway Hit → Fairway Right → GIR Hit → GIR Miss → (if miss: Short → Left → Right → Long) → Pin Front → Pin Center → Pin Back → More Details → (secondary fields)`

**Escape key**: Closes any open modal/sheet/overlay. If none are open, no action.

---

## 9. Responsive Breakpoint Summary

| Screen | Mobile (< 640px) | Tablet (640–1024px) | Desktop (> 1024px) |
|---|---|---|---|
| **Home** | Full-width list, button fixed bottom | Same, max-width 640px centered | Max-width 640px centered, button top-right |
| **New Round Setup** | Single column, full-width inputs | Max-width 560px centered | Same as tablet |
| **Score Entry** | Full-width card, swipe nav | Max-width 480px centered card | Same as tablet |
| **Scorecard** | Horizontal scroll, suggest landscape | Full 9-hole visible | Full 18-hole visible |
| **Dashboard** | 2-col stat grid, full-width miss map | 3-col stat grid, miss map beside | Side-by-side layout, 960px max |
| **Trends** | Stacked charts, 200px tall | 2-col chart grid, 240px tall | 2-col grid, 280px tall, 960px max |

All screens: page padding `16px` mobile, `24px` tablet+. Content centered within viewport on tablet and desktop.

---

## 10. Screen-by-Screen State Checklist

### Home
- [ ] Empty (no rounds) — centered empty state with CTA
- [ ] With rounds — list sorted by date
- [ ] Active round exists — in-progress banner
- [ ] Swipe-to-delete — red zone, confirmation dialog
- [ ] After delete — card collapses, list re-renders

### New Round Setup
- [ ] Default state — 1 player "Me", 18 holes, par 72
- [ ] Adding players — up to 4, auto-focus
- [ ] Removing players — minimum 1
- [ ] Par quick-set — pills and hole grid
- [ ] GO button disabled — no player names
- [ ] GO button enabled — at least one name

### Score Entry
- [ ] Hole 1, default — par as score, 2 putts, nothing selected
- [ ] Par 3 — no fairway toggle
- [ ] Par 4/5 — fairway toggle visible
- [ ] GIR auto-derived — HIT
- [ ] GIR auto-derived — MISS, diamond appears
- [ ] GIR manual override — toggling overrides auto
- [ ] Miss direction multi-select — two directions selected
- [ ] Secondary fields collapsed
- [ ] Secondary fields expanded
- [ ] Running totals updating
- [ ] Player switching (multiplayer)
- [ ] Hole picker open
- [ ] Last hole, swipe left — finish round dialog
- [ ] Back button — leave round dialog
- [ ] Crash recovery — restores exact state

### Scorecard
- [ ] Active round — live data, cells tappable to edit
- [ ] Completed round — historical data, cells tappable to edit
- [ ] Portrait mobile — horizontal scroll, landscape hint
- [ ] Landscape mobile — full front-9 visible
- [ ] Score color coding — eagle through double+

### Dashboard
- [ ] Full data — all stat cards, miss map, club table
- [ ] No club data — club table hidden
- [ ] All GIR hit — miss map shows celebration state
- [ ] No GIR misses with club data but no misses — clean map
- [ ] Export — CSV and JSON download

### Trends
- [ ] 0–1 rounds — empty state with message
- [ ] 2+ rounds — all 5 charts render (Score, GIR%, Putts per GIR, FW%, Scrambling%)
- [ ] 5+ rounds — charts show meaningful patterns
- [ ] No scrambling data — scrambling chart hidden
- [ ] No fairway data — FW% chart hidden
- [ ] Cumulative miss map — all rounds aggregated
- [ ] Chart tooltip on hover/tap

---

_Every screen designed. Every state defined. Reference ui-guidelines.md for pixels._
