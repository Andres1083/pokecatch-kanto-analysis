// Detalle de Pokémon (estilo ficha del original)

import { frontSprite, artSprite, artFallback, sceneForMon } from "../data/sprites.js?v=128";
import { evosOf, prevOf, familyStages, STONE_ES } from "../data/evolutions.js?v=128";
import { ITEMS } from "../data/items.js?v=128";
import { itemImg } from "./item-icon.js?v=128";
import { pixelIcon } from "./pixel.js?v=128";
import { countFamily, familySlots } from "../data/families.js?v=128";
import { getNature, natureEffectHtml } from "../data/natures.js?v=128";
import { showConfirm, showAlert } from "./confirm.js?v=128";

const TYPE_ES = {
  normal: "Normal", fire: "Fuego", water: "Agua", electric: "Eléctrico",
  grass: "Planta", ice: "Hielo", fighting: "Lucha", poison: "Veneno",
  ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho",
  rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro",
  steel: "Acero", fairy: "Hada",
};

const TYPE_COLORS = {
  normal: "#a8a878", fire: "#f08030", water: "#6890f0", electric: "#f8d030",
  grass: "#78c850", ice: "#98d8d8", fighting: "#c03028", poison: "#a040a0",
  ground: "#e0c068", flying: "#a890f0", psychic: "#f85888", bug: "#a8b820",
  rock: "#b8a038", ghost: "#705898", dragon: "#7038f8", dark: "#705848",
  steel: "#b8b8d0", fairy: "#ee99ac",
};

function xpForNext(level) {
  return Math.floor(level * level * 8 + level * 20);
}

