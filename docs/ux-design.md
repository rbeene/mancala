# Mancala - UX Design Specification

## Overview

A web-based Mancala board game with a natural, tactile aesthetic. The core design principle: **stones must never be individually countable** — players estimate pit contents visually, just like a real game.

---

## 1. Visual Stone Representation

### Core Concept: Organic Pile Rendering

Stones are rendered as an **amorphous, layered pile** — never as discrete countable objects. The pile grows in size, height, and visual density as count increases. Two pits with the same count should look *similar but not identical* due to randomized rendering.

### Pile Rendering Approach (CSS + SVG Hybrid)

Each pit contains a `<div class="stone-pile">` with dynamically generated content based on stone count.

#### Technique: Layered Radial Blobs

Generate 3–8 overlapping ellipses (SVG `<ellipse>` or CSS pseudo-elements) with:

- **Randomized positions** within the pit bounds (seeded by pit index + stone count to stay stable per game state, but vary between pits)
- **Gaussian blur** (`filter: blur(2px)`) to prevent individual shape recognition
- **Varying opacity** (0.4–0.8) so layers blend into a cohesive mass
- **Earth-tone color variation**: Each blob randomly picks from a palette:
  - `#8B7355` (warm stone)
  - `#6B6B6B` (gray stone)
  - `#A0926B` (sand stone)
  - `#7A6E5D` (dark earth)
  - `#9C8E7C` (light clay)

#### Pile Size Scaling by Count

| Stone Count | Pile Diameter (% of pit) | Blob Count | Blur Radius | Visual Description        |
|-------------|--------------------------|------------|-------------|---------------------------|
| 0           | 0%                       | 0          | —           | Empty pit                 |
| 1–2         | 25–30%                   | 2–3        | 1.5px       | Tiny cluster at bottom    |
| 3–4         | 35–45%                   | 3–4        | 2px         | Small mound               |
| 5–6         | 50–55%                   | 4–5        | 2.5px       | Medium pile               |
| 7–9         | 60–70%                   | 5–6        | 3px         | Substantial mound         |
| 10–14       | 75–85%                   | 6–7        | 3.5px       | Large pile, nearing edges |
| 15–24       | 85–92%                   | 7–8        | 4px         | Heaping pile, slight overflow feel |
| 25+         | 95–100%                  | 8–10       | 4.5px       | Overflowing, max density  |

#### Pile Height (3D Depth Illusion)

Use `box-shadow` and vertical offset to simulate pile height:

```css
.stone-pile {
  /* Height increases with count */
  --pile-elevation: calc(var(--stone-count) * 0.3px);
  transform: translateY(calc(var(--pile-elevation) * -1));
  box-shadow:
    0 var(--pile-elevation) calc(var(--pile-elevation) * 0.5) rgba(0, 0, 0, 0.3),
    0 calc(var(--pile-elevation) * 0.5) calc(var(--pile-elevation) * 0.3) rgba(0, 0, 0, 0.15);
}
```

#### Randomization Seed

Each pile gets a deterministic but unique appearance:

```javascript
// Seed = pitIndex * 1000 + stoneCount * 7 + someGameSalt
// Use seed for: blob positions, sizes, rotations, color picks
// This means the same count in different pits looks different,
// but a pit's appearance is stable until its count changes
```

When stone count changes, blobs should **morph/transition** (not pop) using CSS transitions:

