// Efectos visuales de combate y captura

import { fxFamilyForMove } from "../data/fx-moves.js?v=135";
import { BattleFX } from "./battle-fx-canvas.js?v=135";

const BALL_SRC = "assets/items/poke-ball.png";

export function familyForMove(move) {
  if (!move) return "contact";
  const t = (move.type || "").toLowerCase();
  const name = (move.name || move.nameEs || "").toLowerCase();
  if (/bite|crunch|mord|mastic/.test(name)) return "morsure";
  if (/slash|cut|scissor|x-scissor|entail|cuchill|corte/.test(name)) return "entaille";
  if (/punch|poing|hammer|megapunch/.test(name)) return "poing";
  if (/beam|pulse|ray|thunderbolt|ice-beam|flamethrower|hyper-beam/.test(name)) return "rayon";
  if (/ember|fire|flamethrower|overheat|lava/.test(name) || t === "fire") return "fire";
  if (/water|hydro|surf|bubble|aqua/.test(name) || t === "water") return "water";
  if (/thunder|spark|volt|electro|shock/.test(name) || t === "electric") return "electric";
  if (/leaf|razor-leaf|solar|vine|grass/.test(name) || t === "grass") return "grass";
  if (/rock|stone|roll/.test(name) || t === "rock") return "projectile";
  if (/gust|air|aerial|fly|wing|hurricane/.test(name) || t === "flying") return "ciel";
  if (move.category === "status") return "zone";
  if (move.category === "special") return "rayon";
  return "contact";
}

