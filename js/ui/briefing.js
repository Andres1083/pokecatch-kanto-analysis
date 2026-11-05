// Pantalla previa al gimnasio: nivel recomendado, premio y Pokémon que aparecen con su %.

import { frontSprite } from "../data/sprites.js?v=131";
import { encounterTable, periodOf, recommendedLevels } from "../engine/story.js?v=131";
import { pixelIcon } from "./pixel.js?v=131";
import { ITEMS } from "../data/items.js?v=131";
import { itemImg } from "./item-icon.js?v=131";

const fmt = (n) => Number(n).toLocaleString("es-ES");
const pctLabel = (p) => (p < 1 ? "<1 %" : `${p >= 10 ? Math.round(p) : p.toFixed(1).replace(".", ",")} %`);

/** Promedio de las tablas de todos los tramos con salvajes. */
function chapterTable(segs, ctx) {
  const wildSegs = segs.filter(s => s.kind === "route" && s.areas.length);
  const acc = new Map();
  for (const seg of wildSegs) {
    for (const e of encounterTable(seg, ctx)) acc.set(e.id, (acc.get(e.id) || 0) + e.pct / wildSegs.length);
  }
  return [...acc.entries()].map(([id, pct]) => ({ id, pct })).sort((a, b) => b.pct - a.pct);
}

export function rainTable(segs, weather = "rain") {
  const wildSegs = segs.filter(s => s.kind === "route" && s.areas.length);
  const out = new Map(), rainSegs = [];
  for (const seg of wildSegs) {
    const base = new Set(encounterTable(seg, { period: "day" }).map(e => e.id));
    const extra = encounterTable(seg, { period: "day", weather }).filter(e => !base.has(e.id));
    if (extra.length) rainSegs.push(seg.name);
    for (const e of extra) out.set(e.id, Math.max(out.get(e.id) || 0, e.pct));
  }
  return { list: [...out.entries()].map(([id, pct]) => ({ id, pct })), rainSegs };
}

/** Secciones de especies: general + noche / día / lluvia / tormenta (como el original, sin repetir especies). */
function sections(segs) {
  const day = chapterTable(segs, { period: "day" });
  const night = chapterTable(segs, { period: "night" });
  const { list: rain, rainSegs } = rainTable(segs);
  const dayMap = new Map(day.map(e => [e.id, e.pct])), nightMap = new Map(night.map(e => [e.id, e.pct]));
  const all = new Set([...dayMap.keys(), ...nightMap.keys()]);
  const nightOnly = [], dayOnly = [], general = [];
  for (const id of all) {
    const d = dayMap.get(id) || 0, n = nightMap.get(id) || 0;
    const e = { id, pct: Math.max(d, n) };
    if (n > d * 1.35 + 0.01) nightOnly.push(e);       // aparece sobre todo de noche
    else if (d > n * 1.35 + 0.01) dayOnly.push(e);     // aparece sobre todo de día
    else general.push(e);
  }
  const byPct = (a, b) => b.pct - a.pct;
  nightOnly.sort(byPct); dayOnly.sort(byPct); general.sort(byPct);
  const rainOnly = rain.filter(e => !all.has(e.id));
  // Tormenta: especies que solo salen con tormenta (si el juego distingue lluvia de tormenta)
  const stormList = rainTable(segs, "storm").list.filter(e => !all.has(e.id) && !rainOnly.some(r => r.id === e.id));
  const ids = new Set([...all, ...rain.map(e => e.id), ...stormList.map(e => e.id)]);
  return { general, dayOnly, nightOnly, rainOnly, stormOnly: stormList, rainSegs, ids: [...ids] };
}

/** Objetos del capítulo: el que se encuentra una sola vez (find) + los que dan los nodos «?». */
function itemsOf(segs, have) {
  const found = segs.map(s => s.find).filter(Boolean);
  const hasQ = segs.some(s => s.kind === "route" && s.item);
  const list = [];
  for (const f of found) if (f.item && ITEMS[f.item]) list.push({ id: f.item, once: true, got: !!(have.bag && have.bag[f.item] > 0) || !!(have.flags && f.once && have.flags.includes(f.once)) });
  if (hasQ) {
    const pool = Object.entries(ITEMS).filter(([, v]) => v.cat !== "key").sort((a, b) => (b[1].weight || 1) - (a[1].weight || 1));
    const pick = ["berry-oran", "candy-s", "candy-m", "berry-pecha", "candy-l", "rare-candy", "stone-fire", "vit-hp"].filter(id => ITEMS[id]);
    for (const id of (pick.length ? pick : pool.slice(0, 6).map(([k]) => k)).slice(0, 6)) list.push({ id, once: false, got: !!(have.bag && have.bag[id] > 0) });
  }
  return list;
}

