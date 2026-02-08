<script lang="ts">
  import { game } from '../stores/game.svelte.js';

  let p1Name = $derived(game.mode === 'pvc' ? 'You' : 'Player 1');
  let p2Name = $derived(game.mode === 'pvc' ? 'Computer' : 'Player 2');
  let p1Active = $derived(game.currentPlayer === 0 && !game.gameOver);
  let p2Active = $derived(game.currentPlayer === 1 && !game.gameOver);

  let turnAnnouncement = $derived.by(() => {
    if (game.gameOver) return 'Game over.';
    if (game.thinking) return 'Computer is thinking.';
    const name = game.currentPlayer === 0 ? p1Name : p2Name;
    return `It's ${name}'s turn.`;
  });
</script>

<div class="game-header">
  <div class="turn-indicator">
    <div class="player-label player-1" class:active={p1Active}>
      <span class="turn-dot"></span>
      <span class="player-name">{p1Name}</span>
    </div>

    <span class="vs-divider">vs</span>

    <div class="player-label player-2" class:active={p2Active}>
      <span class="player-name">{p2Name}</span>
      {#if game.mode === 'pvc'}
        <span class="difficulty-badge">{game.difficulty}</span>
      {/if}
      <span class="turn-dot"></span>
    </div>
  </div>

  {#if game.thinking}
    <div class="thinking-indicator" aria-label="Computer is thinking">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  {/if}

  <div aria-live="polite" aria-atomic="true" class="sr-only">
    {turnAnnouncement}
  </div>
</div>

<style>
  .game-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 0;
  }

  .turn-indicator {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .player-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 1.125rem;
    color: #8A7A6A;
    transition: color 0.3s ease;
  }

  .player-label.active {
    font-weight: 700;
  }

  .player-label.player-1.active {
    color: #D4A843;
  }

  .player-label.player-2.active {
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

  .player-label.active .turn-dot {
    background: currentColor;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 currentColor; }
    50% { box-shadow: 0 0 0 4px transparent; }
  }

  .vs-divider {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.875rem;
    color: #6B5D4D;
    font-style: italic;
  }

  .difficulty-badge {
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 4px;
    background: rgba(91, 139, 212, 0.15);
    color: #5B8BD4;
    font-weight: 500;
    text-transform: capitalize;
  }

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
    50% { opacity: 1; transform: scale(1); }
  }

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

  @media (max-width: 480px) {
    .player-label {
      font-size: 0.9375rem;
    }
  }
</style>
