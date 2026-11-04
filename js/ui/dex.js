import { DEX_NAMES } from "../data/dex-names.js?v=128";
import { iconSprite, frontSprite } from "../data/sprites.js?v=128";
import { openPlayerEditor, avatarHtml, getAspect, aspectSrc, frameClass } from "./player-avatar.js?v=128";
import { pixelIcon } from "./pixel.js?v=128";
import { badgeHtml } from "./badge.js?v=128";
import { NATURES, natureLabel } from "../data/natures.js?v=128";
import { shinyOdds } from "../data/shiny.js?v=128";
import { placeMenu } from "./dropdown.js?v=128";
import { showTip } from "./tip.js?v=128";
import { getPokemon } from "../data/pokeapi.js?v=128";

/** Dos naturalezas recomendadas según las estadísticas base. */
function recommendNatures(b) {
  const atk = Number(b.atk) || 0;
  const spa = Number(b.spa) || 0;
  const find = (up, down) => NATURES.findIndex(n => n.up === up && n.down === down);
  // Empate Atk/SpA (p. ej. Mew 100/100): no inventar un lado "ganador"
  if (atk === spa) {
    return {
      mode: "mixed",
      picks: [find("atk", "spa"), find("spa", "atk")], // Firme y Modesta
      b: { ...b, atk, spa },
    };
  }
  const phys = atk > spa;
  const main = phys ? "atk" : "spa";
  const off = phys ? "spa" : "atk";
  return {
    mode: phys ? "phys" : "spec",
    picks: [find(main, off), find("spe", off)], // ofensiva + velocidad
    b: { ...b, atk, spa },
  };
}

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const MODES = [["all", "Todos"], ["caught", "Capturados"], ["seen", "Solo vistos"], ["missing", "Faltan"]];
const modeLabel = (m) => (m === "all" ? "ESTADO" : (MODES.find(x => x[0] === m)?.[1] || "ESTADO"));
const SPARK = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 1.5l2.4 7.1 7.1 2.4-7.1 2.4L12 20.5l-2.4-7.1L2.5 11l7.1-2.4z" fill="currentColor"/><path d="M19 15l1 2.5 2.5 1-2.5 1L19 22l-1-2.5-2.5-1 2.5-1z" fill="currentColor"/></svg>`;

export function dexSets(state) {
  const st = state.stats || {};
  const owned = [...state.playerTeam, ...(state.box || [])].map(m => m.id);
  const caught = new Set([...(st.caught || []), ...owned]);
  const seen = new Set([...(st.seen || []), ...caught]);
  return { caught, seen };
}

let dexFilter = { q: "", mode: "all", open: true, shiny: false };