const tileHtml = (id, owned) => `<div class="bf-tile ${owned.has(id) ? "own" : ""}"><img src="${frontSprite(id)}" alt="#${id}" /><span class="bf-ball"></span></div>`;

function overlayShell(inner, color) {
  const overlay = document.createElement("div");
  overlay.className = "wb-overlay bf-overlay";
  overlay.innerHTML = `<div class="wb-card bf-card" role="dialog" aria-modal="true" style="--bc:${color || "#3a4268"}">${inner}</div>`;
  document.body.appendChild(overlay);
  return overlay;
}

/**
 * Detalle de capítulo.
 * status: "done" | "current" | "todo" | null · onAction: acción del botón inferior (si actionLabel).
 */
export function showBriefing({ chapterName, segs, owned, weather, bg, closeLabel = "CONTINUAR", status = null, actionLabel = null, onAction = null, badgeHtmlStr = null, color = null, have = {} }) {
  return new Promise((resolve) => {
    const gym = segs.find(s => s.gym)?.gym;
    const now = periodOf();
    const nowKey = now === "night" ? "night" : "day";
    const sec = sections(segs);
    const ownedCount = sec.ids.filter(id => owned.has(id)).length;
    const [lo, hi] = gym ? recommendedLevels(gym) : [1, 5];
    const rainNow = weather === "rain" || weather === "storm";

    const blocks = [
      { key: "night", icon: "🌙", label: "NOCHE", list: sec.nightOnly, active: nowKey === "night" },
      { key: "rain", icon: "🌧️", label: "LLUVIA", list: sec.rainOnly, active: weather === "rain" },
      { key: "storm", icon: "⛈️", label: "TORMENTA", list: sec.stormOnly, active: weather === "storm" },
      { key: "day", icon: "☀️", label: "DÍA", list: sec.dayOnly, active: nowKey === "day" },
    ].filter(b => b.list.length).sort((a, b) => Number(b.active) - Number(a.active));
    const blockHtml = (b) => `
      <div class="bf-sec ${b.active ? "" : "dim"}">
        <div class="bf-sec-head"><span>${b.icon} ${b.label}</span>${b.active ? `<b class="bf-now">AHORA</b>` : ""}</div>
        <div class="bf-tiles">${b.list.map(e => tileHtml(e.id, owned)).join("")}</div>
      </div>`;
    const its = itemsOf(segs, have);
    const itemsHtml = its.length ? `
          <div class="bf-head2"><span>OBJETOS QUE SE ENCUENTRAN</span><small>${its.some(i => i.once) ? `${its.filter(i => i.once && i.got).length}/${its.filter(i => i.once).length} encontrados` : ""}</small></div>
          <div class="bf-items">${its.map(i => `<span class="bf-item ${i.once ? "once" : ""} ${i.got ? "got" : ""}" title="${ITEMS[i.id].name}">${itemImg(i.id, 30)}</span>`).join("")}</div>` : "";
    const periodChip = nowKey === "night" ? "🌙 Noche" : "☀️ Día";

    const overlay = overlayShell(`
      ${gym ? `<div class="bf-hero" style="background-image:url('${bg}')">
        ${status === "done" ? `<span class="bf-done">✓ Completado</span>` : ""}
        <button type="button" class="bf-x" aria-label="Cerrar">✕</button>
        <img class="bf-idle" src="assets/trainers/${gym.sprite}.png" alt="${gym.leaderEs}" onerror="this.remove()" /></div>` : ""}
      <div class="bf-scroll">
        <div class="bf-body">
          <div class="bf-title">${badgeHtmlStr || `<img src="${pixelIcon("gem", { a: "#f1f5f9", b: "#9aa9c2", c: "#ffffff" })}" alt="" width="40" height="40" style="width:40px;height:40px" />`}<h2>${chapterName}</h2></div>
          ${gym ? `<div class="bf-chips">
            <span class="bf-chip green">Nv. recomendado <b>${lo}–${hi}</b></span>
            <span class="bf-chip">${gym.leaderEs}</span>
            <span class="bf-chip type" style="--tc:${gym.color || "#94a3b8"}">${gym.typeEs}</span>
            <span class="bf-chip">Recompensa ${fmt(gym.reward)} ₽</span>
            <span class="bf-chip blue2">${periodChip}</span>
          </div>` : ""}
          ${sec.rainSegs.length ? `<div class="bf-chip blue">🌧️ Lluvia : ${sec.rainSegs.join(", ")}</div>` : ""}
          ${itemsHtml}
          <div class="bf-head2"><span>POKÉMON QUE SE ENCUENTRAN</span><small>${ownedCount}/${sec.ids.length} capturados</small></div>
          ${sec.general.length ? `<div class="bf-tiles bf-general">${sec.general.map(e => tileHtml(e.id, owned)).join("")}</div>` : ""}
          ${blocks.map(blockHtml).join("")}
          <div class="bf-gap"></div>
        </div>
      </div>
      <div class="bf-foot"><button type="button" class="bf-go">${actionLabel || closeLabel}</button></div>`, color || gym?.color);
        let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      clearTimeout(autoT);
      overlay.remove();
      resolve();
    };
    // Idle: si no tocas, sigue solo a los 4.5 s
    const autoT = setTimeout(close, 4500);
    overlay.querySelector(".bf-x")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    overlay.querySelector(".bf-go")?.addEventListener("click", () => { close(); if (actionLabel && onAction) onAction(); });
  });
}

/** Detalle de la Liga Pokémon: lista de entrenadores con nivel recomendado y tope. */
export function showLeague({ trainers, bg, unlocked, beaten, onAction }) {
  return new Promise((resolve) => {
    const lo = Math.min(...trainers.map(t => t.lo)), hi = Math.max(...trainers.map(t => t.hi));
    const reward = trainers.reduce((a, t) => a + (t.reward || 0), 0);
    const hero = trainers.map((t, i) => `<img class="bf-idle ${t.champ && !beaten ? "sil" : ""}" style="left:${4 + i * 19}%" src="assets/trainers/${t.sprite}.png" alt="" onerror="this.remove()">`).join("");
    const rows = trainers.map(t => {
      const hidden = t.champ && !beaten;
      return `<div class="bf-tr"><span class="bf-trf"><img class="${hidden ? "sil" : ""}" src="assets/trainers/${t.sprite}.png" alt="" onerror="this.remove()"></span>
        <div class="bf-trn"><b>${hidden ? "???" : t.name}</b>${hidden ? "" : `<span class="bf-chip type" style="--tc:${t.color}">${t.type}</span>`}</div>
        <div class="bf-trr"><span class="bf-chip ${t.hi >= 86 ? "gold" : "green"}">Nv. recomendado <b>${t.lo}–${t.hi}</b></span><small>Tope <b>${t.top}</b></small></div></div>`;
    }).join("");
    const overlay = overlayShell(`
      <div class="bf-hero bf-league" style="background-image:url('${bg}')">
        <button type="button" class="bf-x" aria-label="Cerrar">✕</button>${hero}</div>
      <div class="bf-scroll"><div class="bf-body">
        <div class="bf-title"><i class="bf-master"></i><h2>Liga Pokémon</h2></div>
        <div class="bf-chips col">
          <span class="bf-chip gold">Nv. recomendado <b>${lo}–${hi}</b></span>
          <span class="bf-chip">${trainers.length} Entrenadores seguidos</span>
          <span class="bf-chip">Recompensa ${fmt(reward)} ₽</span>
          <span class="bf-chip red">Una derrota = vuelta al 1.er Entrenador</span>
        </div>
        <div class="bf-head2"><span>ENTRENADORES</span></div>
        <div class="bf-trs">${rows}</div>
        <div class="bf-gap"></div>
      </div></div>
      <div class="bf-foot"><button type="button" class="bf-go" ${unlocked ? "" : "disabled"}>${unlocked ? "ENTRAR EN LA LIGA" : "🔒 VENCE A LOS 8 LÍDERES"}</button></div>`, "#c9a227");
    const close = () => { overlay.remove(); resolve(); };
    overlay.querySelector(".bf-x")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    overlay.querySelector(".bf-go").onclick = () => { if (!unlocked) return; close(); onAction?.(); };
  });
}
