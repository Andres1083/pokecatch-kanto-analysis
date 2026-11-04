// Mochila: panel plegable + hoja de acción para usar / vender objetos.

import { CATEGORIES, ITEMS, bagKinds, useItem, sellItem } from "../data/items.js?v=125";
import { pixelIcon } from "./pixel.js?v=125";
import { frontSprite } from "../data/sprites.js?v=125";

const icon = (id) => {
  const it = ITEMS[id] || {};
  const name = it.name || id;
  // Icono procedural siempre disponible (offline)
  const fallback = pixelIcon(it.shape || "gem", it.pal || {});
  // Intenta PNG local; si falla, usa el SVG generado
  return `<img class="item-sprite" src="assets/items/${id}.png" alt="${name}" width="36" height="36" data-fb="${fallback}" onerror="this.onerror=null;this.src=this.dataset.fb||''" />`;
};

export function renderBag(state) {
  const kinds = bagKinds(state);
  let body = "";
  if (true) {
    const sections = CATEGORIES.map(cat => {
      const ids = Object.keys(state.bag || {}).filter(id => ITEMS[id]?.cat === cat.key && state.bag[id] > 0);
      if (!ids.length) return "";
      return `
        <div class="bag-cat">${cat.label}</div>
        <div class="bag-grid">
          ${ids.map(id => `
            <button class="bag-tile ${cat.key === "key" ? "key" : ""}" data-item="${id}" title="${ITEMS[id].name}">
              ${icon(id)}
              <span class="bag-qty">×${state.bag[id]}</span>
            </button>`).join("")}
        </div>`;
    }).join("");
    body = sections || `<p class="bag-empty">Aún no tienes objetos. Busca los "?" en la ruta.</p>`;
  }
  return `
    <section class="bag-card" id="bag-card">
      <header class="bag-head" id="bag-toggle">
        <h3>Mochila</h3>
        <button class="bag-help" id="bag-help" aria-label="Ayuda">?</button>
        <span class="bag-count">${kinds} objeto${kinds === 1 ? "" : "s"}</span>
        
      </header>
      ${body}
    </section>`;
}

/** Engancha eventos tras renderizar. `api` = { state, applyXp, xpForNext, onChange } */
export function bindBag(api) {
  const { state } = api;
  const toggle = document.getElementById("bag-toggle");
  if (!toggle) return;
  toggle.onclick = (e) => {
    if (e.target.closest("#bag-help")) return;
    return;
  };
  const help = document.getElementById("bag-help");
  if (help) help.onclick = () => {
    showSheet(`
      <h3>Mochila</h3>
      <p>Aquí se guardan los objetos que encuentras en los puntos <b>?</b> de la ruta
      (o mientras estás ausente): bayas, caramelos, vitaminas, piedras y objetos valiosos.</p>
      <p>Toca un objeto para usarlo con un Pokémon o venderlo.</p>
      <button class="sheet-btn" data-close>Entendido</button>`);
  };
  document.querySelectorAll("[data-item]").forEach(btn => {
    btn.onclick = () => openItem(api, btn.dataset.item);
  });
}

function showSheet(html, onMount) {
  document.querySelector(".sheet-overlay")?.remove();
  const o = document.createElement("div");
  o.className = "sheet-overlay";
  o.innerHTML = `<div class="sheet">${html}</div>`;
  o.addEventListener("click", (e) => {
    if (e.target === o || e.target.closest("[data-close]")) o.remove();
  });
  document.body.appendChild(o);
  if (onMount) onMount(o);
  return o;
}

function openItem(api, id) {
  const { state } = api;
  const it = ITEMS[id];
  if (!it) return;
  const usable = !!it.use;
  const sellable = !!it.sell;

  const team = usable ? `
    <div class="sheet-team">
      ${state.playerTeam.map((m, i) => `
        <button class="sheet-mon" data-use="${i}">
          <img src="${frontSprite(m)}" alt="${m.nameEs}" />
          <span>Nv.${m.level}</span>
          <div class="wb-xp"><div class="fill" style="width:${Math.max(0, (m.currentHp / m.maxHp) * 100)}%"></div></div>
        </button>`).join("")}
    </div>` : "";

  showSheet(`
    <div class="sheet-head">
      <div class="sheet-icon">${icon(id)}</div>
      <div><h3>${it.name}</h3><small>×${state.bag[id]}</small></div>
    </div>
    <p>${it.desc}</p>
    ${usable ? `<p class="sheet-hint">Elige un Pokémon:</p>` : ""}
    ${team}
    <p class="sheet-result" id="sheet-result"></p>
    ${sellable ? `<button class="sheet-btn gold" data-sell>Vender por ${it.sell.toLocaleString("es-ES")} ₽</button>` : ""}
    <button class="sheet-btn" data-close>Cerrar</button>
  `, (o) => {
    o.querySelectorAll("[data-use]").forEach(b => {
      b.onclick = async () => {
        const mon = state.playerTeam[Number(b.dataset.use)];
        const el = o.querySelector("#sheet-result");
        if (api.tryStoneEvolve) {
          const se = await api.tryStoneEvolve(id, mon);
          if (se) {
            el.textContent = se.msg;
            el.className = "sheet-result " + (se.ok ? "ok" : "err");
            if (se.ok) { api.onChange(true); setTimeout(() => o.remove(), 1200); }
            return;
          }
        }
        const r = useItem(state, id, mon, api);
        el.textContent = r.msg;
        el.className = "sheet-result " + (r.ok ? "ok" : "err");
        if (r.ok) { api.onChange(true); setTimeout(() => o.remove(), 900); }
      };
    });
    const sell = o.querySelector("[data-sell]");
    if (sell) sell.onclick = () => {
      const r = sellItem(state, id);
      if (r.ok) { api.onChange(true); o.remove(); }
    };
  });
}