```css
.stone-pile .blob {
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

#### Mancala (Store) Piles

Stores accumulate many more stones (up to 48). Use the same technique but:

- Allow larger blob count (up to 14)
- Pile can fill the taller store area vertically
- Slightly reduced blur (3px max) since the store is larger — still uncountable but slightly more textured
- Add a subtle inner glow at high counts to convey "fullness"

---

## 2. Board Layout

### Overall Structure

```
┌──────────────────────────────────────────────────────────────┐
│                    GAME HEADER (turn info)                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────┐  ┌────┬────┬────┬────┬────┬────┐  ┌──────┐       │
│  │      │  │ P2 │ P2 │ P2 │ P2 │ P2 │ P2 │  │      │       │
│  │  P2  │  │ 12 │ 11 │ 10 │  9 │  8 │  7 │  │  P1  │       │
│  │STORE │  ├────┼────┼────┼────┼────┼────┤  │STORE │       │
│  │      │  │ P1 │ P1 │ P1 │ P1 │ P1 │ P1 │  │      │       │
│  │      │  │  1 │  2 │  3 │  4 │  5 │  6 │  │      │       │
│  └──────┘  └────┴────┴────┴────┴────┴────┘  └──────┘       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    GAME FOOTER (controls)                     │
└──────────────────────────────────────────────────────────────┘
```

**Note on orientation**: Player 2's pits (top row) are numbered right-to-left (12→7) to match traditional Mancala counter-clockwise play. Player 1's pits (bottom row) go left-to-right (1→6). Player 1's store is on the RIGHT. Player 2's store is on the LEFT.

### Dimensions

```css
:root {
  /* Board */
  --board-max-width: 900px;
  --board-padding: 24px;
  --board-radius: 24px;
  --board-bg: linear-gradient(145deg, #8B6914, #6B4F12, #8B6914);

  /* Pits */
  --pit-size: 80px;           /* diameter */
  --pit-gap: 12px;            /* between pits */
  --pit-radius: 50%;          /* circular */
  --pit-bg: #2C1810;          /* dark wood hollow */
  --pit-inner-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.6),
                      inset 0 1px 3px rgba(0, 0, 0, 0.4);

  /* Stores (Mancalas) */
  --store-width: 90px;
  --store-height: 200px;      /* tall, spanning both rows + gap */
  --store-radius: 45px;       /* pill shape */
  --store-bg: #2C1810;

  /* Spacing */
  --row-gap: 16px;            /* between top and bottom pit rows */
  --store-gap: 20px;          /* between store and pit grid */
}
```

### Board CSS Structure

```css
.board {
  display: grid;
  grid-template-columns: var(--store-width) 1fr var(--store-width);
  grid-template-rows: auto auto;
  gap: 0 var(--store-gap);
  max-width: var(--board-max-width);
  margin: 0 auto;
  padding: var(--board-padding);
  background: var(--board-bg);
  border-radius: var(--board-radius);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
}

/* Wood grain overlay */
.board::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--board-radius);
  background: repeating-linear-gradient(
    87deg,
    transparent,
    transparent 3px,
    rgba(0, 0, 0, 0.03) 3px,
    rgba(0, 0, 0, 0.03) 4px
  );
  pointer-events: none;
}

.store-p2 {
  grid-row: 1 / 3;
  grid-column: 1;
}

.pits-container {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  gap: var(--row-gap);
}

.store-p1 {
  grid-row: 1 / 3;
  grid-column: 3;
}

