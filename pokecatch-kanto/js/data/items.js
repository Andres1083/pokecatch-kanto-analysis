// Objetos de la mochila: datos, recompensas del nodo "?" y efectos.

export const CATEGORIES = [
  { key: "berry",   label: "Bayas" },
  { key: "key",     label: "Objetos clave" },
  { key: "candy",   label: "Caramelos" },
  { key: "vitamin", label: "Vitaminas" },
  { key: "stone",   label: "Evolución" },
  { key: "held",    label: "Para llevar" },
];

const VIT = (name, stat, a, b) => ({
  name, cat: "vitamin", shape: "pill", pal: { a, b, c: "#ffffff" }, weight: 2,
  desc: `Sube de forma permanente la estadística de ${stat.label} (máx. 10 por vitamina).`,
  use: { vitamin: stat.key },
});

export const ITEMS = {
  "berry-oran":   { name: "Baya Aranja", cat: "berry", shape: "berry", pal: { a: "#f08a3c", b: "#b5521b", c: "#ffd2a0" }, weight: 16,
                    desc: "Restaura el 30 % de los PS de un Pokémon.", use: { heal: 0.3 } },
  "berry-pecha":  { name: "Baya Meloc", cat: "berry", shape: "berry", pal: { a: "#f3a6b6", b: "#c4607a", c: "#ffe0e7" }, weight: 9,
                    desc: "Restaura el 50 % de los PS de un Pokémon.", use: { heal: 0.5 } },
  "berry-sitrus": { name: "Baya Zidra", cat: "berry", shape: "berry", pal: { a: "#f5d441", b: "#c29a10", c: "#fff3a8" }, weight: 4,
                    desc: "Restaura todos los PS de un Pokémon.", use: { heal: 1 } },

  "nugget": { name: "Pepita Dorada", cat: "key", shape: "nugget", pal: { a: "#f7c531", b: "#b9831a", c: "#fff1a6" }, weight: 4,
              desc: "Una pepita brillante. Se puede vender por 2.500 ₽.", sell: 2500 },
  "pearl":  { name: "Perla", cat: "key", shape: "pearl", pal: { a: "#e8eef7", b: "#9aa9c2", c: "#ffffff" }, weight: 4,
              desc: "Una perla lustrosa. Se puede vender por 1.000 ₽.", sell: 1000 },

  "old-amber": { name: "Ámbar Viejo", cat: "key", shape: "pearl", pal: { a: "#e8a63a", b: "#a86a14", c: "#ffe2a0" }, weight: 0,
              desc: "Un trozo de ámbar con un Pokémon antiguo dentro. Se puede vender por 5.000 ₽.", sell: 5000 },
  "rare-candy": { name: "Caramelo Raro", cat: "candy", shape: "candy", pal: { a: "#f06ab5", b: "#b03a80", c: "#ffc2e6" }, weight: 0,
              desc: "Hace subir un nivel a un Pokémon.", use: { xpFrac: 1 } },

  "candy-s": { name: "Caramelo XS", cat: "candy", shape: "candy", pal: { a: "#6fdc8c", b: "#2f9d52", c: "#c9f7d6" }, weight: 12,
               desc: "Da experiencia a un Pokémon (≈15 % del nivel actual).", use: { xpFrac: 0.15 } },
  "candy-m": { name: "Caramelo M", cat: "candy", shape: "candy", pal: { a: "#f2a07b", b: "#c2623c", c: "#ffd9c6" }, weight: 6,
               desc: "Da experiencia a un Pokémon (≈40 % del nivel actual).", use: { xpFrac: 0.4 } },
  "candy-l": { name: "Caramelo L", cat: "candy", shape: "candy", pal: { a: "#7a8cf5", b: "#3f4fc2", c: "#d3d9ff" }, weight: 3,
              desc: "Da experiencia a un Pokémon (≈100 % del nivel actual: sube un nivel).", use: { xpFrac: 1 } },

  "vit-hp":  VIT("PS Más",   { key: "hp",  label: "PS" },        "#ef6a6a", "#b13a3a"),
  "vit-atk": VIT("Proteína", { key: "atk", label: "Ataque" },    "#f08a3c", "#b5521b"),
  "vit-def": VIT("Hierro",   { key: "def", label: "Defensa" },   "#6aa6ef", "#3a6fb1"),
  "vit-spa": VIT("Calcio",   { key: "spa", label: "At. Esp." },  "#c06aef", "#8a3ab1"),
  "vit-spd": VIT("Zinc",     { key: "spd", label: "Def. Esp." }, "#6aefb0", "#3ab176"),
  "vit-spe": VIT("Carbono",  { key: "spe", label: "Velocidad" }, "#efd96a", "#b19a3a"),

  "everstone": { name: "Piedra Eterna", cat: "held", shape: "gem", pal: { a: "#b9c2cc", b: "#6f7a86", c: "#f1f4f7" }, weight: 2,
                 desc: "Equípala a un huésped de la Guardería (pestaña Crianza): la cría heredará su naturaleza." },

  "stone-fire":    { name: "Piedra Fuego",  cat: "stone", shape: "gem", pal: { a: "#f0643a", b: "#a8321a", c: "#ffc2a8" }, weight: 3,
                     desc: "Hace evolucionar a ciertos Pokémon. Guárdala: las evoluciones llegarán pronto." },
  "stone-water":   { name: "Piedra Agua",   cat: "stone", shape: "gem", pal: { a: "#4a8cf0", b: "#1f55b0", c: "#b8d4ff" }, weight: 3,
                     desc: "Hace evolucionar a ciertos Pokémon. Guárdala: las evoluciones llegarán pronto." },
  "stone-thunder": { name: "Piedra Trueno", cat: "stone", shape: "gem", pal: { a: "#f5d441", b: "#b89610", c: "#fff3a8" }, weight: 3,
                     desc: "Hace evolucionar a ciertos Pokémon. Guárdala: las evoluciones llegarán pronto." },
  "stone-leaf":    { name: "Piedra Hoja",   cat: "stone", shape: "gem", pal: { a: "#5ac86a", b: "#2a8a3a", c: "#c4f5cc" }, weight: 3,
                     desc: "Hace evolucionar a ciertos Pokémon. Guárdala: las evoluciones llegarán pronto." },
  "stone-moon":    { name: "Piedra Lunar",  cat: "stone", shape: "gem", pal: { a: "#7a6fc4", b: "#463c8a", c: "#cfc8ff" }, weight: 2,
                     desc: "Hace evolucionar a ciertos Pokémon. Guárdala: las evoluciones llegarán pronto." },
};

