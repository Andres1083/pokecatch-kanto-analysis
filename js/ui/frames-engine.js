import { evaluateAchievements, FRAME_REWARD_MAP } from "../data/achievements.js?v=94";

/**
 * Marcos estilo Poke'Catch original (pixel→SVG→CSS).
 * Aspectos: assets/trainers/still/*.png del original.
 */
const PIX = {"coin1": {"pal": {"o": "#a86e00", "y": "#ffcb05", "l": "#fff2a8"}, "rows": ["..ooo..", ".oylyo.", "oylyyyo", "oyyoyyo", "oyyyyyo", ".oyyyo.", "..ooo.."]}, "coin2": {"pal": {"o": "#a86e00", "y": "#ffcb05", "l": "#fff2a8"}, "rows": [".ooo.", "oylyo", "oyyyo", "oyoyo", "oyyyo", "oyyyo", ".ooo."]}, "coin3": {"pal": {"o": "#a86e00", "y": "#ffcb05"}, "rows": [".o.", "oyo", "oyo", "oyo", "oyo", "oyo", ".o."]}, "coin4": {"pal": {"o": "#a86e00"}, "rows": ["o", "o", "o", "o", "o", "o", "o"]}, "spark7": {"pal": {"w": "#ffffff", "y": "#ffe066"}, "rows": ["...w...", "...y...", "..yyy..", "wyywyyw", "..yyy..", "...y...", "...w..."]}, "spark5": {"pal": {"w": "#ffffff", "y": "#ffe066"}, "rows": ["..w..", "..y..", "wywyw", "..y..", "..w.."]}, "spark3": {"pal": {"w": "#ffffff", "y": "#ffe066"}, "rows": [".y.", "ywy", ".y."]}, "bulbOn": {"pal": {"y": "#ffcb05", "w": "#fff8c0"}, "rows": [".y.", "ywy", ".y."]}, "bulbOff": {"pal": {"o": "#5a3200", "y": "#8a5a10"}, "rows": [".o.", "oyo", ".o."]}, "crown": {"pal": {"y": "#ffcb05", "l": "#fff2a8", "o": "#a86e00", "r": "#e3353b", "b": "#4f8ff7"}, "rows": ["l...l...l", "yl.lyl.ly", "yyyyyyyyy", "yryybyyry", "ooooooooo"]}, "heart": {"pal": {"p": "#ff6f9f", "l": "#ffc2d6"}, "rows": ["pp.pp", "plppp", ".ppp.", "..p.."]}, "pokeballHD": {"pal": {"k": "#1b1b22", "R": "#ff8a8a", "r": "#e3353b", "d": "#a8202a", "W": "#ffffff", "w": "#e4e6ee", "g": "#9aa0b4"}, "rows": ["...kkkkk...", "..kRRrrrk..", ".kRrrrrrdk.", "kRrrkkkrrdk", "krrkWWwkrdk", "kkkkWwwkkkk", "kwwkwwgkwgk", "kWwwkkkwwgk", ".kwwwwwwgk.", "..kwwwggk..", "...kkkkk..."]}, "masterHD": {"pal": {"k": "#1b1b22", "P": "#c084ff", "p": "#7a3fc8", "q": "#4a1f8a", "m": "#ff6fb5", "W": "#ffffff", "w": "#e4e6ee", "g": "#9aa0b4"}, "rows": ["...kkkkk...", "..kPWpWpk..", ".kmpWWWpmk.", "kPppkkkppqk", "kppkWWwkpqk", "kkkkWwwkkkk", "kwwkwwgkwgk", "kWwwkkkwwgk", ".kwwwwwwgk.", "..kwwwggk..", "...kkkkk..."]}, "rocket9": {"pal": {"k": "#1b1b22", "d": "#2a2a33", "R": "#ff3b3b", "h": "#ff9a9a"}, "rows": [".kkkkkkkk.", "kddddddddk", "kdhhhhhddk", "kdRRddRRdk", "kdRRddRRdk", "kdRRRRRddk", "kdRRdRRddk", "kdRRddRRdk", "kdRRddRRdk", "kddddddddk", ".kkkkkkkk."]}};

