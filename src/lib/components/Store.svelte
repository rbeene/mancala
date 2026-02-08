<script lang="ts">
  import Stones from './Stones.svelte';

  let {
    player,
    count,
    pitIndex,
  }: {
    player: 0 | 1;
    count: number;
    pitIndex: number;
  } = $props();

  let label = $derived(
    `${player === 0 ? 'Player 1' : 'Player 2'} store, ${count} stones`
  );
</script>

<div
  class="store"
  class:store-p1={player === 0}
  class:store-p2={player === 1}
  role="region"
  aria-label={label}
>
  <div class="store-inner">
    <Stones count={count} pitIndex={pitIndex} isStore={true} />
  </div>
  <span class="store-score" aria-hidden="true">{count}</span>
</div>

<style>
  .store {
    width: var(--store-width, 96px);
    height: var(--store-height, 210px);
    border-radius: 48px;
    /* Outer rim — carved wood edge */
    background: radial-gradient(
      ellipse at 45% 30%,
      #6B5020 0%,
      #5A4218 40%,
      #4A3510 100%
    );
    box-shadow:
      inset 0 2px 1px rgba(255, 220, 140, 0.12),
      inset 0 -2px 1px rgba(0, 0, 0, 0.2),
      0 3px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
    padding: 5px;
  }

  .store-inner {
    width: 100%;
    height: 100%;
    border-radius: 44px;
    background: radial-gradient(
      ellipse at 50% 35%,
      #3A2810 0%,
      #2C1E0C 50%,
      #1E1408 100%
    );
    box-shadow:
      inset 0 8px 20px rgba(0, 0, 0, 0.6),
      inset 0 3px 6px rgba(0, 0, 0, 0.4),
      inset 0 -4px 8px rgba(80, 60, 20, 0.1);
    position: relative;
    overflow: hidden;
  }

  .store-score {
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: rgba(232, 213, 176, 0.9);
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
    z-index: 2;
    pointer-events: none;
  }

  .store:focus-visible {
    outline: 2px solid #D4A843;
    outline-offset: 3px;
  }

  @media (max-width: 480px) {
    .store-score {
      font-size: 1.25rem;
      bottom: 10px;
    }
  }
</style>
