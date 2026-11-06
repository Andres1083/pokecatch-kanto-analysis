// "Mis Pokémon": lista en cuadrícula con filtros (adaptada de Pokemaniakos).

import { frontSprite } from "../data/sprites.js?v=136";
import { NATURES, natureLabel } from "../data/natures.js?v=136";
import { showPokemonDetail } from "./pokemon-detail.js?v=136";

export const TYPE_INFO = {
  normal:   { label: "Normal",    color: "#A8A878", emoji: "⚪", icon: "assets/ui/icons/types/normal.svg" },
  fire:     { label: "Fuego",     color: "#F08030", emoji: "🔥", icon: "assets/ui/icons/types/fire.svg" },
  water:    { label: "Agua",      color: "#6890F0", emoji: "💧", icon: "assets/ui/icons/types/water.svg" },
  electric: { label: "Eléctrico", color: "#F8D030", emoji: "⚡", icon: "assets/ui/icons/types/electric.svg" },
  grass:    { label: "Planta",    color: "#78C850", emoji: "🌿", icon: "assets/ui/icons/types/grass.svg" },
  ice:      { label: "Hielo",     color: "#98D8D8", emoji: "❄️", icon: "assets/ui/icons/types/ice.svg" },
  fighting: { label: "Lucha",     color: "#C03028", emoji: "🥊", icon: "assets/ui/icons/types/fighting.svg" },
  poison:   { label: "Veneno",    color: "#A040A0", emoji: "☠️", icon: "assets/ui/icons/types/poison.svg" },
  ground:   { label: "Tierra",    color: "#E0C068", emoji: "🌍", icon: "assets/ui/icons/types/ground.svg" },
  flying:   { label: "Volador",   color: "#A890F0", emoji: "🕊️", icon: "assets/ui/icons/types/flying.svg" },
  psychic:  { label: "Psíquico",  color: "#F85888", emoji: "🔮", icon: "assets/ui/icons/types/psychic.svg" },
  bug:      { label: "Bicho",     color: "#A8B820", emoji: "🐛", icon: "assets/ui/icons/types/bug.svg" },
  rock:     { label: "Roca",      color: "#B8A038", emoji: "🪨", icon: "assets/ui/icons/types/rock.svg" },
  ghost:    { label: "Fantasma",  color: "#705898", emoji: "👻", icon: "assets/ui/icons/types/ghost.svg" },
  dragon:   { label: "Dragón",    color: "#7038F8", emoji: "🐉", icon: "assets/ui/icons/types/dragon.svg" },
  dark:     { label: "Siniestro", color: "#705848", emoji: "🌑", icon: "assets/ui/icons/types/dark.svg" },
  steel:    { label: "Acero",     color: "#B8B8D0", emoji: "⚙️", icon: "assets/ui/icons/types/steel.svg" },
  fairy:    { label: "Hada",      color: "#EE99AC", emoji: "✨", icon: "assets/ui/icons/types/fairy.svg" },
};

export function typeIconHtml(key, { size = 28, className = "" } = {}) {
  const t = TYPE_INFO[key];
  if (!t) return "";
  return `<img class="type-icon ${className}" src="${t.icon}" alt="${t.label}" title="${t.label}" width="${size}" height="${size}" draggable="false" />`;
}

const filters = { nature: "", types: new Set(), sort: "recent" };

const power = (m) => ["hp", "atk", "def", "spa", "spd", "spe"].reduce((s, k) => s + (m.stats?.[k] || 0), 0);