function pixToSvg(name) {
  const def = PIX[name];
  if (!def) return null;
  const { pal, rows } = def;
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  let rects = "";
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === "." || !pal[ch]) continue;
      rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${pal[ch]}"/>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects}</svg>`;
  return { url: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, w, h };
}

const cache = {};
const getPix = (n) => (cache[n] ||= pixToSvg(n));
const FP = 1.35;

function layer([name, pos, ox = 0, oy = 0, scale]) {
  const p = getPix(name);
  if (!p) return "";
  const s = scale ?? FP;
  const size = `calc(${p.w * s} * var(--fp, 1px)) calc(${p.h * s} * var(--fp, 1px))`;
  const x = pos[1] === "l" ? `left calc(3px + ${ox} * var(--fp, 1px))`
    : pos[1] === "r" ? `right calc(3px + ${ox} * var(--fp, 1px))`
    : `left calc(50% + ${ox} * var(--fp, 1px))`;
  const y = pos[0] === "t" ? `top calc(3px + ${oy} * var(--fp, 1px))`
    : pos[0] === "b" ? `bottom calc(3px + ${oy} * var(--fp, 1px))`
    : `top calc(50% + ${oy} * var(--fp, 1px))`;
  return `${p.url} ${x} ${y} / ${size} no-repeat`;
}
function layersCss(arr) {
  if (!arr || !arr.length) return "none";
  return arr.map(layer).join(", ");
}
function animCss(sel, name, def) {
  if (!def) return "";
  if (Array.isArray(def)) return `${sel} { background: ${layersCss(def)}; }\n`;
  const total = def.frames.reduce((s, f) => s + f[0], 0);
  let t = 0;
  const kfs = def.frames.map(([dur, layers]) => {
    const pct = ((t / total) * 100).toFixed(2);
    t += dur;
    return `${pct}% { background: ${layersCss(layers)}; }`;
  }).join(" ");
  return `@keyframes ${name} { ${kfs} 100% { background: ${layersCss(def.frames[0][1])}; } }
${sel} { background: ${layersCss(def.frames[0][1])}; animation: ${name} ${def.dur}s step-end infinite; }\n`;
}

const CATALOG = [
  { id: "base", name: "Estándar" },
  { id: "pokeball", name: "Poké Ball", a: [["pokeballHD", "br", -2, -2, 1.1]] },
  {
    id: "casino", name: "Casino",
    a: {
      dur: 0.9,
      frames: [
        [1, [["coin1", "br", -1, -1]]],
        [1, [["coin2", "br", -1, -1]]],
        [1, [["coin3", "br", -1, -1]]],
        [1, [["coin4", "br", -1, -1]]],
        [1, [["coin3", "br", -1, -1]]],
        [1, [["coin2", "br", -1, -1]]],
      ],
    },
    b: {
      dur: 2.2,
      frames: [
        [6, [["spark5", "tl", -1, -1], ["spark3", "tr", -1, -1]]],
        [1, [["spark7", "tl", -1, -1], ["spark3", "tr", -1, -1]]],
        [1, [["spark5", "tl", -1, -1], ["spark5", "tr", -1, -1]]],
        [1, [["spark3", "tl", -1, -1], ["spark7", "tr", -1, -1]]],
        [1, [["spark5", "tl", -1, -1], ["spark5", "tr", -1, -1]]],
        [1, [["spark7", "tl", -1, -1], ["spark3", "tr", -1, -1]]],
      ],
    },
  },
  { id: "league", name: "Liga", a: [["crown", "tc", 0, -3]] },
  { id: "rocket", name: "Team Rocket", a: [["rocket9", "br", -2, -2, 1.15]] },
];