function sceneEl() {
  return document.querySelector("#scene");
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const TYPE_COL = {
  fire: ["#ffe27a", "#ff5a14"], water: ["#c9ecff", "#2f86ff"], electric: ["#fffbb0", "#f2c200"],
  grass: ["#d2f7a2", "#35a83a"], ice: ["#f0fdff", "#6fd0ee"], fighting: ["#ffe6bf", "#d0562a"],
  poison: ["#efc2ff", "#9b3fc4"], ground: ["#efdca8", "#a6783a"], flying: ["#ffffff", "#9fb2ff"],
  psychic: ["#ffd0ea", "#e43f98"], bug: ["#e2f87a", "#7ea820"], rock: ["#ece0b4", "#8b7a45"],
  ghost: ["#d7c5ff", "#5a3f8f"], dragon: ["#fff0b0", "#ff7a1a"], dark: ["#a69aa0", "#2a2226"],
  steel: ["#f5f8fb", "#8a97a8"], fairy: ["#ffe0f1", "#f27fb8"], normal: ["#ffffff", "#c7c7c7"],
};

// Forma de la partícula según el tipo (para proyectiles y ráfagas)
const TYPE_SHAPE = (() => {
  const orbF = (t, size) => { const [a, b] = TYPE_COL[t]; return `width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff 0,${a} 30%,${b} 75%,transparent 100%);box-shadow:0 0 ${size}px ${b};`; };
  const o = {};
  for (const t of Object.keys(TYPE_COL)) o[t] = orbF(t, 14);
  o.water = `width:13px;height:19px;margin:-9px 0 0 -6px;border-radius:50% 50% 50% 50%/65% 65% 35% 35%;background:radial-gradient(circle at 35% 30%,#fff,${TYPE_COL.water[0]} 35%,${TYPE_COL.water[1]});`;
  o.grass = `width:20px;height:10px;margin:-5px 0 0 -10px;border-radius:0 100% 0 100%;background:linear-gradient(135deg,${TYPE_COL.grass[0]},${TYPE_COL.grass[1]});`;
  o.ice = `width:13px;height:24px;margin:-12px 0 0 -6px;background:linear-gradient(${TYPE_COL.ice[0]},${TYPE_COL.ice[1]});clip-path:polygon(50% 0,100% 100%,0 100%);`;
  o.electric = `width:16px;height:16px;margin:-8px 0 0 -8px;background:${TYPE_COL.electric[0]};clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);box-shadow:0 0 10px ${TYPE_COL.electric[1]};`;
  return o;
})();

function relRect(el, SR) {
  const r = el.getBoundingClientRect();
  return { x: r.left - SR.left, y: r.top - SR.top, w: r.width, h: r.height, cx: r.left - SR.left + r.width / 2, cy: r.top - SR.top + r.height / 2 };
}


// Motor canvas portado del original (js/engine/battle-fx-canvas.js).
// Devuelve true si el movimiento se animó con él; false → se usa el motor CSS de abajo.
// play() resuelve en el IMPACTO (como en el original); la animación sigue unos instantes,
// así que la capa se limpia después, salvo que otro ataque haya empezado ya.
let canvasFxToken = 0;
async function playCanvasFx(scene, move, side, speed) {
  const slug = (move?.name || move?.key || "").toLowerCase().trim().replace(/\s+/g, "-");
  if (!slug || !BattleFX.has(slug)) return false;
  const atkSide = document.querySelector(side === "ally" ? "#ally-side" : "#enemy-side");
  const defSide = document.querySelector(side === "ally" ? "#enemy-side" : "#ally-side");
  const defImg = document.querySelector(side === "ally" ? "#enemy-img" : "#ally-img");
  if (!atkSide || !defSide || !defImg) return false;
  const token = ++canvasFxToken;
  const layer = document.createElement("div");
  layer.style.cssText = "position:absolute;inset:0;z-index:30;pointer-events:none;overflow:hidden;";
  scene.appendChild(layer);
  const cleanup = () => {
    layer.remove();
    if (token !== canvasFxToken) return; // ya empezó otro ataque: él se encarga
    for (const el of [atkSide, defSide]) { el.style.transform = ""; el.style.opacity = ""; el.style.filter = ""; el.style.clipPath = ""; }
    scene.style.transform = "";
    document.querySelectorAll(".fxclone").forEach((m) => m.remove());
  };
  try {
    const ok = await BattleFX.play({
      move: slug, attEl: atkSide, defEl: defSide, fxEl: layer, shakeEl: scene,
      mirror: side !== "ally", speed,
      onImpact: () => { defImg.classList.remove("anim-hit"); void defImg.offsetWidth; defImg.classList.add("anim-hit"); },
    });
    setTimeout(cleanup, ok ? 900 / speed : 0);
    return !!ok;
  } catch (e) {
    console.warn("BattleFX canvas falló, uso el motor CSS", e);
    cleanup();
    return false;
  }
}

export async function playMoveFx({ move, side = "ally", speed = 1 } = {}) {
  const scene = sceneEl();
  if (!scene) return;
  const sp = Math.max(0.6, speed || 1);
  const T = (ms) => ms / sp;
  // 1) Motor canvas del original (pixel-art). Si el movimiento está en FX_MOVES, se usa ese.
  if (await playCanvasFx(scene, move, side, sp)) return;
  const type = (move?.type || "normal").toLowerCase();
  const [c1, c2] = TYPE_COL[type] || TYPE_COL.normal;
  let kind = fxFamilyForMove(move);
  // "signature" = movimiento único: se resuelve por tipo
  if (kind === "signature") kind = ({ fire: "fire", water: "water", electric: "electric", grass: "grass", fighting: "poing", flying: "ciel", ground: "projectile", rock: "projectile", normal: "contact", bug: "contact", steel: "contact" })[type] || "type";
  if (kind === "mental") kind = "type";
  if (kind === "souffle" && ["fire", "water"].includes(type)) kind = type;
  if (kind === "rayon" && type === "electric") kind = "electric";

  const atkImg = document.querySelector(side === "ally" ? "#ally-img" : "#enemy-img");
  const defImg = document.querySelector(side === "ally" ? "#enemy-img" : "#ally-img");
  if (!atkImg || !defImg) { await delay(T(300)); return; }
  const SR = scene.getBoundingClientRect();
  const A = relRect(atkImg, SR), D = relRect(defImg, SR);
  // Origen tipo "boca": un poco arriba y hacia el rival (no el pecho/centro)
  const mouthY = A.y + A.h * 0.38;
  const mouthX = side === "ally" ? (A.x + A.w * 0.72) : (A.x + A.w * 0.28);
  A.cx = mouthX;
  A.cy = mouthY;
  const flip = side === "ally" ? " scaleX(-1)" : "";
  const dist = Math.hypot(D.cx - A.cx, D.cy - A.cy);
  const ang = Math.atan2(D.cy - A.cy, D.cx - A.cx) * 180 / Math.PI;

  const layer = document.createElement("div");
  layer.style.cssText = "position:absolute;inset:0;z-index:30;pointer-events:none;overflow:hidden;";
  scene.appendChild(layer);
  const mk = (css, html = "") => { const e = document.createElement("div"); e.style.cssText = "position:absolute;left:0;top:0;will-change:transform,opacity;" + css; e.innerHTML = html; layer.appendChild(e); return e; };
  const go = (el, kf, ms, o = {}) => el.animate(kf, { duration: T(ms), fill: "forwards", easing: "ease-out", ...o }).finished.catch(() => {});
  const at = (x, y, extra = "") => `translate(${x}px,${y}px)${extra}`;

  // Pequeños elementos reutilizables
  const orb = (size, color2 = c2, color1 = c1) => `width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff 0,${color1} 30%,${color2} 75%,transparent 100%);box-shadow:0 0 ${size}px ${c2};`;
  const fly = (el, ms, { arc = 0, spin = 0, scale = [1, 1], delayMs = 0, from = A, to = D, jitter = 0 } = {}) => {
    const N = 10, kf = [];
    const jx = (Math.random() - .5) * jitter, jy = (Math.random() - .5) * jitter;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = from.cx + (to.cx + jx - from.cx) * t;
      const y = from.cy + (to.cy + jy - from.cy) * t - Math.sin(Math.PI * t) * arc;
      kf.push({ transform: at(x, y, ` rotate(${spin * t}deg) scale(${scale[0] + (scale[1] - scale[0]) * t})`), opacity: i === 0 ? 0 : 1, offset: t });
    }
    return el.animate(kf, { duration: T(ms), delay: T(delayMs), fill: "both", easing: "linear" }).finished.catch(() => {});
  };
  const burst = (x, y, n = 8, size = 8, spread = 46) => {
    const ps = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * .5, r = spread * (.6 + Math.random() * .6);
      const e = mk(`width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;border-radius:50%;background:${i % 2 ? c1 : c2};box-shadow:0 0 6px ${c1};`);
      ps.push(go(e, [{ transform: at(x, y, " scale(1)"), opacity: 1 }, { transform: at(x + Math.cos(a) * r, y + Math.sin(a) * r, " scale(.2)"), opacity: 0 }], 360));
    }
    const fl = mk(`width:70px;height:70px;margin:-35px 0 0 -35px;border-radius:50%;background:radial-gradient(#fff,${c1} 40%,transparent 70%);`);
    ps.push(go(fl, [{ transform: at(x, y, " scale(.3)"), opacity: 1 }, { transform: at(x, y, " scale(1.4)"), opacity: 0 }], 320));
    return Promise.all(ps);
  };
  const lunge = async () => {
    const dx = (D.cx - A.cx) * 0.6, dy = (D.cy - A.cy) * 0.6;
    await go(atkImg, [{ transform: "translate(0,0)" + flip }, { transform: `translate(${dx}px,${dy}px)` + flip + " scale(1.1)" }], 170, { easing: "ease-in", fill: "none" });
  };
  const back = () => go(atkImg, [{ transform: `translate(${(D.cx - A.cx) * 0.6}px,${(D.cy - A.cy) * 0.6}px)` + flip }, { transform: "translate(0,0)" + flip }], 170, { fill: "none" });
  const recoil = () => go(atkImg, [{ transform: "scale(1)" + flip }, { transform: "scale(1.12)" + flip, offset: .4 }, { transform: "scale(1)" + flip }], 220, { fill: "none" });
  const hit = async () => {
    defImg.classList.remove("anim-hit"); void defImg.offsetWidth; defImg.classList.add("anim-hit");
    go(defImg, [{ filter: "brightness(1)" }, { filter: `brightness(2.4) drop-shadow(0 0 6px ${c1})`, offset: .3 }, { filter: "brightness(1)" }], 300, { fill: "none" });
  };

  try {
    switch (kind) {
      case "contact":
      case "poing": {
        await lunge();
        hit();
        const big = kind === "poing";
        await Promise.all([burst(D.cx, D.cy, big ? 12 : 8, big ? 10 : 8, big ? 60 : 46), back()]);
        break;
      }
      case "entaille": {
        await lunge();
        hit();
        const sl = [];
        for (let i = 0; i < 3; i++) {
          const e = mk(`width:90px;height:7px;margin:-3px 0 0 -45px;border-radius:4px;background:linear-gradient(90deg,transparent,#fff,${c1},transparent);box-shadow:0 0 8px ${c1};`);
          const ox = (i - 1) * 16, oy = (i - 1) * 14;
          sl.push(go(e, [{ transform: at(D.cx + ox - 20, D.cy + oy - 20, " rotate(-40deg) scaleX(0)"), opacity: 1 }, { transform: at(D.cx + ox + 10, D.cy + oy + 10, " rotate(-40deg) scaleX(1)"), opacity: 1, offset: .5 }, { transform: at(D.cx + ox + 14, D.cy + oy + 14, " rotate(-40deg) scaleX(1)"), opacity: 0 }], 300, { delay: T(i * 70) }));
        }
        await Promise.all([...sl, back()]);
        break;
      }
      case "morsure": {
        await lunge();
        hit();
        const jaw = (dir) => `width:56px;height:30px;margin:-15px 0 0 -28px;background:#f5f5f5;clip-path:polygon(0 ${dir > 0 ? 100 : 0}%,12% ${dir > 0 ? 20 : 80}%,25% ${dir > 0 ? 100 : 0}%,38% ${dir > 0 ? 20 : 80}%,50% ${dir > 0 ? 100 : 0}%,62% ${dir > 0 ? 20 : 80}%,75% ${dir > 0 ? 100 : 0}%,88% ${dir > 0 ? 20 : 80}%,100% ${dir > 0 ? 100 : 0}%,100% ${dir > 0 ? 0 : 100}%,0 ${dir > 0 ? 0 : 100}%);filter:drop-shadow(0 0 4px ${c2});`;
        const j1 = mk(jaw(1)), j2 = mk(jaw(-1));
        await Promise.all([
          go(j1, [{ transform: at(D.cx, D.cy - 46), opacity: 1 }, { transform: at(D.cx, D.cy - 12), opacity: 1, offset: .6 }, { transform: at(D.cx, D.cy - 12), opacity: 0 }], 340),
          go(j2, [{ transform: at(D.cx, D.cy + 46), opacity: 1 }, { transform: at(D.cx, D.cy + 12), opacity: 1, offset: .6 }, { transform: at(D.cx, D.cy + 12), opacity: 0 }], 340),
          back(),
        ]);
        await burst(D.cx, D.cy, 6, 6, 34);
        break;
      }
      case "rayon": {
        recoil();
        const beam = mk(`width:${dist}px;height:16px;margin-top:-8px;border-radius:8px;transform-origin:0 50%;background:linear-gradient(90deg,${c2},#fff,${c1});box-shadow:0 0 16px ${c1},0 0 30px ${c2};`);
        const base = at(A.cx, A.cy, ` rotate(${ang}deg)`);
        await go(beam, [{ transform: base + " scaleX(0) scaleY(.4)", opacity: 1 }, { transform: base + " scaleX(1) scaleY(1)", opacity: 1, offset: .35 }, { transform: base + " scaleX(1) scaleY(1.4)", opacity: 1, offset: .75 }, { transform: base + " scaleX(1) scaleY(.2)", opacity: 0 }], 460);
        hit();
        burst(D.cx, D.cy, 8, 8, 50);
        break;
      }
      case "queue": {
        // Cola: el atacante gira y barre con un arco
        const dx = (D.cx - A.cx) * 0.6, dy = (D.cy - A.cy) * 0.6;
        await go(atkImg, [{ transform: "translate(0,0) rotate(0deg)" + flip }, { transform: `translate(${dx}px,${dy}px) rotate(${side === "ally" ? -25 : 25}deg)` + flip, offset: .5 }, { transform: `translate(${dx}px,${dy}px) rotate(${side === "ally" ? 25 : -25}deg)` + flip }], 260, { easing: "ease-in-out", fill: "none" });
        const arc = mk(`width:90px;height:90px;margin:-45px 0 0 -45px;border-radius:50%;border:8px solid transparent;border-top-color:${c1};border-right-color:${c2};box-shadow:0 0 12px ${c1};`);
        hit();
        await Promise.all([go(arc, [{ transform: at(D.cx, D.cy, " rotate(-120deg) scale(.6)"), opacity: 1 }, { transform: at(D.cx, D.cy, " rotate(120deg) scale(1.2)"), opacity: 0 }], 360), back()]);
        break;
      }
      case "bec": {
        // Picotazos: tres golpes rápidos
        const dx = (D.cx - A.cx) * 0.55, dy = (D.cy - A.cy) * 0.55;
        for (let i = 0; i < 3; i++) {
          await go(atkImg, [{ transform: "translate(0,0)" + flip }, { transform: `translate(${dx}px,${dy}px)` + flip }, { transform: "translate(0,0)" + flip }], 150, { easing: "ease-in-out", fill: "none" });
          burst(D.cx + (i - 1) * 12, D.cy - 6 + i * 6, 4, 5, 26);
        }
        hit(); await delay(T(120));
        break;
      }
      case "pied": {
        // Patada: embestida con giro y onda de choque
        const dx = (D.cx - A.cx) * 0.62, dy = (D.cy - A.cy) * 0.62;
        await go(atkImg, [{ transform: "translate(0,0) rotate(0deg)" + flip }, { transform: `translate(${dx}px,${dy}px) rotate(${side === "ally" ? 30 : -30}deg)` + flip + " scale(1.12)" }], 190, { easing: "ease-in", fill: "none" });
        hit();
        const ring = mk(`width:60px;height:60px;margin:-30px 0 0 -30px;border-radius:50%;border:5px solid ${c1};box-shadow:0 0 12px ${c2};`);
        await Promise.all([burst(D.cx, D.cy, 10, 9, 56), go(ring, [{ transform: at(D.cx, D.cy, " scale(.3)"), opacity: 1 }, { transform: at(D.cx, D.cy, " scale(1.8)"), opacity: 0 }], 360), back()]);
        break;
      }
      case "piege": {
        // Atrapar: anillos que se cierran sobre el rival
        hit();
        const rs = [];
        for (let i = 0; i < 3; i++) {
          const r = mk(`width:90px;height:90px;margin:-45px 0 0 -45px;border-radius:50%;border:5px solid ${i % 2 ? c1 : c2};box-shadow:0 0 10px ${c1};`);
          rs.push(go(r, [{ transform: at(D.cx, D.cy, " scale(1.7) rotate(0deg)"), opacity: 0 }, { transform: at(D.cx, D.cy, " scale(1.3) rotate(60deg)"), opacity: 1, offset: .3 }, { transform: at(D.cx, D.cy, " scale(.5) rotate(180deg)"), opacity: 0 }], 520, { delay: T(i * 110) }));
        }
        await Promise.all(rs);
        break;
      }
      case "drain": {
        // Drenaje: las partículas viajan del rival hacia el atacante
        hit();
        const ps = [];
        for (let i = 0; i < 6; i++) { const e = mk(orb(14, c2, c1)); ps.push(fly(e, 420, { delayMs: i * 60, from: D, to: A, arc: 26, jitter: 30 })); }
        await Promise.all(ps);
        go(atkImg, [{ filter: "brightness(1)" }, { filter: `brightness(1.8) drop-shadow(0 0 8px ${c1})` }, { filter: "brightness(1)" }], 320, { fill: "none" });
        await delay(T(150));
        break;
      }
      case "rafale": {
        recoil();
        const ps = [];
        const rs = TYPE_SHAPE[type] || orb(12);
        for (let i = 0; i < 5; i++) { const e = mk(rs); ps.push(fly(e, 300, { delayMs: i * 70, jitter: 30, spin: type === "grass" || type === "ice" ? 360 : 0 })); }
        await Promise.all(ps);
        hit(); await burst(D.cx, D.cy, 8, 7, 44);
        break;
      }
      case "projectile": {
        recoil();
        const solid = ["ground", "rock", "normal", "fighting", "steel", "bug", "dark"].includes(type);
        const e = mk(solid
          ? `width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:30%;background:radial-gradient(circle at 35% 30%,#fff,${c1} 35%,${c2});box-shadow:0 0 6px rgba(0,0,0,.4);`
          : (TYPE_SHAPE[type] || orb(14)));
        const extra = [];
        if (!solid) for (let i = 1; i <= 3; i++) extra.push(fly(mk(TYPE_SHAPE[type] || orb(14)), 380, { arc: 40 - i * 6, spin: 360, delayMs: i * 60, jitter: 18 }));
        await Promise.all([fly(e, 380, { arc: 50, spin: solid ? 540 : 180 }), ...extra]);
        e.remove(); hit();
        if (["ground", "rock"].includes(type)) {
          const ps = [];
          for (let i = 0; i < 7; i++) {
            const d = mk(`width:9px;height:9px;margin:-4px 0 0 -4px;background:${i % 2 ? c1 : c2};border-radius:2px;`);
            const dx = (Math.random() - .5) * 90;
            ps.push(go(d, [{ transform: at(D.cx, D.cy + 20), opacity: 1 }, { transform: at(D.cx + dx * .5, D.cy - 40 - Math.random() * 20, ` rotate(${dx * 4}deg)`), opacity: 1, offset: .5 }, { transform: at(D.cx + dx, D.cy + 30, ` rotate(${dx * 8}deg)`), opacity: 0 }], 420));
          }
          await Promise.all(ps);
        } else await burst(D.cx, D.cy, 8, 7, 44);
        break;
      }
      case "zone": {
        const rings = [];
        for (let i = 0; i < 3; i++) {
          const r = mk(`width:60px;height:60px;margin:-30px 0 0 -30px;border-radius:50%;border:4px solid ${i % 2 ? c1 : c2};box-shadow:0 0 12px ${c1};`);
          rings.push(go(r, [{ transform: at(A.cx, A.cy, " scale(.3)"), opacity: .9 }, { transform: at(A.cx, A.cy, " scale(3)"), opacity: 0 }], 520, { delay: T(i * 130) }));
        }
        await Promise.all(rings);
        break;
      }
      case "souffle": {
        recoil();
        const ps = [];
        for (let i = 0; i < 6; i++) {
          const e = mk(`width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:radial-gradient(${c1},${c2} 80%,transparent);filter:blur(2px);`);
          ps.push(fly(e, 380, { delayMs: i * 55, scale: [.6, 1.9], jitter: 36 }));
        }
        await Promise.all(ps);
        hit(); await delay(T(120));
        break;
      }
      case "ciel": {
        recoil();
        const ps = [];
        for (let i = 0; i < 3; i++) {
          const e = mk(`width:70px;height:8px;margin:-4px 0 0 -35px;border-radius:50%;background:linear-gradient(90deg,transparent,#fff,transparent);box-shadow:0 0 8px ${c2};`);
          ps.push(fly(e, 340, { delayMs: i * 80, jitter: 40, spin: ang }));
        }
        await Promise.all(ps);
        hit(); await burst(D.cx, D.cy, 6, 6, 40);
        break;
      }
      case "fire": {
        recoil();
        const e = mk(orb(34));
        const trail = [];
        for (let i = 0; i < 5; i++) { const t = mk(orb(14)); trail.push(fly(t, 420, { delayMs: 40 + i * 45, arc: 24, scale: [1, .4] })); }
        await fly(e, 420, { arc: 24, scale: [.8, 1.3] });
        e.remove(); hit();
        await burst(D.cx, D.cy, 12, 10, 58);
        break;
      }
      case "water": {
        recoil();
        const ps = [];
        for (let i = 0; i < 7; i++) { const e = mk(`width:14px;height:20px;margin:-10px 0 0 -7px;border-radius:50% 50% 50% 50%/65% 65% 35% 35%;background:radial-gradient(circle at 35% 30%,#fff,${c1} 35%,${c2});`); ps.push(fly(e, 380, { delayMs: i * 45, arc: 34 + i * 3, jitter: 22 })); }
        await Promise.all(ps);
        hit(); await burst(D.cx, D.cy, 10, 8, 50);
        break;
      }
      case "electric": {
        recoil();
        const pts = [[A.cx, A.cy]];
        const n = 7;
        for (let i = 1; i < n; i++) { const t = i / n; pts.push([A.cx + (D.cx - A.cx) * t + (Math.random() - .5) * 46, A.cy + (D.cy - A.cy) * t + (Math.random() - .5) * 46]); }
        pts.push([D.cx, D.cy]);
        const bolt = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        bolt.setAttribute("width", SR.width); bolt.setAttribute("height", SR.height);
        bolt.style.cssText = "position:absolute;left:0;top:0;";
        bolt.innerHTML = `<polyline points="${pts.map(p => p.join(",")).join(" ")}" fill="none" stroke="${c2}" stroke-width="9" stroke-linejoin="round" opacity=".6"/><polyline points="${pts.map(p => p.join(",")).join(" ")}" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>`;
        layer.appendChild(bolt);
        const flash = mk(`left:0;top:0;width:100%;height:100%;background:${c1};mix-blend-mode:screen;`);
        hit();
        go(flash, [{ opacity: .5 }, { opacity: 0 }], 260);
        await go(bolt, [{ opacity: 1 }, { opacity: .2 }, { opacity: 1 }, { opacity: .1 }, { opacity: 1 }, { opacity: 0 }], 460, { easing: "linear" });
        await burst(D.cx, D.cy, 8, 7, 44);
        break;
      }
      case "grass": {
        recoil();
        const ps = [];
        for (let i = 0; i < 6; i++) {
          const e = mk(`width:22px;height:11px;margin:-5px 0 0 -11px;border-radius:0 100% 0 100%;background:linear-gradient(135deg,${c1},${c2});`);
          ps.push(fly(e, 420, { delayMs: i * 55, arc: 30 + (i % 3) * 14, spin: 720, jitter: 26 }));
        }
        await Promise.all(ps);
        hit(); await burst(D.cx, D.cy, 8, 7, 44);
        break;
      }
      default: {
        // Tipos restantes: hielo, psíquico, fantasma, siniestro, veneno, bicho, hada, dragón, acero…
        recoil();
        const ps = [];
        const shape = {
          ice: `width:14px;height:26px;margin:-13px 0 0 -7px;background:linear-gradient(${c1},${c2});clip-path:polygon(50% 0,100% 100%,0 100%);`,
          poison: orb(18, c2, c1),
          ghost: orb(22, c2, c1) + "opacity:.9;",
          dark: orb(24, c2, c1),
          psychic: orb(16, c2, c1),
          fairy: `width:16px;height:16px;margin:-8px 0 0 -8px;background:${c1};clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);box-shadow:0 0 8px ${c2};`,
        }[type] || orb(20, c2, c1);
        for (let i = 0; i < 5; i++) { const e = mk(shape); ps.push(fly(e, 380, { delayMs: i * 60, arc: 20, spin: type === "ice" ? 360 : 0, jitter: 30 })); }
        if (type === "psychic" || type === "ghost") {
          const r = mk(`width:70px;height:70px;margin:-35px 0 0 -35px;border-radius:50%;border:4px solid ${c1};box-shadow:0 0 14px ${c2};`);
          ps.push(go(r, [{ transform: at(D.cx, D.cy, " scale(.3)"), opacity: 1 }, { transform: at(D.cx, D.cy, " scale(1.8)"), opacity: 0 }], 520, { delay: T(260) }));
        }
        await Promise.all(ps);
        hit(); await burst(D.cx, D.cy, 9, 8, 48);
      }
    }
  } catch (err) {
    console.warn("fx error", move?.name, err);
    defImg.classList.add("anim-hit");
  } finally {
    layer.remove();
    atkImg.getAnimations?.().forEach(a => a.cancel?.());
    defImg.classList.remove("anim-hit");
    void defImg.offsetWidth;
  }
  await delay(T(60));
}