.pit-row {
  display: flex;
  justify-content: space-between;
  gap: var(--pit-gap);
}
```

### Pit Styling

```css
.pit {
  width: var(--pit-size);
  height: var(--pit-size);
  border-radius: var(--pit-radius);
  background: var(--pit-bg);
  box-shadow: var(--pit-inner-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: default;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.pit[data-clickable="true"] {
  cursor: pointer;
}

.store {
  width: var(--store-width);
  height: var(--store-height);
  border-radius: var(--store-radius);
  background: var(--store-bg);
  box-shadow: var(--pit-inner-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
```

### 3D Perspective

```css
.board-wrapper {
  perspective: 1200px;
}

.board {
  transform: rotateX(3deg);
  transform-origin: center bottom;
}
```

This gives a subtle top-down angle, making the board feel like you're looking across a table.

---

## 3. Game Flow Screens

### 3.1 Welcome / Menu Screen

**Layout**: Centered card on a dark wood-textured background.

```
┌──────────────────────────────────┐
│                                  │
│          🪨 MANCALA 🪨           │  ← Rustic serif title, large
│       The Ancient Stone Game     │  ← Subtitle, smaller
│                                  │
│  ┌──────────────────────────┐    │
│  │  ○ Human vs Human        │    │  ← Radio buttons
│  │  ● Human vs Computer     │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │  ← Only visible when
│  │  Difficulty:              │    │    "vs Computer" selected
│  │  [Easy] [Medium] [Hard]  │    │
│  │                           │    │
│  │  "Easy: Makes occasional  │    │  ← Description updates
│  │   mistakes, good for      │    │    per selection
│  │   learning"               │    │
│  └──────────────────────────┘    │
│                                  │
│       ┌──────────────────┐       │
│       │    START GAME     │       │  ← Primary CTA
│       └──────────────────┘       │
│                                  │
└──────────────────────────────────┘
```

**Difficulty descriptions**:
- **Easy**: "Relaxed play. The computer sometimes makes suboptimal moves — great for learning the rules."
- **Medium**: "A fair challenge. The computer plays solid strategy but won't punish every mistake."
- **Hard**: "Expert level. The computer looks several moves ahead and plays to win."

**Styling**:

```css
.menu-card {
  max-width: 480px;
  margin: 10vh auto;
  padding: 48px 40px;
  background: linear-gradient(160deg, #3E2B1A, #2C1D10);
  border-radius: 20px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
  text-align: center;
}

.game-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 3rem;
  font-weight: 700;
  color: #E8D5B0;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.game-subtitle {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 1rem;
  color: #A89070;
  margin-bottom: 36px;
}

.start-button {
  padding: 14px 48px;
  font-size: 1.125rem;
  font-weight: 600;
  font-family: 'Inter', system-ui, sans-serif;
  color: #1A1A1A;
  background: linear-gradient(180deg, #D4A843, #B8922E);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 4px 16px rgba(180, 130, 40, 0.3);
}

.start-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(180, 130, 40, 0.45);
}

.start-button:active {
  transform: translateY(0);
}
```

### 3.2 Game Board Screen

See Section 2 for board layout. Additional UI around the board:

**Header Area** (above board):

```
┌─────────────────────────────────────────────────┐
│  Computer (Hard) ● ←turn dot    [vs]   ○ You    │
│                  ▼ active side indicator          │
└─────────────────────────────────────────────────┘
```

- Active player name is bold + accent color (gold for P1, blue for P2)
- A filled dot `●` appears next to the current player
- When vs Computer, show difficulty as a subtle badge

**Footer Area** (below board):

```
┌─────────────────────────────────────────────────┐
│  [New Game]                    [Rules (?)]       │
└─────────────────────────────────────────────────┘
```

- "New Game" button: muted style, always accessible
- "Rules" button: opens a slide-out or modal with game rules

### 3.3 Game Over Screen

Rendered as a modal overlay on top of the board (board stays visible behind a dimmed backdrop).

```
┌──────────────────────────────────────┐
│                                      │
│           🎉 GAME OVER 🎉            │
│                                      │
│          ┌──────────────┐            │
│          │   YOU WIN!    │            │  ← or "Computer Wins!"
│          │   28 — 20     │            │     or "It's a Tie!"
│          └──────────────┘            │
│                                      │
│   ┌────────────┐  ┌──────────────┐   │
│   │  NEW GAME  │  │  MAIN MENU   │   │
│   └────────────┘  └──────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

**Styling**:

```css
.game-over-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.4s ease;
}

.game-over-card {
  background: linear-gradient(160deg, #3E2B1A, #2C1D10);
  border-radius: 20px;
  padding: 48px 56px;
  text-align: center;
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.winner-text {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2.25rem;
  color: #E8D5B0;
  margin-bottom: 8px;
}

.final-score {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 1.5rem;
  color: #A89070;
  margin-bottom: 32px;
}

/* Winner's score in their accent color */
.final-score .p1-score { color: #D4A843; }
.final-score .p2-score { color: #5B8BD4; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
```

---

## 4. Interactions & Animations

### 4.1 Pit Hover (Current Player's Pits Only)

```css
.pit[data-clickable="true"]:hover {
  box-shadow:
    var(--pit-inner-shadow),
    0 0 12px 2px rgba(212, 168, 67, 0.35);   /* warm gold glow for P1 */
  transform: scale(1.03);
}

/* P2's pits when it's P2's turn (human vs human) */
.pit[data-player="2"][data-clickable="true"]:hover {
  box-shadow:
    var(--pit-inner-shadow),
    0 0 12px 2px rgba(91, 139, 212, 0.35);    /* blue glow for P2 */
}
```

Non-active pits have `pointer-events: none` and `opacity: 0.85` to feel inactive.

### 4.2 Scoop Animation (On Pit Click)

When a player clicks a pit:

1. **Pit dips** (0–100ms): The pit background briefly darkens and the pile scales down

```css
@keyframes scoop {
  0%   { transform: scale(1); opacity: 1; }
  30%  { transform: scale(0.7); opacity: 0.6; }
  60%  { transform: scale(0.3); opacity: 0.2; }
  100% { transform: scale(0); opacity: 0; }
}

.stone-pile.scooping {
  animation: scoop 0.35s ease-in forwards;
}
```

2. **Pit recoils** (100–250ms): Subtle bounce on the pit itself

```css
@keyframes pitRecoil {
  0%   { transform: scale(1); }
  40%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.pit.scooped {
  animation: pitRecoil 0.25s ease-out;
}
```

### 4.3 Stone Distribution

After scoop, stones are distributed counter-clockwise, one per pit:

- **Timing**: 220ms between each pit drop
- **Total duration**: `numStones * 220ms` (e.g., 4 stones = ~0.9s)
- **Per-pit "drop" animation**: The target pit's pile quickly grows

```css
@keyframes dropStone {
  0%   { transform: scale(0.9); }
  50%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}

.stone-pile.receiving {
  animation: dropStone 0.2s ease-out;
}
```

- **Active pit highlight**: As each stone is "placed," the target pit briefly lights up with a subtle ring:

```css
.pit.drop-target {
  box-shadow:
    var(--pit-inner-shadow),
    0 0 8px 1px rgba(255, 255, 255, 0.15);
  transition: box-shadow 0.15s ease;
}
```

- **Sound** (optional): A soft "clk" sound per drop — wood/stone contact. Keep volume low, provide mute toggle.

### 4.4 Capture Animation

When the last stone lands in an empty pit on the player's side, capturing the opposite pit:

1. **Both pits highlight** (0–300ms): The landing pit and opposite pit glow with the player's accent color

```css
.pit.capture-source,
.pit.capture-target {
  box-shadow:
    var(--pit-inner-shadow),
    0 0 16px 4px rgba(212, 168, 67, 0.5);
  animation: captureFlash 0.3s ease;
}

@keyframes captureFlash {
  0%, 100% { box-shadow: var(--pit-inner-shadow), 0 0 16px 4px rgba(212, 168, 67, 0.5); }
  50%      { box-shadow: var(--pit-inner-shadow), 0 0 24px 8px rgba(212, 168, 67, 0.7); }
}
```

2. **Stones flow to store** (300–800ms): The pile in both pits shrinks while the store's pile grows. Use a CSS transform + opacity transition on a "phantom" pile element that moves from pit to store:

```css
.capture-phantom {
  position: absolute;
  transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
  /* Start at pit position, end at store position */
  /* JS sets --target-x, --target-y */
}

.capture-phantom.moving {
  transform: translate(var(--target-x), var(--target-y));
  opacity: 0.5;
}
```

### 4.5 Extra Turn Notification

When a player earns an extra turn (last stone lands in their store):

```css
.extra-turn-banner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 32px;
  background: rgba(212, 168, 67, 0.9);
  color: #1A1A1A;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 12px;
  animation: extraTurnPop 1.5s ease forwards;
  z-index: 50;
}

@keyframes extraTurnPop {
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  15%  { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
  25%  { transform: translate(-50%, -50%) scale(1); }
  75%  { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -50%) translateY(-20px); }
}
```

Display text: **"Extra Turn!"** — visible for ~1.5 seconds, then fades up.

### 4.6 Invalid Move (Empty Pit Click)

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-4px); }
  40%      { transform: translateX(4px); }
  60%      { transform: translateX(-3px); }
  80%      { transform: translateX(3px); }
}

.pit.invalid-move {
  animation: shake 0.4s ease;
  box-shadow:
    var(--pit-inner-shadow),
    0 0 8px 2px rgba(180, 60, 60, 0.4);
}
```

The red glow fades after 0.4s. No disruptive error message — the shake communicates "nope."

### 4.7 Game Over — Remaining Stones Sweep

When the game ends (one side is empty), all remaining stones on the other side sweep to that player's store:

- **Timing**: 150ms stagger between each pit (left to right for P1, right to left for P2)
- **Animation per pit**: Pile shrinks to 0, phantom pile travels to store
- **Store pile grows** after each pit empties
- **Total duration**: ~1.2s for 6 pits

### 4.8 Computer "Thinking" Indicator

When it's the computer's turn:

```css
.thinking-indicator {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.thinking-indicator .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5B8BD4;
  animation: thinkingPulse 1.2s ease-in-out infinite;
}

.thinking-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
.thinking-indicator .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes thinkingPulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50%      { opacity: 1; transform: scale(1); }
}
```

Add a 400–800ms artificial delay before the computer makes its move, so it doesn't feel instantaneous. The thinking dots show during this delay.

---

## 5. Information Display

### 5.1 Turn Indicator

Located in the header bar above the board:

```html
<div class="turn-indicator">
  <div class="player-label player-1" data-active="true">
    <span class="turn-dot"></span>
    <span class="player-name">You</span>
  </div>
  <span class="vs-divider">vs</span>
  <div class="player-label player-2" data-active="false">
    <span class="player-name">Computer</span>
    <span class="difficulty-badge">Hard</span>
    <span class="turn-dot"></span>
  </div>
