/**
 * Logros Kanto (extraídos del original Poke'Catch + capturas).
 * kind: "aspect" | "frame" | "scene"
 * progress(ctx) → { cur, max }  |  done(ctx) → bool
 */

export const ACHIEVEMENTS = [
  // ── Aspectos (outfits / trainer sprites) ──
  {
    id: "oak",
    kind: "aspect",
    reward: "oak",
    title: "Prof. Oak",
    desc: "Captura todos los Pokémon de Kanto, legendarios y singulares incluidos.",
    max: 151,
    progress: (s) => countDex(s, 1, 151),
  },
  {
    id: "fisherman",
    kind: "aspect",
    reward: "fisherman",
    title: "Pescador",
    desc: "Captura todos los Pokémon de tipo Agua de Kanto.",
    max: 32,
    // ids agua Kanto gen1
    ids: [7,8,9,54,55,60,61,62,72,73,79,80,86,87,90,91,98,99,116,117,118,119,120,121,129,130,131,134,138,139,140,141],
    progress: (s) => countIds(s, [7,8,9,54,55,60,61,62,72,73,79,80,86,87,90,91,98,99,116,117,118,119,120,121,129,130,131,134,138,139,140,141]),
  },
  {
    id: "scientist",
    kind: "aspect",
    reward: "scientist",
    title: "Científico",
    desc: "Revive los tres fósiles de Kanto.",
    max: 3,
    ids: [138, 140, 142],
    progress: (s) => countIds(s, [138, 140, 142]),
  },
  {
    id: "kimonogirl",
    kind: "aspect",
    reward: "beauty",
    title: "Eevee",
    desc: "Consigue a Vaporeon, Jolteon y Flareon.",
    max: 3,
    ids: [134, 135, 136],
    progress: (s) => countIds(s, [134, 135, 136]),
  },
  {
    id: "rocketgrunt",
    kind: "aspect",
    reward: "grunt",
    title: "Variocolor ×10",
    desc: "Ten 10 Pokémon variocolor.",
    max: 10,
    progress: (s) => ({ cur: Math.min(10, countShiny(s)), max: 10 }),
  },
  {
    id: "pokefan-f",
    kind: "aspect",
    reward: "lass",
    title: "Guardería",
    desc: "Haz eclosionar 50 Huevos.",
    max: 50,
    progress: (s) => ({ cur: Math.min(50, s.stats?.hatched || 0), max: 50 }),
  },
  {
    id: "youngster",
    kind: "aspect",
    reward: "youngster",
    title: "10 combates",
    desc: "Gana 10 combates.",
    max: 10,
    progress: (s) => ({ cur: Math.min(10, s.stats?.wins || 0), max: 10 }),
  },
  {
    id: "picnicker",
    kind: "aspect",
    reward: "picnicker",
    title: "10 capturas",
    desc: "Captura 10 Pokémon.",
    max: 10,
    progress: (s) => ({ cur: Math.min(10, totalCaptures(s)), max: 10 }),
  },
  {
    id: "brock-outfit",
    kind: "aspect",
    reward: "camper",
    title: "Medalla Roca",
    desc: "Consigue la Medalla Roca.",
    max: 1,
    progress: (s) => ({ cur: hasBadge(s, "Roca") ? 1 : 0, max: 1 }),
  },
  {
    id: "misty-outfit",
    kind: "aspect",
    reward: "swimmer-f",
    title: "Medalla Cascada",
    desc: "Consigue la Medalla Cascada.",
    max: 1,
    progress: (s) => ({ cur: hasBadge(s, "Cascada") ? 1 : 0, max: 1 }),
  },
  {
    id: "erika-outfit",
    kind: "aspect",
    reward: "beauty",
    title: "Medalla Arcoíris",
    desc: "Consigue la Medalla Arcoíris.",
    max: 1,
    progress: (s) => ({ cur: hasBadge(s, "Arcoíris") ? 1 : 0, max: 1 }),
  },
  {
    id: "sabrina-outfit",
    kind: "aspect",
    reward: "channeler",
    title: "Medalla Pantano",
    desc: "Consigue la Medalla Pantano.",
    max: 1,
    progress: (s) => ({ cur: hasBadge(s, "Pantano") ? 1 : 0, max: 1 }),
  },
  {
    id: "badges8",
    kind: "aspect",
    reward: "cooltrainer-m",
    title: "8 medallas",
    desc: "Consigue las 8 medallas de Kanto.",
    max: 8,
    progress: (s) => ({ cur: Math.min(8, (s.badges || []).length), max: 8 }),
  },
  {
    id: "evolve30",
    kind: "aspect",
    reward: "supernerd",
    title: "Evoluciones",
    desc: "Haz evolucionar 30 Pokémon.",
    max: 30,
    progress: (s) => ({ cur: Math.min(30, s.stats?.evolutions || s.stats?.evolved || 0), max: 30 }),
  },
  {
    id: "blue",
    kind: "aspect",
    reward: "blue",
    title: "Campeón",
    desc: "Derrota a Azul en la Liga para desbloquearlo.",
    max: 1,
    progress: (s) => ({ cur: hasBadge(s, "Maestro") || s.stats?.champion ? 1 : 0, max: 1 }),
  },
  {
    id: "pokemaniac",
    kind: "aspect",
    reward: "hiker",
    title: "Pokémaníaco",
    desc: "Captura 500 Pokémon, duplicados incluidos.",
    max: 500,
    progress: (s) => ({ cur: Math.min(500, totalCaptures(s)), max: 500 }),
  },
  {
    id: "gentleman",
    kind: "aspect",
    reward: "gentleman",
    title: "Intercambios",
    desc: "Completa 20 intercambios.",
    max: 20,
    progress: (s) => ({ cur: Math.min(20, s.stats?.trades || 0), max: 20 }),
  },
  {
    id: "giovanni",
    kind: "aspect",
    reward: "giovanni",
    title: "Giovanni",
    desc: "Derrota a Giovanni en Ciudad Verde sin que ninguno de tus Pokémon se debilite.",
    max: 1,
    progress: (s) => ({ cur: s.feats?.giovanni || s.stats?.feats?.giovanni ? 1 : 0, max: 1 }),
  },

  {
    id: "blackbelt", kind: "aspect", reward: "blackbelt",
    title: "Maestro de incursiones",
    desc: "Gana 25 incursiones variocolor.",
    max: 25,
    progress: (s) => ({ cur: Math.min(25, Number(s.raids?.clears || s.stats?.raidClears || 0)), max: 25 }),
  },

  // ── Marcos (frames) ──
  {
    id: "frame-trade50",
    kind: "frame",
    reward: "trade",
    title: "Intercambios",
    desc: "Completa 50 intercambios.",
    max: 50,
    progress: (s) => ({ cur: Math.min(50, s.stats?.trades || 0), max: 50 }),
  },
  {
    id: "frame-dex250",
    kind: "frame",
    reward: "dex",
    title: "Pokédex",
    desc: "Captura 250 especies diferentes.",
    max: 250,
    progress: (s) => ({ cur: Math.min(250, dexCount(s)), max: 250 }),
  },
  {
    id: "frame-hatch100",
    kind: "frame",
    reward: "nursery",
    title: "Guardería",
    desc: "Haz eclosionar 100 Huevos.",
    max: 100,
    progress: (s) => ({ cur: Math.min(100, s.stats?.hatched || 0), max: 100 }),
  },
  {
    id: "frame-shiny50",
    kind: "frame",
    reward: "shiny",
    title: "Variocolor",
    desc: "Ten 50 Pokémon variocolor.",
    max: 50,
    progress: (s) => ({ cur: Math.min(50, countShiny(s)), max: 50 }),
  },
  {
    id: "frame-raids50",
    kind: "frame",
    reward: "raid",
    title: "Incursiones",
    desc: "Gana 50 incursiones variocolor.",
    max: 50,
    progress: (s) => ({ cur: Math.min(50, s.stats?.raidClears || s.raids?.clears || 0), max: 50 }),
  },
  {
    id: "frame-casino",
    kind: "frame",
    reward: "casino",
    title: "Casino",
    desc: "Desbloquea el Casino de Ciudad Azulona.",
    max: 1,
    progress: (s) => ({ cur: casinoProgress(s) ? 1 : 0, max: 1 }),
  },

  // ── Escenas (cinemáticas Kanto) ──
  {
    id: "scene-zapdos",
    kind: "scene",
    reward: "zapdos",
    title: "Zapdos",
    desc: "Pokémon legendario — captura a Zapdos.",
    region: "kanto",
    max: 1,
    progress: (s) => ({ cur: owns(s, 145) ? 1 : 0, max: 1 }),
  },
  {
    id: "scene-moltres",
    kind: "scene",
    reward: "moltres",
    title: "Moltres",
    desc: "Pokémon legendario — captura a Moltres.",
    region: "kanto",
    max: 1,
    progress: (s) => ({ cur: owns(s, 146) ? 1 : 0, max: 1 }),
  },
  {
    id: "scene-articuno",
    kind: "scene",
    reward: "articuno",
    desc: "Pokémon legendario — captura a Articuno.",
    title: "Articuno",
    region: "kanto",
    max: 1,
    progress: (s) => ({ cur: owns(s, 144) ? 1 : 0, max: 1 }),
  },
  {
    id: "scene-mewtwo",
    kind: "scene",
    reward: "mewtwo",
    title: "Mewtwo",
    desc: "Pokémon legendario — captura a Mewtwo.",
    region: "kanto",
    max: 1,
    progress: (s) => ({ cur: owns(s, 150) ? 1 : 0, max: 1 }),
  },
  {
    id: "scene-mew",
    kind: "scene",
    reward: "mew",
    title: "Mew",
    desc: "Pokémon singular — captura a Mew.",
    region: "kanto",
    max: 1,
    progress: (s) => ({ cur: owns(s, 151) ? 1 : 0, max: 1 }),
  },
  {
    id: "scene-blue",
    kind: "scene",
    reward: "blue-champ",
    title: "Azul",
    desc: "Campeón de la Liga — derrota a Azul.",
    region: "kanto",
    max: 1,
    progress: (s) => ({ cur: hasBadge(s, "Maestro") || s.stats?.champion ? 1 : 0, max: 1 }),
  },
];

