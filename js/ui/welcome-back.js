// Modal "¡Bienvenido de nuevo!" con lo ganado mientras estabas ausente.

import { frontSprite } from "../data/sprites.js?v=2";
import { ITEMS } from "../data/items.js?v=2";
import { itemImg } from "./item-icon.js?v=2";
import { pixelIcon } from "./pixel.js?v=2";

export function formatAway(ms) {
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 1) return `${Math.max(1, Math.round(ms / 1000))} s`;
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

const fmt = (n) => Number(n).toLocaleString("es-ES");

/** Devuelve una promesa que se resuelve al cerrar el modal. */
export function showWelcomeBack(report) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "wb-overlay";

    const team = report.team.map(t => `
      <div class="wb-mon ${t.fainted ? "ko" : ""}">
        ${t.levels > 0 ? `<span class="wb-plus">+${t.levels}</span>` : ""}
        <img src="${frontSprite(t.id)}" alt="${t.name}" />
        <span class="wb-lv">Nv. ${t.level}</span>
        <div class="wb-xp"><div class="fill" style="width:${t.xpPct}%"></div></div>
      </div>`).join("");

    const items = report.items.length ? `
      <div class="wb-section">
        <span>OBJETOS</span>
      </div>
      <div class="wb-items">
        ${report.items.map(i => `
          <div class="wb-item" title="${ITEMS[i.id].name}">
            ${itemImg(i.id, 28)}
            <b>×${i.qty}</b>
          </div>`).join("")}
      </div>` : "";

    const caps = report.captures || [];
    const groups = new Map();
    for (const c of caps) {
      const k = `${c.id}:${c.shiny ? 1 : 0}`;
      const g = groups.get(k) || { id: c.id, name: c.name, shiny: c.shiny, nuevo: 0, rep: 0, lib: 0 };
      if (c.status === "team" || c.status === "box") g.nuevo++;
      else if (c.status === "family") g.rep++;
      else g.lib++;
      groups.set(k, g);
    }
    const list = [...groups.values()].sort((x, y) => (y.shiny - x.shiny) || (y.nuevo - x.nuevo));
    const newCount = caps.filter(c => c.status === "team" || c.status === "box").length;
    const line = (g) => [g.nuevo ? `${g.nuevo} nuevo${g.nuevo > 1 ? "s" : ""}` : "", g.rep ? `${g.rep} repetido${g.rep > 1 ? "s" : ""}` : "", g.lib ? `${g.lib} liberado${g.lib > 1 ? "s" : ""}` : ""].filter(Boolean).join(" · ");
    const capHtml = `
      <div class="wb-section"><span>CAPTURADOS</span><b>${caps.length} · ${newCount} nuevos</b></div>
      ${list.length ? `<div class="wb-caps">${list.map(g => `
        <div class="wb-cap ${g.nuevo ? "" : "dim"}">
          ${g.shiny ? `<i class="wb-shiny">✦</i>` : ""}
          ${g.nuevo + g.rep + g.lib > 1 ? `<em class="wb-n">×${g.nuevo + g.rep + g.lib}</em>` : ""}
          <img src="${frontSprite({ id: g.id, shiny: g.shiny })}" alt="${g.name}" />
          <span class="wb-cn">${g.name}</span>
          <small>${line(g)}</small>
        </div>`).join("")}</div>` : `<p class="wb-none">No capturaste ningún Pokémon.</p>`}`;

    overlay.innerHTML = `
      <div class="wb-card" role="dialog" aria-modal="true" aria-label="Bienvenido de nuevo">
        <div class="wb-head">
          <h2>¡Bienvenido de nuevo!</h2>
          <span class="wb-away">ausente ${formatAway(report.elapsedMs)}${report.capped ? "<br><small>(máx. 8 h)</small>" : ""}</span>
          <button class="wb-x" aria-label="Cerrar">✕</button>
        </div>
        <div class="wb-body">
          <div class="wb-stats">
            <div class="wb-stat"><small>Combates ganados</small><b>${fmt(report.wins)}</b></div>
            <div class="wb-stat"><small>Dinero</small><b class="gold">+${fmt(report.money)} ₽</b></div>
            <div class="wb-stat"><small>Derrotas</small><b>${fmt(report.losses)}</b></div>
          </div>
          <div class="wb-section"><span>EQUIPO</span><b>+${report.totalLevels} niveles</b></div>
          <div class="wb-team">${team}</div>
          ${capHtml}
          ${items}
          <button class="wb-ok">¡GENIAL!</button>
        </div>
      </div>`;

    const close = () => {
      overlay.remove();
      document.removeEventListener("keydown", onKey);
      resolve();
    };
    const onKey = (e) => { if (e.key === "Escape" || e.key === "Enter") close(); };
    overlay.querySelector(".wb-x").onclick = close;
    overlay.querySelector(".wb-ok").onclick = close;
    document.addEventListener("keydown", onKey);
    document.body.appendChild(overlay);
    overlay.querySelector(".wb-ok").focus();
  });
}
