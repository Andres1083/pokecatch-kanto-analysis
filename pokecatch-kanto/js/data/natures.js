// Naturalezas (25) — suben un stat 10% y bajan otro 10%

const STATS = ["atk", "def", "spa", "spd", "spe"];

export const NATURES = [
  { name: "Hardi", nameEs: "Fuerte", up: null, down: null },
  { name: "Solo", nameEs: "Huraña", up: "atk", down: "def" },
  { name: "Brave", nameEs: "Audaz", up: "atk", down: "spe" },
  { name: "Rigide", nameEs: "Firme", up: "atk", down: "spa" },
  { name: "Mauvais", nameEs: "Pícara", up: "atk", down: "spd" },
  { name: "Assuré", nameEs: "Osada", up: "def", down: "atk" },
  { name: "Docile", nameEs: "Dócil", up: null, down: null },
  { name: "Relax", nameEs: "Plácida", up: "def", down: "spe" },
  { name: "Malin", nameEs: "Agitada", up: "def", down: "spa" },
  { name: "Lâche", nameEs: "Floja", up: "def", down: "spd" },
  { name: "Timide", nameEs: "Miedosa", up: "spe", down: "atk" },
  { name: "Pressé", nameEs: "Activa", up: "spe", down: "def" },
  { name: "Sérieux", nameEs: "Serena", up: null, down: null },
  { name: "Jovial", nameEs: "Alegre", up: "spe", down: "spa" },
  { name: "Naïf", nameEs: "Ingenua", up: "spe", down: "spd" },
  { name: "Modeste", nameEs: "Modesta", up: "spa", down: "atk" },
  { name: "Doux", nameEs: "Afable", up: "spa", down: "def" },
  { name: "Discret", nameEs: "Mansa", up: "spa", down: "spe" },
  { name: "Pudique", nameEs: "Rara", up: null, down: null },
  { name: "Foufou", nameEs: "Alocada", up: "spa", down: "spd" },
  { name: "Calme", nameEs: "Serena", up: "spd", down: "atk" }, // fix: Calmada
  { name: "Gentil", nameEs: "Amable", up: "spd", down: "def" },
  { name: "Malpoli", nameEs: "Grosera", up: "spd", down: "spe" },
  { name: "Prudent", nameEs: "Cauta", up: "spd", down: "spa" },
  { name: "Bizarre", nameEs: "Rara", up: null, down: null },
];

// Nombres ES más correctos
NATURES[0].nameEs = "Fuerte";
NATURES[6].nameEs = "Dócil";
NATURES[12].nameEs = "Seria";
NATURES[18].nameEs = "Tímida";
NATURES[20].nameEs = "Calmada";
NATURES[24].nameEs = "Rara";

export function randomNature() {
  return Math.floor(Math.random() * NATURES.length);
}

export function getNature(index) {
  return NATURES[index] || NATURES[0];
}

/** Multiplicador de stat por naturaleza */
export function natureMult(natureIndex, stat) {
  const n = getNature(natureIndex);
  if (!n.up && !n.down) return 1;
  if (n.up === stat) return 1.1;
  if (n.down === stat) return 0.9;
  return 1;
}

/** Aplica naturaleza sobre stats ya calculados a nivel */
export function applyNatureToStats(stats, natureIndex) {
  const out = { ...stats };
  for (const s of STATS) {
    out[s] = Math.max(1, Math.floor((out[s] || 1) * natureMult(natureIndex, s)));
  }
  return out;
}

export const STAT_LABEL = { atk: "Ataque", def: "Defensa", spa: "At. Esp.", spd: "Def. Esp.", spe: "Velocidad" };

/** HTML con lo que sube y lo que baja una naturaleza */
export function natureEffectHtml(index) {
  const n = getNature(index);
  if (!n.up || !n.down) {
    return `<b>${n.nameEs}</b>: naturaleza neutra, no sube ni baja ninguna estadística.`;
  }
  return `<b>${n.nameEs}</b>: <span class="nat-up">▲ +10 % ${STAT_LABEL[n.up]}</span> · <span class="nat-down">▼ −10 % ${STAT_LABEL[n.down]}</span>`;
}

const SHORT = { atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe" };
/** Texto para el filtro: "Audaz (+Atk / -Spe)" o "Fuerte (neutra)" */
export function natureLabel(index) {
  const n = getNature(index);
  return n.up && n.down ? `${n.nameEs} (+${SHORT[n.up]} / -${SHORT[n.down]})` : `${n.nameEs} (neutra)`;
}
