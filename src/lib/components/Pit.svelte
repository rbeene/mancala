<script lang="ts">
  import Stones from './Stones.svelte';

  let {
    index,
    count,
    clickable = false,
    player,
    isInvalid = false,
    onclick
  }: {
    index: number;
    count: number;
    clickable?: boolean;
    player: 0 | 1;
    isInvalid?: boolean;
    onclick?: () => void;
  } = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onclick?.();
    }
  }

  let pitLabel = $derived.by(() => {
    const side = player === 0 ? 'your side' : 'opponent side';
    const pitNum = player === 0 ? index + 1 : 13 - index;
    return `Pit ${pitNum}, ${side}, ${count} stones`;
  });
</script>

<button
  class="pit"
  class:clickable
  class:invalid={isInvalid}
  class:player-1={player === 0}
  class:player-2={player === 1}
  data-clickable={clickable}
  data-player={player === 0 ? '1' : '2'}
  aria-label={pitLabel}
  tabindex={clickable ? 0 : -1}
  disabled={!clickable}
  onclick={() => onclick?.()}
  onkeydown={handleKeydown}
>
  <Stones count={count} pitIndex={index} />
</button>

<style>
  .pit {
    width: var(--pit-size, 80px);
    height: var(--pit-size, 80px);
    border-radius: 50%;
    background: #2C1810;
    box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.6),
                inset 0 1px 3px rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: default;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
    border: none;
    padding: 0;
    min-width: 44px;
    min-height: 44px;
    flex-shrink: 0;
  }

  .pit.clickable {
    cursor: pointer;
  }

  .pit.clickable:hover {
    box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.6),
                inset 0 1px 3px rgba(0, 0, 0, 0.4),
                0 0 12px 2px rgba(212, 168, 67, 0.35);
    transform: scale(1.03);
  }

  .pit.clickable.player-2:hover {
    box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.6),
                inset 0 1px 3px rgba(0, 0, 0, 0.4),
                0 0 12px 2px rgba(91, 139, 212, 0.35);
  }

  .pit:not(.clickable) {
    opacity: 0.85;
  }

  .pit:focus-visible {
    outline: 2px solid #D4A843;
    outline-offset: 3px;
  }

  .pit.invalid {
    animation: shake 0.4s ease;
    box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.6),
                inset 0 1px 3px rgba(0, 0, 0, 0.4),
                0 0 8px 2px rgba(180, 60, 60, 0.4);
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(3px); }
  }

  @media (hover: none) {
    .pit.clickable:hover {
      box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.6),
                  inset 0 1px 3px rgba(0, 0, 0, 0.4);
      transform: none;
    }

    .pit.clickable:active {
      box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.6),
                  inset 0 1px 3px rgba(0, 0, 0, 0.4),
                  0 0 12px 2px rgba(212, 168, 67, 0.35);
      transform: scale(0.97);
    }
  }
</style>
