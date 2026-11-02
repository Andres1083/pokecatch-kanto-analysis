// Ajusta el tamaño de los Pokémon en combate según su dibujo REAL (sin el margen transparente del PNG).
// El tamaño deseado del dibujo (px) viene en la variable CSS --art del estilo inline (ver spriteSizeStyle).
const boxCache = new Map(); // src -> Promise<{w,h,top,bottom}|null>

function bbox(src) {
  if (boxCache.has(src)) return boxCache.get(src);
  const p = new Promise((res) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => {
      try {
        const w = im.naturalWidth, h = im.naturalHeight;
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(im, 0, 0);
        const d = x.getImageData(0, 0, w, h).data;
        let top = h, bottom = -1;
        for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) if (d[(y * w + i) * 4 + 3] > 24) { if (y < top) top = y; if (y > bottom) bottom = y; }
        res(bottom < 0 ? null : { w, h, top, bottom: bottom + 1 });
      } catch (_) { res(null); }
    };
    im.onerror = () => res(null);
    im.src = src;
  });
  boxCache.set(src, p);
  return p;
}

export async function fitSprite(img) {
  if (!img || !img.isConnected) return;
  const art = parseFloat(img.style.getPropertyValue("--art"));
  const src = img.currentSrc || img.src;
  if (!art || !src || !img.complete || !img.naturalWidth) return;
  const key = `${src}|${art}`;
  if (img.dataset.fit === key) return;
  const b = await bbox(src);
  if (!img.isConnected || (img.currentSrc || img.src) !== src) return;
  if (!b) { img.dataset.fit = key; return; }
  const k = art / Math.max(1, b.bottom - b.top);
  const s = img.style;
  s.setProperty("width", `${Math.round(b.w * k)}px`, "important");
  s.setProperty("height", `${Math.round(b.h * k)}px`, "important");
  s.setProperty("max-width", "none", "important");
  s.setProperty("max-height", "none", "important");
  s.setProperty("margin-bottom", `${Math.round(-(b.h - b.bottom) * k + 2)}px`, "important");
  // La barra de vida queda pegada al dibujo, no al margen transparente de arriba
  const hp = img.parentElement?.querySelector?.(".hp-mini");
  if (hp) hp.style.setProperty("margin-bottom", `${Math.round(-b.top * k - 4)}px`, "important");
  img.dataset.fit = key;
}

export function installSpriteFit() {
  const run = (el) => { if (el?.matches?.("img.mon-sprite")) fitSprite(el); };
  document.addEventListener("load", (e) => run(e.target), true);
  new MutationObserver((ms) => {
    for (const m of ms) {
      if (m.type === "attributes") run(m.target);
      else m.addedNodes.forEach((n) => { if (n.nodeType === 1) { run(n); n.querySelectorAll?.("img.mon-sprite").forEach(run); } });
    }
  }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["style", "src"] });
}
