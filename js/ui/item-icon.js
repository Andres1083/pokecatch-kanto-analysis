// Icono de objeto: usa el PNG de assets/items/<id>.png y, si falta, el icono generado.
import { ITEMS } from "../data/items.js?v=136";
import { pixelIcon } from "./pixel.js?v=136";

export function itemIconSrc(id) { return `assets/items/${id}.png`; }
export function itemFallback(id) {
  const it = ITEMS[id] || {};
  return pixelIcon(it.shape || "gem", it.pal || {});
}
/** <img> listo para insertar. */
export function itemImg(id, size = 26, cls = "item-sprite") {
  const it = ITEMS[id] || {};
  return `<img class="${cls}" src="${itemIconSrc(id)}" alt="${it.name || id}" width="${size}" height="${size}" style="width:${size}px;height:${size}px;image-rendering:pixelated" data-fb="${itemFallback(id)}" onerror="if(!this.dataset.r){this.dataset.r=1;this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${id}.png'}else{this.onerror=null;this.src=this.dataset.fb||''}" />`;
}
