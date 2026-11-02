// Evoluciones de Kanto. kind: "lvl" (nivel) | "stone" (objeto de la mochila)
// Las de intercambio se resuelven por nivel (40) porque el juego no tiene intercambios.
const L = (to, v) => ({ to, kind: "lvl", v });
const S = (to, item) => ({ to, kind: "stone", item });
export const EVOS = {
  1: [L(2, 16)], 2: [L(3, 32)], 4: [L(5, 16)], 5: [L(6, 36)], 7: [L(8, 16)], 8: [L(9, 36)],
  10: [L(11, 7)], 11: [L(12, 10)], 13: [L(14, 7)], 14: [L(15, 10)], 16: [L(17, 18)], 17: [L(18, 36)],
  19: [L(20, 20)], 21: [L(22, 20)], 23: [L(24, 22)], 25: [S(26, "stone-thunder")], 27: [L(28, 22)],
  29: [L(30, 16)], 30: [S(31, "stone-moon")], 32: [L(33, 16)], 33: [S(34, "stone-moon")],
  35: [S(36, "stone-moon")], 37: [S(38, "stone-fire")], 39: [S(40, "stone-moon")], 41: [L(42, 22)],
  43: [L(44, 21)], 44: [S(45, "stone-leaf")], 46: [L(47, 24)], 48: [L(49, 31)], 50: [L(51, 26)],
  52: [L(53, 28)], 54: [L(55, 33)], 56: [L(57, 28)], 58: [S(59, "stone-fire")], 60: [L(61, 25)],
  61: [S(62, "stone-water")], 63: [L(64, 16)], 64: [L(65, 40)], 66: [L(67, 28)], 67: [L(68, 40)],
  69: [L(70, 21)], 70: [S(71, "stone-leaf")], 72: [L(73, 30)], 74: [L(75, 25)], 75: [L(76, 40)],
  77: [L(78, 40)], 79: [L(80, 37)], 81: [L(82, 30)], 84: [L(85, 31)], 86: [L(87, 34)], 88: [L(89, 38)],
  90: [S(91, "stone-water")], 92: [L(93, 25)], 93: [L(94, 40)], 96: [L(97, 26)], 98: [L(99, 28)],
  100: [L(101, 30)], 102: [S(103, "stone-leaf")], 104: [L(105, 28)], 109: [L(110, 35)], 111: [L(112, 42)],
  116: [L(117, 32)], 118: [L(119, 33)], 120: [S(121, "stone-water")], 129: [L(130, 20)],
  133: [S(134, "stone-water"), S(135, "stone-thunder"), S(136, "stone-fire")],
  138: [L(139, 40)], 140: [L(141, 40)], 147: [L(148, 30)], 148: [L(149, 55)],
};
export const STONE_ES = { "stone-fire": "Piedra Fuego", "stone-water": "Piedra Agua", "stone-thunder": "Piedra Trueno", "stone-leaf": "Piedra Hoja", "stone-moon": "Piedra Lunar" };

export function evosOf(id) { return EVOS[id] || []; }
export function prevOf(id) {
  for (const [from, list] of Object.entries(EVOS)) if (list.some(e => e.to === id)) return Number(from);
  return null;
}
/** Árbol de la familia: [[ids de la etapa 0], [etapa 1], ...] */
export function familyStages(id) {
  let root = id, p;
  while ((p = prevOf(root))) root = p;
  const stages = [[root]];
  for (;;) {
    const next = stages[stages.length - 1].flatMap(i => evosOf(i).map(e => e.to));
    if (!next.length) break;
    stages.push(next);
  }
  return stages;
}
