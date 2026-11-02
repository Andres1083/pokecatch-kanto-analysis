// Clima interno del juego + ciclo día/noche

/** Semilla estable por hora local */
function hourSeed(d = new Date()) {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = d.getHours();
  return y * 1000000 + m * 10000 + day * 100 + h;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function isNight(d = new Date()) {
  const h = d.getHours();
  return h < 6 || h >= 20;
}

export function isDusk(d = new Date()) {
  const h = d.getHours();
  return h === 19 || h === 6;
}

/** Clima de juego estable durante la hora local actual. */
export function weatherForNow(d = new Date()) {
  const seed = hourSeed(d);
  const rnd = mulberry32(seed);
  const roll = rnd();
  let key;
  if (roll < 0.35) key = "clear";
  else if (roll < 0.55) key = "sun";
  else if (roll < 0.75) key = "cloud";
  else if (roll < 0.9) key = "rain";
  else key = "storm";

  const night = isNight(d);
  return {
    key,
    night,
    dusk: isDusk(d),
    hour: d.getHours(),
    untilHour: (d.getHours() + 1) % 24,
    label: labelFor(key, night),
    icon: iconFor(key, night),
  };
}

function labelFor(key, night) {
  if (night && (key === "clear" || key === "sun")) return "Noche despejada";
  const map = {
    clear: "Despejado",
    sun: "Sol",
    cloud: "Nublado",
    rain: "Lluvia",
    storm: "Tormenta",
  };
  return map[key] || "Despejado";
}

function iconFor(key, night) {
  if (night && (key === "clear" || key === "sun")) return "🌙";
  return {
    clear: "🌤️",
    sun: "☀️",
    cloud: "☁️",
    rain: "🌧️",
    storm: "⛈️",
  }[key] || "🌤️";
}

export function formatHour(h) {
  return `${String(h).padStart(2, "0")} h`;
}

export function formatClock(d = new Date()) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

/**
 * Clima interno del mundo del juego.
 * Se mantiene estable durante cada hora y no depende del tiempo meteorológico real
 * ni de las coordenadas del jugador.
 */
export function getGameWeather() {
  return { ...weatherForNow(), source: "game" };
}
