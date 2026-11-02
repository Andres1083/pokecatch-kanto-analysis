// Elección del inicial: plataformas, Poké Balls que caen, silueta blanca y Pokémon animados (como el original).
import { pixelMask, spawnRing } from "../engine/presentations.js?v=3";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const COLORS = { 1: "#7be08b", 4: "#ff9b4a", 7: "#7cc4ff" };

export function starterMarkup() {
  const slot = (id, name) => `
    <button class="starter-card sx-slot" data-id="${id}" type="button" aria-label="${name}" disabled>
      <span class="sx-pad"></span>
      <img class="sx-mon sil" src="assets/pokemon/${id}.png" alt="${name}" draggable="false" />
      <img class="sx-ball" src="assets/items/poke-ball.png" alt="" draggable="false" />
    </button>`;
  return `
    <div class="sx-stars"></div>
    <p class="starter-title">¡El Profesor Oak te ofrece un Pokémon!</p>
    <div class="starters sx">${slot(1, "Bulbasaur")}${slot(4, "Charmander")}${slot(7, "Squirtle")}</div>
    <div class="sx-fx" id="sx-fx"></div>
    <div class="sx-dialog"><span id="sx-text"></span><em>▼</em></div>
    <button id="btn-choose-starter" class="btn-confirm sx-go" disabled type="button">ELIGE UN POKÉMON</button>
    <button id="sx-skip" class="btn-skip sx-skip" type="button">SALTAR ⏭</button>`;
}

export async function playStarterReveal(root) {
  const slots = [...root.querySelectorAll(".sx-slot")];
  const fx = root.querySelector("#sx-fx");
  const textEl = root.querySelector("#sx-text");
  const skipBtn = root.querySelector("#sx-skip");
  const TEXT = "¡Elige un Pokémon!";
  let skipped = false, alive = true;

  const finalize = () => {
    skipped = true;
    textEl.textContent = TEXT;
    slots.forEach((s) => {
      s.classList.add("pad-on", "ready");
      s.querySelector(".sx-ball").style.display = "none";
      const m = s.querySelector(".sx-mon");
      m.classList.remove("sil"); m.classList.add("show", "idle");
      m.style.cssText += ";opacity:1;visibility:visible";
      s.disabled = false;
    });
    root.dataset.ready = "1";
    skipBtn.hidden = true;
  };
  skipBtn.onclick = finalize;
  const wait = (ms) => (skipped || !alive ? Promise.resolve() : delay(ms));
  const rel = (el) => { const a = el.getBoundingClientRect(), b = root.getBoundingClientRect(); return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2, w: a.width, h: a.height }; };

  // 1) plataformas
  slots.forEach((s, i) => setTimeout(() => !skipped && s.classList.add("pad-on"), i * 230));
  await wait(900);
  if (skipped) return;

  // 2) texto del cuadro de diálogo
  for (let i = 1; i <= TEXT.length && !skipped; i++) { textEl.textContent = TEXT.slice(0, i); await delay(34); }
  await wait(250);
  if (skipped) return;

  // 3) las Poké Balls caen sobre las plataformas
  await Promise.all(slots.map(async (s, i) => {
    await wait(i * 360);
    if (skipped) return;
    const ball = s.querySelector(".sx-ball");
    ball.style.display = "block";
    const pad = rel(s.querySelector(".sx-pad"));
    await ball.animate([
      { transform: "translate(-50%, -520px) rotate(-90deg)", opacity: 1 },
      { transform: "translate(-50%, 0) rotate(0deg)", opacity: 1, offset: 0.62 },
      { transform: "translate(-50%, -26px) rotate(40deg)", offset: 0.78 },
      { transform: "translate(-50%, 0) rotate(0deg)", offset: 0.9 },
      { transform: "translate(-50%, -8px) rotate(0deg)" },
      { transform: "translate(-50%, 0) rotate(0deg)" },
    ], { duration: 820, easing: "cubic-bezier(.4,0,.6,1)", fill: "forwards" }).finished.catch(() => {});
    if (skipped) return;
    spawnRing(fx, pad.x, pad.y, 52, "#9cc4ff");
  }));
  await wait(450);
  if (skipped) return;

  // 4) se abren: destello, silueta blanca que se forma a píxeles y color
  await Promise.all(slots.map(async (s, i) => {
    await wait(i * 300);
    if (skipped) return;
    const ball = s.querySelector(".sx-ball"), mon = s.querySelector(".sx-mon");
    const pad = rel(s.querySelector(".sx-pad"));
    const col = COLORS[s.dataset.id] || "#fff";
    ball.animate([{ transform: "translate(-50%,0) scale(1)", opacity: 1 }, { transform: "translate(-50%,-6px) scale(1.5)", opacity: 0 }], { duration: 260, fill: "forwards" });
    spawnRing(fx, pad.x, pad.y - 36, 70, col);
    mon.style.visibility = "visible";
    mon.classList.add("show");
    await pixelMask(mon, "in", 520).catch(() => {});
    if (skipped) return;
    await delay(360);
    mon.classList.remove("sil");        // la silueta blanca pasa a color
    mon.classList.add("idle");
    spawnRing(fx, pad.x, pad.y - 36, 46, "#fff");
    s.classList.add("ready");
    s.disabled = false;
  }));
  if (skipped) return;
  finalize();
}
