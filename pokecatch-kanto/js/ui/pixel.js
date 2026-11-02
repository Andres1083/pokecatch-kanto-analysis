// Iconos pixel-art generados en código (SVG nítido, sin imágenes externas).
// Letras: o = contorno, a = color principal, b = sombra, c = brillo, l = hoja,
//         w = blanco, r = rojo, d = oscuro, y = amarillo, . = transparente.

const SHAPES = {
  bush: [
    "....l..l....",
    "...lL.lL.l..",
    ".l.lLllLLlL.",
    ".lLlLLLLlLLl",
    "lLLLLLLLLLLl",
    "lLLdLLLdLLLl",
    ".lLLLLLLLLl.",
    "..dlLLLLld..",
    "...dddddd...",
  ],
  center: [
    "...rrrrrr...",
    "..rrrwwrrr..",
    ".rrrrwwrrrr.",
    "rrrrrrrrrrrr",
    "owwwwwwwwwwo",
    "owbbwwwwbbwo",
    "owbbwwrrwbbo",
    "owwwwwrrwwwo",
    "oooooooooooo",
  ],
  berry: [
    "......ll....",
    ".....lll.l..",
    "......o.ll..",
    "...oooooo...",
    "..oaaaaaao..",
    ".oacaaaaaao.",
    ".oacaaaaaao.",
    ".oaaaaaaabo.",
    ".oaaaaaabbo.",
    "..obaaabbo..",
    "...oobboo...",
  ],
  candy: [
    "............",
    "oo........oo",
    "oao.oooo.oao",
    "oaaoaccaoaao",
    "oaaoaaaaoaao",
    "oaaobaabbaao",
    "oao.obbo.oao",
    "oo........oo",
  ],
  gem: [
    "....oooo....",
    "...occcao...",
    "..occaaaao..",
    ".occaaaaabo.",
    ".oaaaaaabbo.",
    "..oaaaabbo..",
    "...oaabbo...",
    "....obbo....",
    ".....oo.....",
  ],
  pill: [
    "............",
    "..oooooooo..",
    ".oaaaoyyyyo.",
    "oaccaoyyyyyo",
    "oaaaaoyyyyyo",
    "obaaaoyyyyyo",
    ".obbaoyyyyo.",
    "..oooooooo..",
  ],
  nugget: [
    "............",
    "....oooo....",
    "...occcao...",
    "..occaaaaoo.",
    ".occaaaaabbo",
    ".oaaaaabbbo.",
    "..obbbbbboo.",
    "...oooooo...",
  ],
  pearl: [
    "....oooo....",
    "...occcao...",
    "..occaaaao..",
    "..ocaaaaao..",
    "..oaaaaabo..",
    "..obaaabbo..",
    "...obbbbo...",
    "....oooo....",
  ],
  bag: [
    "....oooo....",
    "...oaaaao...",
    "..oaaaaaao..",
    ".oabbbbbbao.",
    ".oaaaccaaao.",
    ".oaaaaaaaao.",
    "..oaaaaaao..",
    "...oooooo...",
  ],
};

const BASE = {
  o: "#1b1f2e", w: "#f8fafc", r: "#e3353b", d: "#14301c", y: "#fde68a",
  l: "#4ea85a", L: "#7fd06c", c: "#ffffff", b: "#00000055",
};

const cache = new Map();

/** Devuelve un data-URI SVG del icono. `pal` sobrescribe a/b/c (principal, sombra, brillo). */
export function pixelIcon(shape, pal = {}) {
  const key = shape + JSON.stringify(pal);
  if (cache.has(key)) return cache.get(key);
  const map = SHAPES[shape];
  if (!map) return "";
  const colors = { ...BASE, ...pal };
  const w = Math.max(...map.map(r => r.length));
  const rects = [];
  map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === ".") continue;
      const fill = colors[ch];
      if (!fill) continue;
      rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`);
    }
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${map.length}" shape-rendering="crispEdges">${rects.join("")}</svg>`;
  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  cache.set(key, uri);
  return uri;
}