const norm = (t) => String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function gridHtml(state) {
  const { caught, seen } = dexSets(state);
  const q = norm(dexFilter.q.trim().replace(/^#|^n\.?º?\s*/i, ""));
  const shinies = new Set(state.stats?.shiny || []);
  const filt = state.captureFilter || {};
  const fresh = new Set((state.stats?.caughtOrder || []).slice(-3));
  let out = "";
  for (let id = 1; id <= 151; id++) {
    const c = caught.has(id), s = seen.has(id);
    if (dexFilter.mode === "caught" && !c) continue;
    if (dexFilter.mode === "missing" && c) continue;
    if (dexFilter.shiny && !shinies.has(id)) continue;
    if (dexFilter.mode === "seen" && !(s && !c)) continue;
    if (q && !(String(id).padStart(3, "0").includes(q) || String(id) === q || (s && norm(DEX_NAMES[id - 1]).includes(q)))) continue;
    const label = s ? DEX_NAMES[id - 1] : "???";
    out += `<div class="dx-cell ${c ? "got" : s ? "seen" : "none"}${c ? " dx-pick" : ""}" data-id="${id}" title="${label}">
      <img src="${iconSprite({ id, shiny: dexFilter.shiny && shinies.has(id) })}" alt="" loading="lazy" onerror="this.style.visibility='hidden'" />
      ${c ? `<i class="dx-ball"></i>` : ""}${shinies.has(id) ? `<b class="dx-shiny">✦</b>` : ""}${filt[id]?.length ? `<b class="dx-filt" title="Filtro de naturaleza">⚙</b>` : ""}${c && fresh.has(id) ? `<span class="dx-new">NEW</span>` : ""}
      <small>N.º ${String(id).padStart(3, "0")}</small>
      <span class="dx-name">${label}</span></div>`;
  }
  return out || `<p class="dx-empty">Sin resultados</p>`;
}

export function renderDex(state) {
  const { caught, seen } = dexSets(state);
  const n = [...caught].filter(id => id >= 1 && id <= 151).length;
  const pct = Math.round(n / 151 * 100);
  const shinies = (state.stats?.shiny || []).length;
  const order = state.stats?.caughtOrder || [];
  const last = order.filter(id => id >= 1 && id <= 151).slice(-12).reverse();
  const missShiny = Math.max(0, 151 - shinies);
  return `
  <div class="dx-page">
    <section class="dx-card dx-top">
      <header class="dx-banner">
        <div class="dx-title">
          <span class="dx-gem" aria-hidden="true">📕</span>
          <h2>Pokédex</h2>
          <button type="button" class="dx-help" id="dx-help" aria-label="Ayuda">?</button>
        </div>
        <div class="dx-stats">
          <span>Vistos <b>${seen.size}</b></span>
          <span>✦ Variocolor <b>${shinies}</b></span>
          <span>Regiones completas <b>${n >= 151 ? 1 : 0}/4</b></span>
        </div>
      </header>

      <div class="dx-summary">
        <div class="dx-ring" style="--p:${pct}">
          <div class="dx-ring-inner">
            <b>${pct}&nbsp;%</b>
            <small>${n}&nbsp;/&nbsp;151</small>
          </div>
        </div>
        <div class="dx-regions">
          <div class="dx-reg">
            <span>Kanto</span>
            <div class="dx-bar"><i style="width:${(n / 151) * 100}%"></i></div>
            <em>${n}&nbsp;/&nbsp;151</em>
          </div>
          <div class="dx-reg lock">
            <span>Johto</span>
            <div class="dx-bar"></div>
            <em>🔒</em>
          </div>
          <div class="dx-reg lock">
            <span>Hoenn</span>
            <div class="dx-bar"></div>
            <em>🔒</em>
          </div>
          <div class="dx-reg lock">
            <span>Sinnoh</span>
            <div class="dx-bar"></div>
            <em>🔒</em>
          </div>
        </div>
      </div>

      <div class="dx-sub">ÚLTIMAS CAPTURAS</div>
      <div class="dx-last">${
        last.length
          ? last.map(id => `<img src="${iconSprite(id)}" alt="" width="40" height="40" loading="lazy" onerror="this.style.visibility='hidden'">`).join("")
          : `<span class="dx-muted">Aún no hay capturas recientes</span>`
      }</div>
    </section>

    <div class="dx-tools">
      <input id="dx-q" type="search" placeholder="Nombre o número…" value="${esc(dexFilter.q)}" autocomplete="off" />
      <div class="dx-dd" id="dx-dd">
        <button type="button" id="dx-mode-btn" class="dx-ddbtn" aria-haspopup="listbox" aria-expanded="false">${modeLabel(dexFilter.mode)} <i>▾</i></button>
        <div class="dx-ddmenu" id="dx-mode-menu" role="listbox" hidden>
          ${MODES.map(([v, l]) => `<button type="button" role="option" data-mode="${v}" class="${dexFilter.mode === v ? "on" : ""}">${l}</button>`).join("")}
        </div>
      </div>
      <button type="button" id="dx-shiny" class="dx-shbtn dx-shicon${dexFilter.shiny ? " on" : ""}" aria-label="Variocolor" title="Solo variocolor">${SPARK}</button>
    </div>

    <section class="dx-card dx-kanto ${dexFilter.open ? "" : "closed"}">
      <button type="button" class="dx-region-head" id="dx-toggle">
        <div class="dx-rh-left">
          <h2>Kanto</h2>
          <em class="dx-shchip" id="dx-shchip">✦×${shinies} faltan ${missShiny}</em>
        </div>
        <div class="dx-rh-right">
          <span>${n}&nbsp;/&nbsp;151</span>
          <i class="dx-caret">▾</i>
        </div>
      </button>
      <div class="dx-regbar"><div class="dx-bar"><i style="width:${(n / 151) * 100}%"></i></div></div>
      <div class="dx-grid" id="dx-grid">${gridHtml(state)}</div>
    </section>
  </div>`;
}

function openNaturePicker(state, id, refresh) {
  state.captureFilter = state.captureFilter || {};
  const sel = new Set(state.captureFilter[id] || []);
  const ov = document.createElement("div");
  ov.className = "np-overlay";
  const rows = () => NATURES.map((n, i) => `<label class="np-row"><input type="checkbox" data-n="${i}" ${sel.has(i) ? "checked" : ""}><span>${natureLabel(i)}</span></label>`).join("");
  ov.innerHTML = `<div class="np-box">
    <div class="np-head"><img src="${iconSprite(id)}" alt=""><div><h3>${DEX_NAMES[id - 1]}</h3><small>Solo guardo las naturalezas marcadas; el resto se libera solo. Sin marcar = guardo todas. Los variocolor siempre se guardan.</small></div></div>
    <div class="np-tools"><button type="button" data-a="all">Todas</button><button type="button" data-a="none">Ninguna</button><button type="button" data-a="info" class="np-info" aria-label="Recomendación">ⓘ</button></div>
    <div class="np-tip" id="np-tip" hidden></div>
    <div class="np-list">${rows()}</div>
    <div class="np-foot"><button type="button" data-a="cancel">Cancelar</button><button type="button" class="ok" data-a="save">Guardar</button></div>
  </div>`;
  document.body.appendChild(ov);
  const list = ov.querySelector(".np-list");
  list.onchange = (e) => { const i = Number(e.target.dataset.n); e.target.checked ? sel.add(i) : sel.delete(i); };
  ov.onclick = (e) => {
    const a = e.target.dataset?.a;
    if (e.target === ov || a === "cancel") return ov.remove();
    if (a === "info") {
      const tip = ov.querySelector("#np-tip");
      tip.hidden = !tip.hidden;
      if (!tip.hidden && !tip.dataset.done) {
        tip.textContent = "Calculando…";
        getPokemon(id).then(p => {
          const b = {};
          p.stats.forEach(s => { b[({ attack: "atk", "special-attack": "spa", speed: "spe" })[s.stat.name] || s.stat.name] = s.base_stat; });
          const r = recommendNatures(b);
          const [n1, n2] = r.picks.map(i => natureLabel(i));
          let why;
          if (r.mode === "mixed") {
            why = `${DEX_NAMES[id - 1]} es equilibrado (Atk ${b.atk} = SpA ${b.spa}). Sirve tanto físico como especial: 1.ª sube Ataque y baja At. Esp.; 2.ª al revés. Elige según el set que quieras.`;
          } else if (r.mode === "phys") {
            why = `${DEX_NAMES[id - 1]} pega más de físico (Atk ${b.atk} > SpA ${b.spa}). 1.ª sube Ataque; 2.ª sube Velocidad. Ambas bajan At. Esp.`;
          } else {
            why = `${DEX_NAMES[id - 1]} pega más de especial (SpA ${b.spa} > Atk ${b.atk}). 1.ª sube At. Esp.; 2.ª sube Velocidad. Ambas bajan Ataque.`;
          }
          tip.innerHTML = `<b>Recomendadas:</b><br>1. ${n1}<br>2. ${n2}<br><small>${why}</small>`;
          tip.dataset.done = "1";
        }).catch(() => { tip.textContent = "No pude consultar las estadísticas ahora (sin conexión). Prueba de nuevo más tarde."; });
      }
    }
    if (a === "all") { NATURES.forEach((_, i) => sel.add(i)); list.innerHTML = rows(); }
    if (a === "none") { sel.clear(); list.innerHTML = rows(); }
    if (a === "save") {
      if (sel.size === 0 || sel.size === NATURES.length) delete state.captureFilter[id];
      else state.captureFilter[id] = [...sel].sort((x, y) => x - y);
      try { window.__pokeSave?.(); } catch (_) {}
      ov.remove(); refresh();
    }
  };
}

export function bindDex(state) {
  const q = document.getElementById("dx-q");
  if (!q) return;
  const upd = () => { document.getElementById("dx-grid").innerHTML = gridHtml(state); };
  q.oninput = () => { dexFilter.q = q.value; upd(); };
  const mb = document.getElementById("dx-mode-btn"), mm = document.getElementById("dx-mode-menu");
  const closeMenu = () => { mm.hidden = true; mb.setAttribute("aria-expanded", "false"); };
  mb.onclick = (e) => { e.stopPropagation(); mm.hidden = !mm.hidden; mb.setAttribute("aria-expanded", String(!mm.hidden)); if (!mm.hidden) placeMenu(document.getElementById("dx-dd"), mm); };
  mm.onclick = (e) => {
    const o = e.target.closest("[data-mode]");
    if (!o) return;
    dexFilter.mode = o.dataset.mode;
    mb.innerHTML = `${modeLabel(dexFilter.mode)} <i>▾</i>`;
    mm.querySelectorAll("[data-mode]").forEach(x => x.classList.toggle("on", x === o));
    closeMenu(); upd();
  };
  document.addEventListener("click", function h(ev) {
    if (!document.body.contains(mb)) return document.removeEventListener("click", h);
    if (!ev.target.closest("#dx-dd")) closeMenu();
  });
  const sb = document.getElementById("dx-shiny");
  if (sb) sb.onclick = () => { dexFilter.shiny = !dexFilter.shiny; sb.classList.toggle("on", dexFilter.shiny); upd(); };
  const chip = document.getElementById("dx-shchip");
  if (chip) chip.onclick = (e) => { e.stopPropagation(); showTip(chip, "Variocolores", `Cada encuentro salvaje tiene ${shinyOdds()} de probabilidad de ser variocolor. Los variocolor siempre se guardan, sin importar el filtro de naturaleza.`); };
  document.getElementById("dx-grid").onclick = (e) => {
    const cell = e.target.closest(".dx-pick");
    if (cell) openNaturePicker(state, Number(cell.dataset.id), upd);
  };
  const tg = document.getElementById("dx-toggle");
  if (tg) tg.onclick = () => { dexFilter.open = !dexFilter.open; document.querySelector(".dx-kanto").classList.toggle("closed", !dexFilter.open); };
  const hp = document.getElementById("dx-help");
  if (hp) hp.onclick = () => showTip(hp, "Pokédex", "Los Pokémon capturados se ven en color, los vistos en sombra oscura y el resto como silueta. Busca por nombre o número.");
}

// ───────── Ficha de entrenador ─────────
const MEDAL_ICONS = ["boulder", "cascade", "thunder", "rainbow", "soul", "marsh", "volcano", "earth"];

function fmtTime(ms) {
  const m = Math.floor(ms / 60000);
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
}

export function showTrainerCard(state, { sprite, onRename, onSave } = {}) {
  sprite = sprite || getAspect(state);
  const { caught, seen } = dexSets(state);
  const st = state.stats || {};
  const all = [...state.playerTeam, ...(state.box || [])];
  const best = all.reduce((a, m) => (!a || m.level > a.level ? m : a), null);
  const pct = Math.round(caught.size / 151 * 100);
  const date = new Date(st.startedAt || Date.now()).toLocaleDateString("es");
  const wins = st.wins || 0, battles = st.battles || 0;
  const winPct = battles ? Math.round(wins / battles * 100) : 0;
  const nMedals = Math.max(state.badges?.length || 0, Math.min(8, state.chapter || 0));
  const medals = Array.from({ length: 8 }, (_, i) => i < nMedals);
  const partner = state.playerTeam[0];
  if (state.player && !state.player.no) state.player.no = 2000 + ((state.player.name || "").split("").reduce((a, c) => a + c.charCodeAt(0) * 7, 0) % 7000);
  const trainerNo = String(state.player?.no || 2000);
  const ov = document.createElement("div");
  ov.className = "tc-overlay";
  const front = () => `
    <div class="tc-top">
      <div class="tc-left">
        <div class="tc-art" id="tc-portrait" title="Editar aspecto y marco">${partner ? `<img class="tc-partner" src="${frontSprite(partner)}" alt="" onerror="this.style.visibility='hidden'">` : ""}<img class="tc-trainer" src="${aspectSrc(state)}" alt="" onerror="this.style.visibility='hidden'"><span class="tc-frame-hint">✎</span></div>
        <div class="tc-comp"><i class="tc-ball"></i><span>Compañero: ${partner ? esc(partner.nameEs || partner.name) : "—"}</span></div>
      </div>
      <div class="tc-id">
        <div class="tc-name">${avatarHtml(state, { cls: "tc-mini-av" })}<h3>${esc(state.player?.name || "Entrenador")}</h3><small>#${trainerNo}</small><button type="button" class="tc-edit" id="tc-edit" aria-label="Editar">✎</button></div>
        <div class="tc-two"><div class="tc-box"><small>Entrenador desde</small><b>${date}</b></div>
        <div class="tc-box"><small>Tiempo de juego</small><b>${fmtTime(st.playMs || 0)}</b></div></div>
        <div class="tc-prog"><div class="tc-ring" style="--p:${pct}"><b>${pct}%</b></div>
          <div><b>${caught.size} / 151 capturados</b>
          <span class="tc-shiny">✦ ${(st.shiny || []).length} variocolor capturados</span>
          <small>· ${seen.size - caught.size} vistos</small></div></div>
      </div>
    </div>
    <div class="tc-sub">EQUIPO <span>${state.playerTeam.length} / 6</span></div>
    <div class="tc-team">${state.playerTeam.map(m => `<div><img src="${iconSprite(m)}" alt="" onerror="this.style.visibility='hidden'"><em>${m.level}</em></div>`).join("")}</div>
    <div class="tc-sub">MEDALLAS <span>${nMedals} / 8</span></div>
    <div class="tc-medals"><div class="tc-mrow">${[0, 1, 2, 3].map(i => `<div class="tc-dia ${medals[i] ? "got" : ""}"><span>${badgeHtml(i, medals[i], 30)}</span></div>`).join("")}</div>
      <div class="tc-mrow lo">${[4, 5, 6, 7].map(i => `<div class="tc-dia ${medals[i] ? "got" : ""}"><span>${badgeHtml(i, medals[i], 30)}</span></div>`).join("")}</div></div>`;
  const LEG = [144, 145, 146, 150, 151];
  const legs = LEG.filter(id => caught.has(id)).length;
  const ico = (cls, inner = "") => `<i class="tc-ic ${cls}">${inner}</i>`;
  const tile = (icon, label, value, extra = "") => `<div class="tc-st">${icon}<div><small>${label}</small><b>${value}${extra}</b></div></div>`;
  const back = () => `
    <div class="tc-sub">POKÉDEX POR REGIÓN</div>
    <div class="tc-box wide"><div class="tc-row"><span>Kanto</span><span>${caught.size} / 151</span></div><div class="dx-bar"><i style="width:${caught.size / 151 * 100}%"></i></div></div>
    <hr class="tc-hr">
    <div class="tc-sub">COMBATES</div>
    <div class="tc-stats">
      ${tile(ico("vs", "VS"), "Combates", battles.toLocaleString("es"))}
      ${tile(ico("win", "★"), "Victorias", wins.toLocaleString("es"), ` <em>${winPct} %</em>`)}
      ${tile(ico("ball"), "Balls lanzadas", (st.balls || 0).toLocaleString("es"))}
      ${tile(ico("ball ultra"), "Capturas", (st.captures || 0).toLocaleString("es"))}
      ${tile(ico("raid", "✧"), "Incursiones superadas", st.raids || 0)}
      <div class="tc-st">${best ? `<img class="tc-bestimg" src="${iconSprite(best)}" alt="" onerror="this.style.visibility='hidden'">` : ico("win", "—")}<div><small>Nivel más alto</small><b>${best ? `${esc(best.nameEs || best.name)} <em>${best.level}</em>` : "—"}</b></div></div>
    </div>
    <hr class="tc-hr">
    <div class="tc-sub">COLECCIÓN</div>
    <div class="tc-stats">
      ${tile(ico("ball master"), "Pokémon", all.length.toLocaleString("es"))}
      ${tile(ico("shiny", "✦"), "Variocolor", (st.shiny || []).length)}
      ${tile(ico("ball legend"), "Legendarios", `${legs} / ${LEG.length}`)}
      ${tile(ico("evo", "◆"), "Evoluciones", (st.evolutions || 0).toLocaleString("es"))}
      ${tile(ico("egg"), "Huevos eclosionados", st.hatched || 0)}
      ${tile(ico("trade", "⇄"), "Intercambios", st.trades || 0)}
    </div>`;
  ov.innerHTML = `
    <div class="tc-panel">
      <div class="tc-header"><h2>Ficha de Entrenador</h2>
        <div class="tc-tabs"><button data-t="f" class="on">ANVERSO</button><button data-t="b">REVERSO</button></div>
        <button class="tc-x" aria-label="Cerrar">✕</button></div>
      <div class="tc-body">${front()}</div>
    </div>`;
  document.body.appendChild(ov);
  const body = ov.querySelector(".tc-body");
  ov.querySelectorAll("[data-t]").forEach(b => b.onclick = () => {
    ov.querySelectorAll("[data-t]").forEach(x => x.classList.toggle("on", x === b));
    body.innerHTML = b.dataset.t === "f" ? front() : back();
  });
  const close = () => ov.remove();
  ov.querySelector(".tc-x").onclick = close;
  const openEdit = () => {
    openPlayerEditor(state, {
      onSave: () => {
        try { onRename?.(state.player?.name); } catch (_) {}
        try { onSave?.(state); } catch (_) {}
        sprite = getAspect(state);
        if (ov.querySelector("[data-t].on")?.dataset.t === "f") body.innerHTML = front();
        else body.innerHTML = back();
      },
    });
  };
  body.addEventListener("click", (e) => {
    if (e.target.closest("#tc-portrait") || e.target.closest("#tc-edit") || e.target.closest("[data-player-avatar]")) {
      openEdit();
    }
  });
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
}
