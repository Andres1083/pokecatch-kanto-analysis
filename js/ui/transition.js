// Transiciones pixeladas: damero oscuro que cubre / descubre en diagonal (arriba-izquierda → abajo-derecha)
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const BLOCK = 8;
const INK = "#090b13";

function animate(ms, draw) {
  return new Promise(resolve => {
    let done = false;
    const end = () => { if (done) return; done = true; draw(1); resolve(); };
    const t0 = performance.now();
    const step = (t) => {
      if (done) return;
      const p = Math.min(1, (t - t0) / ms);
      draw(p);
      if (p >= 1) { done = true; resolve(); } else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    setTimeout(end, ms + 250); // por si la pestaña pausa los frames
  });
}

/**
 * Cubre la zona de aventura con un damero en diagonal, ejecuta `swap` (cambio de escenario) y la descubre.
 */
export async function sceneWipe(swap, speed = 1) {
  const target = document.querySelector(".view-adventure");
  if (!target || document.hidden) { await swap(); return; }
  const r = target.getBoundingClientRect();
  if (r.width < 40 || r.height < 40) { await swap(); return; }
  const cv = document.createElement("canvas");
  cv.width = Math.ceil(r.width); cv.height = Math.ceil(r.height);
  cv.className = "scene-wipe";
  cv.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;z-index:70;pointer-events:none;image-rendering:pixelated`;
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");
  const cols = Math.ceil(cv.width / BLOCK), rows = Math.ceil(cv.height / BLOCK);
  const thr = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    thr[y * cols + x] = 0.8 * ((x + y) / (cols + rows - 2)) + 0.19 * (BAYER[y & 3][x & 3] / 15);
  }
  const paint = (p, cover) => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = INK;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const t = thr[y * cols + x];
      if (cover ? p >= t : p < t) ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
    }
  };
  const ms = Math.max(170, 420 / Math.max(1, speed));
  try {
    await animate(ms, p => paint(p, true));
    await swap();
    await animate(ms, p => paint(p, false));
  } finally { cv.remove(); }
}
