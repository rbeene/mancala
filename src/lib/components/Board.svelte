<script lang="ts">
  import Pit from './Pit.svelte';
  import Store from './Store.svelte';
  import { game } from '../stores/game.svelte.js';

  // P2 pits top row: displayed as 12, 11, 10, 9, 8, 7 (right to left from P2's perspective)
  const p2PitIndices = [12, 11, 10, 9, 8, 7];
  // P1 pits bottom row: displayed as 0, 1, 2, 3, 4, 5 (left to right)
  const p1PitIndices = [0, 1, 2, 3, 4, 5];

  function isP1PitClickable(index: number): boolean {
    return game.currentPlayer === 0 && game.canClickPit(index);
  }

  function isP2PitClickable(index: number): boolean {
    return game.currentPlayer === 1 && game.canClickPit(index);
  }
</script>

<div class="board-wrapper">
  <!-- Decorative outer frame -->
  <div class="board-frame">
    <div class="board" role="group" aria-label="Mancala game board">
      <div class="store-left">
        <Store player={1} count={game.board[13]} pitIndex={13} />
      </div>

      <div class="pits-container">
        <!-- Player labels -->
        <div class="row-label top-label" class:active={game.currentPlayer === 1}>
          {game.mode === 'pvc' ? 'Computer' : 'Player 2'}
        </div>

        <div
          class="pit-row top-row"
          class:active={game.currentPlayer === 1}
          role="group"
          aria-label="Player 2 pits"
        >
          {#each p2PitIndices as index}
            <Pit
              {index}
              count={game.board[index]}
              clickable={isP2PitClickable(index)}
              player={1}
              isInvalid={game.invalidPit === index}
              onclick={() => game.handlePitClick(index)}
            />
          {/each}
        </div>

        <!-- Center divider -->
        <div class="center-divider"></div>

        <div
          class="pit-row bottom-row"
          class:active={game.currentPlayer === 0}
          role="group"
          aria-label="Player 1 pits"
        >
          {#each p1PitIndices as index}
            <Pit
              {index}
              count={game.board[index]}
              clickable={isP1PitClickable(index)}
              player={0}
              isInvalid={game.invalidPit === index}
              onclick={() => game.handlePitClick(index)}
            />
          {/each}
        </div>

        <div class="row-label bottom-label" class:active={game.currentPlayer === 0}>
          {game.mode === 'pvc' ? 'You' : 'Player 1'}
        </div>
      </div>

      <div class="store-right">
        <Store player={0} count={game.board[6]} pitIndex={6} />
      </div>

      {#if game.extraTurnMessage}
        <div class="extra-turn-banner" role="alert">
          Extra Turn!
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .board-wrapper {
    perspective: 1000px;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  /* Decorative outer frame — darker border with beveled look */
  .board-frame {
    max-width: var(--board-max-width, 900px);
    width: 100%;
    padding: 6px;
    background: linear-gradient(160deg, #4A3520, #2A1A0C, #3A2818);
    border-radius: 28px;
    box-shadow:
      0 12px 48px rgba(0, 0, 0, 0.5),
      0 4px 12px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 220, 140, 0.08),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3);
    transform: rotateX(2deg);
    transform-origin: center bottom;
  }

  .board {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0 var(--store-gap, 22px);
    width: 100%;
    padding: var(--board-padding, 28px);
    background:
      /* Wood grain overlay */
      repeating-linear-gradient(
        88deg,
        transparent,
        transparent 6px,
        rgba(0, 0, 0, 0.03) 6px,
        rgba(0, 0, 0, 0.03) 7px
      ),
      repeating-linear-gradient(
        91deg,
        transparent,
        transparent 18px,
        rgba(0, 0, 0, 0.02) 18px,
        rgba(0, 0, 0, 0.02) 19px
      ),
      /* Main wood color */
      linear-gradient(160deg, #A07828, #8B6418, #9A7020, #7C5810);
    border-radius: 22px;
    box-shadow:
      inset 0 2px 0 rgba(255, 220, 140, 0.15),
      inset 0 -2px 0 rgba(0, 0, 0, 0.15);
    position: relative;
    align-items: center;
  }

  .store-left {
    grid-column: 1;
    grid-row: 1;
    display: flex;
    align-items: center;
  }

  .pits-container {
    grid-column: 2;
    grid-row: 1;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .store-right {
    grid-column: 3;
    grid-row: 1;
    display: flex;
    align-items: center;
  }

  .row-label {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(40, 25, 10, 0.4);
    text-align: center;
    padding: 4px 0;
    transition: color 0.3s ease;
  }

  .row-label.active.bottom-label {
    color: rgba(180, 140, 50, 0.7);
  }

  .row-label.active.top-label {
    color: rgba(70, 120, 180, 0.7);
  }

  .center-divider {
    height: var(--row-gap, 20px);
    position: relative;
  }

  .center-divider::before {
    content: '';
    position: absolute;
    left: 10%;
    right: 10%;
    top: 50%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 0, 0, 0.15) 20%,
      rgba(0, 0, 0, 0.15) 80%,
      transparent
    );
  }

  .pit-row {
    display: flex;
    justify-content: space-between;
    gap: var(--pit-gap, 14px);
    position: relative;
    padding: 6px;
    border-radius: 12px;
    transition: box-shadow 0.4s ease;
  }

  .pit-row.active.bottom-row {
    box-shadow: 0 0 20px 4px rgba(212, 168, 67, 0.08);
  }

  .pit-row.active.top-row {
    box-shadow: 0 0 20px 4px rgba(91, 139, 212, 0.08);
  }

  .extra-turn-banner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 14px 40px;
    background: linear-gradient(135deg, rgba(212, 168, 67, 0.95), rgba(180, 130, 40, 0.95));
    color: #1A1209;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.5rem;
    font-weight: 700;
    border-radius: 14px;
    animation: extraTurnPop 1.5s ease forwards;
    z-index: 50;
    pointer-events: none;
    box-shadow: 0 4px 24px rgba(180, 130, 40, 0.4);
    letter-spacing: 0.02em;
  }

  @keyframes extraTurnPop {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    15% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
    25% { transform: translate(-50%, -50%) scale(1); }
    75% { opacity: 1; }
    100% { opacity: 0; transform: translate(-50%, -50%) translateY(-20px); }
  }

  @media (max-width: 768px) {
    .board-frame {
      border-radius: 20px;
      margin: 0 8px;
    }
    .board {
      border-radius: 16px;
    }
  }

  @media (max-width: 480px) {
    .board-frame {
      margin: 0 4px;
      padding: 4px;
      transform: none;
    }
    .board {
      border-radius: 14px;
    }
    .row-label {
      font-size: 0.6rem;
    }
  }
</style>