</div>
```

```css
.player-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 1.125rem;
  color: #8A7A6A;
  transition: color 0.3s ease;
}

.player-label[data-active="true"] {
  font-weight: 700;
}

.player-label.player-1[data-active="true"] {
  color: #D4A843;
}

.player-label.player-2[data-active="true"] {
  color: #5B8BD4;
}

.turn-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
  transition: background 0.3s ease;
}

.player-label[data-active="true"] .turn-dot {
  background: currentColor;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 currentColor; }
  50%      { box-shadow: 0 0 0 4px transparent; }
}

.difficulty-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(91, 139, 212, 0.15);
  color: #5B8BD4;
  margin-left: 6px;
  font-weight: 500;
}
```

### 5.2 Score Display

Scores are displayed **inside each store**, overlaid on the stone pile:

```css
.store-score {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  z-index: 2;  /* Above pile */
  pointer-events: none;
}
```

The score number is readable but doesn't dominate — it's a small numeral at the bottom of the store. This is the **only numeric count** visible on the board. Pit stone counts are never shown numerically.

### 5.3 Active Side Indicator

The active player's side of the board has a subtle glowing border along their pit row:

```css
.pit-row[data-active="true"]::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 12px;
  box-shadow: 0 0 12px 2px var(--player-accent-color);
  opacity: 0.25;
  animation: glowPulse 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.15; }
  50%      { opacity: 0.3; }
}
```

### 5.4 Last Move Indicator

After each move, briefly highlight the path of the last move:

- The source pit gets a fading ring (0.8s fade)
- The last pit in the distribution path gets a slightly brighter ring
- These fade away after 1.5s, before the next turn

### 5.5 Footer Controls

```css
.game-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: var(--board-max-width);
  margin: 16px auto 0;
  padding: 0 8px;
}