/** @param {{team:object[], box:object[]}} src */
export function showCollection({ team, box = [] }) {
  const overlay = document.createElement("div");
  overlay.className = "coll-overlay";

  const all = () => [
    ...team.map(m => ({ m, inTeam: true })),
    ...box.map(m => ({ m, inTeam: false })),
  ];

  overlay.innerHTML = `
    <div class="coll-panel">
      <div class="coll-top">
        <button class="coll-back" type="button">← Volver</button>
        <h2>Mis Pokémon <small id="coll-count"></small></h2>
        <button class="coll-close" aria-label="Cerrar">✕</button>
      </div>
      <select id="coll-sort" class="coll-select">
        <option value="recent">Más recientes primero</option>
        <option value="name">Orden alfabético (A-Z)</option>
        <option value="dex">N° de Pokédex</option>
        <option value="power">Más poderoso primero (suma de Stats)</option>
      </select>
      <div class="coll-chips">
        <select id="coll-nature" class="coll-nature" aria-label="Filtrar por naturaleza">
          <option value="">Todas las naturalezas</option>
          ${NATURES.map((_, i) => `<option value="${i}">${natureLabel(i)}</option>`).join("")}
        </select>
      </div>
      <div class="coll-chips" id="coll-types">
        ${Object.entries(TYPE_INFO).map(([k, t]) =>
          `<button type="button" class="coll-chip" data-type="${k}" style="--c:${t.color}" title="${t.label}"><img class="type-icon" src="${t.icon}" alt="${t.label}" draggable="false" /></button>`).join("")}
      </div>
      <div class="coll-grid" id="coll-grid"></div>
    </div>`;

  const grid = overlay.querySelector("#coll-grid");
  const sortSel = overlay.querySelector("#coll-sort");
  const natSel = overlay.querySelector("#coll-nature");
  sortSel.value = filters.sort;
  natSel.value = filters.nature;
  overlay.querySelectorAll(".coll-chip").forEach(b => b.classList.toggle("active", filters.types.has(b.dataset.type)));

  function render() {
    let list = all();
    if (filters.nature !== "") list = list.filter(x => String(x.m.natureIndex ?? 0) === filters.nature);
    if (filters.types.size) list = list.filter(x => [...filters.types].every(t => (x.m.types || []).includes(t)));
    if (filters.sort === "name") list.sort((a, b) => (a.m.nameEs || a.m.name).localeCompare(b.m.nameEs || b.m.name));
    else if (filters.sort === "dex") list.sort((a, b) => a.m.id - b.m.id);
    else if (filters.sort === "power") list.sort((a, b) => power(b.m) - power(a.m));
    else list.reverse(); // más recientes (los últimos capturados) primero

    overlay.querySelector("#coll-count").textContent = `· ${list.length}`;
    if (!list.length) {
      grid.innerHTML = `<div class="coll-empty">No hay Pokémon que coincidan con estos filtros.</div>`;
      return;
    }
    grid.innerHTML = list.map(({ m, inTeam }, i) => {
      const types = m.types || [];
      const border = TYPE_INFO[types[0]]?.color || "#cbd5e1";
      const icons = types.map(t => TYPE_INFO[t]
        ? `<span class="coll-type" title="${TYPE_INFO[t].label}"><img class="type-icon" src="${TYPE_INFO[t].icon}" alt="${TYPE_INFO[t].label}" draggable="false" /></span>` : "").join("");
      return `
        <button type="button" class="coll-card" data-i="${i}" style="border-color:${border}">
          <span class="coll-lv">Nv.${m.level}</span>
          ${inTeam ? `<span class="coll-team">★</span>` : ""}
          <span class="coll-types">${icons}</span>
          <img src="${frontSprite(m)}" alt="${m.nameEs || m.name}" loading="lazy" />
          <span class="coll-dex">#${m.id}</span>
          <span class="coll-name">${m.nameEs || m.name}</span>
        </button>`;
    }).join("");
    grid.querySelectorAll(".coll-card").forEach(el => {
      el.onclick = () => {
        const { m, inTeam } = list[Number(el.dataset.i)];
        showPokemonDetail(m, { inTeam });
      };
    });
  }

  sortSel.onchange = () => { filters.sort = sortSel.value; render(); };
  natSel.onchange = () => { filters.nature = natSel.value; render(); };
  overlay.querySelectorAll(".coll-chip").forEach(b => {
    b.onclick = () => {
      const t = b.dataset.type;
      filters.types.has(t) ? filters.types.delete(t) : filters.types.add(t);
      b.classList.toggle("active");
      render();
    };
  });
  const close = () => overlay.remove();
  overlay.querySelector(".coll-close").onclick = close;
  overlay.querySelector(".coll-back").onclick = close;
  document.body.appendChild(overlay);
  render();
}
