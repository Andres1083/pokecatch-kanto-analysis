// Pantalla de título: sprites con movimiento, Continuar/Nueva partida, Cómo jugar, Invitado / Google.
import { frontSprite } from "../data/sprites.js?v=137";
import { showConfirm } from "./confirm.js?v=137";
import { CHANGELOG, LATEST } from "../data/changelog.js?v=137";
import { renderChangelogList } from "./changelog-view.js?v=137";
import { getSession, playAsGuest, signInWithGoogle, signOut, googleAvailable } from "../engine/auth.js?v=137";

const BALLS = ["poke-ball", "great-ball", "ultra-ball"];
const HOWTO = [
  ["🎒", "Tu aventura avanza sola", "Tu equipo recorre rutas, combate y captura Pokémon salvajes aunque cierres el juego. Al volver verás el resumen."],
  ["⚔️", "Gimnasios y Liga", "Cada capítulo termina con un líder. Vence a los 8, a la Liga Pokémon y al Campeón. Puedes repetir capítulos para subir de nivel."],
  ["🎯", "Capturas", "Cada Pokémon salvaje puede capturarse con tus Poké Balls. Usa el filtro de capturas para elegir cuáles."],
  ["🥚", "Guardería", "Deja a dos Pokémon en la guardería para conseguir huevos y eclosionarlos."],
  ["🎰", "Casino", "Tras la medalla Trueno juega en la tragaperras con Pokédólares y cambia las fichas por premios."],
  ["⏩", "Velocidad", "Cambia la velocidad del combate arriba. El clima y la hora cambian los Pokémon que aparecen."],
];

