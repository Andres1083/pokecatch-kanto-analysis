/**
 * Lobby de Incursiones — más fiel al original
 * (boss shiny animado, fondo de escena, marco del jugador, scroll completo)
 */
import { frontSprite } from "../data/sprites.js?v=125";
import { avatarHtml } from "./player-avatar.js?v=125";
import {
  bossOfDay, ensureRaidSave, RAID_CFG, monName, todayKey, pityReady,
} from "../engine/raids.js?v=125";

const TYPE_ES = {
  normal: "Normal", fire: "Fuego", water: "Agua", electric: "Eléctrico",
  grass: "Planta", ice: "Hielo", fighting: "Lucha", poison: "Veneno",
  ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho",
  rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro",
  steel: "Acero", fairy: "Hada",
};
const TYPE_COLOR = {
  ghost: "#705898", poison: "#a040a0", normal: "#a8a878", water: "#6890f0",
  ice: "#98d8d8", fire: "#f08030", grass: "#78c850", electric: "#f8d030",
  psychic: "#f85888", fighting: "#c03028", ground: "#e0c068", flying: "#a890f0",
  bug: "#a8b820", rock: "#b8a038", dragon: "#7038f8", dark: "#705848",
  steel: "#b8b8d0", fairy: "#ee99ac",
};
const TYPES = {
  94: ["ghost", "poison"], 93: ["ghost", "poison"], 92: ["ghost", "poison"],
  143: ["normal"], 131: ["water", "ice"], 130: ["water", "flying"],
  149: ["dragon", "flying"], 6: ["fire", "flying"], 9: ["water"], 3: ["grass", "poison"],
  133: ["normal"], 25: ["electric"], 65: ["psychic"], 68: ["fighting"],
};

/** Evento Halloween: fuerza Gengar como boss de Kanto (como el original esta temporada). */
function eventBoss() {
  const d = new Date();
  // 20 oct – 5 nov
  const m = d.getMonth() + 1, day = d.getDate();
  if ((m === 10 && day >= 20) || (m === 11 && day <= 5)) {
    return { id: 94, level: 100, shiny: true, region: "kanto", date: todayKey(), event: "halloween" };
  }
  return null;
}

