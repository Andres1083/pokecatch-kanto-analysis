// Sprites locales de alta calidad + art animado (GIF estilo Showdown)

const LOCAL = "assets/pokemon";
const API = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

function idOf(x) {
  return typeof x === "object" && x ? x.id : x;
}
function isShiny(x) {
  return typeof x === "object" && x && x.shiny;
}

/** Icono estático 96×96 (PC, listas, riel) */
export function frontSprite(x) {
  const id = idOf(x);
  if (isShiny(x)) return `${LOCAL}/shiny/${id}.png`;
  return `${LOCAL}/${id}.png`;
}

export function backSprite(x) { return frontSprite(x); }
export function battleSprite(x) { return frontSprite(x); }
export function iconSprite(x) { return frontSprite(x); }

/** Arte animado (detalle / showcase). GIF local; fallback a PNG estático. */
export function artSprite(x, { still = false } = {}) {
  const id = idOf(x);
  const shiny = isShiny(x);
  if (still) {
    // still no descargado: usamos el icono nítido
    return frontSprite(x);
  }
  return shiny
    ? `${LOCAL}/art/shiny/${id}.gif`
    : `${LOCAL}/art/${id}.gif`;
}

export function trainerSprite(key) {
  return `assets/trainers/${key}.png`;
}

export function remoteSprite(x) {
  const id = idOf(x);
  return isShiny(x) ? `${API}/shiny/${id}.png` : `${API}/${id}.png`;
}

export function spriteFallback(x) {
  const remote = remoteSprite(x);
  const safe = remote.replace(/'/g, "%27");
  return `onerror="this.onerror=null;this.src='${safe}'"`;
}

/** Fallback del art animado → icono estático local */
export function artFallback(x) {
  const fb = frontSprite(x);
  const safe = fb.replace(/'/g, "%27");
  return `onerror="this.onerror=null;this.src='${safe}'"`;
}

/**
 * Fondo de escena según tipo primario (assets del original).
 */
const TYPE_SCENE = {
  water:    "assets/bg/scenes/10-pleine-mer-710x400.webp",
  ice:      "assets/bg/scenes/09-plage-710x400.webp",
  grass:    "assets/bg/scenes/12-foret-jade-v2-710x400.webp",
  bug:      "assets/bg/scenes/12-foret-jade-v2-710x400.webp",
  fire:     "assets/bg/scenes/19-centrale-abandonnee-710x400.webp",
  rock:     "assets/bg/scenes/03-sentier-rocheux-710x400.webp",
  ground:   "assets/bg/scenes/14-grotte-taupiqueur-710x400.webp",
  fighting: "assets/bg/scenes/03-sentier-rocheux-710x400.webp",
  ghost:    "assets/bg/scenes/15-grotte-sombre-710x400.webp",
  dark:     "assets/bg/scenes/21-manoir-pokemon-710x400.webp",
  poison:   "assets/bg/scenes/15-grotte-sombre-710x400.webp",
  electric: "assets/bg/scenes/19-centrale-abandonnee-710x400.webp",
  psychic:  "assets/bg/scenes/16-tour-pokemon-710x400.webp",
  fairy:    "assets/bg/scenes/01-prairie-ouverte-710x400.webp",
  dragon:   "assets/bg/scenes/02-chemin-boise-lisiere-710x400.webp",
  flying:   "assets/bg/scenes/01-prairie-ouverte-710x400.webp",
  normal:   "assets/bg/scenes/01-prairie-ouverte-710x400.webp",
  steel:    "assets/bg/scenes/23-sylphe-sarl-710x400.webp",
};

export function sceneForMon(mon) {
  const t = (mon?.types && mon.types[0]) || "normal";
  return TYPE_SCENE[t] || TYPE_SCENE.normal;
}

export function spriteSizePx(heightDm, { min = 48, max = 110, base = 72 } = {}) {
  const h = Number(heightDm);
  if (!h || h <= 0) return base;
  const dm = h < 5 && h !== Math.floor(h) ? h * 10 : h;
  const px = 28 + Math.pow(dm, 0.72) * 12.5;
  return Math.round(Math.min(max, Math.max(min, px)));
}

export function spriteSizeStyle(mon) {
  const px = spriteSizePx(mon?.height);
  return `width:${px}px;height:${px}px;--art:${px}px;max-width:${px}px;max-height:${px}px;`;
}
