// Historia de Kanto: capítulos → tramos → nodos, y tablas de aparición.
// Datos tomados del Poke'Catch original (pesos, horarios, clima).

import { CHAPTERS } from "../data/story.js?v=100";
import KANTO_ENCOUNTERS from "../data/encounters-kanto.js?v=100";

export { CHAPTERS };

// ───────── Mapa de nodos ─────────
// t: wild | trainer | item | center | find | gym     seg: índice de tramo

/** Distribuciones exactas (copiadas de la barra del original). W=salvaje T=entrenador ?=objeto */
const LAYOUTS = {
  "0:1": "WWW?",      // Ruta 1
  "0:3": "WW",        // Ruta 2
  "0:4": "WTWW?TW?",  // Bosque Verde
};

function shuffle(a, rand) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function layoutFor(ci, si, step, rand) {
  if (LAYOUTS[`${ci}:${si}`]) return [...LAYOUTS[`${ci}:${si}`]];
  const w = step.wild || 0, t = step.trainers || 0;
  const items = step.item ? ((w + t) >= 6 ? 2 : 1) : 0;
  const arr = shuffle([...Array(w).fill("W"), ...Array(t).fill("T"), ...Array(items).fill("?")], rand);
  if (arr.length && arr[0] === "?") arr.push(arr.shift()); // no empezar con "?"
  return arr;
}
const LETTER = { W: "wild", T: "trainer", "?": "item" };

/** Construye { segs, nodes } del capítulo. */
export function buildChapter(ci, rand = Math.random) {
  const ch = CHAPTERS[ci % CHAPTERS.length];
  const segs = [];
  const nodes = [];
  const steps = ch.steps;
  let pendingFind = null;

  steps.forEach((st, si) => {
    if (st.kind === "route") {
      const segIdx = segs.length;
      segs.push({ name: st.name, kind: "route", areas: st.areas || [], bg: st.bg, lv: st.lv || null, step: si });
      for (const L of layoutFor(ci, si, st, rand)) nodes.push({ t: LETTER[L], seg: segIdx });
    } else if (st.kind === "heal") {
      let segIdx = segs.length - 1;
      if (segIdx < 0 || nodes.length === 0) {
        segs.push({ name: st.name, kind: "town", areas: [], bg: "town", step: si });
        segIdx = segs.length - 1;
      }
      nodes.push({ t: "center", seg: segIdx });
    } else if (st.kind === "find") {
      pendingFind = st;
    } else if (st.kind === "unlock") {
      const segIdx = Math.max(0, segs.length - 1);
      nodes.push({ t: "unlock", seg: segIdx, key: st.once, text: st.text });
    } else if (st.kind === "gym") {
      const segIdx = segs.length;
      segs.push({ name: st.name, kind: "gym", areas: [], bg: st.bg, step: si, gym: st });
      if (pendingFind) { nodes.push({ t: "find", seg: segIdx, item: pendingFind.item }); pendingFind = null; }
      nodes.push({ t: "gym", seg: segIdx });
    } else if (st.kind === "legend") {
      const segIdx = segs.length;
      segs.push({
        name: st.name,
        kind: "legend",
        areas: [],
        bg: st.bg || "cave",
        step: si,
        legendId: st.id,
        legendLevel: st.level,
      });
      nodes.push({
        t: "legend",
        seg: segIdx,
        id: st.id,
        level: st.level,
        once: st.once || `legend-${st.id}`,
      });
    }
    // gift / static / trade: aún no implementados (se omiten)
  });
  return { segs, nodes };
}

export function gymOf(segs) {
  return segs.find(s => s.kind === "gym")?.gym || null;
}

// ───────── Aparición de Pokémon salvajes ─────────

/** [día, atardecer, noche] — multiplicadores del original */
const TIME_WEIGHTS = {
  10: [1.5, 1, .3], 11: [1.5, 1, .3], 13: [1.5, 1, .3], 14: [1.5, 1, .3], 16: [1.5, 1, .2], 17: [1.5, 1, .2],
  21: [1, 1, .2], 22: [1, 1, .2], 69: [1, 1, .3], 70: [1, 1, .3], 19: [.6, .6, 1.8], 20: [.6, .6, 1.8],
  43: [.3, .3, 2], 44: [.3, .3, 2], 48: [.3, .3, 2], 49: [.3, .3, 2], 52: [.5, .5, 2], 35: [.5, .5, 2],
  92: [.5, .5, 2], 93: [.5, .5, 2], 96: [.5, .5, 1.8], 41: [.7, .7, 1.5],
};

/**
 * Ajustes de tasa según hora/clima.
 * IMPORTANTE: solo se aplican a especies que YA están en la tabla del área
 * (no inyecta Pokémon de otras rutas).
 * - boost: [[id, factor]] multiplica el peso
 * - drop: ids con peso reducido (DROP_FACTOR)
 */
