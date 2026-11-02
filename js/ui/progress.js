// Pestaña «Progreso»: lista de gimnasios/capítulos con nivel recomendado, clima y medallas.

import { CHAPTERS, buildChapter, recommendedLevels } from "../engine/story.js?v=65";
import { badgeHtml } from "./badge.js?v=65";
import { rainTable } from "./briefing.js?v=65";
import { pixelIcon } from "./pixel.js?v=65";
import { BG_DATA } from "../data/backgrounds.js?v=65";

const bgOf = (key) => BG_DATA[key] || (key && key.startsWith("gym") ? BG_DATA["gym-rock"] : BG_DATA.prairie);

function gymOf(ci) {
  return CHAPTERS[ci].steps.find(s => s.kind === "gym");
}

/** Colores de medalla de los 8 gimnasios (para la tarjeta de región). */
function medalColors() {
  return CHAPTERS.map((c, i) => gymOf(i)).filter(g => g && g.badgeEs && !["Maestro"].includes(g.badgeEs)).map(g => ({ badge: g.badgeEs, color: g.color }));
}

const REGIONS = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Teselia", "Kalos", "Alola", "Galar", "Paldea"];
const LEAGUE_FIRST = 9, LEAGUE_LAST = 13;

/** Datos de los entrenadores de la Liga (capítulos 9–13). */
export function leagueTrainers() {
  const out = [];
  for (let i = LEAGUE_FIRST; i <= LEAGUE_LAST; i++) {
    const g = gymOf(i);
    if (!g) continue;
    const [lo, hi] = recommendedLevels(g);
    out.push({ ch: i, name: g.leaderEs, type: g.typeEs, color: g.color, sprite: g.sprite, lo, hi, top: Math.max(...g.team.map(t => t[1])), reward: g.reward, champ: i === LEAGUE_LAST });
  }
  return out;
}
export { LEAGUE_FIRST, LEAGUE_LAST };

export function renderProgress(state) {
  const owned = new Set([...state.playerTeam, ...(state.box || [])].map(m => m.id));
  const medals = medalColors().slice(0, 8);
  const medalHtml = medals.map((m, i) => {
    const got = state.badges.includes(m.badge);
    return `<span class="pg-medal ${got ? "got" : ""}" title="${m.badge}">${badgeHtml(i, got, 24)}</span>`;
  }).join("");

  const regions = REGIONS.map((r, i) => i === 0 ? `
    <div class="pg-region sel"><b>🗺️ ${r}</b><small>● ${owned.size}/151 capturados</small><div class="pg-medals">${medalHtml}</div></div>` : `
    <div class="pg-region lock"><b>${r}</b><small>🔒 Termina ${REGIONS[i - 1]} para desbloquear</small></div>`).join("");

  const chip = (cls, t) => `<span class="pg-chip ${cls}">${t}</span>`;
  const row = (i) => {
    const ch = CHAPTERS[i], gym = gymOf(i);
    if (!gym) return "";
    const status = i < state.chapter ? "done" : i === state.chapter ? "current" : "todo";
    const [lo, hi] = recommendedLevels(gym);
    const { rainSegs } = rainTable(buildChapter(i).segs);
    const isBadge = !!gym.badgeEs && gym.badgeEs !== "Maestro";
    const bi = isBadge ? CHAPTERS.slice(0, i + 1).filter((c, k) => gymOf(k)?.badgeEs && gymOf(k).badgeEs !== "Maestro").length - 1 : -1;
    return `
      <div class="pg-row ${status}" data-open="${i}" style="--c:${gym.color || "#6b7280"}">
        <div class="pg-bg" style="background-image:url('${bgOf(gym.bg)}')"></div>
        <span class="pg-num">${String(i + 1).padStart(2, "0")}</span>
        <span class="pg-leader"><span class="pg-lf"><img class="bf-idle" src="assets/trainers/${gym.sprite}.png" alt="" onerror="this.style.visibility='hidden'" /></span>${bi >= 0 ? `<i class="pg-tb">${badgeHtml(bi, true, 18)}</i>` : ""}</span>
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

  const lt = leagueTrainers();
  const lstatus = state.chapter > LEAGUE_LAST ? "done" : state.chapter >= LEAGUE_FIRST ? "current" : "todo";
  const leagueRow = lt.length ? `
      <div class="pg-row ${lstatus}" data-league="1" style="--c:#c9a227">
        <div class="pg-bg" style="background-image:url('${bgOf("gym-psychic")}')"></div>
        <span class="pg-num">${String(9 + 1).padStart(2, "0")}</span>
        <span class="pg-leader"><i class="bf-master sm"></i></span>
        <div class="pg-info"><b>Liga Pokémon</b>
          <div class="pg-chips">${chip("gold", `Nv. recomendado ${Math.min(...lt.map(t => t.lo))}–${Math.max(...lt.map(t => t.hi))}`)}${chip("", `${lt.length} Entrenadores`)}</div></div>
        ${lstatus === "todo" ? `<span class="pg-lock">🔒</span>` : `<span class="pg-lock">›</span>`}
      </div>` : "";

  const rows = [];
  for (let i = 0; i < LEAGUE_FIRST; i++) {
    rows.push(row(i));
    if (i === 1) rows.push(`<div class="pg-secret"><span>🔒</span><div><b>Cueva Celeste</b><small>Vence a la Liga Pokémon</small></div></div>`);
  }
  rows.push(leagueRow);

  return `
    <section class="pg-card">
      <header class="pg-head"><span class="pg-mapic">🗺️</span><h2>Aventura</h2><button type="button" class="pg-help" id="pg-help">?</button><span>Regiones 1/${REGIONS.length}</span></header>
      <div class="pg-regions">${regions}</div>
      <div class="pg-sub">GIMNASIOS</div>
      ${rows.join("")}
    </section>`;
}

/** api = { state, onOpen(i), onReplay(i) } */
export function bindProgress(api) {
  const hp = document.getElementById("pg-help");
  if (hp) hp.onclick = () => alert("Aventura: supera los gimnasios de cada región para avanzar. Toca un gimnasio para ver los Pokémon que aparecen (de día, de noche y con lluvia) y ↻ para volver a repetir ese capítulo.");
  document.querySelectorAll("[data-league]").forEach(el => { el.onclick = () => api.onLeague?.(); });
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
