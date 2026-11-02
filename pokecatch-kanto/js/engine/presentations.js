/**
 * Presentaciones de líderes / Alto Mando / (base para legendarios)
 * Inspirado en vs-intro + boss-intro del original Poke'Catch.
 *
 * Uso:
 *   import { playBossIntro, playVsIntro } from "./presentations.js";
 *   await playBossIntro({
 *     root: document.querySelector("#scene"),
 *     trainer: "Lance",
 *     title: "Alto Mando",
 *     subtitle: "Sala 4",
 *     type: "dragon",
 *     types: ["dragon"],
 *     color: "#6f5cff",
 *     sprite: "assets/trainers/lance.png",
 *   });
 */

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function animate(node, keyframes, opts) {
  return node.animate(keyframes, { fill: "forwards", easing: "cubic-bezier(.2,.8,.3,1)", ...opts }).finished;
}

const TYPE_COLOR = {
  normal: "#c8c8a8", fire: "#f08030", water: "#6890f0", electric: "#f8d030",
  grass: "#78c850", ice: "#98d8d8", fighting: "#c03028", poison: "#a040a0",
  ground: "#e0c068", flying: "#a890f0", psychic: "#f85888", bug: "#a8b820",
  rock: "#b8a038", ghost: "#705898", dragon: "#7038f8", dark: "#705848",
  steel: "#b8b8d0", fairy: "#ee99ac",
};

/**
 * Pantalla VS (tú vs entrenador) — combates de ruta / gimnasio corto
 */
export async function playVsIntro({
  root,
  playerName = "Tú",
  playerSprite = null,
  playerAvatarHtml = null,
  playerMonId = null,
  trainerName = "Entrenador",
  trainerSprite = "assets/trainers/youngster.png",
  gymName = null,
  duration = 1800,
} = {}) {
  if (!root) return;

  const leftSrc = playerSprite
    || (playerMonId ? `assets/pokemon/${playerMonId}.png` : "assets/trainers/red.png");
  const rightSrc = trainerSprite || "assets/trainers/youngster.png";

  const node = el(`
    <div class="vs-intro vs-stage framed">
      <div class="vs-stage-dim"></div>
      <div class="vs-burst" aria-hidden="true"></div>
      <div class="vs-row">
        <div class="vs-card left">
          <div class="vs-portrait player">
            <img src="${leftSrc}" alt="" onerror="this.onerror=null;this.src='assets/trainers/red.png'" />
          </div>
          <span class="vs-label">${escapeHtml(playerName)}</span>
        </div>
        <div class="vs-mid">
          <div class="vs-flash">VS</div>
        </div>
        <div class="vs-card right">
          <div class="vs-portrait rival">
            <img src="${rightSrc}" alt="" onerror="this.onerror=null;this.src='assets/trainers/youngster.png'" />
          </div>
          <span class="vs-label">${escapeHtml(trainerName)}${gymName ? `<small>${escapeHtml(gymName)}</small>` : ""}</span>
        </div>
      </div>
    </div>
  `);

  root.appendChild(node);
  const left = node.querySelector(".vs-card.left");
  const right = node.querySelector(".vs-card.right");
  const vs = node.querySelector(".vs-flash");
  const burst = node.querySelector(".vs-burst");

  left.style.opacity = "0";
  right.style.opacity = "0";
  vs.style.opacity = "0";

  // Entrada lateral fuerte
  await Promise.all([
    animate(left, [
      { transform: "translateX(-120px) scale(.85)", opacity: 0 },
      { transform: "translateX(0) scale(1)", opacity: 1 },
    ], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" }),
    animate(right, [
      { transform: "translateX(120px) scale(.85)", opacity: 0 },
      { transform: "translateX(0) scale(1)", opacity: 1 },
    ], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" }),
  ]);

  // Flash VS + partículas
  vs.style.opacity = "1";
  if (burst) {
    for (let i = 0; i < 12; i++) {
      const s = document.createElement("i");
      s.className = "vs-spark";
      s.style.setProperty("--a", `${i * 30}deg`);
      s.style.setProperty("--d", `${18 + (i % 4) * 8}px`);
      burst.appendChild(s);
    }
  }
  await animate(vs, [
    { transform: "translate(-50%,-50%) scale(2.6)", opacity: 0, filter: "brightness(2)" },
    { transform: "translate(-50%,-50%) scale(1)", opacity: 1, filter: "brightness(1)" },
  ], { duration: 280 });
  await animate(vs, [
    { transform: "translate(-50%,-50%) scale(1)" },
    { transform: "translate(-50%,-50%) scale(1.18)" },
    { transform: "translate(-50%,-50%) scale(1)" },
  ], { duration: 320 });

  await delay(Math.max(400, duration - 1000));
  await animate(node, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 });
  node.remove();
}

/** Disolución a bloques (dither) de un nodo, usando máscaras CSS pre-generadas. dir: "out" | "in". */
async function pixelMask(node, dir = "out", ms = 420, block = 8) {
  const W = Math.max(8, Math.round(node.clientWidth)), H = Math.max(8, Math.round(node.clientHeight));
  const cols = Math.ceil(W / block), rows = Math.ceil(H / block);
  const th = new Float32Array(cols * rows).map(() => Math.random());
  const N = 7, frames = [];
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  for (let f = 0; f <= N; f++) {
    const q = f / N;
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#000";
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const visible = dir === "out" ? th[y * cols + x] > q : th[y * cols + x] < q;
      if (visible) ctx.fillRect(x * block, y * block, block, block);
    }
    frames.push(`url(${cv.toDataURL()})`);
  }
  node.style.webkitMaskSize = node.style.maskSize = "100% 100%";
  for (const fr of frames) {
    node.style.webkitMaskImage = node.style.maskImage = fr;
    await delay(ms / (N + 1));
  }
  if (dir === "in") node.style.webkitMaskImage = node.style.maskImage = "none";
}

