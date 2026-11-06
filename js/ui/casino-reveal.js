// Escena de canje del Casino (como el original): moneda → plataforma → silueta → revelación → «¡Recibes a X Nv. N!»
import { COIN_CASE } from "../data/casino-assets.js?v=135";
import { frontSprite, artSprite } from "../data/sprites.js?v=135";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/** opts: { price, mon, name, level, resultText } → resuelve al terminar o al saltar. */
export function playCasinoReveal({ price, mon, name, level, resultText }) {
  return new Promise((resolve) => {
    const root = document.createElement("div");
    root.className = "cr-overlay";
    const src = mon ? artSprite({ id: mon.id, shiny: mon.shiny }) : "";
    const fb = mon ? frontSprite({ id: mon.id, shiny: mon.shiny }) : "";
    root.innerHTML = `
      <i class="cr-stars"></i>
      <div class="cr-title">Casino de Ciudad Azulona</div>
      <div class="cr-stage">
        <img class="cr-plat" src="assets/ui/cr-platform.png" alt="">
        <img class="cr-coin" src="assets/items/poke-ball.png" alt="" width="44" height="44">
        <img class="cr-mon" src="${src}" alt="" draggable="false" onerror="this.onerror=null;this.src='${fb}'">
        <span class="cr-spk s1"></span><span class="cr-spk s2"></span><span class="cr-spk s3"></span><span class="cr-spk s4"></span>
      </div>
      <div class="cr-box"><span class="cr-bic"><img src="${COIN_CASE}" alt="" width="30" height="30"></span><p id="cr-text"></p><i class="cr-more">▾</i></div>
      <div class="cr-hint" id="cr-hint"></div>
      <button type="button" class="cr-skip">SALTAR ⏭</button>`;
    document.body.appendChild(root);

    const q = (s) => root.querySelector(s);
    // El GIF animado se amplía con escala entera para conservar el píxel (≈3×)
    const monEl = q(".cr-mon");
    const fit = () => { const k = 3; const w = monEl.naturalWidth, h = monEl.naturalHeight; if (w && h) { const f = Math.min(k, Math.max(1, Math.floor(Math.min(260 / w, 220 / h)))); monEl.style.width = `${w * f}px`; monEl.style.height = `${h * f}px`; } };
    monEl.addEventListener("load", fit); if (monEl.complete) fit();
    let skipped = false, finished = false, tapResolve = null;
    const text = q("#cr-text");
    const wait = (ms) => (skipped ? Promise.resolve() : new Promise((r) => setTimeout(r, ms)));
    const done = () => { if (finished) return; finished = true; root.remove(); resolve(); };
    const say = async (html, plain) => {
      if (skipped) { text.innerHTML = html; return; }
      for (let i = 1; i <= plain.length && !skipped; i++) { text.textContent = plain.slice(0, i); await wait(22); }
      text.innerHTML = html;
    };

    q(".cr-skip").onclick = (e) => { e.stopPropagation(); skipped = true; done(); };
    root.addEventListener("click", () => { if (tapResolve) { const r = tapResolve; tapResolve = null; r(); } });

    (async () => {
      await say(`¡Cambias <b>${esc(price)} fichas</b> por un Pokémon!`, `¡Cambias ${price} fichas por un Pokémon!`);
      await wait(450);
      root.classList.add("cr-coin-on");            // la moneda cae sobre la plataforma
      await wait(900);
      root.classList.add("cr-sil-on");             // silueta blanca
      await wait(900);
      root.classList.add("cr-rev-on");             // revelación con destellos
      await say(`¡Recibes a <b class="cr-hl">${esc(name)}</b>!`, `¡Recibes a ${name}!`);
      await wait(700);
      text.innerHTML = resultText ? esc(resultText) : `¡Recibes a <b class="cr-hl">${esc(name)}</b> Nv. ${esc(level)}!`;
      q("#cr-hint").textContent = "Toca para continuar";
      root.classList.add("cr-end-on");
      if (!skipped && !finished) await new Promise((r) => { tapResolve = r; });
      done();
    })();
  });
}
