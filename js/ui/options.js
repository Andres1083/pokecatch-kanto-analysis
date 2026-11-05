// Ventana de Opciones con pestañas (como el original): General, Guardado, Novedades y Avanzado.
import { CHANGELOG, LATEST } from "../data/changelog.js?v=131";
import { showConfirm } from "./confirm.js?v=131";
import { getSession, signOut } from "../engine/auth.js?v=131";
import { renderChangelogList } from "./changelog-view.js?v=131";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const SEEN_KEY = "pokecatch-kanto-changelog";
const seen = () => { try { return localStorage.getItem(SEEN_KEY); } catch (_) { return null; } };

const TABS = [
  { id: "general", ico: "⚙️", label: "General" },
  { id: "save", ico: "💾", label: "Guardado" },
  { id: "news", ico: "🎟️", label: "Novedades" },
  { id: "adv", ico: "🔒", label: "Avanzado" },
];

/** api: { state, saveGame, clearSave, onHome() } */
export function showOptions(api) {
  const root = document.createElement("div");
  root.className = "opt-overlay";
  let tab = "general";

  const row = (id, title, sub, extra = "") => `<button type="button" class="opt-row" data-act="${id}"><span class="opt-t"><b>${title}</b><small>${sub}</small></span>${extra}<i class="opt-chev">›</i></button>`;
  
  function body() {
    const s = api.state;
    if (tab === "general") {
      const sp = Number(s.speed) || 1;
      const autoOn = s.autoSwitch !== false;
      return `<h3>General</h3><div class="opt-card">
        <div class="opt-row"><span class="opt-t"><b>Velocidad de combate</b><small>Igual que los botones ×1 ×2 ×4 del mapa</small></span>
        <span class="opt-seg">${[1, 2, 4].map((n) => `<button type="button" data-spd="${n}" class="${sp === n ? "on" : ""}">×${n}</button>`).join("")}</span></div>
        <div class="opt-row opt-toggle" data-toggle="autoSwitch"><span class="opt-t"><b>Cambio automático</b><small>Saca al Pokémon más adecuado contra el rival</small></span>
        <span class="opt-switch${autoOn ? " on" : ""}" role="switch" aria-checked="${autoOn}"><i></i></span></div>
      </div>`;
    }
    if (tab === "save") {
      const ses = getSession();
      return `<h3>Guardado</h3><div class="opt-card">
        <div class="opt-row"><span class="opt-t"><b>${esc(ses?.name || s.player?.name || "Entrenador")}</b><small>${ses?.mode === "google" ? "Cuenta conectada" : "Guardado en este navegador"}</small></span></div>
        ${row("save", "Guardar ahora", "Fuerza un guardado inmediato")}
        ${row("home", "Volver al inicio", "Guarda y vuelve a la pantalla de título")}
        ${ses ? row("out", "Cerrar sesión", "Tu partida se queda en este navegador") : ""}
      </div>`;
    }
    if (tab === "news") {
      return `<h3>Novedades</h3><div class="opt-card">${row("log", "Changelogs", "Notas de la versión", seen() === LATEST ? "" : `<em class="opt-new">NEW</em>`)}</div>`;
    }
    return `<h3>Avanzado</h3><div class="opt-card">
      <button type="button" class="opt-row opt-danger" data-act="wipe"><span class="opt-t"><b>Borrar partida</b><small>Borra todo el progreso (pide confirmación)</small></span><i class="opt-chev">›</i></button></div>`;
  }

  function paint() {
    root.innerHTML = `<div class="opt-panel" role="dialog" aria-label="Opciones">
      <div class="opt-head"><span class="opt-gear">⚙️</span><h2>Opciones</h2><button type="button" class="opt-x" aria-label="Cerrar">✕</button></div>
      <div class="opt-tabs" role="tablist">${TABS.map((t) => `<button type="button" role="tab" class="opt-tab${t.id === tab ? " on" : ""}" data-tab="${t.id}"><span>${t.ico}</span>${t.id === tab ? `<em>${t.label}</em>` : ""}${t.id === "news" && seen() !== LATEST ? `<i class="opt-new">NEW</i>` : ""}</button>`).join("")}</div>
      <div class="opt-body">${body()}</div>
      <div class="opt-foot"><span>Autoguardado activo</span><span>Poke'Catch v${LATEST}</span></div></div>`;
  }

  root.addEventListener("click", (e) => {
    if (e.target === root || e.target.closest(".opt-x")) return root.remove();
    const t = e.target.closest("[data-tab]");
    if (t) { tab = t.dataset.tab; return paint(); }
    const sb = e.target.closest("[data-spd]");
    if (sb) {
      api.state.speed = Number(sb.dataset.spd); api.saveGame();
      root.querySelectorAll("[data-spd]").forEach((b) => b.classList.toggle("on", b === sb));
      document.querySelectorAll(".speed-controls button").forEach((b) => b.classList.toggle("active", Number(b.dataset.spd) === api.state.speed));
      return;
    }
    const tg = e.target.closest("[data-toggle]");
    if (tg) {
      const key = tg.dataset.toggle;
      const next = !(api.state[key] !== false);
      api.state[key] = next;
      api.saveGame();
      const sw = tg.querySelector(".opt-switch");
      if (sw) { sw.classList.toggle("on", next); sw.setAttribute("aria-checked", String(next)); }
      return;
    }
    const a = e.target.closest("[data-act]");
    if (!a) return;
    const act = a.dataset.act;
    if (act === "save") { api.saveGame(); a.querySelector("small").textContent = "¡Guardado!"; }
    else if (act === "home") { api.saveGame(); location.reload(); }
    else if (act === "out") { signOut(); api.saveGame(); location.reload(); }
    else if (act === "wipe") { showConfirm({ title: "Se borrará tu partida guardada en este dispositivo. ¿Seguro?", confirmLabel: "Borrar", danger: true }).then(ok => { if (ok) { api.clearSave(); location.reload(); } }); }
    else if (act === "log") {
      try { localStorage.setItem(SEEN_KEY, LATEST); } catch (_) {}
      const p = root.querySelector(".opt-panel");
      p.innerHTML = `<div class="opt-head"><span class="opt-gear">🎟️</span><h2>Changelogs</h2><button type="button" class="opt-x" aria-label="Cerrar">✕</button></div><div class="opt-body opt-log">${renderChangelogList(CHANGELOG)}</div>`;
    }
  });
  paint();
  document.body.appendChild(root);
}
