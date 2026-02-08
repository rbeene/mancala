<script lang="ts">
  import Menu from './lib/components/Menu.svelte';
  import Board from './lib/components/Board.svelte';
  import GameHeader from './lib/components/GameHeader.svelte';
  import GameFooter from './lib/components/GameFooter.svelte';
  import GameOver from './lib/components/GameOver.svelte';
  import { game } from './lib/stores/game.svelte.js';
</script>

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
    background-color: #1A1209;
    background-image:
      radial-gradient(ellipse at 30% 20%, rgba(107, 79, 18, 0.15), transparent 60%),
      radial-gradient(ellipse at 70% 80%, rgba(107, 79, 18, 0.1), transparent 50%);
    min-height: 100vh;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    color: #E8D5B0;
  }

  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  :global(:root) {
    --board-max-width: 900px;
    --board-padding: 24px;
    --pit-size: 80px;
    --pit-gap: 12px;
    --store-width: 90px;
    --store-height: 200px;
    --store-gap: 20px;
    --row-gap: 16px;
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
