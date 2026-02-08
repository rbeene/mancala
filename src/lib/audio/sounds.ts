let ctx: AudioContext | null = null;
let muted = false;

function getContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

function isMuted(): boolean {
  return muted;
}

function setMuted(value: boolean): void {
  muted = value;
}

function noise(ac: AudioContext, duration: number): AudioBufferSourceNode {
  const length = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  return src;
}

/** Short scraping burst — stones scooped from a pit */
function playPickup(): void {
  if (muted) return;
  const ac = getContext();
  const t = ac.currentTime;

  const src = noise(ac, 0.15);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(800, t);
  bp.frequency.exponentialRampToValueAtTime(400, t + 0.15);
  bp.Q.value = 1.5;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
  gain.gain.linearRampToValueAtTime(0.15, t + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

  src.connect(bp).connect(gain).connect(ac.destination);
  src.start(t);
  src.stop(t + 0.15);
}

/** Glass gem dropping into a wooden pit — weighty clink with settle. */
function playDrop(dropIndex: number = 0): void {
  if (muted) return;
  const ac = getContext();
  const t = ac.currentTime;

  // Vary pitch slightly per drop so each sounds unique
  const pitchVar = (dropIndex % 5) * 30 + Math.random() * 40;

  // 1. Impact thud — the gem hitting the wooden bowl
  const thud = ac.createOscillator();
  thud.type = 'sine';
  thud.frequency.setValueAtTime(280 + pitchVar * 0.3, t);
  thud.frequency.exponentialRampToValueAtTime(120, t + 0.1);
  const thudGain = ac.createGain();
  thudGain.gain.setValueAtTime(0.18, t);
  thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

  // 2. Glass clink — mid-range ring as gem touches other gems
  const clink = ac.createOscillator();
  clink.type = 'sine';
  clink.frequency.setValueAtTime(800 + pitchVar, t);
  clink.frequency.exponentialRampToValueAtTime(500 + pitchVar * 0.5, t + 0.15);
  const clinkGain = ac.createGain();
  clinkGain.gain.setValueAtTime(0.14, t);
  clinkGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

  // 3. Brief high shimmer — glass overtone
  const shimmer = ac.createOscillator();
  shimmer.type = 'sine';
  shimmer.frequency.setValueAtTime(1600 + pitchVar * 2, t);
  shimmer.frequency.exponentialRampToValueAtTime(1200 + pitchVar, t + 0.06);
  const shimGain = ac.createGain();
  shimGain.gain.setValueAtTime(0.04, t);
  shimGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

  // 4. Transient click — initial contact
  const nSrc = noise(ac, 0.02);
  const nGain = ac.createGain();
  nGain.gain.setValueAtTime(0.12, t);
  nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1200;
  bp.Q.value = 1.5;

  thud.connect(thudGain).connect(ac.destination);
  clink.connect(clinkGain).connect(ac.destination);
  shimmer.connect(shimGain).connect(ac.destination);
  nSrc.connect(bp).connect(nGain).connect(ac.destination);

  thud.start(t);
  thud.stop(t + 0.12);
  clink.start(t);
  clink.stop(t + 0.18);
  shimmer.start(t);
  shimmer.stop(t + 0.08);
  nSrc.start(t);
  nSrc.stop(t + 0.02);
}

/** Deeper thud with scrape — stones captured */
function playCapture(): void {
  if (muted) return;
  const ac = getContext();
  const t = ac.currentTime;

  // Low thud
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(60, t + 0.2);
  const thudGain = ac.createGain();
  thudGain.gain.setValueAtTime(0.3, t);
  thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

  // Scrape layer
  const src = noise(ac, 0.2);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(1200, t);
  bp.frequency.exponentialRampToValueAtTime(500, t + 0.2);
  bp.Q.value = 1.2;
  const scrapeGain = ac.createGain();
  scrapeGain.gain.setValueAtTime(0.15, t);
  scrapeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

  osc.connect(thudGain).connect(ac.destination);
  src.connect(bp).connect(scrapeGain).connect(ac.destination);

  osc.start(t);
  osc.stop(t + 0.2);
  src.start(t);
  src.stop(t + 0.2);
}

/** Two ascending chime notes — extra turn reward */
function playExtraTurn(): void {
  if (muted) return;
  const ac = getContext();
  const t = ac.currentTime;

  // C5 = 523.25, E5 = 659.25
  const notes = [523.25, 659.25];
  const noteDur = 0.15;

  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ac.createGain();
    const start = t + i * 0.13;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + noteDur);

    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + noteDur);
  });
}

/** Ascending arpeggio C4-E4-G4-C5 — game over / victory */
function playGameOver(): void {
  if (muted) return;
  const ac = getContext();
  const t = ac.currentTime;

  const notes = [261.63, 329.63, 392.0, 523.25]; // C4 E4 G4 C5
  const noteDur = 0.18;

  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ac.createGain();
    const start = t + i * 0.12;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.18, start + 0.01);
    gain.gain.setValueAtTime(0.18, start + noteDur * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, start + noteDur);

    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + noteDur);
  });
}

/** Short low buzz — invalid move attempt */
function playInvalidMove(): void {
  if (muted) return;
  const ac = getContext();
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(100, t);
  osc.frequency.exponentialRampToValueAtTime(70, t + 0.1);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}

/** Subtle click for UI interactions */
function playClick(): void {
  if (muted) return;
  const ac = getContext();
  const t = ac.currentTime;

  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + 0.03);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + 0.03);
}

export const audio = {
  playPickup,
  playDrop,
  playCapture,
  playExtraTurn,
  playGameOver,
  playInvalidMove,
  playClick,
  isMuted,
  setMuted,
};
