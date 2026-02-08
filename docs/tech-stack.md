# Tech Stack Recommendation: Mancala Web Game

## Recommendation: Svelte 5 + Vite + TypeScript

After evaluating all five options against the project requirements, **Svelte 5 with Vite and TypeScript** is the clear winner for this project.

---

## Evaluation Matrix

| Criteria | Vanilla JS | React + Vite | Svelte + Vite | Vue + Vite | Canvas/WebGL |
|---|---|---|---|---|---|
| Development Speed | Medium | Fast | **Fastest** | Fast | Slow |
| Animation Capabilities | Manual | Library-dependent | **Built-in** | Library-dependent | Maximum control |
| Testing Support | Manual setup | Excellent | **Excellent** | Good | Difficult |
| Bundle Size | Smallest | ~40kb+ | **~1.6kb+** | ~20kb+ | Varies |
| Code Clarity for LLMs | Good | Good | **Best** | Good | Poor |
| State Management | Manual | Hooks/Context | **Runes (built-in)** | Composition API | Manual |
| Mobile Performance | Good | Good | **Excellent** | Good | Excellent |

---

## Why Svelte 5 Wins

### 1. Built-in Animations (Critical for Mancala)

Svelte is the only framework with first-class animation primitives built into the language:

- **`svelte/transition`** — `fade`, `fly`, `slide`, `scale`, `blur`, `crossfade` out of the box
- **`svelte/animate`** — FLIP animations for list reordering (stone movements between pits)
- **`svelte/motion`** — `tweened` and `spring` stores for physics-based animations (stone settling effects)
- **`crossfade` with `send`/`receive`** — animate elements moving between containers (stone distribution from pit to pit)

For Mancala's stone distribution animation, `crossfade` paired with `flip` is a near-perfect fit: stones "leave" one pit and "arrive" in the next with smooth transitions, no third-party library needed.

### 2. Svelte 5 Runes for Game State

Svelte 5's runes system (`$state`, `$derived`, `$effect`) maps naturally to game state:

```typescript
// game.svelte.ts — reactive game state as a plain module
let board = $state<number[]>([4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]);
let currentPlayer = $state<0 | 1>(0);
let gameOver = $derived(/* check end conditions */);
```

No Redux, no Context API, no stores boilerplate. State is reactive by declaration. This is the cleanest mental model for LLMs to understand and generate code for.

### 3. Smallest Bundle, Best Mobile Performance

Svelte compiles away at build time — no runtime framework shipped to the browser. The result:
- **~1.6kb** base overhead vs React's ~40kb
- No virtual DOM diffing means faster updates on low-powered mobile devices
- Critical for smooth 60fps animations during stone distribution

### 4. LLM-Friendly Code

Svelte components are the most readable of any framework:
- Single-file components with clear `<script>`, HTML template, and `<style>` sections
- No JSX mental model shift — it's enhanced HTML
- Minimal boilerplate means less noise for an LLM to parse
- Runes are explicit about what is reactive (`$state`) vs derived (`$derived`)

### 5. Excellent Testing with Vitest

Game logic lives in plain TypeScript files (`.svelte.ts` or pure `.ts`), fully testable with Vitest without any DOM or component overhead. Component tests use `@testing-library/svelte` which has Svelte 5 support.

---

## Why Not the Others

### Vanilla HTML/CSS/JS
- No component model makes state management painful at scale
- Animation sequencing (distribute stones one-by-one with delays) requires manual orchestration
- No built-in reactivity — manual DOM updates are error-prone
- Testing requires all custom setup

### React + Vite
- Animations require `framer-motion` or `react-spring` (~15-30kb additional)
- Hooks-based state can be confusing (stale closures, dependency arrays)
- Virtual DOM overhead unnecessary for this use case
- Larger bundle for no benefit in a client-side game

### Vue + Vite
- Good option, but `<Transition>` component is less capable than Svelte's built-in transitions
- Composition API is powerful but more verbose than runes
- Slightly larger ecosystem overhead with no compensating advantage for this project

### Canvas/WebGL
- Overkill — Mancala is a board game, not a physics simulation
- All UI elements (buttons, menus, modals) must be built from scratch
- Accessibility is nearly impossible
- Text rendering, responsiveness, and mobile touch handling are all harder
- Testing is extremely difficult (pixel-based assertions)

---

## Exact Package List

### Core

| Package | Purpose |
|---|---|
| `svelte@5` | UI framework |
| `vite@6` | Build tool and dev server |
| `@sveltejs/vite-plugin-svelte` | Vite integration for Svelte |
| `typescript` | Type safety for game logic and AI |