function playerSpriteSrc() {
  try {
    const st = window.__pokeState?.();
    const asp = st?.player?.aspect;
    if (asp) return `assets/trainers/${asp}.png`;
    const g = st?.player?.gender;
    if (g === "f") return "assets/trainers/leaf.png";
  } catch (_) {}
  return "assets/trainers/red.png";
}

/** Animación por fotogramas (rAF): funciona igual en Safari/iOS que en escritorio. */
function tween(ms, fn) {
  return new Promise((res) => {
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / Math.max(1, ms));
      try { fn(t); } catch (_) {}
      if (t < 1) requestAnimationFrame(step); else res();
    };
    requestAnimationFrame(step);
  });
}
const easeIn = (t) => t * t, easeOut = (t) => 1 - (1 - t) * (1 - t);

/**
 * Captura: el entrenador entra, lanza la Poké Ball en arco hasta el Pokémon,
 * este es absorbido, la ball cae, se sacude 3 veces y se resuelve (éxito o escape).
 */
export async function playCaptureFx({ success = true, speed = 1, verify = null } = {}) {
  // verify = { ok, label, onVerdict() }: tras capturar, la ball vuelve a la mano del entrenador y se comprueba la naturaleza
  const scene = sceneEl();
  if (!scene) return;
  const sp = Math.max(0.5, speed || 1);
  const D = (ms) => ms / sp;

  const enemy = document.querySelector("#enemy-img");
  const enemySide = document.querySelector("#enemy-side");
  const SR = scene.getBoundingClientRect();
  const B = 34;

  const layer = document.createElement("div");
  layer.className = "capture-throw-layer";
  layer.innerHTML = `
    <div class="capture-trainer"><img src="${playerSpriteSrc()}" alt="" onerror="this.src='assets/trainers/red.png'" /></div>
    <img class="cap-ball" src="${BALL_SRC}" alt="" width="${B}" height="${B}"
         style="position:absolute;left:0;top:0;width:${B}px;height:${B}px;opacity:0;image-rendering:pixelated;z-index:22;filter:drop-shadow(0 2px 3px rgba(0,0,0,.55))" />`;
  scene.appendChild(layer);
  const trainer = layer.querySelector(".capture-trainer");
  const timg = trainer.querySelector("img");
  // Mismo tamaño que send-out: 34% del alto del campo
  const H = Math.round(Math.min(132, Math.max(96, SR.height * 0.34)));
  if (timg) {
    timg.style.height = H + "px";
    timg.style.width = "auto";
    timg.style.maxHeight = H + "px";
    timg.style.transform = "scaleX(-1)";
    timg.style.transformOrigin = "center bottom";
  }
  const ball = layer.querySelector(".cap-ball");
  const place = (x, y, rot = 0, sc = 1, op = 1) => { ball.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg) scale(${sc})`; ball.style.opacity = String(op); };

  const resetEnemy = () => { if (enemy) { enemy.style.transform = ""; enemy.style.opacity = ""; enemy.style.filter = ""; } };

  try {
    // 1) El entrenador entra por la izquierda (sin inclinarse)
    void trainer.offsetWidth;
    trainer.classList.add("in");
    await delay(D(480));

    const tr = trainer.getBoundingClientRect();
    const er = (enemy || enemySide || scene).getBoundingClientRect();
    const start = { x: tr.left - SR.left + tr.width * 0.8 - B / 2, y: tr.top - SR.top + tr.height * 0.3 - B / 2 };
    const hit = { x: er.left - SR.left + er.width / 2 - B / 2, y: er.top - SR.top + er.height * 0.45 - B / 2 };
    const ground = { x: hit.x, y: er.top - SR.top + er.height - B * 0.9 };

    // 2) Lanzamiento: pequeño gesto del brazo y la ball vuela en arco
    const apex = Math.min(start.y, hit.y) - Math.max(50, Math.abs(hit.x - start.x) * 0.22);
    tween(D(260), (t) => { timg.style.transform = `translateX(${Math.sin(Math.PI * t) * 10}px)`; });
    await tween(D(650), (t) => {
      const x = start.x + (hit.x - start.x) * t;
      const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * apex + t * t * hit.y;
      place(x, y, t * 720, 0.7 + 0.3 * t);
    });
    if (!verify) trainer.classList.add("out");

    // 3) Impacto: destello y el Pokémon es absorbido
    const flash = document.createElement("div");
    flash.style.cssText = `position:absolute;left:${hit.x + B / 2 - 40}px;top:${hit.y + B / 2 - 40}px;width:80px;height:80px;border-radius:50%;background:radial-gradient(#fff,rgba(255,255,255,0) 70%);z-index:23;pointer-events:none;`;
    layer.appendChild(flash);
    tween(D(380), (t) => { flash.style.transform = `scale(${0.3 + 1.3 * t})`; flash.style.opacity = String(1 - t); });
    if (enemy) {
      const dx = (hit.x + B / 2) - (er.left - SR.left + er.width / 2);
      const dy = (hit.y + B / 2) - (er.top - SR.top + er.height / 2);
      await tween(D(420), (t) => {
        const e = easeIn(t);
        enemy.style.transform = `translate(${dx * e}px,${dy * e}px) scale(${1 - 0.95 * e})`;
        enemy.style.filter = `brightness(${1 + 3 * e})`;
        enemy.style.opacity = String(t < 0.75 ? 1 : 1 - (t - 0.75) * 4);
      });
    } else await delay(D(300));
    flash.remove();

    // 4) La ball cae al suelo con un rebote
    await tween(D(650), (t) => {
      let y;
      if (t < 0.55) y = hit.y + (ground.y - hit.y) * easeIn(t / 0.55);
      else if (t < 0.75) y = ground.y - 16 * Math.sin(Math.PI * ((t - 0.55) / 0.2));
      else y = ground.y - 5 * Math.sin(Math.PI * ((t - 0.75) / 0.25));
      place(hit.x + (ground.x - hit.x) * easeOut(t), y, 0, 1);
    });
    place(ground.x, ground.y, 0, 1);
    await delay(D(250));

    // 5) Tres sacudidas
    for (let i = 0; i < 3; i++) {
      await tween(D(520), (t) => place(ground.x, ground.y, -22 * Math.sin(2 * Math.PI * t) * (1 - t * 0.2), 1));
      place(ground.x, ground.y, 0, 1);
      await delay(D(280));
    }

    if (success) {
      if (enemySide) { enemySide.style.visibility = "hidden"; enemySide.style.opacity = "0"; } // showEnemy() lo restaura en el siguiente combate
      resetEnemy();
      if (enemy) enemy.style.visibility = "hidden"; // el <img> tiene visibility propio y ganaba al del contenedor
      const stars = document.createElement("div");
      stars.style.cssText = `position:absolute;left:${ground.x + B / 2}px;top:${ground.y - 30}px;z-index:24;font-size:1.3rem;white-space:nowrap;`;
      stars.textContent = "✨ ✨ ✨";
      layer.appendChild(stars);
      tween(D(900), (t) => { stars.style.transform = `translate(-50%,${-6 - 26 * t}px) scale(${0.6 + 0.6 * Math.sin(Math.PI * Math.min(1, t * 1.6))})`; stars.style.opacity = String(Math.sin(Math.PI * t)); });
      await tween(D(600), (t) => { const k = 1 + 0.3 * Math.sin(Math.PI * t); place(ground.x, ground.y, 0, k); ball.style.filter = `brightness(${1 + Math.sin(Math.PI * t)}) drop-shadow(0 2px 3px rgba(0,0,0,.55))`; });
      await delay(D(500));
      if (verify) {
        // 6) La ball vuelve volando a la mano del entrenador
        const hand = { x: start.x, y: start.y };
        const apex2 = Math.min(ground.y, hand.y) - 70;
        await tween(D(700), (t) => {
          const x = ground.x + (hand.x - ground.x) * t;
          const y = (1 - t) * (1 - t) * ground.y + 2 * (1 - t) * t * apex2 + t * t * hand.y;
          place(x, y, -t * 540, 1 - 0.2 * t);
        });
        place(hand.x, hand.y, 0, 0.8);
        // 7) Comprobación de naturaleza: burbuja sobre el entrenador
        const bub = document.createElement("div");
        bub.className = "cap-verify " + (verify.ok ? "ok" : "no");
        bub.textContent = (verify.ok ? "✓ " : "✗ ") + (verify.label || "");
        bub.style.left = (hand.x + B / 2) + "px";
        bub.style.top = (hand.y - 30) + "px";
        layer.appendChild(bub);
        await tween(D(260), (t) => { bub.style.opacity = String(t); bub.style.transform = `translate(-50%,${-8 * t}px)`; });
        try { verify.onVerdict?.(); } catch (_) {}
        await delay(D(750));
        if (!verify.ok) {
          // 8) No coincide: la ball se abre y el Pokémon se libera
          const f3 = document.createElement("div");
          f3.style.cssText = `position:absolute;left:${hand.x + B / 2 - 36}px;top:${hand.y + B / 2 - 36}px;width:72px;height:72px;border-radius:50%;background:radial-gradient(#fff,rgba(255,255,255,0) 70%);z-index:23;`;
          layer.appendChild(f3);
          tween(D(400), (t) => { f3.style.transform = `scale(${0.3 + 1.5 * t})`; f3.style.opacity = String(1 - t); });
          tween(D(300), (t) => place(hand.x, hand.y, 0, 0.8 + 0.4 * t, 1 - t));
          if (enemy?.src) {
            const gh = document.createElement("img");
            gh.src = enemy.src; gh.alt = "";
            gh.style.cssText = `position:absolute;left:${hand.x + B / 2}px;top:${hand.y + B / 2}px;height:64px;width:auto;z-index:24;image-rendering:pixelated;transform-origin:center bottom;`;
            layer.appendChild(gh);
            await tween(D(750), (t) => {
              gh.style.transform = `translate(-50%,${-10 - 46 * t}px) scale(${0.2 + 0.8 * easeOut(Math.min(1, t * 2))})`;
              gh.style.opacity = String(t < 0.5 ? 1 : 1 - (t - 0.5) * 2);
              gh.style.filter = `brightness(${1 + 2 * (1 - t)})`;
            });
          } else await delay(D(500));
        } else {
          await tween(D(500), (t) => { const k = 0.8 + 0.2 * Math.sin(Math.PI * t); place(hand.x, hand.y, 0, k, 1 - Math.max(0, t - 0.6) * 2.5); ball.style.filter = `brightness(${1 + Math.sin(Math.PI * t)}) drop-shadow(0 2px 3px rgba(0,0,0,.55))`; });
        }
        bub.style.opacity = "0";
        trainer.classList.add("out");
        await delay(D(350));
      }
    } else {
      // Se escapa: la ball se abre y el Pokémon reaparece
      const f2 = document.createElement("div");
      f2.style.cssText = `position:absolute;left:${ground.x + B / 2 - 36}px;top:${ground.y + B / 2 - 36}px;width:72px;height:72px;border-radius:50%;background:radial-gradient(#fff,rgba(255,255,255,0) 70%);z-index:23;`;
      layer.appendChild(f2);
      tween(D(400), (t) => { f2.style.transform = `scale(${0.3 + 1.5 * t})`; f2.style.opacity = String(1 - t); });
      tween(D(300), (t) => place(ground.x, ground.y, 0, 1 + 0.4 * t, 1 - t));
      if (enemy) {
        await tween(D(420), (t) => {
          const e = easeOut(t);
          enemy.style.transform = `scale(${0.1 + 0.9 * e})`;
          enemy.style.opacity = String(e);
          enemy.style.filter = `brightness(${4 - 3 * e})`;
        });
      }
      resetEnemy();
      await delay(D(300));
    }
  } finally {
    layer.remove();
    resetEnemy();
  }
}
