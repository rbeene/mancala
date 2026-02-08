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
  <h1 class="game-title">Mancala</h1>

  <div class="turn-indicator">
    <div class="player-card player-1" class:active={p1Active}>
      <span class="turn-dot"></span>
      <span class="player-name">{p1Name}</span>
      <span class="player-score">{game.scores[0]}</span>
    </div>

    <div class="vs-badge">VS</div>

    <div class="player-card-wrapper">
      <div class="player-card player-2" class:active={p2Active}>
        <span class="player-score">{game.scores[1]}</span>
        <span class="player-name">{p2Name}</span>
        {#if game.thinking}
          <span class="thinking-dots" aria-label="Computer is thinking">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </span>
        {:else if game.mode === 'pvc'}
          <span class="difficulty-badge">{game.difficulty}</span>
        {/if}
        <span class="turn-dot"></span>
      </div>

      {#if game.commentary}
        <div class="speech-bubble" role="status" aria-live="polite">
          {game.commentary}
        </div>
      {/if}
    </div>
  </div>

  <div aria-live="polite" aria-atomic="true" class="sr-only">
    {turnAnnouncement}
  </div>
</div>

<style>
  .game-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px 0;
  }

  .game-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: rgba(232, 213, 176, 0.5);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0;
  }

  .turn-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .player-card {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.4s ease;
  }

  .player-card.active {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .player-card.player-1.active {
    border-color: rgba(212, 168, 67, 0.3);
    box-shadow: 0 0 16px rgba(212, 168, 67, 0.08);
  }

  .player-card.player-2.active {
    border-color: rgba(91, 139, 212, 0.3);
    box-shadow: 0 0 16px rgba(91, 139, 212, 0.08);
  }

  .player-name {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 1rem;
    font-weight: 500;
    color: #8A7A6A;
    transition: color 0.3s ease;
  }

  .player-card.active .player-name {
    font-weight: 700;
  }

  .player-card.player-1.active .player-name {
    color: #D4A843;
  }

  .player-card.player-2.active .player-name {
    color: #6B9FE0;
  }

  .player-score {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: #6B5D4D;
    transition: color 0.3s ease;
    min-width: 24px;
    text-align: center;
  }

  .player-card.player-1.active .player-score {
    color: #D4A843;
  }

  .player-card.player-2.active .player-score {
    color: #6B9FE0;
  }

  .turn-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: transparent;
    transition: background 0.3s ease, box-shadow 0.3s ease;
  }

  .player-card.active .turn-dot {
    background: currentColor;
    animation: glow 2s ease-in-out infinite;
  }

  .player-card.player-1.active .turn-dot {
    color: #D4A843;
    box-shadow: 0 0 6px rgba(212, 168, 67, 0.5);
  }

  .player-card.player-2.active .turn-dot {
    color: #6B9FE0;
    box-shadow: 0 0 6px rgba(91, 139, 212, 0.5);
  }

  @keyframes glow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .vs-badge {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    color: #4A3D30;
    letter-spacing: 0.08em;
    padding: 4px 8px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.03);
  }

  .difficulty-badge {
    font-size: 0.65rem;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(91, 139, 212, 0.12);
    color: #6B9FE0;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .player-card-wrapper {
    position: relative;
  }

  .speech-bubble {
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(91, 139, 212, 0.15);
    border: 1px solid rgba(91, 139, 212, 0.25);
    color: #A0C4F0;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 12px;
    white-space: nowrap;
    z-index: 20;
    animation: bubbleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
  }

  .speech-bubble::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid rgba(91, 139, 212, 0.25);
  }

  @keyframes bubbleIn {
    0% { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.9); }
    100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  }

  .thinking-dots {
    display: inline-flex;
    gap: 3px;
    align-items: center;
    padding: 2px 4px;
  }

  .thinking-dots .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #6B9FE0;
    animation: thinkingPulse 1.2s ease-in-out infinite;
  }

  .thinking-dots .dot:nth-child(2) { animation-delay: 0.2s; }
  .thinking-dots .dot:nth-child(3) { animation-delay: 0.4s; }

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
    .player-card {
      padding: 6px 10px;
      gap: 6px;
    }
    .player-name {
      font-size: 0.875rem;
    }
    .player-score {
      font-size: 1rem;
    }
    .game-title {
      font-size: 1.125rem;
    }
  }
</style>
