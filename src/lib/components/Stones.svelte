<script lang="ts">
  let { count, pitIndex = 0, isStore = false }: { count: number; pitIndex?: number; isStore?: boolean } = $props();

  // Deterministic pseudo-random seeded by pitIndex
  function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  const stoneColors = ['#8B7355', '#6B6B6B', '#A0926B', '#7A6E5D', '#9C8E7C'];

  interface Blob {
    x: number;
    y: number;
    rx: number;
    ry: number;
    color: string;
    opacity: number;
    rotation: number;
  }

  let blobs = $derived.by(() => {
    if (count === 0) return [];

    const seed = pitIndex * 1000 + count * 7 + 42;
    const rng = seededRandom(seed);

    let blobCount: number;
    if (count <= 2) blobCount = 2 + Math.floor(rng());
    else if (count <= 4) blobCount = 3 + Math.floor(rng() * 2);
    else if (count <= 6) blobCount = 4 + Math.floor(rng() * 2);
    else if (count <= 9) blobCount = 5 + Math.floor(rng() * 2);
    else if (count <= 14) blobCount = 6 + Math.floor(rng() * 2);
    else if (count <= 24) blobCount = 7 + Math.floor(rng() * 2);
    else blobCount = 8 + Math.floor(rng() * 3);

    if (isStore) blobCount = Math.min(blobCount + 2, 14);

    const result: Blob[] = [];
    for (let i = 0; i < blobCount; i++) {
      result.push({
        x: 20 + rng() * 60,
        y: 20 + rng() * 60,
        rx: 8 + rng() * 14,
        ry: 6 + rng() * 12,
        color: stoneColors[Math.floor(rng() * stoneColors.length)],
        opacity: 0.4 + rng() * 0.4,
        rotation: rng() * 360,
      });
    }
    return result;
  });

  let pileSize = $derived.by(() => {
    if (count === 0) return 0;
    const maxStones = isStore ? 48 : 24;
    return Math.sqrt(count / maxStones) * 100;
  });

  let blurRadius = $derived.by(() => {
    if (count <= 2) return 1.5;
    if (count <= 4) return 2;
    if (count <= 6) return 2.5;
    if (count <= 9) return 3;
    if (count <= 14) return 3.5;
    if (count <= 24) return 4;
    return 4.5;
  });

  let elevation = $derived(Math.min(count * 0.3, 8));
</script>

{#if count > 0}
  <div
    class="stone-pile"
    style:width="{Math.max(pileSize, 25)}%"
    style:height="{Math.max(pileSize, 25)}%"
    style:filter="blur({blurRadius}px)"
    style:transform="translateY(-{elevation}px)"
    style:box-shadow="0 {elevation}px {elevation * 0.5}px rgba(0, 0, 0, 0.3)"
    aria-hidden="true"
  >
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {#each blobs as blob}
        <ellipse
          cx={blob.x}
          cy={blob.y}
          rx={blob.rx}
          ry={blob.ry}
          fill={blob.color}
          opacity={blob.opacity}
          transform="rotate({blob.rotation}, {blob.x}, {blob.y})"
        />
      {/each}
    </svg>
  </div>
{/if}

<style>
  .stone-pile {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    transition: width 0.4s cubic-bezier(0.25, 0.1, 0.25, 1),
                height 0.4s cubic-bezier(0.25, 0.1, 0.25, 1),
                filter 0.4s ease;
    pointer-events: none;
  }

  svg {
    overflow: visible;
  }
</style>