function msUntilMidnight() {
  const n = new Date();
  const m = new Date(n);
  m.setHours(24, 0, 0, 0);
  return Math.max(0, m - n);
}
function fmtCountdown(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const mi = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h} h ${mi} min ${sec} s`;
}

const ASPECTS = [
  { id: "red", label: "Rojo" },
  { id: "leaf", label: "Leaf" },
  { id: "blue", label: "Azul" },
  { id: "youngster", label: "Joven" },
  { id: "lass", label: "Chica" },
  { id: "hiker", label: "Montañero" },
  { id: "fisherman", label: "Pescador" },
  { id: "biker", label: "Motorista" },
  { id: "beauty", label: "Belleza" },
  { id: "birdkeeper", label: "Pajarero" },
  { id: "bugcatcher", label: "Cazabichos" },
  { id: "rocket", label: "Rocket" },
];
const FRAMES = [
  { id: "std", label: "Estándar", cls: "fr-std" },
  { id: "ball", label: "Poké Ball", cls: "fr-ball" },
  { id: "casino", label: "Casino", cls: "fr-casino" },
  { id: "league", label: "Liga", cls: "fr-league" },
  { id: "rocket", label: "Team Rocket", cls: "fr-rocket" },
];

function playerAspect(state) {
  return state.player?.aspect || (state.player?.gender === "f" ? "leaf" : "red");
}
function playerFrame(state) {
  return state.player?.frame || "league";
}

export async function openRaidsLobby(host) {
  const state = host.state;
  const raid = ensureRaidSave(state);
  const boss = eventBoss() || bossOfDay();
  boss.shiny = true;
  const types = (host.getTypes?.(boss.id) || TYPES[boss.id] || ["normal"]).slice(0, 2);

  let picks = (raid.picks || []).filter(Boolean).slice(0, RAID_CFG.MINE);
  if (!picks.length && state.playerTeam?.length) {
    picks = state.playerTeam.slice(0, RAID_CFG.MINE).map((m) => m.uid || String(m.id));
  }
  const allMons = () => [...(state.playerTeam || []), ...(state.box || [])];
  const findMon = (key) => allMons().find((m) => m.uid === key || String(m.id) === String(key));
  const resolvePicks = () => picks.map(findMon).filter(Boolean);

  const overlay = document.createElement("div");
  overlay.id = "raids-lobby";
  overlay.className = "raids-lobby";

  
  function bossBg() {
    // Fondos por tipo (usa clases CSS + degradados si no hay asset)
    const t = types[0] || "normal";
    return t;
  }

  function render() {
    const pity = raid.pity || 0;
    const pityPct = Math.min(100, (pity / RAID_CFG.PITY) * 100);
    const resolved = resolvePicks();
    const countdown = fmtCountdown(msUntilMidnight());
    const shinyUrl = frontSprite({ id: boss.id, shiny: true });
    const bgType = bossBg();

    overlay.innerHTML = `
      <div class="rl-panel">
        <header class="rl-head">
          <span class="rl-spark">✦</span>
          <h2>Incursiones</h2>
          <button type="button" class="rl-help" data-act="help">?</button>
        </header>
        <p class="rl-cd">Nuevas incursiones en <b data-cd>${countdown}</b></p>

        <div class="rl-regions">
          <button type="button" class="rl-reg on" data-reg="kanto">
            <img src="${shinyUrl}" alt="" />
            <span>Kanto</span>
            <em>▶ En curso</em>
          </button>
          <button type="button" class="rl-reg lock" disabled>
            <span class="sil">🐇</span><span>Johto</span><i>🔒</i>
          </button>
          <button type="button" class="rl-reg lock" disabled>
            <span class="sil">🐲</span><span>Hoenn</span><i>🔒</i>
          </button>
        </div>

        <div class="rl-card">
          <div class="rl-art type-${bgType}">
            <div class="rl-art-fog"></div>
            <img class="rl-boss shiny" src="${shinyUrl}" alt="" />
            <span class="rl-shine">✦</span>
            <span class="rl-shine s2">✦</span>
            <span class="rl-shine s3">+</span>
          </div>
          <h3>${monName(boss.id)} <span class="shiny-word">variocolor</span></h3>
          <div class="rl-tags">
            ${boss.event === "halloween" ? `<span class="tag halloween">🎃 Halloween</span>` : ""}
            <span class="tag">Nv. ${RAID_CFG.LEVEL} máx.</span>
            <span class="tag">Jefe 6 contra 1</span>
            <span class="tag">Captura ${Math.round(RAID_CFG.CATCH * 100)} %</span>
            ${types.map((t) => `<span class="tag type" style="--c:${TYPE_COLOR[t] || "#888"}">${TYPE_ES[t] || t}</span>`).join("")}
          </div>
          <div class="rl-actions">
            <button type="button" class="rl-go" data-act="go" ${resolved.length < 1 ? "disabled" : ""}>INCURSIÓN</button>
            <button type="button" class="rl-rank" data-act="rank" disabled>CLASIFICACIÓN</button>
          </div>
        </div>

        <div class="rl-pity">
          <div class="rl-pity-label">
            <span>MEDIDOR DE MASTER BALL <button type="button" data-act="pity-help">?</button></span>
            <b>${pity} / ${RAID_CFG.PITY}</b>
          </div>
          <div class="rl-pity-bar"><i style="width:${pityPct}%"></i></div>
        </div>

        <div class="rl-team">
          <div class="rl-team-h">EQUIPO DE LA INCURSIÓN <span>${resolved.length}/6</span></div>
          <div class="rl-you">
            ${avatarHtml(state)}
            <div class="rl-you-label">Tú</div>
            <div class="rl-slots">
              ${[0, 1].map((i) => {
                const m = resolved[i];
                if (!m) return `<button type="button" class="rl-slot empty" data-act="pick" data-slot="${i}">+</button>`;
                return `<button type="button" class="rl-slot filled" data-act="pick" data-slot="${i}">
                  <img src="${frontSprite(m)}" alt="" />
                  <small>Nv. ${m.level || "?"}</small>
                </button>`;
              }).join("")}
            </div>
          </div>
          <button type="button" class="rl-ally" disabled>+ Elegir un aliado</button>
          <button type="button" class="rl-ally" disabled>+ Elegir un aliado</button>
        </div>

        <button type="button" class="rl-leave" data-act="close">SALIR DE LA INCURSIÓN</button>
      </div>
      <div class="rl-modal" hidden></div>
    `;
    // scroll to top so header is visible
    requestAnimationFrame(() => {
      const panel = overlay.querySelector(".rl-panel");
      if (panel) panel.scrollTop = 0;
    });
  }

  function openPicker() {
    const modal = overlay.querySelector(".rl-modal");
    const list = allMons().filter((m) => m && m.id).sort((a, b) => (b.level || 0) - (a.level || 0));
    modal.hidden = false;
    modal.innerHTML = `
      <div class="rl-picker">
        <header>
          <h3>Incursión contra ${monName(boss.id)}</h3>
          <button type="button" data-act="close-modal">✕</button>
        </header>
        <p class="rl-sub">Elige hasta ${RAID_CFG.MINE} Pokémon</p>
        <div class="rl-pick-grid">
          ${list.map((m) => {
            const key = m.uid || String(m.id);
            const on = picks.some((x) => String(x) === String(key));
            return `<button type="button" class="rl-pick ${on ? "on" : ""}" data-pick="${key}">
              <img src="${frontSprite(m)}" alt="" />
              <b>${m.nameEs || m.name || monName(m.id)}</b>
              <small>Nv. ${m.level || "?"}</small>
            </button>`;
          }).join("") || "<p class='rl-empty'>No tienes Pokémon</p>"}
        </div>
        <button type="button" class="rl-apply" data-act="close-modal">Listo</button>
      </div>`;
    modal.onclick = (e) => {
      const p = e.target.closest("[data-pick]");
      if (p) {
        const key = p.dataset.pick;
        const idx = picks.findIndex((x) => String(x) === String(key));
        if (idx >= 0) picks.splice(idx, 1);
        else {
          if (picks.length >= RAID_CFG.MINE) picks.shift();
          picks.push(key);
        }
        raid.picks = picks.slice();
        host.save?.();
        openPicker();
        return;
      }
      if (e.target.closest("[data-act=close-modal]") || e.target === modal) {
        modal.hidden = true;
        render();
        bind();
      }
    };
  }

  function showHelp(title, body) {
    const modal = overlay.querySelector(".rl-modal");
    modal.hidden = false;
    modal.innerHTML = `<div class="rl-picker"><header><h3>${title}</h3><button type="button" data-act="close-modal">✕</button></header><p style="padding:12px;line-height:1.45">${body}</p></div>`;
    modal.onclick = (e) => {
      if (e.target.closest("[data-act=close-modal]") || e.target === modal) modal.hidden = true;
    };
  }

  function bind() {
    overlay.onclick = async (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === "close") { overlay.remove(); return; }
      if (act === "pick") { openPicker(); return; }
      
      if (act === "help") {
        showHelp("Incursiones", "Cada día un jefe variocolor por región. Elige 2 Pokémon, completa el camino y derrota al jefe. Captura base 1 %. Cada Ball fallida llena el medidor Master Ball (200).");
        return;
      }
      if (act === "pity-help") {
        showHelp("Medidor de Master Ball", "Cada Ball fallida contra el jefe del día llena el medidor. Vuelve a cero cada día. Lleno = Master Ball asegurada. Máximo 200.");
        return;
      }
      if (act === "go") {
        const team = resolvePicks();
        if (!team.length) return;
        const go = overlay.querySelector(".rl-go");
        if (go) { go.disabled = true; go.textContent = "…"; }
        try {
          const result = await host.startRun({ boss, picks: team });
          ensureRaidSave(state);
          render();
          bind();
          if (result?.caught) showHelp("¡Capturado!", `Has capturado a ${monName(boss.id)} variocolor.`);
          else if (result?.reason === "defeat") showHelp("Derrota", "Tu equipo se debilitó. ¡Inténtalo de nuevo!");
        } catch (err) {
          console.error(err);
          showHelp("Error", String(err?.message || err));
          render();
          bind();
        }
      }
    };
  }

  render();
  bind();
  document.body.appendChild(overlay);

  const tick = setInterval(() => {
    const el = overlay.querySelector("[data-cd]");
    if (!el || !document.body.contains(overlay)) return clearInterval(tick);
    el.textContent = fmtCountdown(msUntilMidnight());
  }, 1000);

  return { close: () => { clearInterval(tick); overlay.remove(); } };
}
