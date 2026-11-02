// Efectos de sonido simples (Web Audio API, sin archivos)

let ctx = null;
function ac() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return null; }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, dur = 0.08, type = "square", gain = 0.04, when = 0) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g); g.connect(c.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

export const Sfx = {
  unlock() { ac(); },
  hit() { tone(180, 0.06, "square", 0.05); tone(90, 0.08, "triangle", 0.03, 0.02); },
  attack() { tone(320, 0.05, "square", 0.035); },
  faint() { tone(200, 0.12, "sawtooth", 0.04); tone(120, 0.18, "sawtooth", 0.03, 0.08); },
  levelUp() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.1, "square", 0.04, i * 0.09));
  },
  capture() {
    tone(400, 0.08, "square", 0.04);
    tone(500, 0.08, "square", 0.04, 0.1);
    tone(600, 0.08, "square", 0.04, 0.2);
    tone(800, 0.2, "square", 0.05, 0.35);
  },
  escape() { tone(300, 0.1, "sawtooth", 0.04); tone(180, 0.15, "sawtooth", 0.03, 0.1); },
  heal() {
    [392, 494, 587, 784].forEach((f, i) => tone(f, 0.12, "sine", 0.035, i * 0.11));
  },
  evolve() {
    for (let i = 0; i < 8; i++) tone(300 + i * 60, 0.08, "square", 0.035, i * 0.07);
    tone(880, 0.25, "square", 0.05, 0.6);
  },
  click() { tone(600, 0.03, "square", 0.025); },
  ball() { tone(250, 0.05, "triangle", 0.03); tone(400, 0.08, "triangle", 0.03, 0.06); },
};
