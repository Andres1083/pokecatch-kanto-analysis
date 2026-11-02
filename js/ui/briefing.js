// Pantalla previa al gimnasio: nivel recomendado, premio y Pokémon que aparecen con su %.

import { frontSprite } from "../data/sprites.js?v=1";
import { encounterTable, periodOf, recommendedLevels } from "../engine/story.js?v=1";
import { pixelIcon } from "./pixel.js?v=1";

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

export function rainTable(segs) {
  const wildSegs = segs.filter(s => s.kind === "route" && s.areas.length);
  const out = new Map(), rainSegs = [];
  for (const seg of wildSegs) {
    const base = new Set(encounterTable(seg, { period: "day" }).map(e => e.id));
    const extra = encounterTable(seg, { period: "day", weather: "rain" }).filter(e => !base.has(e.id));
    if (extra.length) rainSegs.push(seg.name);
    for (const e of extra) out.set(e.id, Math.max(out.get(e.id) || 0, e.pct));
  }
  return { list: [...out.entries()].map(([id, pct]) => ({ id, pct })), rainSegs };
}

/** Secciones de especies: general + exclusivas de noche / lluvia / día. */
function sections(segs) {
  const day = chapterTable(segs, { period: "day" });
  const night = chapterTable(segs, { period: "night" });
  const { list: rain, rainSegs } = rainTable(segs);
  const dayIds = new Set(day.map(e => e.id)), nightIds = new Set(night.map(e => e.id));
  const general = day.filter(e => nightIds.has(e.id));
  const dayOnly = day.filter(e => !nightIds.has(e.id));
  const nightOnly = night.filter(e => !dayIds.has(e.id));
  const rainOnly = rain.filter(e => !dayIds.has(e.id) && !nightIds.has(e.id));
  const ids = new Set([...day, ...night, ...rain].map(e => e.id));
  return { general, dayOnly, nightOnly, rainOnly, rainSegs, ids: [...ids] };
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
export function showBriefing({ chapterName, segs, owned, weather, bg, closeLabel = "CONTINUAR", status = null, actionLabel = null, onAction = null, badgeHtmlStr = null, color = null }) {
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
      { key: "rain", icon: "🌧️", label: "LLUVIA", list: sec.rainOnly, active: rainNow },
      { key: "day", icon: "☀️", label: "DÍA", list: sec.dayOnly, active: nowKey === "day" },
    ].filter(b => b.list.length).sort((a, b) => Number(b.active) - Number(a.active));
    const blockHtml = (b) => `
      <div class="bf-sec ${b.active ? "" : "dim"}">
        <div class="bf-sec-head"><span>${b.icon} ${b.label}</span>${b.active ? `<b class="bf-now">AHORA</b>` : ""}</div>
        <div class="bf-tiles">${b.list.map(e => tileHtml(e.id, owned)).join("")}</div>
      </div>`;
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
          <div class="bf-head2"><span>POKÉMON QUE SE ENCUENTRAN</span><small>${ownedCount}/${sec.ids.length} capturados</small></div>
          <div class="bf-tiles bf-general">${sec.general.map(e => tileHtml(e.id, owned)).join("")}</div>
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
