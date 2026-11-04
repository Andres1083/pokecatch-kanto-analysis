// Icono de objeto: usa el PNG de assets/items/<id>.png y, si falta, el icono generado.
import { ITEMS } from "../data/items.js?v=125";
import { pixelIcon } from "./pixel.js?v=125";

export function itemIconSrc(id) { return `assets/items/${id}.png`; }
export function itemFallback(id) {
  const it = ITEMS[id] || {};
  return pixelIcon(it.shape || "gem", it.pal || {});
}
/** <img> listo para insertar. */
export function itemImg(id, size = 26, cls = "item-sprite") {
  const it = ITEMS[id] || {};
  return `<img class="${cls}" src="${itemIconSrc(id)}" alt="${it.name || id}" width="${size}" height="${size}" style="width:${size}px;height:${size}px;image-rendering:pixelated" data-fb="${itemFallback(id)}" onerror="this.onerror=null;this.src=this.dataset.fb||''" />`;
}