let injected = false;
export function injectFrameStyles() {
  if (injected) return;
  injected = true;
  let css = `
.tr-face {
  --fp: 1.2px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px; height: 52px;
  border-radius: 12px;
  background: #1a1228;
  border: 2px solid #6a5090;
  overflow: visible;
}
.tr-face .tr-win {
  position: relative; z-index: 1;
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; border-radius: 10px;
}
.tr-face .tr-win img {
  width: 100%; height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}
.tr-face > .fr, .tr-face > .fr::after {
  position: absolute; inset: -2px;
  pointer-events: none;
  z-index: 2;
  content: "";
  background-repeat: no-repeat;
}
.tr-face[data-frame="pokeball"] { border-color: #e04040; }
.tr-face[data-frame="casino"] { border-color: #e8b84a; box-shadow: 0 0 10px rgba(240,180,40,.3); }
.tr-face[data-frame="league"] { border-color: #e8c050; box-shadow: 0 0 0 1px #4a3810; }
.tr-face[data-frame="rocket"] { border-color: #c02020; background: #1a0808; }
.tr-face.me-big { width: 72px; height: 72px; --fp: 1.5px; }
`;
  for (const fr of CATALOG) {
    css += animCss(`.tr-face[data-frame="${fr.id}"] > .fr`, `frA-${fr.id}`, fr.a);
    css += animCss(`.tr-face[data-frame="${fr.id}"] > .fr::after`, `frB-${fr.id}`, fr.b);
  }
  const st = document.createElement("style");
  st.id = "pokecatch-frames";
  st.textContent = css;
  document.head.appendChild(st);
}

export const FRAMES = CATALOG.map(({ id, name }) => ({ id, label: name, cls: `fr-${id}` }));
export const STILL_ASPECTS = [
  "red","leaf","blue","ethan","lyra","youngster","lass","hiker","fisherman","biker",
  "beauty","birdkeeper","bugcatcher","camper","picnicker","supernerd","oak","scientist",
  "gentleman","blackbelt","giovanni","pokemaniac","silver",
];
export function stillSrc(id) { return `assets/trainers/still/${id}.png`; }
function completedAchievements(state) {
  const done = new Set(state.unlockedAchievements || []);
  for (const a of evaluateAchievements(state)) if (a.done) done.add(a.id);
  return done;
}
function unlockedAspectIds(state) {
  const done = completedAchievements(state), out = new Set(["red", "leaf"]);
  for (const a of evaluateAchievements(state)) if (a.kind === "aspect" && done.has(a.id)) out.add(a.reward);
  return out;
}
function unlockedFrameIds(state) {
  const done = completedAchievements(state), out = new Set(["base"]);
  for (const a of evaluateAchievements(state)) if (a.kind === "frame" && done.has(a.id)) out.add(FRAME_REWARD_MAP[a.reward] || a.reward);
  return out;
}
export function getAspect(state) {
  const fallback = state.player?.gender === "f" ? "leaf" : "red";
  const selected = state.player?.aspect || fallback;
  return unlockedAspectIds(state).has(selected) ? selected : fallback;
}
export function getFrame(state) {
  const selected = { std: "base", ball: "pokeball" }[state.player?.frame] || state.player?.frame || "base";
  return unlockedFrameIds(state).has(selected) ? selected : "base";
}
export function frameClass() { return ""; }
export function aspectSrc(state) { return stillSrc(getAspect(state)); }

export function avatarHtml(state, { button = false, cls = "", frameId = null, aspectId = null, size = null } = {}) {
  injectFrameStyles();
  const asp = aspectId || getAspect(state);
  let fr = frameId || getFrame(state);
  fr = { std: "base", ball: "pokeball" }[fr] || fr;
  const tag = button ? "button" : "span";
  const type = button ? ' type="button"' : "";
  const sz = size ? `style="width:${size}px;height:${size}px;--fp:${(size/52)*1.2}px"` : "";
  return `<${tag}${type} class="tr-face ${cls}" data-frame="${fr}" data-player-avatar ${sz}>
    <span class="tr-win"><img src="${stillSrc(asp)}" alt="" onerror="this.src='assets/trainers/${asp}.png'" /></span>
    <i class="fr"></i>
  </${tag}>`;
}

