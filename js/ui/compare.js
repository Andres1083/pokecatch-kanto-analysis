// Comparar dos Pokémon en una sola pantalla, sin scroll (pensado para el móvil en vertical).
import { frontSprite } from "../data/sprites.js?v=137";
import { getNature } from "../data/natures.js?v=137";
import { incomingMult, TYPE_NAME_ES, TYPE_COLOR } from "./type-tip.js?v=137";

let pickedA = null; // Pokémon marcado como «A», a la espera del segundo

export const comparePending = () => pickedA;
export function compareClear() { pickedA = null; }

const STATS = [["hp", "PS"], ["atk", "Ataque"], ["def", "Defensa"], ["spa", "At. Esp."], ["spd", "Def. Esp."], ["spe", "Velocidad"]];
const name = (m) => m.nameEs || m.name || `N.º ${m.id}`;
const total = (m) => STATS.reduce((a, [k]) => a + (m.stats?.[k] || 0), 0);

function weakHtml(m) {
  const mult = incomingMult(m.types || []);
  const w = Object.entries(mult).filter(([, f]) => f > 1).sort((a, b) => b[1] - a[1]);
  const imm = Object.entries(mult).filter(([, f]) => f === 0).map(([t]) => t);
  const pill = (t, f) => `<i class="cp-pill" style="--tc:${TYPE_COLOR[t]}">${TYPE_NAME_ES[t]}${f >= 4 ? " ×4" : ""}</i>`;
  return `<div class="cp-weak"><small>Débil a</small><div>${w.length ? w.map(([t, f]) => pill(t, f)).join("") : "<em>—</em>"}</div>${imm.length ? `<small>Inmune</small><div>${imm.map(t => pill(t, 0)).join("")}</div>` : ""}</div>`;
}

export function showCompare(a, b) {
  const ov = document.createElement("div");
  ov.className = "cp-overlay";
  let winA = 0, winB = 0;
  const rows = STATS.map(([k, label]) => {
    const va = a.stats?.[k] || 0, vb = b.stats?.[k] || 0;
    if (va > vb) winA++; else if (vb > va) winB++;
    const mx = 150; // misma escala que la ficha (barra llena = 150)
    const ca = va > vb ? "win" : va < vb ? "lose" : "", cb = vb > va ? "win" : vb < va ? "lose" : "";
    const d = va === vb ? "=" : `+${Math.abs(va - vb)}`;
    return `<div class="cp-row"><b class="cp-v ${ca}">${va}</b>
      <div class="cp-bars"><div class="cp-l"><i class="${ca}" style="width:${Math.min(100, va / mx * 100)}%"></i></div><span>${label}${va !== vb ? ` <small class="${va > vb ? "a" : "b"}">${d}</small>` : ""}</span><div class="cp-r"><i class="${cb}" style="width:${Math.min(100, vb / mx * 100)}%"></i></div></div>
      <b class="cp-v ${cb}">${vb}</b></div>`;
  }).join("");
  const ta = total(a), tb = total(b);
  const lead = ta !== tb ? (ta > tb ? a : b) : winA !== winB ? (winA > winB ? a : b) : null;
  const verdict = lead ? `${name(a) === name(b) ? `El de ${lead === a ? "la izquierda" : "la derecha"} (Nv. ${lead.level})` : name(lead)} es más fuerte: +${Math.abs(ta - tb)} de total, gana en ${lead === a ? winA : winB} de 6` : "Están igualados";
  const head = (m, side) => `<div class="cp-mon ${side}">
      <img src="${frontSprite(m)}" alt="" draggable="false" onerror="this.style.visibility='hidden'">
      <b>${name(m)}${m.shiny ? " ✦" : ""}</b>
      <small>Nv. ${m.level} · ${getNature(m.natureIndex ?? 0).nameEs}</small>
      <div class="cp-types">${(m.types || []).map(t => `<i class="cp-pill" style="--tc:${TYPE_COLOR[t]}">${TYPE_NAME_ES[t] || t}</i>`).join("")}</div></div>`;
  ov.innerHTML = `<div class="cp-panel" role="dialog" aria-modal="true">
    <div class="cp-top"><span>COMPARAR</span><button type="button" class="cp-x" aria-label="Cerrar">✕</button></div>
    <div class="cp-heads">${head(a, "a")}<div class="cp-vs">VS</div>${head(b, "b")}</div>
    <div class="cp-stats">${rows}</div>
    <div class="cp-total"><b class="${ta > tb ? "win" : ta < tb ? "lose" : ""}">${ta}</b><span>TOTAL</span><b class="${tb > ta ? "win" : tb < ta ? "lose" : ""}">${tb}</b></div>
    <div class="cp-weaks">${weakHtml(a)}${weakHtml(b)}</div>
    <div class="cp-verdict">${verdict}</div></div>`;
  const close = () => ov.remove();
  ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest(".cp-x")) close(); });
  document.body.appendChild(ov);
}

/** Botón «Comparar» de la ficha. Devuelve true si debe cerrarse la ficha. */
export function compareFromDetail(mon, toast) {
  if (!pickedA) { pickedA = mon; toast?.(`${name(mon)} marcado. Abre otro Pokémon y pulsa «Comparar».`); return true; }
  if (pickedA === mon) { pickedA = null; toast?.("Comparación cancelada."); return false; }
  const a = pickedA; pickedA = null;
  showCompare(a, mon);
  return false;
}