/** Partículas en anillo + burst (aprox. del canvas del original). */
function spawnRing(layer, cx, cy, r, color) {
  const n = 28;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const p = document.createElement("i");
    p.className = "bi-spark";
    const size = 3 + (i % 3);
    p.style.cssText = `
      left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;
      background:${color};box-shadow:0 0 6px ${color};
    `;
    layer.appendChild(p);
    const dist = r * (0.85 + (i % 5) * 0.04);
    p.animate(
      [
        { transform: "translate(-50%,-50%) scale(.3)", opacity: 0 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * dist * 0.55}px), calc(-50% + ${Math.sin(a) * dist * 0.55}px)) scale(1)`, opacity: 1, offset: 0.35 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * dist}px), calc(-50% + ${Math.sin(a) * dist}px)) scale(.4)`, opacity: 0 },
      ],
      { duration: 700 + (i % 7) * 40, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }
    );
  }
  // burst corto
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * Math.PI * 2;
    const dist = r * (0.3 + Math.random() * 0.7);
    const p = document.createElement("i");
    p.className = "bi-spark";
    p.style.cssText = `left:${cx}px;top:${cy}px;width:4px;height:4px;background:#fff;box-shadow:0 0 8px ${color};`;
    layer.appendChild(p);
    p.animate(
      [
        { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * dist}px), calc(-50% + ${Math.sin(a) * dist}px)) scale(0)`, opacity: 0 },
      ],
      { duration: 520 + Math.random() * 200, easing: "cubic-bezier(.15,.8,.3,1)", fill: "forwards" }
    );
  }
}

export async function playBossIntro({
  root,
  trainer = "Líder",
  title = "Líder de gimnasio",   // "Alto Mando", "Campeón", etc.
  subtitle = "",                // "Sala 4", nombre del gimnasio…
  type = null,
  types = null,
  color = null,
  sprite = null,                // assets/trainers/xxx.png
  badgeHtml = "",
  holdMs = 900,
} = {}) {
  if (!root) return;

  const typeList = types || (type ? [type] : []);
  const c = color || TYPE_COLOR[typeList[0]] || "#ffcb05";
  const tags = [
    badgeHtml,
    ...typeList.map(
      (t) => `<span class="bi-type" style="--tc:${TYPE_COLOR[t] || "#aaa"}">${labelType(t)}</span>`
    ),
  ].filter(Boolean).join("");

  const node = el(`
    <div class="boss-intro v2" style="--c:${c}">
      <i class="bi-bar top"></i><i class="bi-bar bot"></i>
      <div class="bi-info">
        <small>${escapeHtml(title)}</small>
        <b>${escapeHtml(trainer)}</b>
        <span class="bi-tags">${tags}</span>
        ${subtitle ? `<em>${escapeHtml(subtitle)}</em>` : ""}
      </div>
      <div class="bi-who">
        <i class="bi-ring"></i>
        <img class="bi-trainer sil" src="${sprite || ""}" alt="" onerror="this.style.display='none'" />
      </div>
      <div class="bi-fx" aria-hidden="true"></div>
    </div>
  `);
  root.appendChild(node);
  const info = node.querySelector(".bi-info");
  const who = node.querySelector(".bi-who");
  const img = node.querySelector(".bi-trainer");
  const fx = node.querySelector(".bi-fx");
  info.style.opacity = "0";
  // decode() puede no resolverse nunca en algunos navegadores móviles: carrera con un tope
  if (img && !(img.complete && img.naturalWidth)) {
    await Promise.race([
      new Promise((r) => { img.addEventListener("load", r, { once: true }); img.addEventListener("error", r, { once: true }); }),
      delay(1200),
    ]);
  }

  try {
    // 1) entra el fondo punteado y la silueta se desliza desde la derecha
    await pixelMask(node, "in", 380);
    await animate(who, [
      { transform: "translateX(60%)", opacity: 0 },
      { transform: "translateX(-4%)", opacity: 1, offset: 0.75 },
      { transform: "none", opacity: 1 },
    ], { duration: 460 });
    await delay(Math.max(120, holdMs * 0.2));

    // 2) flash blanco, silueta → color con rebote, anillo de partículas y texto
    const flash = el('<div class="bi-flash"></div>');
    node.appendChild(flash);
    animate(flash, [{ opacity: 1 }, { opacity: 0 }], { duration: 340, easing: "ease-out" }).then(() => flash.remove());
    img?.classList.remove("sil");
    img?.animate([
      { transform: "scale(1.12, 0.9)" },
      { transform: "scale(0.96, 1.05)", offset: 0.5 },
      { transform: "scale(1)" },
    ], { duration: 360, easing: "ease-out" });
    who.classList.add("burst");
    try {
      const wr = who.getBoundingClientRect(), nr = node.getBoundingClientRect();
      spawnRing(fx, wr.left - nr.left + wr.width / 2, wr.top - nr.top + wr.height * 0.48, Math.max(70, wr.height * 0.55), c);
    } catch (_) {}
    info.style.opacity = "1";
    await animate(info, [
      { opacity: 0, transform: "translateX(-36px)" },
      { opacity: 1, transform: "translateX(6px)", offset: 0.7 },
      { opacity: 1, transform: "none" },
    ], { duration: 380 });
    info.classList.add("show");
    try {
      const tg = node.querySelector(".bi-tags");
      if (tg) { const tr = tg.getBoundingClientRect(), nr = node.getBoundingClientRect(); spawnRing(fx, tr.left - nr.left + tr.width / 2, tr.top - nr.top + tr.height / 2, 36, c); }
    } catch (_) {}

    await delay(holdMs + 300);

    // 3) se deshace a bloques sobre el escenario
    await pixelMask(node, "out", 420);
  } catch (_) {
  } finally {
    node.style.webkitMaskImage = node.style.maskImage = "none";
    node.remove();
  }
}

