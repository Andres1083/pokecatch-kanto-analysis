// Casino: tragaperras de 3 carretes × 3 filas, 5 líneas de pago.
// Se apuesta con pokédólares y se ganan fichas, que se canjean en la tienda.
export const BASE_BET = 1000;
export const MULTS = [1, 5, 10, 50];
// Premio lineal con el multiplicador de apuesta (como el original): fichas = suma de líneas × (1|5|10|50).
export const PAYOUT_MULT = { 1: 1, 5: 5, 10: 10, 50: 50 };
// El payoutMultiplier del original (1 / 1,5 / 2 / 3) solo acelera la animación de los carretes.
export const SPIN_SPEED = { 1: 1, 5: 1.5, 10: 2, 50: 3 };
export const prizeFor = (base, mult) => Math.round(base * (PAYOUT_MULT[mult] ?? mult));

export const SYMBOLS = {
  seven: { key: "seven", label: "7" },
  bar:   { key: "bar",   label: "BAR" },
  pika:  { key: "pika",  mon: 25 },
  magne: { key: "magne", mon: 81 },
  psy:   { key: "psy",   mon: 54 },
  shell: { key: "shell", mon: 90 },
  berry: { key: "berry", item: "berry-oran" },
};

// Fichas por combinación (con ×1)
export const PAYS = { seven: 220, bar: 66, pika: 15, magne: 12, psy: 10, shell: 8, berry: 6 };
export const PAY_TWO = { berry: 2, shell: 1 }; // 2 iguales al inicio de la línea

// Filas (0 arriba, 1 medio, 2 abajo) de cada línea, por carrete. Numeración como el original.
export const LINES = [
  { n: 1, rows: [1, 1, 1] },
  { n: 2, rows: [0, 0, 0] },
  { n: 3, rows: [2, 2, 2] },
  { n: 4, rows: [0, 1, 2] },
  { n: 5, rows: [2, 1, 0] },
];

// Tira de cada carrete (22 símbolos, mezclados a mano para que no se agrupen)
export const STRIP = ["berry", "shell", "psy", "berry", "pika", "shell", "magne", "berry", "psy", "bar", "shell", "berry", "magne", "psy", "shell", "seven", "berry", "pika", "psy", "shell", "magne", "berry", "bar", "shell", "pika", "berry", "psy", "magne"].slice(0, 28);

/** Tirada: devuelve la posición de parada de cada carrete y la cuadrícula grid[carrete][fila]. */
export function spinGrid(rnd = Math.random) {
  const L = STRIP.length;
  const stops = [0, 1, 2].map(() => Math.floor(rnd() * L));
  const grid = stops.map(i => [STRIP[(i - 1 + L) % L], STRIP[i], STRIP[(i + 1) % L]]);
  return { stops, grid };
}

/** Evalúa las 5 líneas. Devuelve { total, wins:[{line, sym, pay, cells}] } (fichas con ×1). */
export function evalGrid(grid) {
  const wins = [];
  for (const ln of LINES) {
    const s = ln.rows.map((r, c) => grid[c][r]);
    let pay = 0;
    if (s[0] === s[1] && s[1] === s[2]) pay = PAYS[s[0]];
    else if (s[0] === s[1] && PAY_TWO[s[0]]) pay = PAY_TWO[s[0]];
    if (pay) wins.push({ line: ln.n, sym: s[0], pay, cells: ln.rows.map((r, c) => [c, r]).slice(0, s[0] === s[1] && s[1] !== s[2] ? 2 : 3) });
  }
  return { total: wins.reduce((a, w) => a + w.pay, 0), wins };
}

// Se abre al conseguir la medalla Trueno (3.ª): puedes ir a Ciudad Azulona
export const CASINO_BADGES = 3;
export function casinoUnlocked(state) {
  return Math.max(state.badges?.length || 0, Math.min(8, state.chapter || 0)) >= CASINO_BADGES;
}

// Premios del Casino de Ciudad Azulona (una especie, nivel fijo, precio en fichas)
export const SHOP_KANTO = [
  { id: 63, level: 9, price: 60 },
  { id: 35, level: 8, price: 120 },
  { id: 30, level: 17, price: 250 },
  { id: 147, level: 18, price: 600 },
  { id: 123, level: 25, price: 900 },
  { id: 137, level: 26, price: 1500 },
];
// Vista previa del siguiente casino (Ciudad Trigal, Johto; bloqueado). Las especies que no están en tu Pokédex salen como ???.
export const SHOP_NEXT = [
  { id: 63, level: 10, price: 100 },
  { id: 23, level: 12, price: 200 },
  { id: 27, level: 12, price: 200 },
  { id: 104, level: 18, price: 400 },
  { id: 202, level: 20, price: 800 },
  { id: 147, level: 25, price: 1500 },
  { id: 233, level: 30, price: 3000 },
];
