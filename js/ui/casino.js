// Casino: tragaperras + tienda de premios (fichas)
import { SYMBOLS, PAYS, PAY_TWO, MULTS, BASE_BET, prizeFor, SPIN_SPEED, STRIP, SHOP_KANTO, SHOP_NEXT, spinGrid, evalGrid, casinoUnlocked, CASINO_BADGES } from "../data/casino.js?v=1";
import { CASINO_BG, COIN_CASE, COIN_FRAMES } from "../data/casino-assets.js?v=1";
import { frontSprite } from "../data/sprites.js?v=1";
import { DEX_NAMES } from "../data/dex-names.js?v=1";
import { itemImg } from "./item-icon.js?v=1";
import { dexSets } from "./dex.js?v=1";

const fmt = (n) => Number(n).toLocaleString("es-ES");
const ui = { tab: "slots", mult: 1, spinning: false, auto: false, grid: null };
const wait = (ms) => new Promise(r => setTimeout(r, ms));

function symHtml(key) {
  const s = SYMBOLS[key];
  if (s.mon) return `<img class="cs-sym" src="${frontSprite(s.mon)}" alt="" draggable="false" onerror="this.style.visibility='hidden'">`;
  if (s.item) return `<span class="cs-sym cs-berry">${itemImg(s.item, 44)}</span>`;
  return `<b class="cs-sym cs-${key}">${s.label}</b>`;
}
const cell = (key) => `<div class="cs-cell">${symHtml(key)}</div>`;
const coin = (n = 18) => `<img class="cs-coin-ic" src="${COIN_CASE}" width="${n}" height="${n}" alt="">`;

function startGrid() {
  if (!ui.grid) ui.grid = [0, 7, 14].map(i => [STRIP[i], STRIP[i + 1], STRIP[i + 2]]);
  return ui.grid;
}

function slotsHtml(state) {
  const g = startGrid();
  const marks = `<div class="cs-marks">${[["2", 17], ["4", 33.5], ["1", 50], ["5", 66.5], ["3", 83]].map(([n, p]) => `<i style="top:${p}%">${n}</i>`).join("")}</div>`;
  const prizeRows = [
    ["seven", "seven", "seven"], ["bar", "bar", "bar"], ["pika", "pika", "pika"], ["magne", "magne", "magne"],
    ["psy", "psy", "psy"], ["shell", "shell", "shell"], ["berry", "berry", "berry"], ["berry", "berry", null], ["shell", "shell", null],
  ].map(r => {
    const pay = r[2] ? PAYS[r[0]] : PAY_TWO[r[0]];
    return `<div class="cs-prize ${r[0] === "seven" ? "top" : ""}">${r.map(k => `<span class="cs-pcell">${k ? symHtml(k) : ""}</span>`).join("")}<b>${fmt(prizeFor(pay, ui.mult))} ${coin(20)}</b></div>`;
  }).join("");
  return `
  <div class="cs-stage" style="background-image:url('${CASINO_BG}')">
    <div class="cs-machine">
      <div class="cs-bulbs"></div>
      <div class="cs-head">
        <div class="cs-box"><small>DINERO</small><b id="cs-money">${fmt(state.money)} ₽</b></div>
        <div class="cs-title">CASINO<small>CIUDAD AZULONA</small></div>
        <div class="cs-box"><small>FICHAS</small><b id="cs-f2">${coin(16)} ${fmt(state.fichas || 0)}</b></div>
      </div>
      <div class="cs-rw">
        ${marks}
        <div class="cs-reels">${g.map((col, c) => `<div class="cs-reel" data-r="${c}"><div class="cs-strip">${col.map(cell).join("")}</div></div>`).join("")}</div>
        ${marks}
        <div class="cs-lever" id="cs-lever"><i></i><u></u></div>
      </div>
      <div class="cs-ctl">
        <button type="button" class="cs-auto ${ui.auto ? "on" : ""}" id="cs-auto" aria-label="Tiradas automáticas">⟳</button>
        <button type="button" class="cs-spin" id="cs-spin"><small id="cs-bet">${fmt(BASE_BET * ui.mult)} ₽</small><span>LANZAR</span></button>
        <button type="button" class="cs-mult" id="cs-mult">×${ui.mult}</button>
      </div>
      <div class="cs-win" id="cs-winpop"></div>
    </div>
  </div>
  <div class="cs-card"><div class="cs-ptitle"><h3>Premios</h3><button type="button" class="cs-q" id="cs-help2">?</button><span>Tragaperras</span></div>${prizeRows}</div>`;
}

