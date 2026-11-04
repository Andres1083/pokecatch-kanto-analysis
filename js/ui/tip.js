// Globo de ayuda (como el original): una burbuja oscura junto al botón «?» en vez del alert() del navegador.
let cur = null;
function close() { if (cur) { cur.remove(); cur = null; document.removeEventListener("pointerdown", onDoc, true); } }
function onDoc(e) { if (cur && !cur.contains(e.target)) close(); }

export function showTip(anchor, title, text) {
  const same = cur && cur._anchor === anchor;
  close();
  if (same) return;
  const el = document.createElement("div");
  el.className = "tip-pop";
  el.setAttribute("role", "tooltip");
  el._anchor = anchor;
  el.innerHTML = `<b>${title}</b><p>${text}</p>`;
  document.body.appendChild(el);
  const r = anchor.getBoundingClientRect();
  const w = Math.min(340, window.innerWidth - 16);
  el.style.width = `${w}px`;
  const h = el.offsetHeight;
  let left = (r.left + r.width / 2 > window.innerWidth / 2) ? r.right - w : r.left;
  left = Math.min(Math.max(8, left), window.innerWidth - w - 8);
  let top = r.bottom + 8;
  if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 8);
  el.style.left = `${left}px`; el.style.top = `${top}px`;
  cur = el;
  setTimeout(() => document.addEventListener("pointerdown", onDoc, true), 0);
}