export function showPokemonDetail(mon, { inTeam = true, onClose } = {}) {
  const overlay = document.createElement("div");
  overlay.className = "detail-overlay";

  const types = (mon.types || []).map(t =>
    `<span class="type-badge" style="background:${TYPE_COLORS[t]||"#555"}">${TYPE_ES[t]||t}</span>`
  ).join("");

  const xp = mon.xp || 0;
  const need = xpForNext(mon.level);
  const xpPct = Math.min(100, (xp / need) * 100);
  const dex = String(mon.id).padStart(3, "0");
  const genus = mon.genus || "Pokémon";
  const stats = mon.stats || {};
  const total = (stats.hp || 0) + (stats.atk || 0) + (stats.def || 0) + (stats.spa || 0) + (stats.spd || 0) + (stats.spe || 0);

  const movesHtml = (mon.moves || []).map(m => `
    <div class="detail-move">
      <span class="move-name">${m.nameEs || m.name}</span>
      <span class="type-badge" style="background:${TYPE_COLORS[m.type]||"#555"}">${TYPE_ES[m.type]||m.type}</span>
      <span class="move-pow">${m.power ? `Pot. ${m.power}` : "Estado"}</span>
    </div>
  `).join("") || `<div class="detail-move"><span class="move-name">—</span></div>`;

  const gs = window.__pokeState?.() || { bag: {}, stats: {}, playerTeam: [], box: [] };
  const seenSet = new Set([...(gs.stats?.seen || []), ...(gs.stats?.caught || []), ...gs.playerTeam.map(m => m.id), ...gs.box.map(m => m.id)]);
  const famCount = countFamily([...gs.playerTeam, ...gs.box], mon.id);
  const famSlots = familySlots(mon.id);
  const reqLabel = (e) => e.kind === "lvl" ? `Nv. ${e.v}` : "";
  const names = new Map([...gs.playerTeam, ...gs.box].map(m => [m.id, m.nameEs || m.name]));
  function familyHtml() {
    const stages = familyStages(mon.id);
    const nexts = new Map(evosOf(mon.id).map(e => [e.to, e]));
    return `<div class="evo-tree">` + stages.map(st => `<div class="evo-col">` + st.map(id => {
      const cur = id === mon.id, e = nexts.get(id), known = seenSet.has(id) || cur;
      let req = "";
      if (e) {
        const have = e.kind === "stone" ? (gs.bag?.[e.item] || 0) : 0;
        const ok = e.kind === "lvl" ? mon.level >= e.v : have > 0;
        req = e.kind === "lvl"
          ? `<span class="evo-req ${ok ? "ok" : ""}">Nv. ${e.v}</span>`
          : `<span class="evo-req ${ok ? "ok" : ""}">${itemImg(e.item, 14, "")} ${STONE_ES[e.item]} ×${have}</span>`;
        req += `<button type="button" class="evo-btn" data-evo="${id}" ${ok ? "" : "disabled"}>Evolucionar</button>`;
      }
      return `<div class="evo-node ${cur ? "cur" : ""} ${known ? "" : "unk"}">
        <img src="${frontSprite(id)}" alt="" draggable="false" onerror="this.style.visibility='hidden'">
        <b>${!known ? "???" : cur ? (mon.nameEs || mon.name) : (names.get(id) || `N.º ${String(id).padStart(3, "0")}`)}</b>
        ${cur ? `<small>Nv. ${mon.level}</small>` : ""}${req}</div>`;
    }).join("") + `</div>`).join("") + `</div>`;
  }

  overlay.innerHTML = `
    <div class="detail-panel" style="--tc:${TYPE_COLORS[(mon.types || [])[0]] || "#64748b"}">
      <div class="detail-top">
        <span class="detail-title">${mon.nameEs || mon.name}</span>
        <span class="detail-num">Nº ${dex}</span>
        <button class="detail-x" type="button">✕</button>
      </div>
      <div class="detail-body">

      <div class="detail-hero" style="background-image:url('${sceneForMon(mon)}')">
        <div class="detail-hero-shade"></div>
        <img class="detail-hero-art" src="${artSprite(mon)}" alt="" draggable="false" ${artFallback(mon)} />
        ${mon.shiny ? `<span class="detail-hero-shiny">✦</span>` : ""}
        ${inTeam ? `<span class="detail-badge">En el equipo</span>` : ""}
        <button type="button" class="detail-btn-txt detail-lock-fab ${mon.locked ? "on" : ""}" id="btn-lock">${mon.locked ? "Bloqueado" : "Bloquear"}</button>
        <button type="button" class="detail-btn-txt detail-trash" id="btn-release">Liberar</button>
      </div>

      <div class="detail-main detail-main-below">
        <div class="detail-info">
          <div class="detail-name-row">
            <div class="detail-name-left">
              <span class="detail-name-big">${mon.nameEs || mon.name}</span>
              <span class="detail-name-lv">Nv. ${mon.level}</span>
            </div>
            <div class="detail-types">${types}</div>
          </div>
          <div class="detail-genus">${genus}</div>
          <div class="detail-meta-row">
            <div class="detail-boxes">
              <div class="dbox"><span class="l">PS</span><span class="v">${mon.currentHp}/${mon.maxHp}</span></div>
              <button type="button" class="dbox dbox-nature" id="nature-box"><span class="l">Naturaleza ⓘ</span><span class="v">${(getNature(mon.natureIndex ?? 0).nameEs)}</span></button>
            </div>
          </div>
          <div class="nature-effect" id="nature-effect" hidden>${natureEffectHtml(mon.natureIndex ?? 0)}</div>
        </div>
      </div>

      <button type="button" class="detail-moves-toggle" id="moves-toggle">
        MOVIMIENTOS <span class="moves-count">(${(mon.moves||[]).length})</span>
        <i class="st-caret" id="moves-caret">▾</i>
      </button>
      <div class="detail-moves" id="moves-body">
        ${movesHtml}
      </div>

      <div class="detail-xp">
        <div class="xp-bar"><div class="fill" style="width:${xpPct}%"></div></div>
        <span>PE ${xp} / ${need}</span>
      </div>

      <hr class="detail-sep">
      <button type="button" class="detail-stats-title stats-toggle" id="stats-toggle">ESTADÍSTICAS <span>Total ${total} <i class="st-caret">▾</i></span></button>
      <div class="detail-stats" id="stats-body">
        ${statRow("PS", stats.hp, "hp")}
        ${statRow("Ataque", stats.atk, "atk")}
        ${statRow("Defensa", stats.def, "def")}
        ${statRow("At. Esp.", stats.spa, "spa")}
        ${statRow("Def. Esp.", stats.spd, "spd")}
        ${statRow("Velocidad", stats.spe, "spe")}
      </div>
      <hr class="detail-sep">
      <div class="detail-stats-title">FAMILIA <span>${famCount} / ${famSlots}</span></div>
      <div class="evo-wrap" id="evo-wrap">${familyHtml()}</div>
      <hr class="detail-sep">
      <div class="detail-stats-title">HISTORIAL</div>
      <div class="hist-grid">
        <div class="dbox"><span class="l">Capturado el</span><span class="v">${mon.capturedAt ? new Date(mon.capturedAt).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span></div>
        <div class="dbox"><span class="l">Lugar</span><span class="v">${mon.place || "—"}</span></div>
        <div class="dbox"><span class="l">Victorias</span><span class="v">${mon.wins || 0}</span></div>
      </div>
      </div>
    </div>
  `;

  function statRow(label, val, key) {
    const v = val || 0;
    const pct = Math.min(100, (v / 150) * 100);
    const nat = getNature(mon.natureIndex ?? 0);
    const cls = nat.up === key ? "up" : nat.down === key ? "down" : "";
    const mark = cls === "up" ? ` <b class="nat-up">▲</b>` : cls === "down" ? ` <b class="nat-down">▼</b>` : "";
    // El color lo pone el CSS (gradiente naranja estilo original)
    return `<div class="stat-row"><span class="sr-l">${label}${mark}</span><span class="sr-v ${cls}">${v}</span><div class="stat-bar"><div style="width:${pct}%"></div></div></div>`;
  }

  document.body.appendChild(overlay);

  const close = () => {
    overlay.remove();
    onClose?.();
  };
  overlay.querySelector(".detail-x").onclick = close;
  const mvTg = overlay.querySelector("#moves-toggle");
  const mvBody = overlay.querySelector("#moves-body");
  const mvCaret = overlay.querySelector("#moves-caret");
  if (mvTg && mvBody) {
    // Si hay muchos movimientos, empezar colapsado
    if ((mon.moves || []).length > 4) {
      mvBody.hidden = true;
      if (mvCaret) mvCaret.textContent = "▸";
    }
    mvTg.onclick = () => {
      const open = mvBody.hidden;
      mvBody.hidden = !open;
      if (mvCaret) mvCaret.textContent = open ? "▾" : "▸";
    };
  }
  const stTg = overlay.querySelector("#stats-toggle");
  if (stTg) stTg.onclick = () => { const b = overlay.querySelector("#stats-body"); const h = b.classList.toggle("collapsed"); stTg.classList.toggle("closed", h); };
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  const natBox = overlay.querySelector("#nature-box");
  const natFx = overlay.querySelector("#nature-effect");
  if (natBox && natFx) natBox.onclick = () => { natFx.hidden = !natFx.hidden; };
  overlay.querySelectorAll("[data-evo]").forEach(b => {
    b.onclick = async () => {
      const to = Number(b.dataset.evo);
      const okEvo = await showConfirm({
        title: `¿Evolucionar a ${mon.nameEs || mon.name}?`,
        confirmLabel: "Evolucionar",
        cancelLabel: "Cancelar",
        danger: false,
      });
      if (!okEvo) return;
      b.disabled = true; b.textContent = "…";
      const r = await window.__pokeEvolve?.(mon, to);
      if (!r?.ok) { showAlert(r?.reason || "No se pudo evolucionar"); b.disabled = false; b.textContent = "Evolucionar"; return; }
      overlay.remove();
      showPokemonDetail(mon, { inTeam, onClose });
    };
  });
  const lk = overlay.querySelector("#btn-lock");
  if (lk) lk.onclick = () => {
    mon.locked = !mon.locked;
    lk.classList.toggle("on", mon.locked);
    lk.textContent = mon.locked ? "Bloqueado" : "Bloquear";
    lk.setAttribute("aria-label", mon.locked ? "Desbloquear" : "Bloquear");
    window.__pokeSave?.();
    document.dispatchEvent(new CustomEvent("poke:released"));
  };
  const rel = overlay.querySelector("#btn-release");
  if (rel) {
    rel.onclick = async () => {
      if (mon.locked) { showAlert("Este Pokémon está bloqueado. Desbloquéalo para poder liberarlo."); return; }
      const ok = await showConfirm({
        title: `¿Liberar para siempre a ${mon.nameEs || mon.name}${mon.level != null ? ` Nv. ${mon.level}` : ""}?`,
        confirmLabel: "Liberar",
        cancelLabel: "Cancelar",
        danger: true,
      });
      if (!ok) return;
      const fn = window.__pokeRelease;
      if (!fn) return;
      const r = fn(mon, inTeam);
      if (!r.ok) {
        showAlert(r.reason || "No se pudo liberar");
        return;
      }
      close();
      // refrescar la pantalla de equipo/lista si está abierta
      document.dispatchEvent(new CustomEvent("poke:released"));
    };
  }
}
