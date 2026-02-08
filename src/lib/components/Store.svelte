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
  <Stones count={count} pitIndex={pitIndex} isStore={true} />
  <span class="store-score" aria-hidden="true">{count}</span>
</div>

<style>
  .store {
    width: var(--store-width, 90px);
    height: var(--store-height, 200px);
    border-radius: 45px;
    background: #2C1810;
    box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.6),
                inset 0 1px 3px rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
  }

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
    z-index: 2;
    pointer-events: none;
  }

  .store:focus-visible {
    outline: 2px solid #D4A843;
    outline-offset: 3px;
  }

  @media (max-width: 480px) {
    .store-score {
      font-size: 1.125rem;
    }
  }
</style>