function shopHtml(state) {
  const { caught, seen } = dexSets(state);
  const owned = SHOP_KANTO.filter(p => caught.has(p.id)).length;
  const row = (p, locked) => {
    const known = p.id && (locked ? seen.has(p.id) : true);
    const can = !locked && (state.fichas || 0) >= p.price;
    return `<div class="cs-item ${locked ? "locked" : ""}">
      <div class="cs-icon ${known ? "" : "unk"}">${known ? `<img src="${frontSprite(p.id)}" alt="" onerror="this.style.visibility='hidden'">` : `<span>?</span>`}${!locked && caught.has(p.id) ? `<i class="cs-own"></i>` : ""}</div>
      <div class="cs-iname"><b>${known ? DEX_NAMES[p.id - 1] : "???"}</b><small>Nv. ${p.level}</small></div>
      <button type="button" class="cs-buy ${can ? "" : "no"}" ${locked ? "disabled" : `data-buy="${p.id}"`}>${coin(26)}<b>${fmt(p.price)}</b></button>
    </div>`;
  };
  return `
  <div class="cs-card"><div class="cs-ptitle"><h3>Casino de Ciudad Azulona</h3><span>${owned} / ${SHOP_KANTO.length}</span></div>
    ${SHOP_KANTO.map(p => row(p, false)).join("")}
    <div class="cs-next"><i>🔒</i><h3>Próximo Casino</h3><span>Otra región · ${SHOP_NEXT.filter(p => p.id && seen.has(p.id)).length} / ${SHOP_NEXT.length}</span></div>
    ${SHOP_NEXT.map(p => row(p, true)).join("")}
  </div>`;
}

export const casinoBusy = () => ui.spinning || ui.auto;

export function renderCasino(state) {
  if (!casinoUnlocked(state)) {
    return `<div class="cs-lockmsg"><div class="cs-lockic">🔒</div><h3>Casino de Ciudad Azulona</h3><p>Se abre al conseguir la medalla Trueno (${CASINO_BADGES}.ª) y poder viajar a Ciudad Azulona.</p></div>`;
  }
  return `
  <div class="cs-wrap">
    <div class="cs-top"><button type="button" class="cs-q" id="cs-help">?</button><span class="cs-fichas"><b id="cs-fichas">${fmt(state.fichas || 0)}</b> fichas</span></div>
    <div class="cs-tabs">
      <button type="button" data-cst="slots" class="${ui.tab === "slots" ? "on" : ""}">TRAGAPERRAS</button>
      <button type="button" class="lock" disabled>PACHINKO 🔒</button>
      <button type="button" data-cst="shop" class="${ui.tab === "shop" ? "on" : ""}">TIENDA</button>
    </div>
    ${ui.tab === "shop" ? shopHtml(state) : slotsHtml(state)}
  </div>`;
}

const RULES = "Tragaperras de 3 carretes y 5 líneas de pago (1 fila del medio, 2 arriba, 3 abajo, 4 y 5 diagonales). Pagas 1000 ₽ × el multiplicador (×1, ×5, ×10, ×50) y los premios se pagan en fichas, también × el multiplicador (los carretes giran más rápido con multiplicadores altos). 3 iguales pagan la tabla; 2 bayas o 2 Shellder al inicio de una línea también pagan. Las fichas se canjean por Pokémon en la tienda. ⟳ activa las tiradas automáticas.";

export function bindCasino(api) {
  const root = document.querySelector(".view-casino");
  if (!root || root.dataset.bound) return;
  root.dataset.bound = "1";
  const { state } = api;
  const rerender = () => { root.innerHTML = renderCasino(state); };
  root.addEventListener("click", async (e) => {
    const t = e.target;
    if (t.closest("#cs-help, #cs-help2")) return alert(RULES);
    const tab = t.closest("[data-cst]");
    if (tab) { ui.tab = tab.dataset.cst; ui.auto = false; rerender(); return; }
    if (t.closest("#cs-mult")) {
      ui.mult = MULTS[(MULTS.indexOf(ui.mult) + 1) % MULTS.length];
      rerender(); return;
    }
    if (t.closest("#cs-auto")) {
      ui.auto = !ui.auto;
      t.closest("#cs-auto").classList.toggle("on", ui.auto);
      if (ui.auto && !ui.spinning) runAuto(api);
      return;
    }
    if (t.closest("#cs-spin, #cs-lever")) { if (!ui.spinning) await spin(api); return; }
    const buy = t.closest("[data-buy]");
    if (buy) {
      const p = SHOP_KANTO.find(x => x.id === Number(buy.dataset.buy));
      if (!p) return;
      if ((state.fichas || 0) < p.price) return api.toast(`Te faltan ${fmt(p.price - state.fichas)} fichas`);
      if (!confirm(`¿Canjear ${fmt(p.price)} fichas por ${DEX_NAMES[p.id - 1]} Nv. ${p.level}?`)) return;
      const msg = await api.buy(p);
      api.toast(msg);
      rerender();
    }
  });
}

