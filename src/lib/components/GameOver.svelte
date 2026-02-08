<script lang="ts">
  import { game } from '../stores/game.svelte.js';
  import { audio } from '../audio/sounds.js';

  let winnerText = $derived.by(() => {
    if (game.isDraw) return "It's a Tie!";
    if (game.mode === 'pvc') {
      return game.winner === 0 ? 'You Win!' : 'Computer Wins!';
    }
    return game.winner === 0 ? 'Player 1 Wins!' : 'Player 2 Wins!';
  });

  function handlePlayAgain() {
    audio.playClick();
    game.startGame(game.mode, game.difficulty);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      game.goToMenu();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="game-over-overlay" role="dialog" aria-modal="true" aria-label="Game over">
  <div class="game-over-card">
    <h2 class="heading">GAME OVER</h2>
    <p class="winner-text">{winnerText}</p>
    <p class="final-score">
      <span class="p1-score">{game.scores[0]}</span>
      <span class="score-divider"> — </span>
      <span class="p2-score">{game.scores[1]}</span>
    </p>

    <div class="button-group">
      <button class="btn-primary" onclick={handlePlayAgain}>
        NEW GAME
      </button>
      <button class="btn-secondary" onclick={() => { audio.playClick(); game.goToMenu(); }}>
        MAIN MENU
      </button>
    </div>
  </div>
</div>

<style>
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

  .heading {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    color: #8A7A6A;
    margin: 0 0 8px;
  }

  .winner-text {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 2.25rem;
    color: #E8D5B0;
    margin: 0 0 8px;
  }

  .final-score {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 1.5rem;
    color: #A89070;
    margin: 0 0 32px;
  }

  .p1-score { color: #D4A843; font-weight: 700; }
  .p2-score { color: #5B8BD4; font-weight: 700; }
  .score-divider { color: #6B5D4D; }

  .button-group {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .btn-primary {
    padding: 12px 32px;
    font-size: 1rem;
    font-weight: 600;
    font-family: 'Inter', system-ui, sans-serif;
    color: #1A1A1A;
    background: linear-gradient(180deg, #D4A843, #B8922E);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    box-shadow: 0 4px 16px rgba(180, 130, 40, 0.3);
    letter-spacing: 0.05em;
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(180, 130, 40, 0.45);
  }

  .btn-primary:focus-visible {
    outline: 2px solid #D4A843;
    outline-offset: 3px;
  }

  .btn-secondary {
    padding: 12px 32px;
    font-size: 1rem;
    font-weight: 500;
    font-family: 'Inter', system-ui, sans-serif;
    color: #A89070;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #D4C4A8;
  }

  .btn-secondary:focus-visible {
    outline: 2px solid #D4A843;
    outline-offset: 3px;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(24px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 480px) {
    .game-over-card {
      padding: 32px 24px;
      margin: 0 16px;
    }

    .winner-text {
      font-size: 1.75rem;
    }

    .button-group {
      flex-direction: column;
    }
  }
</style>
