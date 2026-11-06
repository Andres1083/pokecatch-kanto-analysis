// Pestaña «Progreso»: lista de gimnasios/capítulos con nivel recomendado, clima y medallas.

import { CHAPTERS, buildChapter, recommendedLevels } from "../engine/story.js?v=136";
import { badgeHtml, badgeIndex } from "./badge.js?v=136";
import { rainTable } from "./briefing.js?v=136";
import { pixelIcon } from "./pixel.js?v=136";
import { showTip } from "./tip.js?v=136";
import { BG_DATA } from "../data/backgrounds.js?v=136";
import { TYPE_DEX_IDS } from "../data/legend-unlocks.js?v=136";

let resolveBg = null; // lo aporta main.js (mismos fondos que el combate)
const bgOf = (key) => (resolveBg && resolveBg(key)) || BG_DATA[key] || (key && key.startsWith("gym") ? BG_DATA["gym-rock"] : BG_DATA.prairie);


const REGIONS = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Teselia", "Kalos", "Alola", "Galar", "Paldea"];
const LEAGUE_FIRST = 9, LEAGUE_LAST = 13;
/** Capítulos de cada región jugable. rows: gimnasios/rutas; lf-ll: Liga; extra: capítulo final. */
export const REGION_DEFS = [
  { name: "Kanto", first: 0, last: 8, lf: 9, ll: 13, ids: [1, 151], extra: null, leagueName: "Liga Pokémon" },
  { name: "Johto", first: 15, last: 25, lf: 26, ll: 30, ids: [152, 251], extra: 31, leagueName: "Liga Pokémon de Johto" },
];
export const JOHTO_FIRST = REGION_DEFS[1].first;
/** Rango de Liga que contiene al capítulo ch, o null. */
export function leagueOf(ch) {
  return REGION_DEFS.find(r => ch >= r.lf && ch <= r.ll) || null;
}
export { LEAGUE_FIRST, LEAGUE_LAST };

let selRegion = null;

function gymOf(ci) {
  return CHAPTERS[ci].steps.find(s => s.kind === "gym");
}

/** Colores de medalla de una región (8 medallas). */
function medalColors(rd) {
  const out = [];
  for (let i = rd.first; i <= rd.last; i++) {
    const g = gymOf(i);
    if (g && g.badgeEs && !/^Maestro/.test(g.badgeEs)) out.push({ badge: g.badgeEs, color: g.color });
  }
  return out;
}

/** Datos de los entrenadores de la Liga de una región. */
export function leagueTrainers(ri = 0) {
  const rd = REGION_DEFS[ri];
  const out = [];
  for (let i = rd.lf; i <= rd.ll; i++) {
    const g = gymOf(i);
    if (!g) continue;
    const [lo, hi] = recommendedLevels(g);
    out.push({ ch: i, name: g.leaderEs, type: g.typeEs, color: g.color, sprite: g.sprite, lo, hi, top: Math.max(...g.team.map(t => t[1])), reward: g.reward, champ: i === rd.ll });
  }
  return out;
}

export function currentRegionIndex(state) {
  return state.chapter >= JOHTO_FIRST ? 1 : 0;
}

