// Medallas de Kanto (sprites FRLG): una tira de 8 imágenes de 16×16 por color.
import { BADGE_STRIPS } from "./badge-data.js?v=129";
import { CHAPTERS } from "../engine/story.js?v=129";

// Qué variante de color usa cada medalla (frlg-N.png)
const FILE = [1, 2, 3, 4, 5, 6, 7, 8];

let order = null;
/** Posición (0..7) de una medalla por su nombre en español. */
export function badgeIndex(name) {
  if (!order) {
    order = CHAPTERS.map(c => c.steps.find(s => s.kind === "gym")).filter(g => g && g.badgeEs && g.badgeEs !== "Maestro").map(g => g.badgeEs);
  }
  return Math.max(0, order.indexOf(name));
}

/** HTML de una medalla. got=false → silueta apagada. */
export function badgeHtml(i, got = true, size = 32, cls = "") {
  const f = got ? FILE[i] : 1;
  return `<span class="badge-px ${got ? "" : "off"} ${cls}" style="width:${size}px;height:${size}px;background:url(${BADGE_STRIPS[f]}) ${-i * size}px 0 / ${size * 8}px ${size}px no-repeat"></span>`;
}
