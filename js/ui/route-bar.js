// Barra superior de progreso del capítulo: arbustos, entrenadores, "?", centro y gimnasio.

import { pixelIcon } from "./pixel.js?v=130";

const WINDOW = 7;
const px = (shape, pal) => `<img src="${pixelIcon(shape, pal)}" alt="" width="24" height="24" style="width:24px;height:24px" />`;
const MEDAL = { a: "#f1f5f9", b: "#9aa9c2", c: "#ffffff" };

function inner(type) {
  switch (type) {
    case "wild":    return px("bush");
    case "center":  return px("center");
    case "gym":     return px("gem", MEDAL);
    case "legend":  return `<span class="rnode-legend" aria-label="Encuentro legendario">✦</span>`;
    case "unlock":  return `<span class="rnode-q">!</span>`;
    case "item":
    case "find":    return `<span class="rnode-q">?</span>`;
    case "trainer": return `<span class="rnode-dot"></span>`;
    default:        return "";
  }
}

/** @param nodes [{t, seg}]  progress = índice del nodo actual  fighting = hay pelea en curso */
export function renderRouteBar({ name, nodes, progress, fighting = false }) {
  const total = nodes.length;
  const cur = Math.min(progress, total - 1);
  const start = Math.max(0, Math.min(cur - 3, total - WINDOW));
  const end = Math.min(total, start + WINDOW);
  const parts = [];
  for (let i = start; i < end; i++) {
    const t = nodes[i].t;
    const st = i < progress ? "done" : i === progress ? "cur" : "todo";
    if (i > start) parts.push(`<span class="rlink ${i <= progress ? "done" : ""}"></span>`);
    let body = inner(t);
    // Completados: salvajes se atenúan; entrenadores/objetos pasan a punto verde
    if (st === "done" && (t === "trainer" || t === "item" || t === "find" || t === "legend" || t === "unlock")) body = `<span class="rnode-ok"></span>`;
    // En pelea, el nodo actual pasa a cuadro blanco
    if (st === "cur" && fighting && (t === "wild" || t === "trainer")) body = `<span class="rnode-now"></span>`;
    parts.push(`<span class="rnode ${t} ${st}" data-node="${i}">${body}</span>`);
  }
  return `
    <div class="rbar" id="route-bar">
      <span class="rbar-name">${name}</span>
      <div class="rbar-track">${parts.join("")}</div>
      <span class="rbar-count">${Math.min(progress + 1, total)}/${total}</span>
    </div>`;
}
