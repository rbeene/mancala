<script lang="ts">
  let { count, pitIndex = 0, isStore = false }: { count: number; pitIndex?: number; isStore?: boolean } = $props();

  function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // Glass gem colors inspired by real mancala stones — varied teal/blue/green
  const gemPalette = [
    { fill: '#1A8C7A', mid: '#28A890', highlight: '#7EECD8', edge: '#0F6858' },  // teal
    { fill: '#1E7A8C', mid: '#2A96A8', highlight: '#80D8EC', edge: '#125868' },  // blue-teal
    { fill: '#2A7860', mid: '#38946E', highlight: '#7AE0B0', edge: '#1A5840' },  // green
    { fill: '#187888', mid: '#2494A0', highlight: '#78D6E8', edge: '#105868' },  // deep teal
    { fill: '#248868', mid: '#30A47C', highlight: '#80E8C0', edge: '#186850' },  // emerald
    { fill: '#1A7080', mid: '#268C98', highlight: '#74D0E0', edge: '#125060' },  // ocean
    { fill: '#207868', mid: '#2C9480', highlight: '#78DCC4', edge: '#145848' },  // jade
    { fill: '#1C8878', mid: '#28A48E', highlight: '#7CE8D0', edge: '#106858' },  // seafoam
  ];

  interface Gem {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    fill: string;
    mid: string;
    highlight: string;
    edge: string;
    rotation: number;
    highlightOffX: number;
    highlightOffY: number;
    id: string;
  }

  let gems = $derived.by(() => {
    if (count === 0) return [];

    const seed = pitIndex * 1000 + count * 7 + 42;
    const rng = seededRandom(seed);

    // Visual count: fewer than actual — occlusion is why you can't count
    let visualCount: number;
    if (count <= 2) visualCount = count;
    else if (count <= 4) visualCount = 2 + Math.floor(rng() * 2);
    else if (count <= 6) visualCount = 3 + Math.floor(rng() * 2);
    else if (count <= 8) visualCount = 4 + Math.floor(rng() * 2);
    else if (count <= 12) visualCount = 5 + Math.floor(rng() * 2);
    else if (count <= 18) visualCount = 6 + Math.floor(rng() * 2);
    else if (count <= 24) visualCount = 7 + Math.floor(rng() * 2);
    else visualCount = 8 + Math.floor(rng() * 3);

    if (isStore) visualCount = Math.min(visualCount + 2, 14);

    // Gems are flat oval glass — similar size, ±12% variation
    const baseRx = isStore ? 16 : 15;
    const baseRy = isStore ? 13 : 12;
    const spread = Math.min(10 + count * 2, isStore ? 30 : 24);

    const result: Gem[] = [];
    for (let i = 0; i < visualCount; i++) {
      const palette = gemPalette[Math.floor(rng() * gemPalette.length)];
      const angle = rng() * Math.PI * 2;
      const dist = rng() * spread;
      const rx = baseRx * (0.88 + rng() * 0.24);
      const ry = baseRy * (0.88 + rng() * 0.24);
      result.push({
        cx: 50 + Math.cos(angle) * dist,
        cy: 50 + Math.sin(angle) * dist,
        rx,
        ry,
        ...palette,
        rotation: rng() * 360,
        // Highlight offset — small shift from center for specular look
        highlightOffX: -rx * 0.2 + rng() * rx * 0.15,
        highlightOffY: -ry * 0.35 + rng() * ry * 0.1,
        id: `gem-${pitIndex}-${i}`,
      });
    }
    return result;
  });

  let pileSize = $derived.by(() => {
    if (count === 0) return 0;
    const maxStones = isStore ? 48 : 24;
    return Math.sqrt(count / maxStones) * 100;
  });
</script>

{#if count > 0}
  <div
    class="stone-pile"
    style:width="{Math.max(pileSize, 65)}%"
    style:height="{Math.max(pileSize, 65)}%"
    style:transform="translate(-50%, -50%)"
    aria-hidden="true"
  >
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <!-- Shared drop shadow for depth between stacked gems -->
        <filter id="gem-shadow-{pitIndex}" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0.4" dy="1.2" stdDeviation="1" flood-color="rgba(0,0,0,0.45)" />
        </filter>

        <!-- Per-gem radial gradient for glass look -->
        {#each gems as gem}
          <radialGradient id="{gem.id}-grad" cx="40%" cy="35%" r="60%" fx="35%" fy="30%">
            <stop offset="0%" stop-color={gem.mid} />
            <stop offset="50%" stop-color={gem.fill} />
            <stop offset="100%" stop-color={gem.edge} />
          </radialGradient>
        {/each}
      </defs>

      {#each gems as gem}
        <!-- Gem body with radial gradient -->
        <ellipse
          cx={gem.cx}
          cy={gem.cy}
          rx={gem.rx}
          ry={gem.ry}
          fill="url(#{gem.id}-grad)"
          stroke={gem.edge}
          stroke-width="0.6"
          filter="url(#gem-shadow-{pitIndex})"
          transform="rotate({gem.rotation}, {gem.cx}, {gem.cy})"
        />
        <!-- Specular highlight — small bright ellipse near top of gem -->
        <ellipse
          cx={gem.cx + gem.highlightOffX}
          cy={gem.cy + gem.highlightOffY}
          rx={gem.rx * 0.35}
          ry={gem.ry * 0.25}
          fill={gem.highlight}
          opacity="0.6"
          transform="rotate({gem.rotation}, {gem.cx}, {gem.cy})"
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
    border-radius: 50%;
    transition: width 0.4s cubic-bezier(0.25, 0.1, 0.25, 1),
                height 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
    pointer-events: none;
  }

  svg {
    overflow: visible;
  }
</style>
