// Capa de datos usando PokeAPI (con caché simple en memoria)

const cache = new Map();

async function fetchJson(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PokeAPI error: ${res.status} ${url}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

export async function getPokemon(idOrName) {
  return fetchJson(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
}

export async function getPokemonSpecies(idOrName) {
  return fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${idOrName}`);
}

export async function getMove(idOrName) {
  return fetchJson(`https://pokeapi.co/api/v2/move/${idOrName}`);
}

export async function getType(idOrName) {
  return fetchJson(`https://pokeapi.co/api/v2/type/${idOrName}`);
}

// Devuelve datos listos para el motor de combate
export async function getPokemonForBattle(id, level = 5) {
  const mon = await getPokemon(id);
  const species = await getPokemonSpecies(id);

  const stats = {};
  for (const s of mon.stats) {
    const key = s.stat.name
      .replace("special-attack", "spa")
      .replace("special-defense", "spd")
      .replace("attack", "atk")
      .replace("defense", "def")
      .replace("speed", "spe")
      .replace("hp", "hp");
    stats[key] = s.base_stat;
  }

  // Calculamos stats a nivel (fórmula simplificada, sin IVs/EVs por ahora)
  const calcStat = (base, isHp = false) => {
    if (isHp) return Math.floor(((2 * base * level) / 100) + level + 10);
    return Math.floor(((2 * base * level) / 100) + 5);
  };

  const finalStats = {
    hp: calcStat(stats.hp, true),
    atk: calcStat(stats.atk),
    def: calcStat(stats.def),
    spa: calcStat(stats.spa),
    spd: calcStat(stats.spd),
    spe: calcStat(stats.spe),
  };

  // Movimientos (tomamos hasta 4 de los primeros learnable por nivel)
  const learned = mon.moves
    .filter(m => m.version_group_details.some(v => v.move_learn_method.name === "level-up"))
    .map(m => {
      const detail = m.version_group_details.find(v => v.move_learn_method.name === "level-up");
      return { name: m.move.name, level: detail.level_learned_at };
    })
    .filter(m => m.level <= level)
    .sort((a, b) => b.level - a.level)
    .slice(0, 4);

  const moves = [];
  for (const m of learned) {
    try {
      const moveData = await getMove(m.name);
      moves.push({
        id: moveData.id,
        name: moveData.name,
        nameEs: moveData.names?.find(n => n.language.name === "es")?.name || moveData.name,
        type: moveData.type.name,
        power: moveData.power || 0,
        accuracy: moveData.accuracy || 100,
        pp: moveData.pp,
        category: moveData.damage_class.name, // physical / special / status
      });
    } catch {
      // ignoramos movimientos que fallen
    }
  }

  // Si no tiene movimientos, le damos Tackle
  if (moves.length === 0) {
    moves.push({
      id: 33,
      name: "tackle",
      nameEs: "Placaje",
      type: "normal",
      power: 40,
      accuracy: 100,
      pp: 35,
      category: "physical",
    });
  }

  const nameEs = species.names?.find(n => n.language.name === "es")?.name || mon.name;
  const genus = species.genera?.find(g => g.language.name === "es")?.genus
    || species.genera?.find(g => g.language.name === "en")?.genus
    || "Pokémon";
  const flavor = species.flavor_text_entries?.find(f => f.language.name === "es")?.flavor_text
    || species.flavor_text_entries?.find(f => f.language.name === "en")?.flavor_text
    || "";

  return {
    id: mon.id,
    name: mon.name,
    nameEs,
    level,
    types: mon.types.map(t => t.type.name),
    stats: finalStats,
    maxHp: finalStats.hp,
    currentHp: finalStats.hp,
    moves,
    sprites: {
      front: mon.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mon.id}.png`,
      back: mon.sprites.back_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${mon.id}.png`,
      frontShiny: mon.sprites.front_shiny,
      official: mon.sprites.other?.["official-artwork"]?.front_default,
    },
    status: null,
    height: mon.height,
    weight: mon.weight,
    genus,
    flavor: flavor.replace(/\s+/g, " ").trim(),
  };
}

// Tabla de tipos simplificada (se puede ampliar o cargar de PokeAPI)
export const TYPE_CHART = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

export function getTypeEffectiveness(attackType, defenderTypes) {
  let multiplier = 1;
  for (const defType of defenderTypes) {
    const chart = TYPE_CHART[attackType];
    if (chart && chart[defType] !== undefined) {
      multiplier *= chart[defType];
    }
  }
  return multiplier;
}
