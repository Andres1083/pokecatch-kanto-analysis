// Pantalla de Crianza: guardería (2 parejas → huevos) + incubadoras.
import { showTip } from "./tip.js?v=129";
import { showConfirm, showAlert } from "./confirm.js?v=129";
import { iconSprite } from "../data/sprites.js?v=129";
import { ensureNursery, setParent, retrieveParent, startIncubation, compatible, nextEggMs, useBerry, freeIncubator, unlockIncubator, toggleHeld } from "../engine/nursery.js?v=129";
import { BREED_MS, HATCH_MS, EGG_CAP, INCUBATORS, INC_PRICES, PAIRS, pairUnlocked, BREED_BERRIES } from "../data/breeding.js?v=129";
import { ITEMS } from "../data/items.js?v=129";
import { itemImg } from "./item-icon.js?v=129";
import { getNature } from "../data/natures.js?v=129";
import { TYPE_INFO } from "./collection.js?v=129";
import { frontSprite } from "../data/sprites.js?v=129";

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (ms) => { const s = Math.ceil(ms / 1000); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h} h ${String(m).padStart(2, "0")} min` : `${m}:${String(x).padStart(2, "0")}`; };
const egg = (cls = "") => `<i class="egg ${cls}"></i>`;
const money = (n) => Number(n).toLocaleString("es-ES");

export function renderNursery(state) {
  const n = ensureNursery(state);
  const now = Date.now();
  const parent = (m, i) => m
    ? `<div class="nu-par"><img src="${iconSprite(m)}" alt=""><b>${esc(m.nameEs || m.name)}</b><small>Nv. ${m.level} · ${getNature(m.natureIndex ?? 0).nameEs}</small><button type="button" class="nu-held ${n.held[i] ? "on" : ""}" data-held="${i}">${n.held[i] ? `${itemImg(n.held[i], 16, "")} ${ITEMS[n.held[i]].name}` : "＋ Objeto"}</button><button type="button" data-ret="${i}">Retirar</button></div>`
    : `<button type="button" class="nu-par empty" data-pick="${i}"><span>＋</span><small>Elegir de la caja</small></button>`;

  const pairHtml = (p) => {
    if (!pairUnlocked(state, p)) {
      return `<div class="dx-card nu-card nu-locked"><h3>Pareja ${p + 1}</h3><div class="nu-lock">🔒 Se desbloquea al completar la historia de Johto</div></div>`;
    }
    const a = n.parents[p * 2], b = n.parents[p * 2 + 1];
    const nm = nextEggMs(n, p, now);
    const berries = Object.keys(BREED_BERRIES).map(id => {
      const q = state.bag?.[id] || 0;
      return `<button type="button" class="nu-berry" data-berry="${id}" data-pair="${p}" ${q > 0 ? "" : "disabled"} title="${ITEMS[id].name}: −${Math.round(BREED_BERRIES[id] / 60000)} min">${itemImg(id, 26, "")}<small>×${q}</small><em>−${BREED_BERRIES[id] >= 3600000 ? BREED_BERRIES[id] / 3600000 + " h" : BREED_BERRIES[id] / 60000 + " min"}</em></button>`;
    }).join("");
    return `<div class="dx-card nu-card">
      <h3>Pareja ${p + 1}</h3>
      <div class="nu-pair">${parent(a, p * 2)}<span class="nu-heart">♥</span>${parent(b, p * 2 + 1)}</div>
      <div class="nu-status">${a && b
        ? (n.eggs.length >= EGG_CAP ? "Tienes demasiados huevos en espera." : `Próximo huevo en <b data-egg-timer="${p}">${fmt(nm ?? 0)}</b>`)
        : "Misma familia, o un Ditto con cualquiera."}</div>
      ${a && b ? `<div class="nu-bar"><i data-egg-bar="${p}" style="width:${Math.min(100, (1 - (nm ?? 0) / BREED_MS) * 100)}%"></i></div><div class="nu-berries">${berries}</div>` : ""}
    </div>`;
  };

  const free = freeIncubator(n);
  return `
  <div class="nu-wrap">
    <div class="dx-head"><h2>Crianza</h2><button type="button" id="nu-help" class="dx-help" aria-label="Ayuda">?</button></div>
    ${Array.from({ length: PAIRS }, (_, p) => pairHtml(p)).join("")}
    <div class="dx-card nu-card">
      <h3>Huevos <small>${n.eggs.length} / ${EGG_CAP}</small></h3>
      ${n.eggs.length ? `<div class="nu-eggs">${n.eggs.map((e, i) => `<button type="button" class="nu-egg" data-inc="${i}" ${free < 0 ? "disabled" : ""}>${egg()}${e.nature != null ? `<em class="nu-nat" title="Naturaleza heredada">🔒 ${getNature(e.nature).nameEs}</em>` : ""}<small>${free < 0 ? "Sin incubadora libre" : "Incubar"}</small></button>`).join("")}</div>` : `<p class="nu-none">Aún no hay huevos.</p>`}
    </div>
    <div class="dx-card nu-card">
      <h3>Incubadoras <small>${n.incUnlocked} / ${INCUBATORS}</small></h3>
      <div class="nu-incs">${n.incubators.map((x, i) => {
        if (i >= n.incUnlocked) {
          const next = i === n.incUnlocked;
          return `<div class="nu-inc locked">🔒${next ? `<button type="button" data-unlock="1">Desbloquear<br><b>${money(INC_PRICES[i])} ₽</b></button>` : `<small>${money(INC_PRICES[i])} ₽</small>`}</div>`;
        }
        if (!x) return `<div class="nu-inc empty"><small>Libre</small></div>`;
        const left = Math.max(0, HATCH_MS - (now - x.startedAt));
        return `<div class="nu-inc">${egg("warm")}<b data-inc-timer="${x.startedAt}">${fmt(left)}</b><div class="nu-bar"><i data-inc-bar="${x.startedAt}" style="width:${Math.min(100, (1 - left / HATCH_MS) * 100)}%"></i></div></div>`;
      }).join("")}</div>
    </div>
  </div>`;
}

let timer = null;

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
    el.querySelectorAll("[data-egg-timer]").forEach(t => {
      const p = Number(t.dataset.eggTimer), nm = nextEggMs(n, p, now);
      if (nm == null) return;
      t.textContent = fmt(nm);
      const b = el.querySelector(`[data-egg-bar="${p}"]`);
      if (b) b.style.width = `${Math.min(100, (1 - nm / BREED_MS) * 100)}%`;
    });
    el.querySelectorAll("[data-inc-timer]").forEach(x => { const left = Math.max(0, HATCH_MS - (now - Number(x.dataset.incTimer))); x.textContent = fmt(left); });
    el.querySelectorAll("[data-inc-bar]").forEach(x => { const left = Math.max(0, HATCH_MS - (now - Number(x.dataset.incBar))); x.style.width = `${Math.min(100, (1 - left / HATCH_MS) * 100)}%`; });
  }, 1000);

  root.querySelector("#nu-help").onclick = () => showTip(root.querySelector("#nu-help"), "Crianza", `Deja dos Pokémon de la misma familia (o un Ditto con cualquier otro) en la guardería. Cada ${Math.round(BREED_MS / 3600000)} h aparece un huevo de la forma básica (máx. ${EGG_CAP}); las bayas acortan ese tiempo. Pon el huevo en una incubadora: al eclosionar nace un Pokémon de Nv. 5 con naturaleza al azar (¡y con opción de variocolor!). Todo sigue corriendo aunque cierres el juego. Equipa una Piedra Eterna a un huésped y la cría heredará su naturaleza. Las incubadoras 2, 3 y 4 se compran; la 2.ª pareja se abre al completar Johto.`);
  root.querySelectorAll("[data-held]").forEach(b => b.onclick = () => { const r = toggleHeld(state, Number(b.dataset.held)); if (!r.ok) return showAlert(r.reason); api.save(); api.refresh(); });
  root.querySelectorAll("[data-ret]").forEach(b => b.onclick = () => { retrieveParent(state, Number(b.dataset.ret)); api.save(); api.refresh(); });
  root.querySelectorAll("[data-inc]").forEach(b => b.onclick = () => {
    const slot = freeIncubator(n);
    if (slot < 0) return;
    startIncubation(n, Number(b.dataset.inc), slot);
    api.save(); api.refresh();
  });
  root.querySelectorAll("[data-pick]").forEach(b => b.onclick = () => openPicker(api, Number(b.dataset.pick)));
  root.querySelectorAll("[data-berry]").forEach(b => b.onclick = () => {
    const r = useBerry(state, Number(b.dataset.pair), b.dataset.berry);
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
}

function openPicker(api, slot) {
  const { state } = api;
  const n = ensureNursery(state);
  const other = n.parents[slot ^ 1];
  const list = (state.box || []).filter(m => !other || compatible(other, m));
  const card = (m, i) => {
    const types = m.types || [];
    const icons = types.map(t => TYPE_INFO[t] ? `<span class="coll-type" title="${TYPE_INFO[t].label}"><img class="type-icon" src="${TYPE_INFO[t].icon}" alt="" draggable="false" /></span>` : "").join("");
    return `<button type="button" class="coll-card nu-opt" data-i="${i}" style="border-color:${TYPE_INFO[types[0]]?.color || "#cbd5e1"}"><span class="coll-lv">Nv.${m.level}</span><span class="coll-types">${icons}</span><img src="${frontSprite(m)}" alt="" draggable="false" /><span class="coll-dex">#${m.id}</span>${m.shiny ? `<b class="mon-shiny">✦</b>` : ""}<span class="coll-name">${esc(m.nameEs || m.name)}</span></button>`;
  };
  const ov = document.createElement("div");
  ov.className = "np-overlay";
  ov.innerHTML = `<div class="np-box">
    <div class="np-head"><div><h3>Elegir Pokémon</h3><small>${other ? "Solo los de la misma familia, o Ditto con cualquiera." : "Desde tu caja."}</small></div></div>
    <div class="np-list">${list.length ? `<div class="coll-grid">${list.map((m, i) => card(m, i)).join("")}</div>` : `<p class="nu-none">No hay Pokémon disponibles en la caja.</p>`}</div>
    <div class="np-foot"><button type="button" data-a="cancel">Cancelar</button></div>
  </div>`;
  document.body.appendChild(ov);
  ov.onclick = (e) => {
    if (e.target === ov || e.target.dataset?.a === "cancel") return ov.remove();
    const b = e.target.closest(".nu-opt");
    if (!b) return;
    const r = setParent(state, slot, list[Number(b.dataset.i)]);
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
        <div class="hatch-mon"><img src="${iconSprite(mon)}" alt=""><b>${mon.shiny ? "✦ " : ""}${esc(mon.nameEs || mon.name)}</b><small>¡Ha nacido!</small></div>
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