async function runAuto(api) {
  while (ui.auto && document.querySelector("#cs-spin")) {
    const ok = await spin(api);
    if (!ok) { ui.auto = false; document.querySelector("#cs-auto")?.classList.remove("on"); break; }
    await wait(350);
  }
}

function setFichas(n) {
  const a = document.getElementById("cs-fichas"), b = document.getElementById("cs-f2");
  if (a) a.textContent = fmt(n);
  if (b) b.innerHTML = `${coin(16)} ${fmt(n)}`;
}

/** Una tirada completa. Devuelve false si no hay dinero suficiente. */
async function spin(api) {
  const { state } = api;
  if (ui.spinning) return true;
  const cost = BASE_BET * ui.mult;
  if (state.money < cost) { api.toast("No tienes suficientes pokédólares"); return false; }
  state.money -= cost;
  const st = state.stats;
  st.slotSpins = (st.slotSpins || 0) + 1;
  const { grid } = spinGrid();
  const ev = evalGrid(grid);
  const won = prizeFor(ev.total, ui.mult);
  const before = state.fichas || 0;
  state.fichas = before + won;
  st.fichasWon = (st.fichasWon || 0) + won;
  const prev = startGrid();
  ui.grid = grid;
  ui.spinning = true;
  api.hud();
  const pop = document.getElementById("cs-winpop");
  if (pop) pop.className = "cs-win";
  document.querySelectorAll(".cs-cell.win").forEach(c => c.classList.remove("win"));
  document.getElementById("cs-lever")?.classList.add("pull");

  const reels = [...document.querySelectorAll(".cs-reel")];
  await Promise.all(reels.map(async (reel, c) => {
    const strip = reel.querySelector(".cs-strip");
    const h = reel.clientHeight / 3;
    if (!strip || !h) return;
    const K = 10 + c * 6;
    const seq = [...prev[c], ...Array.from({ length: K }, () => STRIP[Math.floor(Math.random() * STRIP.length)]), ...grid[c]];
    strip.style.height = `${seq.length * h}px`;
    strip.style.setProperty("--ch", `${h}px`);
    strip.innerHTML = seq.map(cell).join("");
    const a = strip.animate([{ transform: "translateY(0)" }, { transform: `translateY(${-(seq.length - 3) * h}px)` }],
      { duration: (650 + c * 330) / (SPIN_SPEED[ui.mult] || 1), easing: "cubic-bezier(.25,.8,.3,1)", fill: "forwards" });
    try { await a.finished; } catch (_) {}
    strip.style.height = ""; strip.style.removeProperty("--ch");
    strip.innerHTML = grid[c].map(cell).join("");
    a.cancel();
  }));
  document.getElementById("cs-lever")?.classList.remove("pull");
  ui.spinning = false;

  if (won > 0) {
    for (const w of ev.wins) for (const [c, r] of w.cells) document.querySelector(`.cs-reel[data-r="${c}"] .cs-cell:nth-child(${r + 1})`)?.classList.add("win");
    const pop2 = document.getElementById("cs-winpop");
    if (pop2) { pop2.innerHTML = `<span class="cs-spincoin" style="background-image:url('${COIN_FRAMES}')"></span> +${fmt(won)} fichas`; pop2.className = "cs-win show"; }
    try { api.sfx?.(); } catch (_) {}
    // contador
    const steps = Math.min(12, won), t0 = before;
    for (let i = 1; i <= steps; i++) { setFichas(Math.round(t0 + (won * i) / steps)); await wait(40); }
  }
  setFichas(state.fichas);
  api.save();
  return true;
}
