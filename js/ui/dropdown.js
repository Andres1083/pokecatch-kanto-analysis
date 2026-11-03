// Menú desplegable propio (en la fuente pixel del juego, en vez del selector nativo del sistema)
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/**
 * @param {{options: [string,string][], value: string, onChange: (v:string)=>void, label?: (v:string,l:string)=>string, cls?: string, title?: string}} o
 * @returns {HTMLElement}
 */
export function pixelDropdown({ options, value, onChange, label, cls = "", title = "" }) {
  const root = document.createElement("div");
  root.className = `dx-dd ${cls}`;
  let cur = value;
  const text = () => { const l = options.find(o => o[0] === cur)?.[1] ?? ""; return label ? label(cur, l) : l; };
  root.innerHTML = `<button type="button" class="dx-ddbtn" aria-haspopup="listbox" aria-expanded="false" title="${esc(title)}"><span></span> <i>▾</i></button>
    <div class="dx-ddmenu" role="listbox" hidden>${options.map(([v, l]) => `<button type="button" role="option" data-v="${esc(v)}">${esc(l)}</button>`).join("")}</div>`;
  const btn = root.querySelector(".dx-ddbtn"), menu = root.querySelector(".dx-ddmenu"), span = btn.querySelector("span");
  const paint = () => { span.textContent = text(); menu.querySelectorAll("[data-v]").forEach(b => b.classList.toggle("on", b.dataset.v === cur)); };
  const close = () => { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); };
  btn.onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; btn.setAttribute("aria-expanded", String(!menu.hidden)); if (!menu.hidden) placeMenu(root, menu); };

  menu.onclick = (e) => {
    const o = e.target.closest("[data-v]"); if (!o) return;
    cur = o.dataset.v; paint(); close(); onChange(cur);
  };
  const off = (ev) => { if (!document.body.contains(root)) return document.removeEventListener("click", off); if (!ev.target.closest(".dx-dd") || !root.contains(ev.target)) close(); };
  document.addEventListener("click", off);
  paint();
  return root;
}

/** Abre el menú hacia arriba si por abajo quedaría tapado por la barra inferior. */
export function placeMenu(root, menu) {
  menu.classList.remove("up");
  const r = menu.getBoundingClientRect(), b = root.getBoundingClientRect();
  const limit = window.innerHeight - 110; // altura aprox. de la barra inferior
  if (r.bottom > limit && b.top > r.height + 20) menu.classList.add("up");
}
