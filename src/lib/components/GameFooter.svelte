<script lang="ts">
  import { game } from '../stores/game.svelte.js';
  import { audio } from '../audio/sounds.js';

  let soundMuted = $state(audio.isMuted());

  function toggleMute() {
    soundMuted = !soundMuted;
    audio.setMuted(soundMuted);
    if (!soundMuted) audio.playClick();
  }
</script>

<div class="game-footer">
  <button class="btn-secondary" onclick={() => { audio.playClick(); game.goToMenu(); }}>
    New Game
  </button>
  <button
    class="mute-btn"
    onclick={toggleMute}
    aria-label={soundMuted ? 'Unmute sound' : 'Mute sound'}
    title={soundMuted ? 'Unmute' : 'Mute'}
  >
    {#if soundMuted}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    {:else}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    {/if}
  </button>
</div>

<style>
  .game-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    max-width: 900px;
    margin: 20px auto 0;
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

  .btn-secondary:focus-visible {
    outline: 2px solid #D4A843;
    outline-offset: 3px;
  }

  .mute-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    color: #A89070;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mute-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #D4C4A8;
  }

  .mute-btn:focus-visible {
    outline: 2px solid #D4A843;
    outline-offset: 3px;
  }
</style>
