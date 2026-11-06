import { evaluateAchievements, achievementSummary } from "../data/achievements.js?v=136";

const KIND_LBL = { aspect: "ASPECTO", frame: "MARCO", scene: "ESCENA" };

export function openAchievements(state, { onEquip, onPlayScene } = {}) {
  const root = document.createElement("div");
  root.className = "ach-screen";
  root.innerHTML = render(state);
  document.getElementById("app")?.appendChild(root) || document.body.appendChild(root);

  const onKey = (e) => { if (e.key === "Escape") close(); };
  const close = () => { document.removeEventListener("keydown", onKey); root.remove(); };
  document.addEventListener("keydown", onKey);
  root.addEventListener("click", (e) => { if (e.target === root) close(); }); // tocar fuera también cierra
  root.querySelector(".ach-x")?.addEventListener("click", close);

  let tab = "aspect";
  const paint = () => {
    root.innerHTML = render(state, tab);
    bind();
  };
  const bind = () => {
    root.querySelector(".ach-x")?.addEventListener("click", close);
    root.querySelectorAll("[data-tab]").forEach((b) => {
      b.addEventListener("click", () => { tab = b.dataset.tab; paint(); });
    });
    root.querySelector(".ach-help")?.addEventListener("click", () => {
      const tip = root.querySelector(".ach-tip");
      if (tip) tip.hidden = !tip.hidden;
    });
    root.querySelectorAll("[data-equip]").forEach((b) => {
      b.addEventListener("click", () => {
        const id = b.dataset.equip;
        onEquip?.(id);
        b.textContent = "Puesto";
        b.disabled = true;
      });
    });
    root.querySelectorAll("[data-scene]").forEach((b) => {
      b.addEventListener("click", () => onPlayScene?.(b.dataset.scene));
    });
  };
  bind();
  return { close, refresh: paint };
}

function render(state, tab = "aspect") {
  const list = evaluateAchievements(state);
  const sum = achievementSummary(state);
  const by = (k) => list.filter((a) => a.kind === k);
  const aspects = by("aspect");
  const frames = by("frame");
  const scenes = by("scene");
  const doneA = aspects.filter((a) => a.done).length;
  const doneF = frames.filter((a) => a.done).length;
  const doneS = scenes.filter((a) => a.done).length;

  const active = tab === "frame" ? frames : tab === "scene" ? scenes : aspects;
  const almost = active.filter((a) => a.almost).sort((a, b) => b.pct - a.pct);
  const locked = active.filter((a) => !a.done && !a.almost);
  const unlocked = active.filter((a) => a.done);

  return `
  <div class="ach-panel">
    <header class="ach-head">
      <h1>🏅 Logros <button type="button" class="ach-help" aria-label="Ayuda">?</button></h1>
      <button type="button" class="ach-x" aria-label="Cerrar">✕</button>
      <p class="ach-sum"><b>${sum.unlocked}</b> / ${sum.total} desbloqueados</p>
      <div class="ach-tip" hidden>
        Tus hazañas desbloquean aspectos y marcos para tu ficha de entrenador.
        Toca «Ponérselo» para lucirlos; «¡Casi!» muestra los que tienes a tu alcance.
        Los legendarios capturados y algunos Campeones vencidos también desbloquean su cinemática.
      </div>
    </header>

    <div class="ach-tabs">
      <button type="button" data-tab="aspect" class="${tab==="aspect"?"on":""}">
        <span>Aspectos</span>
        <small>${doneA} / ${aspects.length}</small>
        <i class="ach-bar"><i style="width:${pct(doneA,aspects.length)}%"></i></i>
      </button>
      <button type="button" data-tab="frame" class="${tab==="frame"?"on":""}">
        <span>Marcos</span>
        <small>${doneF} / ${frames.length}</small>
        <i class="ach-bar"><i style="width:${pct(doneF,frames.length)}%"></i></i>
      </button>
      <button type="button" data-tab="scene" class="${tab==="scene"?"on":""}">
        <span>Escenas</span>
        <small>${doneS} / ${scenes.length}</small>
        <i class="ach-bar"><i style="width:${pct(doneS,scenes.length)}%"></i></i>
      </button>
    </div>

    <div class="ach-body">
      ${tab === "scene" ? renderScenes(active) : `
        ${section("¡CASI!", almost)}
        ${section("POR DESBLOQUEAR", locked)}
        ${section("DESBLOQUEADOS", unlocked, true)}
      `}
    </div>
  </div>`;
}

function section(title, items, unlocked = false) {
  if (!items.length) return "";
  return `
  <section class="ach-sec">
    <h2>${title} <span>${items.length}</span></h2>
    ${items.map((a) => row(a, unlocked)).join("")}
  </section>`;
}

function row(a, unlocked) {
  const barCls = a.done ? "ok" : a.pct >= 0.7 ? "hot" : "cold";
  return `
  <article class="ach-row ${a.done ? "done" : "locked"}">
    <div class="ach-ico">${a.done
      ? (a.kind === "frame"
        ? `<span class="ach-frame-reward">◇</span>`
        : `<img src="assets/trainers/still/${a.reward || "youngster"}.png" alt="" onerror="this.style.display='none'" />`)
      : `<span class="ach-lock">🔒</span>`}</div>
    <div class="ach-meta">
      <small>${KIND_LBL[a.kind] || ""}</small>
      <b>${esc(a.desc)}</b>
      ${a.done
        ? `<em class="ach-ok">✓ Desbloqueado</em>`
        : `<div class="ach-prog"><i class="${barCls}" style="width:${Math.round(a.pct*100)}%"></i></div>
           <span class="ach-count">${a.cur} / ${a.max}</span>`}
    </div>
    ${a.done && a.kind !== "scene"
      ? `<button type="button" class="ach-equip" data-equip="${a.id}">PONÉRSELO</button>`
      : ""}
  </article>`;
}

function renderScenes(items) {
  const kanto = items.filter((a) => a.region === "kanto" || !a.region);
  const done = kanto.filter((a) => a.done).length;
  return `
  <section class="ach-sec">
    <h2>KANTO <span>${done} / ${kanto.length}</span></h2>
    <div class="ach-scenes">
      ${kanto.map((a) => `
        <button type="button" class="ach-scene ${a.done?"open":"locked"}" data-scene="${a.id}" ${a.done?"":"disabled"}>
          ${a.done
            ? `<img src="assets/pokemon/${sceneMonId(a)}.png" alt="" /><span>${esc(a.title)}</span><i>▶</i>`
            : `<span class="sil"></span><span>???</span><i class="ach-lock">🔒</i>`}
        </button>`).join("")}
    </div>
  </section>`;
}

function sceneMonId(a) {
  return ({ "scene-zapdos":145,"scene-moltres":146,"scene-articuno":144,"scene-mewtwo":150,"scene-mew":151,"scene-blue":25 })[a.id] || 25;
}
function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;" }[c]));
}