.btn-secondary {
  padding: 8px 20px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #A89070;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #D4C4A8;
}
```

---

## 6. Color Palette & Typography

### Color Tokens

```css
:root {
  /* Background */
  --color-page-bg: #1A1209;           /* Deep dark wood */
  --color-board-bg: #6B4F12;          /* Medium wood */
  --color-pit-bg: #2C1810;            /* Dark hollow */

  /* Player Colors */
  --color-p1-accent: #D4A843;         /* Warm gold */
  --color-p1-accent-soft: rgba(212, 168, 67, 0.2);
  --color-p2-accent: #5B8BD4;         /* Steel blue */
  --color-p2-accent-soft: rgba(91, 139, 212, 0.2);

  /* Stone Palette */
  --color-stone-1: #8B7355;           /* Warm stone */
  --color-stone-2: #6B6B6B;           /* Gray */
  --color-stone-3: #A0926B;           /* Sand */
  --color-stone-4: #7A6E5D;           /* Dark earth */
  --color-stone-5: #9C8E7C;           /* Clay */

  /* Text */
  --color-text-primary: #E8D5B0;      /* Warm cream */
  --color-text-secondary: #A89070;    /* Muted sand */
  --color-text-disabled: #6B5D4D;     /* Faded */

  /* UI */
  --color-border: rgba(255, 255, 255, 0.1);
  --color-error: #C45454;             /* Muted red */
  --color-success: #5DAE6B;           /* Soft green */
}
```

### Typography

```css
/* Fonts — load via Google Fonts or self-host */
/* Primary display:  Playfair Display (serif) — for title only */
/* Primary UI:       Inter (sans-serif) — for everything else */