export function renderProgress(state, bgResolver) {
  if (bgResolver) resolveBg = bgResolver;
  const owned = new Set([...state.playerTeam, ...(state.box || [])].map(m => m.id));
  const unlockedJohto = state.chapter >= JOHTO_FIRST;
  if (selRegion == null || (selRegion === 1 && !unlockedJohto)) selRegion = currentRegionIndex(state);
  const rd = REGION_DEFS[selRegion];
  const badgeBase = selRegion === 1 ? 8 : 0;

  const medalHtml = (r, base) => medalColors(r).slice(0, 8).map((m, i) => {
    const got = state.badges.includes(m.badge);
    return `<span class="pg-medal ${got ? "got" : ""}" title="${m.badge}">${badgeHtml(base + i, got, 24)}</span>`;
  }).join("");
  const capt = (r) => [...owned].filter(id => id >= r.ids[0] && id <= r.ids[1]).length;

  const regions = REGIONS.map((r, i) => {
    const def = REGION_DEFS[i];
    if (def && (i === 0 || unlockedJohto)) {
      return `<div class="pg-region ${selRegion === i ? "sel" : ""}" data-region="${i}"><b>🗺️ ${r}</b><small>● ${capt(def)}/${def.ids[1] - def.ids[0] + 1} capturados</small><div class="pg-medals">${medalHtml(def, i === 1 ? 8 : 0)}</div></div>`;
    }
    return `<div class="pg-region lock"><b>${r}</b><small>🔒 Termina ${REGIONS[i - 1]} para desbloquear</small></div>`;
  }).join("");

  const chip = (cls, t) => `<span class="pg-chip ${cls}">${t}</span>`;
  const row = (i) => {
    const ch = CHAPTERS[i], gym = gymOf(i);
    const segs = buildChapter(i).segs;
    const status = i < state.chapter ? "done" : i === state.chapter ? "current" : "todo";
    const { rainSegs } = rainTable(segs);
    let lo, hi;
    if (gym) [lo, hi] = recommendedLevels(gym);
    else {
      const lv = segs.filter(x => x.lv).flatMap(x => x.lv);
      const st = segs.filter(x => x.staticLevel).map(x => x.staticLevel);
      const all = [...lv, ...st];
      lo = all.length ? Math.min(...all) : 1; hi = all.length ? Math.max(...all) + 3 : 1;
    }
    const isBadge = !!gym?.badgeEs && !/^Maestro/.test(gym.badgeEs) && gym.badgeEs !== "Leyenda";
    const bi = isBadge ? badgeIndex(gym.badgeEs) : -1;
    const bgKey = gym?.bg || segs.find(x => x.bg)?.bg;
    const color = gym?.color || ch.color || "#6b7280";
    const face = gym ? `<img class="bf-idle" src="assets/trainers/${gym.sprite}.png" alt="" onerror="this.style.visibility='hidden'" />`
      : ch.icon?.id ? `<img src="assets/pokemon/${ch.icon.id}.png" alt="" style="image-rendering:pixelated;width:100%;height:100%;object-fit:contain" onerror="this.style.visibility='hidden'" />` : `<span style="font-size:28px">🗺️</span>`;
    return `
      <div class="pg-row ${status}" data-open="${i}" style="--c:${color}">
        <div class="pg-bg" style="background-image:url('${bgOf(bgKey)}')"></div>
        <span class="pg-num">${String(i - rd.first + 1).padStart(2, "0")}</span>
        <span class="pg-leader"><span class="pg-lf">${face}</span>${bi >= 0 ? `<i class="pg-tb">${badgeHtml(bi, true, 18)}</i>` : ""}</span>
        <div class="pg-info">
          <b>${ch.name}</b>
          <div class="pg-chips">
            ${chip("green", `Nv. recomendado ${lo}–${hi}`)}
            ${rainSegs.length ? chip("blue", "🌧️ Lluvia") : ""}
          </div>
        </div>
        ${status !== "todo" ? `<button class="pg-replay ${status === "current" ? "cur" : ""}" data-replay="${i}" title="Volver a este capítulo" aria-label="Volver a este capítulo">↻</button>` : `<span class="pg-lock">🔒</span>`}
      </div>`;
  };

  const lt = leagueTrainers(selRegion);
  const lstatus = state.chapter > rd.ll ? "done" : state.chapter >= rd.lf ? "current" : "todo";
  const leagueRow = lt.length ? `
      <div class="pg-row ${lstatus}" data-league="${selRegion}" style="--c:#c9a227">
        <div class="pg-bg" style="background-image:url('${bgOf("gym-psychic")}')"></div>
        <span class="pg-num">${String(rd.lf - rd.first + 1).padStart(2, "0")}</span>
        <span class="pg-leader"><i class="bf-master sm"></i></span>
        <div class="pg-info"><b>${rd.leagueName}</b>
          <div class="pg-chips">${chip("gold", `Nv. recomendado ${Math.min(...lt.map(t => t.lo))}–${Math.max(...lt.map(t => t.hi))}`)}${chip("", `${lt.length} Entrenadores`)}</div></div>
        ${lstatus === "todo" ? `<span class="pg-lock">🔒</span>` : `<span class="pg-lock">›</span>`}
      </div>` : "";

  const rows = [];
  for (let i = rd.first; i <= rd.last; i++) {
    rows.push(row(i));
    if (selRegion === 0 && i === 1) rows.push(`<div class="pg-secret"><span>🔒</span><div><b>Cueva Celeste</b><small>Vence a la Liga Pokémon</small></div></div>`);
  }
  rows.push(leagueRow);
  if (rd.extra != null) rows.push(row(rd.extra));

  return `
    <section class="pg-card">
      <header class="pg-head"><span class="pg-mapic">🗺️</span><h2>Aventura</h2><button type="button" class="pg-help" id="pg-help">?</button><span>Regiones ${unlockedJohto ? 2 : 1}/${REGIONS.length}</span></header>
      <div class="pg-regions">${regions}</div>
      <div class="pg-sub">${selRegion === 1 ? "JOHTO" : "GIMNASIOS"}</div>
      ${rows.join("")}
    </section>`;
}

/** api = { state, onOpen(i), onReplay(i) } */
export function bindProgress(api) {
  const hp = document.getElementById("pg-help");
  if (hp) hp.onclick = () => showTip(hp, "Aventura", "Aventura: supera los gimnasios de cada región para avanzar. Toca un gimnasio para ver los Pokémon que aparecen (de día, de noche y con lluvia) y ↻ para volver a repetir ese capítulo.");
  document.querySelectorAll("[data-league]").forEach(el => { el.onclick = () => api.onLeague?.(Number(el.dataset.league)); });
  document.querySelectorAll("[data-region]").forEach(el => {
    el.onclick = () => { selRegion = Number(el.dataset.region); api.rerender?.(); };
  });
  document.querySelectorAll("[data-open]").forEach(el => {
    el.onclick = (e) => {
      if (e.target.closest("[data-replay]")) return;
      api.onOpen(Number(el.dataset.open));
    };
  });
  document.querySelectorAll("[data-replay]").forEach(b => {
    b.onclick = (e) => { e.stopPropagation(); api.onReplay(Number(b.dataset.replay)); };
  });
}
