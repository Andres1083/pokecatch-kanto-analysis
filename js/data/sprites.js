// Sprites locales (assets/pokemon) con fallback PokeAPI

const LOCAL = "assets/pokemon";
const API = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

function idOf(x) {
  return typeof x === "object" && x ? x.id : x;
}
function isShiny(x) {
  return typeof x === "object" && x && x.shiny;
}

export function frontSprite(x) {
  const id = idOf(x);
  if (isShiny(x)) return `${API}/shiny/${id}.png`;
  return `${LOCAL}/${id}.png`;
}
export function backSprite(x) { return frontSprite(x); }
export function battleSprite(x) { return frontSprite(x); }
export function iconSprite(x) { return frontSprite(x); }
export function trainerSprite(key) {
  return `assets/trainers/${key}.png`;
}
/** Fallback remoto si el local falla */
export function remoteSprite(x) {
  const id = idOf(x);
  return isShiny(x) ? `${API}/shiny/${id}.png` : `${API}/${id}.png`;
}

/**
 * Altura (dm) → px de campo.
 * height 3 → ~42px · 10 → ~72px · 17 → ~92px · 65 → ~120px
 */
export function spriteSizePx(heightDm, { min = 36, max = 100, base = 60 } = {}) {
  const h = Number(heightDm);
  if (!h || h <= 0) return base;
  // Si viene en metros (0.7) convertir a dm
  const dm = h < 5 && h !== Math.floor(h) ? h * 10 : h;
  const px = 28 + Math.pow(dm, 0.72) * 12.5;
  return Math.round(Math.min(max, Math.max(min, px)));
}

export function spriteSizeStyle(mon) {
  const px = spriteSizePx(mon?.height);
  return `width:${px}px;height:${px}px;--art:${px}px;max-width:${px}px;max-height:${px}px;`;
}
