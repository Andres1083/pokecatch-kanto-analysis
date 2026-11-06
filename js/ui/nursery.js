// Pantalla de Crianza: guardería (2 parejas → huevos) + incubadoras.
import { showTip } from "./tip.js?v=136";
import { showConfirm, showAlert } from "./confirm.js?v=136";
import { iconSprite } from "../data/sprites.js?v=136";
import { ensureNursery, setParent, retrieveParent, startIncubation, compatible, nextEggMs, useBerry, freeIncubator, unlockIncubator, toggleHeld } from "../engine/nursery.js?v=136";
import { BREED_MS, HATCH_MS, EGG_CAP, INCUBATORS, INC_PRICES, PAIRS, pairUnlocked, BREED_BERRIES } from "../data/breeding.js?v=136";
import { ITEMS } from "../data/items.js?v=136";
import { itemImg } from "./item-icon.js?v=136";
import { getNature } from "../data/natures.js?v=136";
import { frontSprite } from "../data/sprites.js?v=136";

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (ms) => { const s = Math.ceil(ms / 1000); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h} h ${String(m).padStart(2, "0")} min` : `${m}:${String(x).padStart(2, "0")}`; };
const egg = (cls = "") => `<i class="egg ${cls}"></i>`;
const money = (n) => Number(n).toLocaleString("es-ES");

// Estado de interfaz que se conserva entre refrescos
const ui = { tab: "guests", q: "", shown: 60 };
const norm = (t) => String(t ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const DITTO = 132;
const BG = "assets/bg/scenes/parc-pension-710x400.webp";

function matches(m, q) {
  if (!q) return true;
  const t = norm(q).trim();
  return norm(m.nameEs || m.name).includes(t) || String(m.id) === t.replace("#", "") || norm(m.name).includes(t);
}

/** Cuadrícula de 5 por fila con la caja (misma maqueta que el PC del original) */
function gridHtml(list, limit, attr = "data-pc") {
  if (!list.length) return `<p class="nu-none gd-empty">No hay Pokémon que coincidan.</p>`;
  const cards = list.slice(0, limit).map(m => `<button type="button" class="gd-mon-card ${m.shiny ? "shiny" : ""}" ${attr}="${(m._gi ?? 0)}" title="${esc(m.nameEs || m.name)}"><img src="${frontSprite(m)}" alt="" draggable="false" loading="lazy"><b>Nv. ${m.level}</b>${m.shiny ? `<i class="gd-sh">✦</i>` : ""}</button>`).join("");
  const more = list.length > limit ? `<button type="button" class="gd-more" data-more="1">Mostrar más (${list.length - limit})</button>` : "";
  return `<div class="gd-grid">${cards}</div>${more}`;
}

const boxList = (state, q, filterFn) => {
  const out = [];
  (state.box || []).forEach((m, i) => { if (matches(m, q) && (!filterFn || filterFn(m))) { m._gi = i; out.push(m); } });
  return out;
};

export function renderNursery(state) {
  const n = ensureNursery(state);
  const now = Date.now();
  const hr = new Date(now).getHours();
  const dayIcon = hr >= 7 && hr < 20 ? "☀️" : "🌙";
  const clock = `${String(hr).padStart(2, "0")}:${String(new Date(now).getMinutes()).padStart(2, "0")}`;
  const hasDitto = n.parents.some(m => m && m.id === DITTO);
  const total = PAIRS * 2;
  const filled = n.parents.filter(Boolean).length;
  const free = freeIncubator(n);
  const usedInc = n.incubators.filter((x, i) => x && i < n.incUnlocked).length;

  // Estado de la puesta
  const active = [];
  for (let p = 0; p < PAIRS; p++) { const nm = nextEggMs(n, p, now); if (nm != null) active.push({ p, nm }); }
  active.sort((a, b) => a.nm - b.nm);
  const status = n.eggs.length >= EGG_CAP ? "Huevos llenos: la puesta está en pausa"
    : active.length ? `Próximo huevo en <b data-egg-next>${fmt(active[0].nm)}</b>`
    : "Deja dos Pokémon compatibles para criar";

  // Padres paseando por el prado (animados)
  const wander = n.parents.map((m, i) => {
    if (!m) return "";
    const left = 22 + (i * 19) % 56;
    const dur = (7 + (i * 3) % 6) + (i % 2) * 1.5;
    const delay = -(i * 2.3);
    return `<div class="gd-wander" style="left:${left}%;--d:${dur}s;animation-delay:${delay}s"><img src="${frontSprite(m)}" alt="${esc(m.nameEs || m.name)}" draggable="false" style="animation-delay:${-(i * 0.37)}s"></div>`;
  }).join("");

  const berries = Object.keys(BREED_BERRIES).map(id => {
    const q = state.bag?.[id] || 0;
    const cut = BREED_BERRIES[id];
    return `<button type="button" class="gd-berry" data-berry="${id}" ${q > 0 && active.length ? "" : "disabled"} title="${ITEMS[id].name}: −${cut >= 3600000 ? cut / 3600000 + " h" : cut / 60000 + " min"}">${itemImg(id, 30, "")}<b>×${q}</b></button>`;
  }).join("");

  // Pestaña Huéspedes
  const slot = (m, i) => {
    const pair = i >> 1;
    if (!pairUnlocked(state, pair)) return `<div class="gd-slot locked" title="Se abre al completar la historia de Johto">🔒</div>`;
    if (!m) return `<button type="button" class="gd-slot empty" data-pick="${i}" aria-label="Añadir huésped"><span>+</span></button>`;
    const nm = (i & 1) ? null : nextEggMs(n, pair, now);
    const pct = Math.min(100, (1 - (nextEggMs(n, pair, now) ?? BREED_MS) / BREED_MS) * 100);
    return `<div class="gd-slot has" data-slot="${i}">
      <button type="button" class="gd-x" data-ret="${i}" aria-label="Retirar" title="Retirar">✕</button>
      <img src="${frontSprite(m)}" alt="" draggable="false">
      <b>${esc(m.nameEs || m.name)}</b>
      <small>Nv. ${m.level} · ${getNature(m.natureIndex ?? 0).nameEs}</small>
      <button type="button" class="nu-held ${n.held[i] ? "on" : ""}" data-held="${i}">${n.held[i] ? `${itemImg(n.held[i], 14, "")} ${ITEMS[n.held[i]].name}` : "＋ Objeto"}</button>
      ${(i & 1) ? "" : ""}
    </div>`;
  };
  const pairBars = Array.from({ length: PAIRS }, (_, p) => {
    if (!pairUnlocked(state, p)) return `<div class="gd-pbar locked">Pareja ${p + 1}: 🔒 se abre al completar Johto</div>`;
    const a = n.parents[p * 2], b = n.parents[p * 2 + 1];
    const nm = nextEggMs(n, p, now);
    return `<div class="gd-pbar">
      <span>Pareja ${p + 1}</span>
      ${a && b ? (nm == null ? `<em>En pausa (huevos llenos)</em>` : `<em>huevo en <b data-egg-timer="${p}">${fmt(nm)}</b></em>`) : `<em>${a || b ? "Falta el compañero (misma familia, o Ditto)" : "Vacía"}</em>`}
      ${a && b && nm != null ? `<div class="nu-bar"><i data-egg-bar="${p}" style="width:${Math.min(100, (1 - nm / BREED_MS) * 100)}%"></i></div>` : ""}
    </div>`;
  }).join("");
  const guests = `<div class="gd-slots">${n.parents.map((m, i) => slot(m, i)).join("")}</div>${pairBars}`;

  // Pestaña Incubadora
  const eggsHtml = n.eggs.length
    ? `<div class="gd-eggs">${n.eggs.map((e, i) => `<button type="button" class="gd-egg" data-inc="${i}" ${free < 0 ? "disabled" : ""}>${egg()}${e.nature != null ? `<em class="nu-nat" title="Naturaleza heredada">🔒 ${getNature(e.nature).nameEs}</em>` : ""}<small>${free < 0 ? "Sin incubadora libre" : "Incubar"}</small></button>`).join("")}</div>`
    : `<p class="nu-none">Aún no hay huevos en espera.</p>`;
  const incs = `<div class="gd-incs">${n.incubators.map((x, i) => {
    if (i >= n.incUnlocked) {
      const next = i === n.incUnlocked;
      return `<div class="gd-inc locked">🔒${next ? `<button type="button" data-unlock="1">Desbloquear<br><b>${money(INC_PRICES[i])} ₽</b></button>` : `<small>${money(INC_PRICES[i])} ₽</small>`}</div>`;
    }
    if (!x) return `<div class="gd-inc empty"><small>Libre</small></div>`;
    const left = Math.max(0, HATCH_MS - (now - x.startedAt));
    return `<div class="gd-inc">${egg("warm")}<b data-inc-timer="${x.startedAt}">${left ? fmt(left) : "¡Listo!"}</b><div class="nu-bar"><i data-inc-bar="${x.startedAt}" style="width:${Math.min(100, (1 - left / HATCH_MS) * 100)}%"></i></div></div>`;
  }).join("")}</div>`;
  const incPanel = `<h4 class="gd-sub">Huevos en espera <small>${n.eggs.length} / ${EGG_CAP}</small></h4>${eggsHtml}<h4 class="gd-sub">Incubadoras <small>${n.incUnlocked} / ${INCUBATORS}</small></h4>${incs}`;

  const list = boxList(state, ui.q);
  return `
  <div class="nu-wrap gd-wrap">
    <section class="gd-card">
      <header class="gd-head"><i class="egg"></i><h2>Guardería</h2><button type="button" id="nu-help" class="gd-help" aria-label="Ayuda">?</button></header>
      <div class="gd-ditto ${hasDitto ? "on" : ""}"><img src="${frontSprite({ id: DITTO })}" alt="" draggable="false"><span>${hasDitto ? "Ditto presente: puede haber huevos ✓" : "Sin Ditto: solo misma familia"}</span></div>
      <div class="gd-scene" style="background-image:url('${BG}')">
        <div class="gd-chip gd-time"><span>${dayIcon}</span> <b data-gd-clock>${clock}</b></div>
        <div class="gd-chip gd-status">${status}</div>
        ${wander}
        <div class="gd-tray">${berries}</div>
      </div>
      <div class="gd-tabs" role="tablist">
        <button type="button" role="tab" class="${ui.tab === "guests" ? "on" : ""}" data-tab="guests">HUÉSPEDES <small>${filled}/${total}</small></button>
        <button type="button" role="tab" class="${ui.tab === "inc" ? "on" : ""}" data-tab="inc">INCUBADORA <small>${usedInc}/${n.incUnlocked}</small>${n.eggs.length ? `<i class="gd-badge">${n.eggs.length}</i>` : ""}</button>
      </div>
      <div class="gd-panel">${ui.tab === "guests" ? guests : incPanel}</div>
      <p class="gd-hint">Toca un Pokémon de tu caja para dejarlo en la Guardería</p>
    </section>
    <section class="gd-pc">
      <div class="gd-search"><input type="search" id="gd-q" placeholder="Buscar un Pokémon…" value="${esc(ui.q)}" autocomplete="off" autocapitalize="off" spellcheck="false"></div>
      <div id="gd-pcgrid">${gridHtml(list, ui.shown)}</div>
    </section>
  </div>`;
}

let timer = null;

/** Hueco para un Pokémon: completa una pareja a medias si es compatible; si no, una pareja vacía */
function autoSlot(state, mon) {
  const n = ensureNursery(state);
  for (let p = 0; p < PAIRS; p++) {
    if (!pairUnlocked(state, p)) continue;
    const a = n.parents[p * 2], b = n.parents[p * 2 + 1];
    if (a && !b && compatible(a, mon)) return p * 2 + 1;
    if (!a && b && compatible(b, mon)) return p * 2;
  }
  for (let p = 0; p < PAIRS; p++) {
    if (!pairUnlocked(state, p)) continue;
    if (!n.parents[p * 2] && !n.parents[p * 2 + 1]) return p * 2;
  }
  return -1;
}

export function bindNursery(api) {
  const { state } = api;
  const root = document.querySelector(".view-nursery");
  if (!root) return;
  const n = ensureNursery(state);
  clearInterval(timer);
  timer = setInterval(() => {
    const el = document.querySelector(".view-nursery .nu-wrap");
    if (!el) { clearInterval(timer); return; }
    const now = Date.now();
    const clk = el.querySelector("[data-gd-clock]");
    if (clk) { const d = new Date(now); clk.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }
    const nx = el.querySelector("[data-egg-next]");
    if (nx) { const ms = []; for (let p = 0; p < PAIRS; p++) { const v = nextEggMs(n, p, now); if (v != null) ms.push(v); } if (ms.length) nx.textContent = fmt(Math.min(...ms)); }
    el.querySelectorAll("[data-egg-timer]").forEach(t => {
      const p = Number(t.dataset.eggTimer), nm = nextEggMs(n, p, now);
      if (nm == null) return;
      t.textContent = fmt(nm);
      const b = el.querySelector(`[data-egg-bar="${p}"]`);
      if (b) b.style.width = `${Math.min(100, (1 - nm / BREED_MS) * 100)}%`;
    });
    el.querySelectorAll("[data-inc-timer]").forEach(x => { const left = Math.max(0, HATCH_MS - (now - Number(x.dataset.incTimer))); x.textContent = left ? fmt(left) : "¡Listo!"; });
    el.querySelectorAll("[data-inc-bar]").forEach(x => { const left = Math.max(0, HATCH_MS - (now - Number(x.dataset.incBar))); x.style.width = `${Math.min(100, (1 - left / HATCH_MS) * 100)}%`; });
  }, 1000);

  root.querySelector("#nu-help").onclick = () => showTip(root.querySelector("#nu-help"), "Guardería", `Deja dos Pokémon de la misma familia (o un Ditto con cualquier otro) en la guardería: toca uno de tu caja y se coloca solo. Cada ${Math.round(BREED_MS / 3600000)} h aparece un huevo de la forma básica (máx. ${EGG_CAP}); las bayas del prado acortan ese tiempo. Pon el huevo en una incubadora: al eclosionar nace un Pokémon de Nv. 5 con naturaleza al azar (¡y con opción de variocolor!). Todo sigue corriendo aunque cierres el juego. Equipa una Piedra Eterna a un huésped y la cría heredará su naturaleza. Las incubadoras 2, 3 y 4 se compran; la 2.ª pareja se abre al completar Johto.`);
  root.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { ui.tab = b.dataset.tab; api.refresh(); });
  root.querySelectorAll("[data-held]").forEach(b => b.onclick = () => { const r = toggleHeld(state, Number(b.dataset.held)); if (!r.ok) return showAlert(r.reason); api.save(); api.refresh(); });
  root.querySelectorAll("[data-ret]").forEach(b => b.onclick = (e) => { e.stopPropagation(); retrieveParent(state, Number(b.dataset.ret)); api.save(); api.refresh(); });
  root.querySelectorAll("[data-inc]").forEach(b => b.onclick = () => {
    const slot = freeIncubator(n);
    if (slot < 0) return;
    startIncubation(n, Number(b.dataset.inc), slot);
    api.save(); api.refresh();
  });
  root.querySelectorAll("[data-pick]").forEach(b => b.onclick = () => openPicker(api, Number(b.dataset.pick)));
  root.querySelectorAll("[data-berry]").forEach(b => b.onclick = () => {
    // La baya se aplica a la pareja a la que le falta menos para el huevo
    let best = null, bestMs = Infinity; const now = Date.now();
    for (let p = 0; p < PAIRS; p++) { const v = nextEggMs(n, p, now); if (v != null && v < bestMs) { best = p; bestMs = v; } }
    if (best == null) return showAlert("Necesitas una pareja completa criando para usar bayas.");
    const r = useBerry(state, best, b.dataset.berry);
    if (!r.ok) return showAlert(r.reason);
    api.save(); api.refresh(); api.tick?.();
  });
  const un = root.querySelector("[data-unlock]");
  if (un) un.onclick = async () => {
    const price = INC_PRICES[n.incUnlocked];
    if (!(await showConfirm({ title: `¿Desbloquear la incubadora ${n.incUnlocked + 1} por ${money(price)} ₽?`, confirmLabel: "Desbloquear" }))) return;
    const r = unlockIncubator(state);
    if (!r.ok) return showAlert(r.reason);
    api.save(); api.refresh(); api.money?.();
  };

  // Caja: buscar y tocar para dejar en la guardería
  const holder = root.querySelector("#gd-pcgrid");
  const fill = () => { holder.innerHTML = gridHtml(boxList(state, ui.q), ui.shown); };
  root.querySelector("#gd-q").oninput = (e) => { ui.q = e.target.value; ui.shown = 60; fill(); };
  holder.onclick = (e) => {
    if (e.target.closest("[data-more]")) { ui.shown += 60; fill(); return; }
    const b = e.target.closest("[data-pc]");
    if (!b) return;
    const mon = state.box[Number(b.dataset.pc)];
    if (!mon) return;
    const slot = autoSlot(state, mon);
    if (slot < 0) return showAlert("No hay un hueco compatible: la pareja necesita ser de la misma familia (o un Ditto con cualquiera), o libera un puesto con ✕.");
    const r = setParent(state, slot, mon);
    if (!r.ok) return showAlert(r.reason);
    ui.tab = "guests";
    api.save(); api.refresh();
  };
}

function openPicker(api, slot) {
  const { state } = api;
  const n = ensureNursery(state);
  const other = n.parents[slot ^ 1];
  let q = "", shown = 60;
  const ov = document.createElement("div");
  ov.className = "np-overlay";
  ov.innerHTML = `<div class="np-box">
    <div class="np-head"><div><h3>Elegir Pokémon</h3><small>${other ? "Solo los de la misma familia, o Ditto con cualquiera." : "Desde tu caja."}</small></div></div>
    <div class="gd-search gd-search-modal"><input type="search" placeholder="Buscar un Pokémon…" autocomplete="off" autocapitalize="off" spellcheck="false"></div>
    <div class="np-list"><div class="np-grid"></div></div>
    <div class="np-foot"><button type="button" data-a="cancel">Cancelar</button></div>
  </div>`;
  document.body.appendChild(ov);
  const gridEl = ov.querySelector(".np-grid");
  const fill = () => { gridEl.innerHTML = gridHtml(boxList(state, q, m => !other || compatible(other, m)), shown, "data-opt"); };
  fill();
  ov.querySelector("input").oninput = (e) => { q = e.target.value; shown = 60; fill(); };
  ov.onclick = (e) => {
    if (e.target === ov || e.target.dataset?.a === "cancel") return ov.remove();
    if (e.target.closest("[data-more]")) { shown += 60; fill(); return; }
    const b = e.target.closest("[data-opt]");
    if (!b) return;
    const r = setParent(state, slot, state.box[Number(b.dataset.opt)]);
    if (!r.ok) { showAlert(r.reason); return; }
    ov.remove(); api.save(); api.refresh();
  };
}

/** Animación de eclosión: el huevo se agita, se rompe y aparece el Pokémon. */
export function showHatchAnim(mon) {
  return new Promise((resolve) => {
    const ov = document.createElement("div");
    ov.className = "hatch-overlay";
    ov.innerHTML = `
      <div class="hatch-stage">
        <i class="egg hatch-egg"></i>
        <div class="hatch-flash"></div>
        <div class="hatch-mon"><img src="${iconSprite(mon)}" alt=""><b>${mon.shiny ? "✦ " : ""}${esc(mon.nameEs || mon.name)}</b><small>¡Ha nacido!</small>${mon._filtered ? `<small class="hatch-filt">${esc(getNature(mon.natureIndex ?? 0).nameEs)}: no coincide con tu filtro → +${mon._familyXp} PE para su familia</small>` : ""}</div>
      </div>`;
    document.body.appendChild(ov);
    const stage = ov.querySelector(".hatch-stage");
    setTimeout(() => stage.classList.add("crack"), 1500);
    setTimeout(() => stage.classList.add("pop"), 2300);
    let done = false;
    const close = () => { if (done) return; done = true; ov.remove(); resolve(); };
    ov.onclick = () => { if (stage.classList.contains("pop")) close(); };
    setTimeout(close, 6500);
  });
}
