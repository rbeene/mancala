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
  <div class="board" role="group" aria-label="Mancala game board">
    <div class="store-left">
      <Store player={1} count={game.board[13]} pitIndex={13} />
    </div>

    <div class="pits-container">
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

<style>
  .board-wrapper {
    perspective: 1200px;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .board {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0 var(--store-gap, 20px);
    max-width: var(--board-max-width, 900px);
    width: 100%;
    padding: var(--board-padding, 24px);
    background: linear-gradient(145deg, #8B6914, #6B4F12, #8B6914);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
                0 2px 8px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    transform: rotateX(3deg);
    transform-origin: center bottom;
    align-items: center;
  }

  .board::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    background: repeating-linear-gradient(
      87deg,
      transparent,
      transparent 3px,
      rgba(0, 0, 0, 0.03) 3px,
      rgba(0, 0, 0, 0.03) 4px
    );
    pointer-events: none;
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
    gap: var(--row-gap, 16px);
  }

  .store-right {
    grid-column: 3;
    grid-row: 1;
    display: flex;
    align-items: center;
  }

  .pit-row {
    display: flex;
    justify-content: space-between;
    gap: var(--pit-gap, 12px);
    position: relative;
    padding: 4px;
    border-radius: 12px;
  }

  .pit-row.active {
    box-shadow: 0 0 12px 2px rgba(212, 168, 67, 0.15);
  }

  .pit-row.top-row.active {
    box-shadow: 0 0 12px 2px rgba(91, 139, 212, 0.15);
  }

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
    pointer-events: none;
  }

  @keyframes extraTurnPop {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    15% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
    25% { transform: translate(-50%, -50%) scale(1); }
    75% { opacity: 1; }
    100% { opacity: 0; transform: translate(-50%, -50%) translateY(-20px); }
  }

  @media (max-width: 768px) {
    .board {
      border-radius: 16px;
      margin: 0 12px;
    }
  }

  @media (max-width: 480px) {
    .board {
      margin: 0 8px;
      transform: none;
    }
  }
</style>
