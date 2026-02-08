<script lang="ts">
  import { game } from '../stores/game.svelte.js';
  import { audio } from '../audio/sounds.js';
  import type { GameMode, Difficulty } from '../engine/types.js';

  let selectedMode = $state<GameMode>('pvc');
  let selectedDifficulty = $state<Difficulty>('medium');

  const difficultyDescriptions: Record<Difficulty, string> = {
    easy: 'Relaxed play. The computer sometimes makes suboptimal moves — great for learning the rules.',
    medium: 'A fair challenge. The computer plays solid strategy but won\'t punish every mistake.',
    hard: 'Expert level. The computer looks several moves ahead and plays to win.'
  };

  function handleStart() {
    audio.playClick();
    game.startGame(selectedMode, selectedDifficulty);
  }
</script>

<div class="menu-card">
  <h1 class="game-title">MANCALA</h1>
  <p class="game-subtitle">The Ancient Stone Game</p>

  <div class="mode-selector" role="radiogroup" aria-label="Game mode">
    <label class="radio-option">
      <input
        type="radio"
        name="mode"
        value="pvp"
        bind:group={selectedMode}
      />
      <span class="radio-label">Human vs Human</span>
    </label>
    <label class="radio-option">
      <input
        type="radio"
        name="mode"
        value="pvc"
        bind:group={selectedMode}
      />
      <span class="radio-label">Human vs Computer</span>
    </label>
  </div>

  {#if selectedMode === 'pvc'}
    <div class="difficulty-selector">
      <p class="difficulty-label">Difficulty:</p>
      <div class="difficulty-buttons" role="radiogroup" aria-label="Difficulty level">
        {#each (['easy', 'medium', 'hard'] as const) as level}
          <button
            class="difficulty-btn"
            class:selected={selectedDifficulty === level}
            onclick={() => { audio.playClick(); selectedDifficulty = level; }}
            role="radio"
            aria-checked={selectedDifficulty === level}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        {/each}
      </div>
      <p class="difficulty-description">
        {difficultyDescriptions[selectedDifficulty]}
      </p>
    </div>
  {/if}

  <button class="start-button" onclick={handleStart}>
    START GAME
  </button>
</div>

<style>
  .menu-card {
    max-width: 480px;
    width: 100%;
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
    margin: 0 0 4px;
  }

  .game-subtitle {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 1rem;
    color: #A89070;
    margin: 0 0 36px;
  }

  .mode-selector {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
    text-align: left;
    padding: 0 20px;
  }

  .radio-option {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 1rem;
    color: #E8D5B0;
  }

  .radio-option input[type="radio"] {
    accent-color: #D4A843;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .difficulty-selector {
    margin-bottom: 32px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
  }

  .difficulty-label {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: #A89070;
    margin: 0 0 12px;
    text-align: left;
  }

  .difficulty-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .difficulty-btn {
    flex: 1;
    padding: 8px 12px;
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

  .difficulty-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #D4C4A8;
  }

  .difficulty-btn.selected {
    background: rgba(212, 168, 67, 0.2);
    border-color: #D4A843;
    color: #D4A843;
  }

  .difficulty-btn:focus-visible {
    outline: 2px solid #D4A843;
    outline-offset: 3px;
  }

  .difficulty-description {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.8125rem;
    color: #8A7A6A;
    line-height: 1.5;
    margin: 0;
    text-align: left;
    font-style: italic;
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
    letter-spacing: 0.05em;
  }

  .start-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(180, 130, 40, 0.45);
  }

  .start-button:active {
    transform: translateY(0);
  }

  .start-button:focus-visible {
    outline: 2px solid #D4A843;
    outline-offset: 3px;
  }

  @media (max-width: 768px) {
    .game-title {
      font-size: 2.25rem;
    }

    .menu-card {
      margin: 5vh 16px;
      padding: 36px 28px;
    }
  }

  @media (max-width: 480px) {
    .game-title {
      font-size: 1.75rem;
    }

    .menu-card {
      padding: 28px 20px;
    }
  }
</style>