export function showTitle({ hasSave, onContinue, onNew }) {
  const app = document.getElementById("app");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const seenLog = () => { try { return localStorage.getItem("pokecatch-kanto-changelog"); } catch (_) { return null; } };
  const render = () => {
    const ses = getSession();
    app.innerHTML = `
      <div class="ttl" id="ttl">
        <div class="ttl-field" id="ttl-field"></div>
        <div class="ttl-main">
          <h1 class="ttl-logo">Poke'<span>Catch</span></h1>
          <div class="ttl-actions">
            ${hasSave
              ? `<button class="ttl-btn ttl-primary" id="t-go">CONTINUAR</button>`
              : `<button class="ttl-btn ttl-primary" id="t-go">NUEVA PARTIDA</button>`}
            ${hasSave ? `<button class="ttl-link" id="t-new">Empezar una partida nueva</button>` : ""}
            <div class="ttl-row">
              <button class="ttl-btn ttl-dark" id="t-how">CÓMO JUGAR</button>
              <button class="ttl-btn ttl-dark ttl-cl" id="t-log">🎟️ CHANGELOGS${seenLog() === LATEST ? "" : `<i class="ttl-new">NEW</i>`}</button>
            </div>
            ${ses
              ? `<div class="ttl-ses">${ses.photo ? `<img src="${esc(ses.photo)}" alt="" referrerpolicy="no-referrer">` : `<span class="ttl-ava">${ses.mode === "guest" ? "👤" : "🙂"}</span>`}
                   <span>Sesión: <b>${esc(ses.name)}</b>${ses.mode === "guest" ? " (invitado)" : ""}</span>
                   <button class="ttl-link" id="t-out">Cerrar sesión</button></div>`
              : `<button class="ttl-btn ttl-google" id="t-google"><svg viewBox="0 0 48 48" width="20" height="20"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg> INICIAR SESIÓN CON GOOGLE</button>
                 <button class="ttl-btn ttl-dark" id="t-guest">JUGAR COMO INVITADO</button>`}
            <div class="ttl-msg" id="t-msg"></div>
          </div>
        </div>
        <p class="ttl-legal">Proyecto fan personal y sin ánimo de lucro. Pokémon y los nombres asociados son marcas de Nintendo, Game Freak y Creatures.<br>Sprites: PokéAPI.</p>
      </div>`;
    wander(document.getElementById("ttl-field"));
    bind();
  };

  const msg = (t) => { const m = document.getElementById("t-msg"); if (m) m.textContent = t || ""; };
  const go = () => { stopWander(); hasSave ? onContinue() : onNew(); };

  function bind() {
    const $ = (id) => document.getElementById(id);
    $("t-go").onclick = () => { if (!getSession()) playAsGuest(); go(); };
    $("t-new")?.addEventListener("click", async () => {
      if (await showConfirm({ title: "Se borrará tu partida guardada en este dispositivo. ¿Empezar de nuevo?", confirmLabel: "Empezar", danger: true })) { if (!getSession()) playAsGuest(); stopWander(); onNew(); }
    });
    $("t-how").onclick = showHow;
    $("t-log").onclick = showLog;
    $("t-guest")?.addEventListener("click", () => { playAsGuest(); render(); });
    $("t-out")?.addEventListener("click", () => { signOut(); render(); });
    $("t-google")?.addEventListener("click", async () => {
      if (!googleAvailable()) { msg("Google aún no está configurado. Juega como invitado por ahora."); return; }
      msg("Abriendo Google…");
      try { await signInWithGoogle(); render(); } catch (e) { msg(e.message); }
    });
  }

  function showLog() {
    try { localStorage.setItem("pokecatch-kanto-changelog", LATEST); } catch (_) {}
    const d = document.createElement("div");
    d.className = "ttl-modal";
    d.innerHTML = `<div class="ttl-card"><button class="ttl-x" aria-label="Cerrar">✕</button><h2>Changelogs</h2>
      <div class="ttl-cl">${renderChangelogList(CHANGELOG)}</div>
      <button class="ttl-btn ttl-primary" style="margin-top:.6rem;width:100%">CERRAR</button></div>`;
    d.addEventListener("click", (e) => { if (e.target === d || e.target.closest(".ttl-x,.ttl-primary")) { d.remove(); const n = document.querySelector("#t-log .ttl-new"); if (n) n.remove(); } });
    app.querySelector("#ttl").appendChild(d);
  }

  function showHow() {
    const d = document.createElement("div");
    d.className = "ttl-modal";
    d.innerHTML = `<div class="ttl-card"><button class="ttl-x" aria-label="Cerrar">✕</button><h2>Cómo jugar</h2>
      ${HOWTO.map(([i, t, p]) => `<div class="ttl-how"><span>${i}</span><div><b>${t}</b><p>${p}</p></div></div>`).join("")}
      <button class="ttl-btn ttl-primary" style="margin-top:.6rem;width:100%">¡ENTENDIDO!</button></div>`;
    d.addEventListener("click", (e) => { if (e.target === d || e.target.closest(".ttl-x,.ttl-primary")) d.remove(); });
    app.querySelector("#ttl").appendChild(d);
  }

  // ── Sprites y pokéballs que deambulan ──
  let timers = [];
  function stopWander() { timers.forEach(clearTimeout); timers = []; }
  function wander(field) {
    stopWander();
    const W = () => field.clientWidth, H = () => field.clientHeight;
    const make = (src, size, ball) => {
      const el = document.createElement("img");
      el.src = src; el.alt = ""; el.className = "ttl-mon" + (ball ? " ttl-ball" : "");
      el.style.width = el.style.height = size + "px";
      let x = Math.random() * (W() - size), y = Math.random() * (H() - size);
      let dir = 1;
      const place = (ms) => {
        el.style.transition = `translate ${ms}ms ${ball ? "cubic-bezier(.3,1.6,.5,1)" : "linear"}`; // solo la posición se anima
        el.style.translate = `${x}px ${y}px`;
        el.style.transform = `scaleX(${dir})`;
      };
      place(0);
      field.appendChild(el);
      const step = () => {
        const nx = Math.max(0, Math.min(W() - size, x + (Math.random() - .5) * 260));
        const ny = Math.max(0, Math.min(H() - size, y + (Math.random() - .5) * 220));
        dir = nx >= x ? -1 : 1; // los sprites miran a la izquierda por defecto
        const ms = 1800 + Math.hypot(nx - x, ny - y) * 18;
        x = nx; y = ny; place(ms);
        timers.push(setTimeout(step, ms + 400 + Math.random() * 2200));
      };
      timers.push(setTimeout(step, 300 + Math.random() * 1500));
    };
    const ids = new Set();
    while (ids.size < 9) ids.add(1 + ((Math.random() * 151) | 0));
    [...ids].forEach((id) => make(frontSprite(id), 88 + ((Math.random() * 36) | 0))); // solo título
    for (let i = 0; i < 4; i++) make(`assets/items/${BALLS[i % BALLS.length]}.png`, 34, true);
  }

  render();
}
