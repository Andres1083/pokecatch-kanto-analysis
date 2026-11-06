// Globo con las ventajas/debilidades de un tipo (al tocar la etiqueta de tipo de un líder).
const ES = { normal: "Normal", fire: "Fuego", water: "Agua", electric: "Eléctrico", grass: "Planta", ice: "Hielo", fighting: "Lucha", poison: "Veneno", ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho", rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro", steel: "Acero", fairy: "Hada" };
const KEY = Object.fromEntries(Object.entries(ES).map(([k, v]) => [v, k]));
const COL = { normal: "#a8a878", fire: "#f08030", water: "#6890f0", electric: "#f8d030", grass: "#78c850", ice: "#98d8d8", fighting: "#c03028", poison: "#a040a0", ground: "#e0c068", flying: "#a890f0", psychic: "#f85888", bug: "#a8b820", rock: "#b8a038", ghost: "#705898", dragon: "#7038f8", dark: "#705848", steel: "#b8b8d0", fairy: "#ee99ac" };
// [superefectivo, poco efectivo, sin efecto] cuando el tipo ATACA
const ATK = {
  normal: [[], ["rock", "steel"], ["ghost"]],
  fire: [["grass", "ice", "bug", "steel"], ["fire", "water", "rock", "dragon"], []],
  water: [["fire", "ground", "rock"], ["water", "grass", "dragon"], []],
  electric: [["water", "flying"], ["electric", "grass", "dragon"], ["ground"]],
  grass: [["water", "ground", "rock"], ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"], []],
  ice: [["grass", "ground", "flying", "dragon"], ["fire", "water", "ice", "steel"], []],
  fighting: [["normal", "ice", "rock", "dark", "steel"], ["poison", "flying", "psychic", "bug", "fairy"], ["ghost"]],
  poison: [["grass", "fairy"], ["poison", "ground", "rock", "ghost"], ["steel"]],
  ground: [["fire", "electric", "poison", "rock", "steel"], ["grass", "bug"], ["flying"]],
  flying: [["grass", "fighting", "bug"], ["electric", "rock", "steel"], []],
  psychic: [["fighting", "poison"], ["psychic", "steel"], ["dark"]],
  bug: [["grass", "psychic", "dark"], ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"], []],
  rock: [["fire", "ice", "flying", "bug"], ["fighting", "ground", "steel"], []],
  ghost: [["psychic", "ghost"], ["dark"], ["normal"]],
  dragon: [["dragon"], ["steel"], ["fairy"]],
  dark: [["psychic", "ghost"], ["fighting", "dark", "fairy"], []],
  steel: [["ice", "rock", "fairy"], ["fire", "water", "electric", "steel"], []],
  fairy: [["fighting", "dragon", "dark"], ["fire", "poison", "steel"], []],
};
const TYPES = Object.keys(ATK);
const defense = (t) => {
  const weak = [], res = [], imm = [];
  for (const a of TYPES) { const [se, nve, no] = ATK[a]; if (se.includes(t)) weak.push(a); else if (nve.includes(t)) res.push(a); else if (no.includes(t)) imm.push(a); }
  return { weak, res, imm };
};

let cur = null;
function close() { if (cur) { cur.remove(); cur = null; document.removeEventListener("pointerdown", onDoc, true); } }
function onDoc(e) { if (cur && !cur.contains(e.target)) close(); }

const pills = (list) => list.map(t => `<span class="tp-pill" style="--tc:${COL[t]}">${ES[t]}</span>`).join("");
const row = (cls, label, list) => list.length ? `<div class="tp-row"><span class="tp-l ${cls}">${label}</span><div class="tp-p">${pills(list)}</div></div>` : "";

/** anchor: elemento tocado; typeEs: nombre del tipo en español (p. ej. "Volador"). */
export function showTypeTip(anchor, typeEs) {
  const t = KEY[typeEs];
  if (!t) return;
  const same = cur && cur._anchor === anchor;
  close();
  if (same) return;
  const [se, nve, no] = ATK[t];
  const d = defense(t);
  const el = document.createElement("div");
  el.className = "tp-pop";
  el._anchor = anchor;
  el.innerHTML = `<span class="tp-pill big" style="--tc:${COL[t]}">${ES[t]}</span>
    <div class="tp-h">EN ATAQUE</div>
    ${row("g", "Superefectivo ×2", se)}${row("r", "Poco efectivo ×½", nve)}${row("n", "Sin efecto ×0", no)}
    <div class="tp-h">EN DEFENSA</div>
    ${row("r", "Débil ×2", d.weak)}${row("g", "Resiste ×½", d.res)}${row("g", "Inmune ×0", d.imm)}`;
  document.body.appendChild(el);
  const r = anchor.getBoundingClientRect();
  const w = Math.min(360, window.innerWidth - 16);
  el.style.width = `${w}px`;
  const h = el.offsetHeight;
  let left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
  let top = r.bottom + 8;
  if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 8);
  el.style.left = `${left}px`; el.style.top = `${top}px`;
  cur = el;
  setTimeout(() => document.addEventListener("pointerdown", onDoc, true), 0);
}

/** Multiplicadores de daño recibido por un Pokémon con esos tipos: { tipo: factor } (solo ≠ 1). */
export function incomingMult(types = []) {
  const out = {};
  for (const a of TYPES) {
    let m = 1;
    for (const t of types) { const [se, nve, no] = ATK[a]; if (se.includes(t)) m *= 2; else if (nve.includes(t)) m *= 0.5; else if (no.includes(t)) m *= 0; }
    if (m !== 1) out[a] = m;
  }
  return out;
}
export const TYPE_NAME_ES = ES;
export const TYPE_COLOR = COL;