### Testing

| Package | Purpose |
|---|---|
| `vitest` | Test runner (Vite-native, fast) |
| `@testing-library/svelte` | Component testing |
| `@testing-library/jest-dom` | DOM assertion matchers |
| `jsdom` | DOM environment for unit tests |

### Development

| Package | Purpose |
|---|---|
| `svelte-check` | Svelte type checking |
| `prettier` | Code formatting |
| `prettier-plugin-svelte` | Svelte formatting support |

### No Additional Animation Libraries Needed

Svelte's built-in `svelte/transition`, `svelte/animate`, and `svelte/motion` modules cover all animation requirements. No `framer-motion`, no `gsap`, no `anime.js`.

---

## Project Structure

```
mancala/
├── src/
│   ├── lib/
│   │   ├── engine/              # Pure game logic (no Svelte dependencies)
│   │   │   ├── board.ts         # Board state, move execution, capture logic
│   │   │   ├── rules.ts         # Move validation, game-over detection
│   │   │   ├── ai.ts            # Minimax with alpha-beta pruning
│   │   │   └── types.ts         # Shared TypeScript types
│   │   ├── components/          # Svelte UI components
│   │   │   ├── Board.svelte     # Main board layout (CSS Grid)
│   │   │   ├── Pit.svelte       # Individual pit with stone visualization
│   │   │   ├── Store.svelte     # Mancala store (scoring pit)
│   │   │   ├── Stones.svelte    # Abstract stone pile rendering
│   │   │   ├── GameStatus.svelte # Turn indicator, score, game over
│   │   │   └── Menu.svelte      # Game mode selection, difficulty
│   │   └── stores/              # Shared reactive state
│   │       └── game.svelte.ts   # Game state management with runes
│   ├── App.svelte               # Root component
│   └── main.ts                  # Entry point
├── tests/
│   ├── engine/                  # Pure logic tests (no DOM needed)
│   │   ├── board.test.ts        # Board manipulation tests
│   │   ├── rules.test.ts        # Rule validation tests
│   │   └── ai.test.ts           # AI decision tests
│   └── components/              # Component integration tests
│       ├── Board.test.ts
│       └── Pit.test.ts
├── index.html
├── vite.config.ts
├── svelte.config.js
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

### Key Architecture Decision: Engine Separation

The `src/lib/engine/` directory contains **zero Svelte imports**. It's pure TypeScript with pure functions. This is critical because:

1. **TDD-friendly** — test game logic with Vitest directly, no DOM mocking
2. **AI testable** — verify minimax produces correct moves with deterministic tests
3. **LLM-friendly** — game rules are readable without framework knowledge
4. **Portable** — engine could be reused if the UI framework ever changes

---

## Testing Strategy

### Unit Tests (engine/) — TDD Focus

Pure function tests with no framework dependencies:

```typescript
// tests/engine/board.test.ts
import { describe, it, expect } from 'vitest';
import { makeMove, createBoard } from '../src/lib/engine/board';

describe('makeMove', () => {
  it('distributes stones counter-clockwise', () => {
    const board = createBoard();
    const result = makeMove(board, 0, 0); // player 0, pit 0
    expect(result.pits).toEqual([0, 5, 5, 5, 5, 4, 0, 4, 4, 4, 4, 4, 4, 0]);
  });

  it('skips opponent store during distribution', () => { /* ... */ });
  it('captures when landing in empty own pit', () => { /* ... */ });
  it('grants extra turn when landing in own store', () => { /* ... */ });
});
```

### AI Tests (engine/ai)

```typescript
// tests/engine/ai.test.ts
describe('AI - minimax', () => {
  it('chooses capture move when available', () => { /* ... */ });
  it('easy mode uses depth 2', () => { /* ... */ });
  it('medium mode uses depth 5', () => { /* ... */ });
  it('hard mode uses depth 8+', () => { /* ... */ });
});
```

### Component Tests (components/)

Verify UI renders correctly and user interactions trigger game logic:

```typescript
// tests/components/Board.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import Board from '../src/lib/components/Board.svelte';

