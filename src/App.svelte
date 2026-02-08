<script lang="ts">
  import Menu from './lib/components/Menu.svelte';
  import Board from './lib/components/Board.svelte';
  import GameHeader from './lib/components/GameHeader.svelte';
  import GameFooter from './lib/components/GameFooter.svelte';
  import GameOver from './lib/components/GameOver.svelte';
  import { game } from './lib/stores/game.svelte.js';
</script>

<div class="bg-layer"></div>

<main>
  {#if game.screen === 'menu'}
    <Menu />
  {:else}
    <GameHeader />
    <Board />
    <GameFooter />
    {#if game.screen === 'gameover'}
      <GameOver />
    {/if}
  {/if}
</main>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(html, body) {
    overscroll-behavior: none;
    touch-action: manipulation;
  }

  :global(body) {
    background-color: #0F0D08;
    min-height: 100vh;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    color: #E8D5B0;
  }

  /* Rich textured background — dark wood surface */
  .bg-layer {
    position: fixed;
    inset: 0;
    z-index: -1;
    background-color: #1A140A;
    background-image:
      /* Warm ambient light from above */
      radial-gradient(ellipse at 50% -10%, rgba(180, 140, 60, 0.12), transparent 55%),
      /* Subtle side light */
      radial-gradient(ellipse at -20% 50%, rgba(120, 90, 30, 0.06), transparent 50%),
      radial-gradient(ellipse at 120% 50%, rgba(120, 90, 30, 0.06), transparent 50%),
      /* Wood grain texture via repeating gradients */
      repeating-linear-gradient(
        92deg,
        transparent,
        transparent 8px,
        rgba(80, 55, 20, 0.04) 8px,
        rgba(80, 55, 20, 0.04) 9px
      ),
      repeating-linear-gradient(
        88deg,
        transparent,
        transparent 14px,
        rgba(60, 40, 12, 0.03) 14px,
        rgba(60, 40, 12, 0.03) 15px
      ),
      /* Larger grain bands */
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 40px,
        rgba(50, 35, 10, 0.06) 40px,
        rgba(50, 35, 10, 0.06) 42px
      );
  }

  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    position: relative;
  }

  :global(:root) {
    --board-max-width: 900px;
    --board-padding: 28px;
    --pit-size: 84px;
    --pit-gap: 14px;
    --store-width: 96px;
    --store-height: 210px;
    --store-gap: 22px;
    --row-gap: 20px;
  }

  @media (max-width: 768px) {
    :global(:root) {
      --pit-size: 64px;
      --pit-gap: 8px;
      --store-width: 72px;
      --store-height: 160px;
      --board-padding: 16px;
      --board-max-width: 100%;
    }
  }

  @media (max-width: 480px) {
    :global(:root) {
      --pit-size: 52px;
      --pit-gap: 6px;
      --store-width: 56px;
      --store-height: 130px;
      --board-padding: 12px;
      --row-gap: 10px;
      --store-gap: 10px;
    }
  }
</style>
