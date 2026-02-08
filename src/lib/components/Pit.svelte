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
  <div class="pit-inner">
    <Stones count={count} pitIndex={index} />
  </div>
</button>

<style>
  .pit {
    width: var(--pit-size, 84px);
    height: var(--pit-size, 84px);
    border-radius: 50%;
    /* Outer ring — the rim of the carved pit */
    background: radial-gradient(
      circle at 45% 40%,
      #6B5020 0%,
      #5A4218 40%,
      #4A3510 100%
    );
    box-shadow:
      /* Outer bevel — raised rim */
      inset 0 2px 1px rgba(255, 220, 140, 0.15),
      inset 0 -2px 1px rgba(0, 0, 0, 0.2),
      /* Shadow beneath the pit */
      0 2px 4px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: default;
    transition: box-shadow 0.25s ease, transform 0.2s ease;
    border: none;
    padding: 4px;
    min-width: 44px;
    min-height: 44px;
    flex-shrink: 0;
  }

  /* Inner carved bowl */
  .pit-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(
      ellipse at 50% 40%,
      #3A2810 0%,
      #2C1E0C 50%,
      #1E1408 100%
    );
    box-shadow:
      /* Deep carved shadow */
      inset 0 6px 16px rgba(0, 0, 0, 0.6),
      inset 0 2px 4px rgba(0, 0, 0, 0.4),
      /* Bottom reflection from wood */
      inset 0 -3px 6px rgba(80, 60, 20, 0.12);
    position: relative;
    overflow: hidden;
  }

  .pit.clickable {
    cursor: pointer;
  }

  .pit.clickable:hover {
    box-shadow:
      inset 0 2px 1px rgba(255, 220, 140, 0.15),
      inset 0 -2px 1px rgba(0, 0, 0, 0.2),
      0 0 16px 3px rgba(212, 168, 67, 0.3),
      0 0 4px 1px rgba(212, 168, 67, 0.15);
    transform: scale(1.04);
  }

  .pit.clickable.player-2:hover {
    box-shadow:
      inset 0 2px 1px rgba(255, 220, 140, 0.15),
      inset 0 -2px 1px rgba(0, 0, 0, 0.2),
      0 0 16px 3px rgba(91, 139, 212, 0.3),
      0 0 4px 1px rgba(91, 139, 212, 0.15);
  }

  .pit:not(.clickable) {
    opacity: 0.9;
  }

  .pit:focus-visible {
    outline: 2px solid #D4A843;
    outline-offset: 3px;
  }

  .pit.invalid {
    animation: shake 0.4s ease;
    box-shadow:
      inset 0 2px 1px rgba(255, 220, 140, 0.15),
      inset 0 -2px 1px rgba(0, 0, 0, 0.2),
      0 0 10px 2px rgba(180, 60, 60, 0.35);
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
      box-shadow:
        inset 0 2px 1px rgba(255, 220, 140, 0.15),
        inset 0 -2px 1px rgba(0, 0, 0, 0.2),
        0 2px 4px rgba(0, 0, 0, 0.15);
      transform: none;
    }

    .pit.clickable:active {
      box-shadow:
        inset 0 2px 1px rgba(255, 220, 140, 0.15),
        inset 0 -2px 1px rgba(0, 0, 0, 0.2),
        0 0 14px 3px rgba(212, 168, 67, 0.3);
      transform: scale(0.97);
    }
  }
</style>