export const ITEM_IDS = Object.keys(ITEMS);

export function addItem(state, id, qty = 1) {
  if (!ITEMS[id]) return;
  if (!state.bag) state.bag = {};
  state.bag[id] = (state.bag[id] || 0) + qty;
}

export function bagKinds(state) {
  return Object.keys(state.bag || {}).filter(id => ITEMS[id] && state.bag[id] > 0).length;
}

/**
 * Recompensa del nodo "?" (objeto aleatorio).
 * Devuelve { kind: "money", amount } o { kind: "item", id, qty }.
 */
export function rollReward(rand = Math.random) {
  // 30 % de las veces son Pokédólares; el resto, un objeto según peso.
  if (rand() < 0.3) return { kind: "money", amount: 200 + Math.floor(rand() * 400) };
  const total = ITEM_IDS.reduce((s, id) => s + (ITEMS[id].weight || 1), 0);
  let r = rand() * total;
  for (const id of ITEM_IDS) {
    r -= ITEMS[id].weight || 1;
    if (r <= 0) return { kind: "item", id, qty: (ITEMS[id].cat === "key" || ITEMS[id].cat === "held") ? 1 : 1 + (rand() < 0.25 ? 1 : 0) };
  }
  return { kind: "item", id: "berry-oran", qty: 1 };
}

/** Aplica la recompensa al estado y devuelve un texto para el mensaje. */
export function applyReward(state, reward) {
  if (reward.kind === "money") {
    state.money += reward.amount;
    return `¡Encontraste ${reward.amount} ₽!`;
  }
  addItem(state, reward.id, reward.qty);
  return `¡Encontraste ${ITEMS[reward.id].name}${reward.qty > 1 ? ` ×${reward.qty}` : ""}!`;
}

function take(state, id) {
  state.bag[id] -= 1;
  if (state.bag[id] <= 0) delete state.bag[id];
}

/** Usa un objeto sobre un Pokémon. Devuelve { ok, msg }. */
export function useItem(state, id, mon, { applyXp, xpForNext }) {
  const it = ITEMS[id];
  if (!it || !(state.bag?.[id] > 0)) return { ok: false, msg: "No te queda ese objeto." };
  const u = it.use;
  if (!u) return { ok: false, msg: "Este objeto no se puede usar ahora." };
  const name = mon.nameEs || mon.name;

  if (u.heal) {
    if (mon.currentHp <= 0) return { ok: false, msg: `${name} está debilitado.` };
    if (mon.currentHp >= mon.maxHp) return { ok: false, msg: `${name} ya tiene los PS al máximo.` };
    const before = mon.currentHp;
    mon.currentHp = Math.min(mon.maxHp, mon.currentHp + Math.ceil(mon.maxHp * u.heal));
    take(state, id);
    return { ok: true, msg: `${name} recuperó ${mon.currentHp - before} PS.` };
  }
  if (u.xpFrac) {
    const amount = Math.max(1, Math.round(xpForNext(mon.level) * u.xpFrac));
    const lv = applyXp(mon, amount);
    take(state, id);
    return { ok: true, msg: `${name} ganó ${amount} XP${lv ? ` y subió ${lv} nivel${lv > 1 ? "es" : ""}` : ""}.` };
  }
  if (u.vitamin) {
    mon.vitamins = mon.vitamins || {};
    const k = u.vitamin;
    if ((mon.vitamins[k] || 0) >= 10) return { ok: false, msg: `${name} ya no puede tomar más ${it.name}.` };
    if (k === "hp") {
      mon.maxHp += 4; mon.currentHp += 4; mon.stats.hp = mon.maxHp;
    } else {
      mon.stats[k] += Math.max(2, Math.ceil(mon.stats[k] * 0.04));
    }
    mon.vitamins[k] = (mon.vitamins[k] || 0) + 1;
    take(state, id);
    return { ok: true, msg: `${name} mejoró con ${it.name}.` };
  }
  // Piedras de evolución: la lógica real está en main (async evolve)
  if (it.cat === "stone") {
    return { ok: false, msg: "STONE_EVO", stone: true };
  }
  return { ok: false, msg: "Este objeto no se puede usar ahora." };
}

export function sellItem(state, id) {
  const it = ITEMS[id];
  if (!it?.sell || !(state.bag?.[id] > 0)) return { ok: false, msg: "No se puede vender." };
  take(state, id);
  state.money += it.sell;
  return { ok: true, msg: `Vendiste ${it.name} por ${it.sell} ₽.` };
}