:root {
  --font-display: 'Playfair Display', Georgia, 'Times New Roman', serif;
  --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

/* Scale */
.text-title    { font: 700 3rem/1.1 var(--font-display); }
.text-heading  { font: 700 1.5rem/1.3 var(--font-ui); }
.text-body     { font: 400 1rem/1.5 var(--font-ui); }
.text-small    { font: 500 0.875rem/1.4 var(--font-ui); }
.text-caption  { font: 400 0.75rem/1.4 var(--font-ui); }
```

---

## 7. Mobile Responsiveness

### Breakpoints

```css
/* Tablet: 768px and below */
/* Phone:  480px and below */
```

### Tablet Adjustments (≤768px)

```css
@media (max-width: 768px) {
  :root {
    --pit-size: 64px;
    --pit-gap: 8px;
    --store-width: 72px;
    --store-height: 160px;
    --board-padding: 16px;
    --board-max-width: 100%;
  }

  .board {
    margin: 0 12px;
    border-radius: 16px;
  }

  .game-title {
    font-size: 2.25rem;
  }
}
```

### Phone Adjustments (≤480px)

```css
@media (max-width: 480px) {
  :root {
    --pit-size: 52px;
    --pit-gap: 6px;
    --store-width: 56px;
    --store-height: 130px;
    --board-padding: 12px;
    --row-gap: 10px;
    --store-gap: 10px;
  }

  .board {
    margin: 0 8px;
    transform: none; /* Remove 3D perspective on mobile for simplicity */
  }

  .game-title {
    font-size: 1.75rem;
  }

  .store-score {
    font-size: 1.125rem;
  }

  .player-label {
    font-size: 0.9375rem;
  }
}
```

### Touch Targets

```css
/* Ensure all clickable pits meet 44px minimum tap target */
.pit {
  min-width: 44px;
  min-height: 44px;
}

/* On touch devices, use tap instead of hover */
@media (hover: none) {
  .pit[data-clickable="true"]:hover {
    /* Reset hover styles — they'd stick on touch */
    box-shadow: var(--pit-inner-shadow);
    transform: none;
  }

  .pit[data-clickable="true"]:active {
    box-shadow:
      var(--pit-inner-shadow),
      0 0 12px 2px rgba(212, 168, 67, 0.35);
    transform: scale(0.97);
  }
}
```

### Viewport Lock

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

```css
/* Prevent pull-to-refresh and overscroll */
html, body {
  overscroll-behavior: none;
  touch-action: manipulation; /* Disables double-tap-to-zoom */
}
```

---

## 8. Accessibility

### Keyboard Navigation

```css
/* Visible focus ring */
.pit:focus-visible,
.store:focus-visible,
button:focus-visible {
  outline: 2px solid var(--color-p1-accent);
  outline-offset: 3px;
}
```

**Tab order**: Left store → Top row pits (left to right) → Right store → Bottom row pits (left to right) → Footer buttons.

Only interactive (clickable) pits are in the tab order (`tabindex="0"`). Non-interactive pits get `tabindex="-1"`.

**Key bindings**:
- `Enter` or `Space`: Select the focused pit
- `Arrow Left/Right`: Move between pits in the same row
- `Arrow Up/Down`: Jump between rows
- `Escape`: Close modals/overlays

### ARIA Labels

```html
<!-- Pit with ARIA -->
<button
  class="pit"
  role="button"
  aria-label="Pit 3, your side, 4 stones"
  aria-describedby="pit-3-hint"
  tabindex="0"
>
  <div class="stone-pile" aria-hidden="true">
    <!-- Visual pile, hidden from screen readers -->
  </div>
</button>
<span id="pit-3-hint" class="sr-only">
  Select to distribute 4 stones counter-clockwise
</span>

<!-- Store with ARIA -->
<div
  class="store"
  role="region"
  aria-label="Your store, 12 stones"
>
  <div class="stone-pile" aria-hidden="true"></div>
  <span class="store-score" aria-hidden="true">12</span>
</div>

<!-- Turn announcements (live region) -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  It's your turn.
</div>

<!-- Extra turn announcement -->
<div aria-live="assertive" class="sr-only">
  Extra turn! You go again.
</div>
```

**Screen-reader-only utility class**:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### High Contrast Mode

Provide a toggle button (moon/sun icon or "High Contrast" text) in the footer:

```css
.high-contrast {
  --color-page-bg: #000000;
  --color-board-bg: #1A1A1A;
  --color-pit-bg: #0D0D0D;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #CCCCCC;
  --color-p1-accent: #FFD700;       /* Brighter gold */
  --color-p2-accent: #66AAFF;       /* Brighter blue */
  --color-border: rgba(255, 255, 255, 0.3);
}

/* Thicker borders for pit visibility */
.high-contrast .pit,
.high-contrast .store {
  border: 2px solid var(--color-border);
}
```

### Color-Blind Friendly Differentiation

Player 1 (Gold) and Player 2 (Blue) are distinguishable for most color vision deficiencies. Additionally:

- **Shape coding**: P1 uses a diamond `◆` marker, P2 uses a circle `●` marker in the turn indicator
- **Position coding**: P1 is always bottom, P2 is always top
- **Label coding**: Names are always visible ("You" / "Computer" or "Player 1" / "Player 2")

---

## 9. Page Background

The entire page uses a dark wood texture:

```css
body {
  background-color: var(--color-page-bg);
  background-image:
    radial-gradient(ellipse at 30% 20%, rgba(107, 79, 18, 0.15), transparent 60%),
    radial-gradient(ellipse at 70% 80%, rgba(107, 79, 18, 0.1), transparent 50%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
```

---

## 10. Animation Timing Summary

| Event                 | Duration    | Easing                          | Delay Pattern         |
|-----------------------|-------------|---------------------------------|-----------------------|
| Pit hover glow        | 200ms       | ease                            | —                     |
| Scoop (pile shrink)   | 350ms       | ease-in                         | —                     |
| Pit recoil            | 250ms       | ease-out                        | —                     |
| Stone drop per pit    | 200ms       | ease-out                        | 220ms stagger         |
| Drop target highlight | 150ms       | ease                            | Synced with drop      |
| Capture flash         | 300ms       | ease                            | After last drop       |
| Capture flow to store | 500ms       | cubic-bezier(0.25, 0.1, 0.25, 1) | After flash         |
| Extra turn banner     | 1500ms      | ease                            | After capture/drop    |
| Invalid shake         | 400ms       | ease                            | Immediate             |
| Game over sweep       | ~1200ms     | ease-in-out                     | 150ms stagger per pit |
| Computer thinking     | 400–800ms   | —                               | Before computer move  |
| Modal appear          | 500ms       | cubic-bezier(0.16, 1, 0.3, 1)  | —                     |
| Pile morph            | 400ms       | cubic-bezier(0.25, 0.1, 0.25, 1) | —                   |

---

## 11. Technology Recommendations

- **Rendering**: HTML + CSS for layout; SVG or Canvas for stone pile blobs within each pit
- **Animation**: CSS transitions/animations for UI; requestAnimationFrame for pile morphing
- **State**: Vanilla JS or a lightweight framework (e.g., Preact, Lit) — the game state is simple
- **No external dependencies required** for the core game; optionally use Howler.js for sound
- **Build**: Vite for fast dev and optimized builds

---

## 12. File Structure Suggestion

```
src/
  index.html
  styles/
    reset.css          # CSS reset / normalize
    variables.css      # All CSS custom properties
    board.css          # Board, pits, stores layout
    stones.css         # Stone pile rendering
    animations.css     # All @keyframes and transition utilities
    menu.css           # Welcome screen styles
    game-over.css      # Game over modal styles
    responsive.css     # Media queries
    accessibility.css  # Focus styles, sr-only, high contrast
  scripts/
    main.js            # Entry point, screen routing
    game.js            # Game state and rules engine
    board.js           # Board DOM rendering and updates
    stones.js          # Stone pile generation (blob positions, colors)
    animations.js      # Animation orchestration and sequencing
    ai.js              # Computer player AI (Easy/Medium/Hard)
    sound.js           # Optional sound manager
  assets/
    fonts/             # Self-hosted fonts (Inter, Playfair Display)
```