/**
 * Aviso de legendario (texto + destello). El original usa un iframe
 * "legend-intro" más elaborado; esto es la versión ligera integrable.
 */
export async function playLegendAnnounce({
  root,
  name = "Pokémon legendario",
  text = "Una presencia imponente se acerca…",
  color = "#c9a0ff",
  sprite = null, // front sprite url
  holdMs = 1400,
} = {}) {
  if (!root) return;
  const node = el(`
    <div class="legend-announce" style="--c:${color}">
      <div class="la-glow"></div>
      ${sprite ? `<img class="la-sprite" src="${sprite}" alt="" />` : ""}
      <div class="la-text">
        <small>Encuentro especial</small>
        <b>${escapeHtml(name)}</b>
        <p>${escapeHtml(text)}</p>
      </div>
    </div>
  `);
  root.appendChild(node);
  await animate(node, [
    { opacity: 0, transform: "scale(.92)" },
    { opacity: 1, transform: "none" },
  ], { duration: 420 });
  await delay(holdMs);
  await animate(node, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
  node.remove();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function labelType(t) {
  const map = {
    normal: "Normal", fire: "Fuego", water: "Agua", electric: "Eléctrico",
    grass: "Planta", ice: "Hielo", fighting: "Lucha", poison: "Veneno",
    ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho",
    rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro",
    steel: "Acero", fairy: "Hada",
  };
  return map[t] || t;
}
