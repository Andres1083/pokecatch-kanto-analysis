// Estados alterados — tabla de movimientos, inmunidades y textos (según el original, reimplementado).
// brn quemadura · par parálisis · psn veneno · slp sueño · frz congelación · cnf confusión
const M = {
  ember:["brn",10],"fire-punch":["brn",10],flamethrower:["brn",10],"fire-blast":["brn",10],"flame-wheel":["brn",10],"sacred-fire":["brn",50],"fire-fang":["brn",10],"lava-plume":["brn",30],"heat-wave":["brn",10],"flare-blitz":["brn",10],"blaze-kick":["brn",10],inferno:["brn",100],"will-o-wisp":["brn",85],
  "thunder-fang":["par",10],discharge:["par",30],nuzzle:["par",100],bounce:["par",30],"dragon-breath":["par",30],"thunder-shock":["par",10],"thunder-punch":["par",10],thunderbolt:["par",10],thunder:["par",30],spark:["par",30],"zap-cannon":["par",100],"body-slam":["par",30],lick:["par",30],"stun-spore":["par",75],"thunder-wave":["par",100],glare:["par",75],
  "poison-jab":["psn",30],"poison-fang":["psn",50],"cross-poison":["psn",10],"gunk-shot":["psn",30],"sludge-wave":["psn",10],"poison-tail":["psn",10],toxic:["psn",90],"poison-sting":["psn",30],sludge:["psn",30],"sludge-bomb":["psn",30],smog:["psn",40],twineedle:["psn",20],"poison-powder":["psn",75],"poison-gas":["psn",55],
  "ice-fang":["frz",10],"freeze-dry":["frz",10],"ice-beam":["frz",10],"ice-punch":["frz",10],blizzard:["frz",10],"powder-snow":["frz",10],
  "dynamic-punch":["cnf",100],hurricane:["cnf",30],"water-pulse":["cnf",20],confusion:["cnf",10],psybeam:["cnf",10],"dizzy-punch":["cnf",20],"confuse-ray":["cnf",100],supersonic:["cnf",55],"sweet-kiss":["cnf",75],
  "tri-attack":["tri",20],
  "sleep-powder":["slp",75],spore:["slp",100],hypnosis:["slp",60],sing:["slp",55],"lovely-kiss":["slp",75],
};
const IMMUNE = { brn: ["fire"], psn: ["poison", "steel"], frz: ["ice"], par: [], slp: [], cnf: [] };
const ALWAYS = new Set(["spore", "sacred-fire", "nuzzle", "zap-cannon", "inferno", "dynamic-punch"]);

export const STATUS_INFO = {
  brn: { tag: "QUE", color: "#f0703a", got: "se quemó", hurt: "sufre por la quemadura" },
  par: { tag: "PAR", color: "#e8c41c", got: "está paralizado", stuck: "está paralizado. ¡No se puede mover!" },
  psn: { tag: "ENV", color: "#b65ad6", got: "fue envenenado", hurt: "sufre por el veneno" },
  slp: { tag: "DOR", color: "#9aa3b5", got: "se durmió", stuck: "está profundamente dormido…", end: "se despertó" },
  frz: { tag: "CEL", color: "#6ad0f0", got: "se congeló", stuck: "está congelado. ¡No se puede mover!", end: "se descongeló" },
  cnf: { tag: "CON", color: "#ff8fd0", got: "está confuso", hurt: "se hirió a sí mismo en su confusión", end: "ya no está confuso" },
};

const slugOf = (m) => (m?.name || m?.key || "").toLowerCase().trim().replace(/\s+/g, "-");
const hasType = (mon, t) => (mon.types || []).includes(t);

/** { status, chance% } que provoca el movimiento, o null. Límite: 100 si es especial, 30 si daña, 50 si es de estado. */
export function effectOf(move) {
  const s = slugOf(move);
  const e = M[s];
  if (!e) return null;
  const cap = ALWAYS.has(s) ? 100 : (move.power > 0 ? 30 : 50);
  const status = e[0] === "tri" ? ["brn", "par", "frz"][Math.floor(Math.random() * 3)] : e[0];
  return { status, chance: Math.min(e[1], cap) };
}

export function canGet(mon, status) {
  if (status === "cnf") return !mon.confused;
  if (mon.status) return false;
  return !(IMMUNE[status] || []).some((t) => hasType(mon, t));
}

export function applyStatus(mon, status) {
  if (status === "cnf") { mon.confused = 2 + Math.floor(Math.random() * 4); return; }
  mon.status = status;
  if (status === "slp") mon.sleep = 1 + Math.floor(Math.random() * 3);
}

export function clearStatus(mon) { delete mon.status; delete mon.sleep; delete mon.confused; }
