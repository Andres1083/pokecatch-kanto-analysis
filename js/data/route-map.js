// Mapa de la ruta: lista de nodos que el jugador va recorriendo.
//   wild    → arbusto: encuentro con Pokémon salvaje
//   trainer → punto rojo: combate contra entrenador
//   item    → "?": objeto aleatorio (₽, pepita, vitaminas, piedras...)
//   center  → Centro Pokémon: cura al equipo

export const ROUTES = {
  1: { name: "Ruta 1", total: 18 },
};

export function generateRouteNodes(total = 18, rand = Math.random) {
  const nodes = [];
  const centerAt = Math.floor(total * 0.55);
  for (let i = 0; i < total; i++) {
    if (i === centerAt) { nodes.push("center"); continue; }
    if (i === total - 1) { nodes.push("trainer"); continue; } // jefe de ruta
    const prev = nodes[i - 1];
    let r = rand();
    let t = r < 0.18 ? "trainer" : r < 0.30 ? "item" : "wild";
    if (i === 0) t = "wild";
    if (t === "item" && prev === "item") t = "wild";
    if (t === "trainer" && prev === "trainer" && nodes[i - 2] === "trainer") t = "wild";
    nodes.push(t);
  }
  return nodes;
}

const TRAINER_NAMES = [
  "Joven Marcos", "Cazabichos Pablo", "Chica Lucía", "Excursionista Tomás",
  "Jugador Iván", "Campista Sara", "Pícnico Elena", "Chaval Dani",
];
export function randomTrainerName(rand = Math.random) {
  return TRAINER_NAMES[Math.floor(rand() * TRAINER_NAMES.length)];
}

// ───────── Entrenadores rivales: clase, sprite y nombre ─────────
const CLASSES = {
  youngster: "Joven", lass: "Chica", bugcatcher: "Cazabichos", hiker: "Montañero", fisherman: "Pescador",
  biker: "Motorista", beauty: "Belleza", camper: "Campista", picnicker: "Excursionista",
  birdkeeper: "Pajarero", supernerd: "Friki",
  sage: "Sabio", rocketgrunt: "Recluta Rocket", "rocketgrunt-f": "Recluta Rocket", scientist: "Científico",
  acetrainer: "Entrenador", "acetrainer-f": "Entrenadora", blackbelt: "Cinturón negro", psychic: "Médium",
};
const POOLS = {
  forest: ["bugcatcher", "bugcatcher", "camper", "picnicker"],
  prairie: ["youngster", "lass", "birdkeeper", "camper"],
  mountain: ["hiker", "hiker", "supernerd", "youngster"],
  cave: ["hiker", "supernerd", "youngster"],
  lake: ["fisherman", "beauty", "lass"],
  pier: ["fisherman", "beauty", "lass"],
  beach: ["fisherman", "beauty", "lass"],
  town: ["youngster", "lass", "beauty", "biker"],
};
const FIRST = ["Rémi", "Marcos", "Pablo", "Lucía", "Tomás", "Iván", "Sara", "Elena", "Dani", "Hugo", "Nora", "Leo", "Ada", "Biel"];

export function randomTrainer(seg, rand = Math.random) {
  let pool = (seg?.classes?.length ? seg.classes : null) || POOLS[seg?.bg] || POOLS.prairie;
  if (/Bici/i.test(seg?.name || "")) pool = ["biker"];
  const sprite = pool[Math.floor(rand() * pool.length)];
  return { sprite, name: `${CLASSES[sprite]} ${FIRST[Math.floor(rand() * FIRST.length)]}` };
}
