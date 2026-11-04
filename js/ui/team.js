// Pantalla de equipo + detalle (estilo original)

import { frontSprite, iconSprite, spriteFallback } from "../data/sprites.js?v=125";
import { DEX_NAMES } from "../data/dex-names.js?v=125";
import { pixelDropdown } from "./dropdown.js?v=125";
import { cropSprite } from "./sprite-fit.js?v=125";
import { showPokemonDetail } from "./pokemon-detail.js?v=125";
import { TYPE_INFO } from "./collection.js?v=125";
import { NATURES, natureLabel } from "../data/natures.js?v=125";

const filters = { nature: "", types: new Set(), sort: "recent", shiny: false };
const power = (m) => ["hp", "atk", "def", "spa", "spd", "spe"].reduce((a, k) => a + (m.stats?.[k] || 0), 0);

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

/** Nombre para mostrar: nunca "#25" ni vacío (cae al nombre de la Pokédex). */
function dispName(m) {
  const n = m.nameEs || m.name;
  return (!n || /^#?\d+$/.test(String(n))) ? (DEX_NAMES[m.id - 1] || `N.º ${m.id}`) : n;
}

const REF_ART = 64; // referencia de escala (sprites locales ahora 96×96)

function xpForNext(level) {
  return Math.floor(level * level * 8 + level * 20);
}

/**
 * @param {object} opts
 * @param {object[]} opts.team   (se modifica al arrastrar)
 * @param {object[]} [opts.box]  PC / caja (se modifica al arrastrar)
 * @param {function} [opts.onChange] se llama tras cambiar el orden del equipo/caja
 * @param {function} opts.onClose
 */
export function showTeamScreen({ team, box = [], presets = null, onChange, onClose }) {
  const overlay = document.createElement("div");
  overlay.className = "team-overlay";
  overlay.innerHTML = `
    <div class="team-panel">
      <div class="team-panel-header">
        <button class="team-back" type="button">← Volver</button>
        <span class="team-title">Equipo y Pokémon</span>
        <span class="team-avg"></span>
        <button class="team-close" type="button" aria-label="Cerrar">✕</button>
      </div>
      <div class="team-presets" id="team-presets" role="tablist" aria-label="Equipos"></div>
      <div class="team-sticky" id="team-sticky" hidden></div>
      <p class="team-hint">Mantén pulsado un Pokémon y arrástralo para cambiarlo de sitio.</p>
      <div class="team-grid" id="team-grid" data-zone="team-area"></div>
      <div class="box-section" data-zone="box-area">
        <div class="box-title">Mis Pokémon <small id="box-count"></small></div>
        <div class="coll-row" id="coll-row"></div>
        <div class="coll-chips">${Object.entries(TYPE_INFO).map(([k, t]) =>
          `<button type="button" class="coll-chip" data-type="${k}" style="--c:${t.color}" title="${t.label}"><img class="type-icon" src="${t.icon}" alt="${t.label}" draggable="false" /></button>`).join("")}</div>
        <div class="coll-grid box-grid" id="box-grid"></div>
      </div>
    </div>
  `;
  const host = document.getElementById("app") || document.body; // fuera de #main: renderRoute() no lo borra
  host.style.position = host.style.position || "relative";
  host.appendChild(overlay);

  const grid = overlay.querySelector("#team-grid");
  const boxGrid = overlay.querySelector("#box-grid");


  // ───────── 5 equipos configurables ─────────
  const presetsEl = overlay.querySelector("#team-presets");
  const stickyEl = overlay.querySelector("#team-sticky");
  const pool = () => [...team, ...box];
  function renderPresets() {
    if (!presets) { presetsEl.hidden = true; return; }
    const act = presets.active;
    presets.teams[act] = team.map(m => m.uid);
    presetsEl.innerHTML = presets.teams.map((ids, i) => {
      const first = i === act ? team[0] : pool().find(m => m.uid === ids[0]);
      const n = i === act ? team.length : ids.filter(u => pool().some(m => m.uid === u)).length;
      return `<button type="button" class="tp-btn${i === act ? " on" : ""}${first ? "" : " empty"}" data-p="${i}" aria-label="Equipo ${i + 1}" role="tab" aria-selected="${i === act}">${
        first ? `<img src="${iconSprite(first)}" alt="" draggable="false" /><b>${i + 1}</b>${n > 1 ? `<small>${n}</small>` : ""}` : `<span>+</span>`}</button>`;
    }).join("");
  }
  presetsEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]");
    if (!b) return;
    const n = Number(b.dataset.p);
    if (n === presets.active) return;
    switchPreset(n);
  });
  function switchPreset(n) {
    presets.teams[presets.active] = team.map(m => m.uid);
    const all = pool();
    let next = (presets.teams[n] || []).map(u => all.find(m => m.uid === u)).filter(Boolean);
    next = next.filter((m, i) => next.indexOf(m) === i).slice(0, 6);
    if (!next.length) {
      // Un equipo vacío no puede combatir: se parte del Pokémon de mayor nivel disponible
      const best = [...all].sort((a, b) => b.level - a.level)[0];
      if (best) next = [best];
    }
    const rest = all.filter(m => !next.includes(m));
    team.splice(0, team.length, ...next);
    box.splice(0, box.length, ...rest);
    presets.active = n;
    presets.teams[n] = team.map(m => m.uid);
    render();
    onChange?.();
  }

  // ───────── Barra fija con los 6 del equipo al bajar ─────────
  function renderSticky() {
    stickyEl.innerHTML = `<div class="ts-bar">` + Array.from({ length: 6 }, (_, i) => {
      const m = team[i];
      return m
        ? `<button type="button" class="ts-slot" data-ts="${i}" data-zone="team" data-idx="${i}" title="Toca para quitar del equipo"><img src="${iconSprite(m)}" alt="" draggable="false" /><span>Nv. ${m.level}</span></button>`
        : `<div class="ts-slot empty" data-zone="team-empty"><i>+</i></div>`;
    }).join("") + `</div>`;
  }
  stickyEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ts]");
    if (!b) return;
    const i = Number(b.dataset.ts);
    if (team.length <= 1) { flash("Debes tener al menos un Pokémon en el equipo"); return; }
    const [m] = team.splice(i, 1);
    box.push(m);
    render(); onChange?.();
  });
  // Se muestra cuando la cuadrícula del equipo sale de la vista (throttled para evitar tildeo en iOS)
  const panelEl = overlay.querySelector(".team-panel");
  let stickyRaf = 0, stickyHeaderH = 0, stickyWasHidden = true;
  const measureHeader = () => {
    const hd = panelEl.querySelector(".team-panel-header");
    stickyHeaderH = hd ? hd.offsetHeight : 0;
    if (stickyEl.style.top !== stickyHeaderH + "px") stickyEl.style.top = stickyHeaderH + "px";
  };
  const updateSticky = () => {
    if (stickyRaf) return;
    stickyRaf = requestAnimationFrame(() => {
      stickyRaf = 0;
      const g = grid.getBoundingClientRect(), pr = panelEl.getBoundingClientRect();
      const shouldShow = g.bottom < pr.top + stickyHeaderH + 8;
      if (shouldShow === !stickyWasHidden) return; // sin cambio → no tocar el DOM
      stickyWasHidden = !shouldShow;
      stickyEl.hidden = !shouldShow;
    });
  };
  measureHeader();
  panelEl.addEventListener("scroll", updateSticky, { passive: true });
  // Recalcular altura del header si cambia (presets, etc.)
  new ResizeObserver(measureHeader).observe(panelEl.querySelector(".team-panel-header") || panelEl);

  function render() {
    const avg = team.length ? Math.round(team.reduce((s, m) => s + m.level, 0) / team.length) : 0;
    overlay.querySelector(".team-avg").innerHTML = `Nivel medio <strong>${avg}</strong>`;
    overlay.querySelector("#box-count").textContent = box.length ? `· ${box.length}` : "";
    grid.innerHTML = "";
    team.forEach((mon, idx) => grid.appendChild(makeCard(mon, idx, true)));
    for (let i = team.length; i < 6; i++) {
      const empty = document.createElement("div");
      empty.className = "team-card empty";
      empty.dataset.zone = "team-empty";
      empty.innerHTML = `<span class="empty-slot">—</span>`;
      grid.appendChild(empty);
    }
    renderPresets();
    renderSticky();
    let list = box.map((m, idx) => ({ m, idx }));
    if (filters.shiny) list = list.filter(x => x.m.shiny);
    if (filters.nature !== "") list = list.filter(x => String(x.m.natureIndex ?? 0) === filters.nature);
    if (filters.types.size) list = list.filter(x => [...filters.types].every(t => (x.m.types || []).includes(t)));
    if (filters.sort === "name") list.sort((a, b) => (a.m.nameEs || a.m.name).localeCompare(b.m.nameEs || b.m.name));
    else if (filters.sort === "dex") list.sort((a, b) => a.m.id - b.m.id);
    else if (filters.sort === "power") list.sort((a, b) => power(b.m) - power(a.m));
    else list.reverse();
    boxGrid.innerHTML = list.length ? "" : `<div class="box-empty">${box.length ? "Ningún Pokémon coincide con los filtros." : "Aún no tienes Pokémon guardados. Arrastra aquí uno del equipo para guardarlo."}</div>`;
    list.forEach(({ m, idx }) => boxGrid.appendChild(makeBoxCard(m, idx)));
  }

  function makeBoxCard(m, idx) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "coll-card";
    card.dataset.zone = "box";
    card.dataset.idx = String(idx);
    const types = m.types || [];
    card.style.borderColor = TYPE_INFO[types[0]]?.color || "#cbd5e1";
    const icons = types.map(t => TYPE_INFO[t]
      ? `<span class="coll-type" title="${TYPE_INFO[t].label}"><img class="type-icon" src="${TYPE_INFO[t].icon}" alt="${TYPE_INFO[t].label}" draggable="false" /></span>` : "").join("");
    card.innerHTML = `<span class="coll-lv">Nv.${m.level}</span><span class="coll-types">${icons}</span>
      <span class="coll-art"><img src="${frontSprite(m)}" alt="" draggable="false" ${spriteFallback(m)} /></span>${m.shiny ? `<b class="mon-shiny">✦</b>` : ""}${m.locked ? `<i class="mon-lock">🔒</i>` : ""}
      <span class="coll-name">${dispName(m)}</span>`;
    const im = card.querySelector("img");
    // Misma escala para todos (como en el original): el píxel mide igual en un Jigglypuff que en un Muk
    cropSprite(frontSprite(m)).then((c) => {
      if (!c || !im.isConnected) return;
      im.src = c.url;
      // Escala ENTERA (2×, 3×…) para nítidos; !important para ganar a cualquier CSS residual
      const box = im.parentElement, side = Math.min(box.clientWidth || 96, box.clientHeight || 96);
      const k = Math.max(1, Math.floor(side / Math.max(REF_ART, c.w, c.h)));
      im.style.setProperty("width", `${c.w * k}px`, "important");
      im.style.setProperty("height", `${c.h * k}px`, "important");
      im.style.setProperty("max-width", "100%", "important");
      im.style.setProperty("max-height", "100%", "important");
      im.style.setProperty("image-rendering", "pixelated", "important");
      im.style.setProperty("image-rendering", "-webkit-optimize-contrast", "important");
    });
    card.addEventListener("click", () => { if (card.dataset.justDragged) return; showPokemonDetail(m, { inTeam: false, onClose: () => {} }); });
    attachDrag(card);
    return card;
  }

  const SPARK = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 1.5l2.4 7.1 7.1 2.4-7.1 2.4L12 20.5l-2.4-7.1L2.5 11l7.1-2.4z" fill="currentColor"/><path d="M19 15l1 2.5 2.5 1-2.5 1L19 22l-1-2.5-2.5-1 2.5-1z" fill="currentColor"/></svg>`;
  const row = overlay.querySelector("#coll-row");
  const SORTS = [["recent", "Más recientes primero"], ["name", "Orden alfabético (A-Z)"], ["dex", "N° de Pokédex"], ["power", "Más poderoso primero"]];
  row.appendChild(pixelDropdown({ options: SORTS, value: filters.sort, cls: "dd-sort", title: "Orden", onChange: (v) => { filters.sort = v; render(); } }));
  /* Desplegable de naturalezas oculto por ahora (reservado para otro filtro)
  row.appendChild(pixelDropdown({ options: [["", "Naturalezas"], ...NATURES.map((_, i) => [String(i), natureLabel(i)])], value: String(filters.nature), cls: "dd-nat", title: "Naturaleza", onChange: (v) => { filters.nature = v; render(); } }));
  */
  const shBtn = document.createElement("button");
  shBtn.type = "button"; shBtn.id = "coll-shiny"; shBtn.className = "dx-shbtn dx-shicon" + (filters.shiny ? " on" : "");
  shBtn.title = "Solo variocolor"; shBtn.setAttribute("aria-label", "Variocolor"); shBtn.innerHTML = SPARK;
  shBtn.onclick = () => { filters.shiny = !filters.shiny; shBtn.classList.toggle("on", filters.shiny); render(); };
  row.appendChild(shBtn);
  overlay.querySelectorAll(".coll-chip[data-type]").forEach(b => {
    b.classList.toggle("active", filters.types.has(b.dataset.type));
    b.onclick = () => { const t = b.dataset.type; filters.types.has(t) ? filters.types.delete(t) : filters.types.add(t); b.classList.toggle("active"); render(); };
  });

  function makeCard(mon, idx, inTeam) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "team-card";
    card.dataset.zone = inTeam ? "team" : "box";
    card.dataset.idx = String(idx);
    const types = (mon.types || []).map(t =>
      `<span class="type-badge" style="background:${TYPE_COLORS[t]||"#555"}">${TYPE_ES[t]||t}</span>`
    ).join("");
    const move = mon.moves?.[0];
    const moveName = move?.nameEs || move?.name || "—";
    const hpPct = Math.max(0, (mon.currentHp / mon.maxHp) * 100);

    card.innerHTML = `
      <div class="team-card-types">${types}</div>
      <img src="${frontSprite(mon)}" alt="${mon.nameEs}" draggable="false" ${spriteFallback(mon)} />
      <div class="team-card-name">${dispName(mon)}</div>
      <div class="team-card-meta">Nv.${mon.level} · ${moveName}</div>
      <div class="team-card-hp"><div class="fill" style="width:${hpPct}%"></div></div>
    `;
    card.addEventListener("click", () => {
      if (card.dataset.justDragged) return;
      showPokemonDetail(mon, { inTeam, onClose: () => {} });
    });
    attachDrag(card);
    return card;
  }

  // ───────── Arrastrar y soltar (táctil y ratón) ─────────
  const HOLD_MS = 260, MOVE_TOL = 10;
  let drag = null;
  let blockScroll = false;
  const panel = overlay.querySelector(".team-panel");
  let lastPt = { x: 0, y: 0 }, raf = 0;
  function autoScroll() {
    raf = 0;
    if (!drag) return;
    const r = panel.getBoundingClientRect(), EDGE = 110;
    let v = 0;
    if (lastPt.y > r.bottom - EDGE) v = Math.min(22, (lastPt.y - (r.bottom - EDGE)) / 4 + 4);
    else if (lastPt.y < r.top + EDGE + 40) v = -Math.min(22, ((r.top + EDGE + 40) - lastPt.y) / 4 + 4);
    if (v) { panel.scrollTop += v; refreshHover(); }
    raf = requestAnimationFrame(autoScroll);
  }
  function refreshHover() {
    if (!drag) return;
    const t = targetAt(lastPt.x, lastPt.y);
    if (drag.hover !== t) { drag.hover?.classList.remove("drop-hover"); t?.classList.add("drop-hover"); drag.hover = t; }
  }
  overlay.addEventListener("touchmove", (e) => { if (blockScroll) e.preventDefault(); }, { passive: false });

  function attachDrag(card) {
    card.addEventListener("pointerdown", (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      const start = { x: e.clientX, y: e.clientY };
      const info = { zone: card.dataset.zone, idx: Number(card.dataset.idx) };
      const isMouse = e.pointerType === "mouse";
      let timer = null;
      const begin = () => {
        blockScroll = true;
        const ghost = card.cloneNode(true);
        ghost.classList.add("drag-ghost");
        const r = card.getBoundingClientRect();
        ghost.style.width = r.width + "px";
        ghost.style.height = r.height + "px";
        document.body.appendChild(ghost);
        card.classList.add("drag-source");
        drag = { info, card, ghost, dx: e.clientX - r.left, dy: e.clientY - r.top, hover: null };
        if (navigator.vibrate) navigator.vibrate(15);
        move(e.clientX, e.clientY);
      };
      const move = (x, y) => {
        if (!drag) return;
        drag.ghost.style.left = x - drag.dx + "px";
        drag.ghost.style.top = y - drag.dy + "px";
        lastPt = { x, y };
        if (!raf) raf = requestAnimationFrame(autoScroll);
        const t = targetAt(x, y);
        if (drag.hover !== t) {
          drag.hover?.classList.remove("drop-hover");
          t?.classList.add("drop-hover");
          drag.hover = t;
        }
      };
      const onMove = (ev) => {
        if (!drag) {
          if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) > MOVE_TOL) {
            if (isMouse) begin(); else cleanup(); // en táctil, moverse antes del tiempo = scroll normal
          }
          return;
        }
        move(ev.clientX, ev.clientY);
      };
      const onUp = (ev) => {
        const d = drag;
        cleanup();
        if (d) {
          card.dataset.justDragged = "1";
          setTimeout(() => delete card.dataset.justDragged, 350);
          const t = targetAt(ev.clientX, ev.clientY);
          if (t) drop(d.info, t);
        }
      };
      function cleanup() {
        clearTimeout(timer);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        if (drag) {
          drag.ghost.remove();
          drag.card.classList.remove("drag-source");
          drag.hover?.classList.remove("drop-hover");
          drag = null;
        }
        blockScroll = false;
      }
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      if (!isMouse) timer = setTimeout(begin, HOLD_MS);
    });
    card.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  function targetAt(x, y) {
    if (drag) drag.ghost.style.display = "none";
    const el = document.elementFromPoint(x, y);
    if (drag) drag.ghost.style.display = "";
    return el?.closest("[data-zone]") || null;
  }

  function drop(from, targetEl) {
    const zone = targetEl.dataset.zone;
    const tIdx = Number(targetEl.dataset.idx);
    const src = from.zone === "team" ? team : box;
    const mon = src[from.idx];
    if (!mon) return;
    let changed = false;

    if (zone === "team" || zone === "box") {
      const dst = zone === "team" ? team : box;
      if (dst === src && tIdx === from.idx) return;
      const other = dst[tIdx];
      if (!other) return;
      dst[tIdx] = mon;
      src[from.idx] = other;
      changed = true;
    } else if (zone === "team-empty" || zone === "team-area") {
      if (from.zone === "box" && team.length < 6) { box.splice(from.idx, 1); team.push(mon); changed = true; }
    } else if (zone === "box-area") {
      if (from.zone === "team") {
        if (team.length <= 1) { flash("Debes tener al menos un Pokémon en el equipo"); return; }
        team.splice(from.idx, 1); box.push(mon); changed = true;
      }
    }
    if (changed) { render(); onChange?.(); }
  }

  function flash(text) {
    const el = overlay.querySelector(".team-hint");
    const old = el.textContent;
    el.textContent = text; el.classList.add("warn");
    setTimeout(() => { el.textContent = old; el.classList.remove("warn"); }, 2200);
  }

  const onReleased = () => { if (document.body.contains(overlay)) { render(); onChange?.(); } };
  document.addEventListener("poke:released", onReleased);
  const close = () => {
    document.removeEventListener("poke:released", onReleased);
    overlay.remove();
    onClose?.();
  };
  overlay.querySelector(".team-close").onclick = close;
  overlay.querySelector(".team-back").onclick = close;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  render();
  updateSticky();
}