export function openPlayerEditor(state, { onSave, onClose } = {}) {
  injectFrameStyles();
  const availableAspects = unlockedAspectIds(state);
  const availableFrames = unlockedFrameIds(state);
  let curAsp = getAspect(state);
  let curFr = getFrame(state);
  const ov = document.createElement("div");
  ov.className = "me-overlay";
  const render = () => {
    const nameVal = (ov.querySelector("#me-name")?.value) ?? (state.player?.name || "");
    ov.innerHTML = `
    <div class="me-panel">
      <header class="me-head">
        <h2>Mi Entrenador</h2>
        <div class="me-tabs">
          <button type="button" class="on" data-tab="aspect">ASPECTO</button>
          <button type="button" data-tab="frame">MARCO</button>
        </div>
        <button type="button" class="me-x" data-act="close">✕</button>
      </header>
      <div class="me-preview">
        ${avatarHtml(state, { cls: "me-big", aspectId: curAsp, frameId: curFr, size: 72 })}
        <label class="me-name">
          <span>NOMBRE</span>
          <input id="me-name" maxlength="10" value="${String(nameVal).slice(0, 10)}" />
          <small><span id="me-len">${String(nameVal).length}</span> / 10</small>
        </label>
      </div>
      <div class="me-grid" data-pane="aspect">
        ${STILL_ASPECTS.map((a) => { const ok = availableAspects.has(a); return `
          <button type="button" class="me-item ${a === curAsp ? "on" : ""} ${ok ? "" : "locked"}" ${ok ? `data-aspect="${a}"` : "disabled"}>
            <img src="${stillSrc(a)}" alt="${a}" onerror="this.style.opacity=.3" />
            ${ok ? "" : `<small class="me-lock" style="position:absolute;right:5px;top:4px;background:#111c;padding:2px 4px;border-radius:6px">🔒</small>`}
          </button>`; }).join("")}`
      </div>
      <div class="me-grid me-frames" data-pane="frame" hidden>
        ${FRAMES.map((fr) => { const ok = availableFrames.has(fr.id); return `
          <button type="button" class="me-item frame ${fr.id === curFr ? "on" : ""} ${ok ? "" : "locked"}" ${ok ? `data-frame="${fr.id}"` : "disabled"}>
            ${avatarHtml(state, { aspectId: curAsp, frameId: fr.id, size: 52 })}
            <small>${fr.label}</small>${ok ? "" : `<small class="me-lock">🔒</small>`}
          </button>`; }).join("")}`
      </div>
      <footer class="me-foot">
        <button type="button" class="me-cancel" data-act="close">CANCELAR</button>
        <button type="button" class="me-ok" data-act="save">CONFIRMAR</button>
      </footer>
    </div>`;
  };
  render();
  ov.onclick = (e) => {
    if (e.target === ov) { ov.remove(); onClose?.(); return; }
    const tab = e.target.closest("[data-tab]");
    if (tab) {
      ov.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("on", x === tab));
      ov.querySelectorAll("[data-pane]").forEach((p) => { p.hidden = p.dataset.pane !== tab.dataset.tab; });
      return;
    }
    const a = e.target.closest("[data-aspect]");
    if (a?.dataset.aspect) {
      curAsp = a.dataset.aspect;
      const nv = ov.querySelector("#me-name")?.value;
      render();
      if (nv != null && ov.querySelector("#me-name")) ov.querySelector("#me-name").value = nv;
      ov.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("on", x.dataset.tab === "aspect"));
      ov.querySelectorAll("[data-pane]").forEach((p) => { p.hidden = p.dataset.pane !== "aspect"; });
      return;
    }
    const f = e.target.closest("button[data-frame]");
    if (f?.dataset.frame) {
      curFr = f.dataset.frame;
      const nv = ov.querySelector("#me-name")?.value;
      render();
      if (nv != null && ov.querySelector("#me-name")) ov.querySelector("#me-name").value = nv;
      ov.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("on", x.dataset.tab === "frame"));
      ov.querySelectorAll("[data-pane]").forEach((p) => { p.hidden = p.dataset.pane !== "frame"; });
      return;
    }
    if (e.target.closest("[data-act=close]")) { ov.remove(); onClose?.(); return; }
    if (e.target.closest("[data-act=save]")) {
      state.player = state.player || {};
      state.player.aspect = curAsp;
      state.player.frame = curFr;
      const nm = ov.querySelector("#me-name")?.value?.trim().slice(0, 10);
      if (nm) state.player.name = nm;
      ov.remove();
      onSave?.(state);
    }
  };
  ov.addEventListener("input", (e) => {
    if (e.target.id === "me-name") {
      const el = ov.querySelector("#me-len");
      if (el) el.textContent = String(e.target.value.length);
    }
  });
  document.body.appendChild(ov);
  return ov;
}
