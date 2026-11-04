// Lista de changelogs: la última versión abierta y las anteriores plegadas con flecha (como el original).
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function renderChangelogList(list) {
  return list.map((c, i) => `<details class="cl-item"${i === 0 ? " open" : ""}>
    <summary><span class="cl-t"><b>v${esc(c.v)} · ${esc(c.title)}</b><small>${esc(c.date)}</small></span><i class="cl-arrow">›</i></summary>
    <ul>${c.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></details>`).join("");
}
