/**
 * Secuencia intro Mewtwo (recreación a partir del vídeo del original)
 * Frames: assets/intro/mewtwo/01_…png … 10_…
 *
 * Uso:
 *   import { playMewtwoIntro } from "./mewtwo-intro.js";
 *   await playMewtwoIntro(document.querySelector("#scene"));
 */

const FRAMES = [
  { src: "01_lab_capsule.webp", ms: 900 },
  { src: "02_lab_break.webp", ms: 900 },
  { src: "03_cave_core.webp", ms: 800 },
  { src: "04_cave_burst.webp", ms: 800 },
  { src: "05_flash_outline.webp", ms: 700 },
  { src: "06_silhouette.webp", ms: 900 },
  { src: "07_silhouette_solid.webp", ms: 800 },
  { src: "08_full_color.webp", ms: 900 },
  { src: "09_title_card.webp", ms: 1200 },
  { src: "10_title_hold.webp", ms: 600 },
];

const TITLE = {
  tag: "POKÉMON LEGENDARIO · Nv. 100",
  name: "Mewtwo",
  type: "Psíquico",
  place: "Cueva Celeste",
};

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * @param {HTMLElement} root  contenedor (ej. #scene)
 * @param {object} opts
 * @param {string} opts.basePath  carpeta de frames (default assets/intro/mewtwo/)
 * @param {number} opts.speed     1 = normal
 * @param {boolean} opts.showHtmlTitle  superpone texto final por si el frame no lo trae nítido
 */
export async function playMewtwoIntro(root, opts = {}) {
  if (!root) return;
  const base = opts.basePath || "assets/intro/mewtwo/";
  const speed = Math.max(0.4, opts.speed || 1);

  const layer = document.createElement("div");
  layer.className = "legend-cine";
  layer.innerHTML = `
    <div class="legend-cine-stage">
      <img class="legend-cine-frame" alt="" />
      <div class="legend-cine-title" hidden>
        <small></small>
        <b></b>
        <span class="legend-cine-tags">
          <em class="type"></em>
          <em class="place"></em>
        </span>
      </div>
    </div>
  `;
  root.appendChild(layer);

  const img = layer.querySelector(".legend-cine-frame");
  const title = layer.querySelector(".legend-cine-title");
  title.querySelector("small").textContent = TITLE.tag;
  title.querySelector("b").textContent = TITLE.name;
  title.querySelector(".type").textContent = TITLE.type;
  title.querySelector(".place").textContent = TITLE.place;

  // preload
  await Promise.all(
    FRAMES.map(
      (f) =>
        new Promise((res) => {
          const i = new Image();
          i.onload = i.onerror = res;
          i.src = base + f.src;
        })
    )
  );

  layer.classList.add("on");
  for (let i = 0; i < FRAMES.length; i++) {
    const f = FRAMES[i];
    img.src = base + f.src;
    if (opts.showHtmlTitle && i >= 8) title.hidden = false;
    else title.hidden = true;
    await delay(f.ms / speed);
  }

  layer.classList.add("out");
  await delay(280 / speed);
  layer.remove();
}

export { FRAMES, TITLE };
