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

/** Short click/clack — a stone landing in a pit. dropIndex varies pitch. */
function playDrop(dropIndex: number = 0): void {
  if (muted) return;
  const ac = getContext();
  const t = ac.currentTime;

  // Base frequency varies slightly per drop for naturalness
  const baseFreq = 900 + (dropIndex % 6) * 80 + Math.random() * 60;

  const osc = ac.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(baseFreq, t);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, t + 0.06);

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

  // Tiny noise layer for texture
  const nSrc = noise(ac, 0.03);
  const nGain = ac.createGain();
  nGain.gain.setValueAtTime(0.06, t);
  nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 2000;

  osc.connect(gain).connect(ac.destination);
  nSrc.connect(hp).connect(nGain).connect(ac.destination);

  osc.start(t);
  osc.stop(t + 0.08);
  nSrc.start(t);
  nSrc.stop(t + 0.03);
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