function dexSet(s) {
  const set = new Set((Array.isArray(s.stats?.caught) ? s.stats.caught : []).map(Number));
  for (const m of [...(s.playerTeam || []), ...(s.box || [])]) if (m?.id) set.add(m.id);
  if (s.dex) for (const k of Object.keys(s.dex)) set.add(+k);
  return set;
}
function dexCount(s) { return dexSet(s).size; }
function owns(s, id) { return dexSet(s).has(id); }
function countIds(s, ids) {
  const set = dexSet(s);
  const cur = ids.filter((id) => set.has(id)).length;
  return { cur, max: ids.length };
}
function countDex(s, from, to) {
  const set = dexSet(s);
  let cur = 0;
  for (let i = from; i <= to; i++) if (set.has(i)) cur++;
  return { cur, max: to - from + 1 };
}
function countShiny(s) {
  return [...(s.playerTeam || []), ...(s.box || [])].filter((m) => m?.shiny).length;
}
function totalCaptures(s) {
  return Number(s.stats?.captures ?? (Array.isArray(s.stats?.caught) ? s.stats.caught.length : 0)) || 0;
}
function casinoProgress(s) {
  return !!s.casinoUnlocked || Math.max(s.badges?.length || 0, Math.min(8, s.chapter || 0)) >= 3;
}

export const FRAME_REWARD_MAP = {
  trade: "pokeball", dex: "league", nursery: "pokeball",
  shiny: "league", raid: "rocket", casino: "casino",
};
function hasBadge(s, name) {
  return (s.badges || []).some((b) => String(b).toLowerCase().includes(String(name).toLowerCase()));
}

/** Evalúa todos los logros contra el estado de partida */
export function evaluateAchievements(state) {
  return ACHIEVEMENTS.map((a) => {
    const p = a.progress(state) || { cur: 0, max: a.max || 1 };
    const cur = p.cur | 0;
    const max = p.max || a.max || 1;
    const done = cur >= max;
    const pct = max ? Math.min(1, cur / max) : 0;
    const almost = !done && pct >= 0.7;
    return { ...a, cur, max, done, pct, almost };
  });
}

export function achievementSummary(state) {
  const list = evaluateAchievements(state);
  const unlocked = list.filter((a) => a.done).length;
  return { total: list.length, unlocked, list };
}