const BONUS = [
  // Pradera de noche: menos Pidgey/Spearow, más Rattata (si está)
  { bg: "prairie",  when: "night", drop: [16, 21], boost: [[19, 1.6], [20, 1.4]] },
  // Bosque: de día un poco más de bichos; de noche menos diurnos
  { bg: "forest",   when: "morning", boost: [[10, 1.3], [13, 1.3]] },
  { bg: "forest",   when: "night", drop: [10, 11, 13, 14, 16, 17], boost: [[25, 1.4]] },
  // Montaña: Geodude de día, Clefairy de noche solo si ya están en la tabla
  { bg: "mountain", when: "day",   boost: [[74, 1.3]] },
  { bg: "mountain", when: "night", boost: [[35, 1.4], [41, 1.2]] },
];

/** Periodo del día a partir de la hora local. */
export function periodOf(d = new Date()) {
  const h = d.getHours();
  if (h >= 20 || h < 6) return "night";
  if (h === 19 || h === 6) return "dusk";
  return h < 10 ? "morning" : "day";
}
const DROP_FACTOR = 0.2; // las especies «dropeadas» no desaparecen, solo se vuelven 5 veces más raras
const TW_INDEX = { morning: 0, day: 0, dusk: 1, night: 2 };

function walkEntries(areas) {
  const out = [];
  for (const a of areas) {
    for (const e of KANTO_ENCOUNTERS[a] || []) {
      if ((e[4] || "walk").split("|").some(m => m === "walk")) out.push({ id: e[0], min: e[1], max: e[2], w: e[3] || 1, area: a });
    }
  }
  return out;
}

/**
 * Tabla [{id, pct, min, max}] de un tramo para un periodo/clima.
 * pct suma 100.
 */
export function encounterTable(seg, { period = "day", weather = "clear" } = {}) {
  const entries = walkEntries(seg.areas || []);
  if (!entries.length) return [];
  const tw = TW_INDEX[period] ?? 0;

  const rules = BONUS.filter(r => {
    const whenOk = r.when === period || (r.when === "rain" && (weather === "rain" || weather === "storm"));
    if (!whenOk) return false;
    if (r.area) return (seg.areas || []).includes(r.area);
    return r.bg === seg.bg;
  });
  const dropped = new Set(rules.flatMap(r => r.drop || []));
  const boostMap = new Map();
  for (const r of rules) {
    for (const [id, f] of (r.boost || [])) {
      boostMap.set(id, (boostMap.get(id) || 1) * f);
    }
  }

  const base = new Map();
  for (const e of entries) {
    let mult = (TIME_WEIGHTS[e.id] || [1, 1, 1])[tw];
    if (dropped.has(e.id)) mult *= DROP_FACTOR;
    if (boostMap.has(e.id)) mult *= boostMap.get(e.id);
    const cur = base.get(e.id) || { id: e.id, min: e.min, max: e.max, w: 0 };
    cur.w += e.w * mult;
    cur.min = Math.min(cur.min, e.min);
    cur.max = Math.max(cur.max, e.max);
    base.set(e.id, cur);
  }
  const baseTotal = [...base.values()].reduce((s, b) => s + b.w, 0) || 1;
  // Solo especies de la tabla del área (sin inyectar ajenos)
  const out = [...base.values()].map(b => ({
    id: b.id,
    pct: (b.w / baseTotal) * 100,
    min: b.min,
    max: b.max,
  }));
  return out.sort((a, b) => b.pct - a.pct);
}

/** Elige un salvaje del tramo. Devuelve { id, level }. */
export function pickEncounter(seg, ctx = {}, rand = Math.random) {
  const table = encounterTable(seg, ctx);
  if (!table.length) return { id: 16, level: 3 };
  let r = rand() * table.reduce((s, t) => s + t.pct, 0);
  let pick = table[table.length - 1];
  for (const t of table) { r -= t.pct; if (r <= 0) { pick = t; break; } }
  const [a, b] = seg.lv || [pick.min, pick.max];
  return { id: pick.id, level: a + Math.floor(rand() * (b - a + 1)) };
}

/** Equipo rival para un entrenador del tramo. */
export function makeTrainerTeam(seg, ctx = {}, rand = Math.random) {
  const n = 1 + (rand() < 0.4 ? 1 : 0) + (rand() < 0.15 ? 1 : 0);
  const mons = [];
  for (let i = 0; i < n; i++) {
    const e = pickEncounter(seg, ctx, rand);
    mons.push({ id: e.id, level: Math.min(e.level + 1, (seg.lv ? seg.lv[1] + 1 : 99)) });
  }
  return mons;
}

/** Especies de todos los tramos de un capítulo (para precargar enemigos). */
export function chapterSpecies(segs) {
  const set = new Map();
  for (const seg of segs) {
    for (const e of walkEntries(seg.areas || [])) {
      const [a, b] = seg.lv || [e.min, e.max];
      for (let l = a; l <= b + 1; l++) set.set(`${e.id}:${l}`, { id: e.id, level: l });
    }
    if (seg.gym) for (const [id, level] of seg.gym.team) set.set(`${id}:${level}`, { id, level });
    if (seg.legendId) set.set(`${seg.legendId}:${seg.legendLevel}`, { id: seg.legendId, level: seg.legendLevel });
  }
  return [...set.values()];
}

export function recommendedLevels(gym) {
  const lv = gym.team.map(t => t[1]);
  return [Math.min(...lv), Math.max(...lv) + 5];
}
