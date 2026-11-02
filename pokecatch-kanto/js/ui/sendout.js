// Aparición / retirada de tu Pokémon: silueta blanca que se forma (o se deshace) a píxeles
const clamp = (v) => Math.max(0, Math.min(1, v));

export function imgReady(img, ms = 1500) {
  return new Promise(res => {
    if (img.complete && img.naturalWidth > 0) return res(true);
    const done = (ok) => { img.removeEventListener("load", l); img.removeEventListener("error", e); res(ok); };
    const l = () => done(true), e = () => done(false);
    img.addEventListener("load", l); img.addEventListener("error", e);
    setTimeout(() => done(img.naturalWidth > 0), ms);
  });
}

/** dir: "in" (aparece) | "out" (se retira). El <img> queda oculto al terminar "out". */
export async function dissolve(img, dir, ms = 520, flip = true) {
  const scene = img?.closest("#scene");
  if (!img || !scene || !(await imgReady(img)) || document.hidden) {
    if (img) img.style.visibility = dir === "in" ? "visible" : "hidden";
    return;
  }
  const r = img.getBoundingClientRect(), s = scene.getBoundingClientRect();
  const W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
  const nw = img.naturalWidth, nh = img.naturalHeight;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  cv.className = "dissolve-cv";
  cv.style.cssText = `position:absolute;left:${r.left - s.left}px;top:${r.top - s.top}px;width:${W}px;height:${H}px;z-index:7;pointer-events:none;image-rendering:pixelated`;
  scene.appendChild(cv);
  const ctx = cv.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  // Silueta blanca (source-in no necesita leer píxeles)
  const wh = document.createElement("canvas"); wh.width = nw; wh.height = nh;
  const wctx = wh.getContext("2d");
  wctx.drawImage(img, 0, 0);
  wctx.globalCompositeOperation = "source-in"; wctx.fillStyle = "#fff"; wctx.fillRect(0, 0, nw, nh);
  img.style.visibility = "hidden";

  const B = 4; // bloque en px de pantalla
  const cols = Math.ceil(W / B), rows = Math.ceil(H / B);
  const t1 = new Float32Array(cols * rows), t2 = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const i = y * cols + x, v = y / rows;
    t1[i] = clamp(Math.random() * 0.8 + (1 - v) * 0.2);
    t2[i] = clamp(Math.random() * 0.8 + v * 0.2);
  }
  const sx = nw / W, sy = nh / H;
  const draw = (p) => {
    const q = dir === "in" ? p : 1 - p;
    const whiteAmt = clamp(q / 0.6) * 1.15, colAmt = clamp((q - 0.4) / 0.6) * 1.15;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (flip) { ctx.translate(W, 0); ctx.scale(-1, 1); }
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const src = colAmt > t2[i] ? img : whiteAmt > t1[i] ? wh : null;
      if (!src) continue;
      // con el flip, el bloque (x) del canvas toma el origen sin voltear
      ctx.drawImage(src, x * B * sx, y * B * sy, B * sx, B * sy, x * B, y * B, B, B);
    }
    ctx.restore();
  };
  await new Promise(resolve => {
    let done = false; const t0 = performance.now();
    const fin = () => { if (done) return; done = true; draw(1); resolve(); };
    const step = (t) => { if (done) return; const p = clamp((t - t0) / ms); draw(p); if (p >= 1) fin(); else requestAnimationFrame(step); };
    requestAnimationFrame(step);
    setTimeout(fin, ms + 250);
  });
  cv.remove();
  img.style.visibility = dir === "in" ? "visible" : "hidden";
}