it('highlights valid pits on current player turn', () => { /* ... */ });
it('disables pits during animation', () => { /* ... */ });
```

---

## Animation Strategy

### Stone Distribution Animation

When a player selects a pit, stones are distributed one-by-one counter-clockwise. This is the core animation:

1. **Sequenced `fly` transitions** — Each stone "flies" from the selected pit to the next pit in sequence, with staggered delays (150-250ms apart)
2. **`crossfade` pairs** — Use Svelte's `crossfade` with `send`/`receive` to animate the stone count visual transitioning between pits
3. **`spring` stores** — The stone pile visual (see below) uses `spring` for a satisfying settle effect as new stones arrive
4. **Async orchestration** — A `distributeStones()` function returns a Promise that resolves when the full animation sequence completes, preventing user interaction during animation

### Capture Animation

When a capture occurs:
1. Stones in the captured pit and the landing stone **fly** to the player's store
2. The store's pile visual **springs** to its new size
3. A subtle **scale** pulse on the store indicates the capture

### Game Over Animation

- Final scores **tweened** from current to final values
- Winner's store gets a `scale` + glow effect

---

## Making Stones Non-Countable: Visual Approach

This is a key design requirement. Instead of rendering individual stone elements, use **abstract pile representations**:

### Approach: Layered Gradient Piles

Each pit renders stones as a **single visual element** whose appearance scales with count:

1. **CSS radial gradients** — Multiple overlapping radial gradients create the illusion of a pile of colored stones. The number of gradient layers and their spread varies with stone count
2. **Size scaling** — The pile element scales from ~30% to ~95% of the pit area based on stone count, using a non-linear curve (square root) so 1 stone vs 4 stones is visually distinct, but 20 vs 22 is not
3. **Color intensity** — Higher counts produce richer, more saturated colors with deeper shadows
4. **Subtle noise texture** — A CSS `filter` with a tiny SVG noise texture gives the pile a granular, natural feel
5. **`spring`-based size transitions** — When stones are added/removed, the pile size animates with a spring for a physical "settling" feel

```svelte
<!-- Stones.svelte (concept) -->
<script lang="ts">
  import { spring } from 'svelte/motion';

  let { count }: { count: number } = $props();

  const size = spring(0, { stiffness: 0.15, damping: 0.7 });
  $effect(() => { size.set(Math.sqrt(count / 48) * 100); });
</script>

<div
  class="stone-pile"
  style:width="{$size}%"
  style:height="{$size}%"
  style:--intensity="{Math.min(count / 20, 1)}"
/>
```

### Alternative Visual Representations

The Stones.svelte component can support multiple visual modes:

- **Cluster mode** — Overlapping circles with slight randomized offsets (positions seeded by pit index for consistency, not individually countable because of overlap)
- **Heat mode** — A glowing orb whose color shifts from cool blue (few) to warm amber (many)
- **Particle mode** — Animated particles swirling within the pit, density proportional to count

The recommended default is **layered gradient piles** — it's the simplest to implement, performs well, and clearly communicates "more" vs "fewer" without individual stone counting.

---

## AI Implementation: Minimax with Alpha-Beta Pruning

### Difficulty Levels via Search Depth

| Difficulty | Search Depth | Behavior |
|---|---|---|
| Easy | 2 | Plays short-sighted, often misses captures |
| Medium | 5 | Competent play, sees basic tactics |
| Hard | 8+ | Strong play, sees deep capture chains |

### Evaluation Heuristic

The board evaluation function for minimax considers:
- **Score difference** (stones in own store minus opponent's)
- **Remaining stones** on own side (more options = better)
- **Capture potential** (empty pits with opponent stones across)
- **Extra turn potential** (moves that land in own store)

### Web Worker for AI

Run minimax in a **Web Worker** so the UI thread stays responsive during Hard difficulty computation. Svelte's reactivity makes it easy to show a "thinking..." state while awaiting the worker's response.

---

## Setup Commands

```bash
npm create vite@latest mancala -- --template svelte-ts
cd mancala
npm install
npm install -D vitest @testing-library/svelte @testing-library/jest-dom jsdom svelte-check prettier prettier-plugin-svelte
```

---

## Summary

**Svelte 5 + Vite + TypeScript** is the optimal stack because:

1. **Built-in animations** eliminate the need for animation libraries and map perfectly to Mancala's stone distribution mechanic (`crossfade`, `flip`, `spring`)
2. **Runes (`$state`, `$derived`)** provide the cleanest game state management with zero boilerplate
3. **Smallest bundle** (~1.6kb framework overhead) delivers the best mobile performance
4. **Pure TypeScript engine** enables rigorous TDD without any framework coupling
5. **Most readable code** for LLM comprehension and future maintenance
6. **No backend needed** — Vite serves the SPA statically, all logic runs client-side
