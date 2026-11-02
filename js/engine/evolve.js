// Evoluciones por nivel y por piedra

import { EVOS, evosOf } from "../data/evolutions.js?v=100";
import { getPokemonForBattle } from "../data/pokeapi.js?v=100";
import { frontSprite, backSprite } from "../data/sprites.js?v=100";
import { applyNatureToStats } from "../data/natures.js?v=100";

/** Evolución por nivel disponible (la de menor nivel que cumpla). */
export function levelEvoReady(mon) {
  const list = evosOf(mon.id).filter(e => e.kind === "lvl" && mon.level >= e.v);
  if (!list.length) return null;
  // Si hay varias, la de mayor umbral cumplido
  return list.sort((a, b) => b.v - a.v)[0];
}

/** Evolución por piedra concreta. */
export function stoneEvoReady(mon, itemId) {
  return evosOf(mon.id).find(e => e.kind === "stone" && e.item === itemId) || null;
}

/**
 * Transforma el mon en su evolución `toId`.
 * Conserva nivel, XP, naturaleza, vitaminas; recalcula stats y sprites.
 */
export async function evolveMon(mon, toId) {
  const level = mon.level;
  const ratio = mon.maxHp > 0 ? mon.currentHp / mon.maxHp : 1;
  const wasFainted = mon.currentHp <= 0;

  let next;
  try {
    next = await getPokemonForBattle(toId, level);
  } catch {
    // Offline: solo cambia id/nombre/sprites y escala stats ~15%
    next = {
      id: toId,
      name: mon.name,
      nameEs: mon.nameEs,
      level,
      types: mon.types,
      stats: {
        hp: Math.floor(mon.maxHp * 1.15),
        atk: Math.floor((mon.stats?.atk || 10) * 1.12),
        def: Math.floor((mon.stats?.def || 10) * 1.12),
        spa: Math.floor((mon.stats?.spa || 10) * 1.12),
        spd: Math.floor((mon.stats?.spd || 10) * 1.12),
        spe: Math.floor((mon.stats?.spe || 10) * 1.12),
      },
      moves: mon.moves,
    };
  }

  if (mon.natureIndex != null && next.stats) {
    next.stats = applyNatureToStats(next.stats, mon.natureIndex);
  }

  mon.id = toId;
  mon.name = next.name || mon.name;
  mon.nameEs = next.nameEs || next.name || mon.nameEs;
  mon.types = next.types || mon.types;
  mon.stats = { ...next.stats };
  mon.maxHp = next.stats.hp;
  mon.stats.hp = mon.maxHp;
  mon.currentHp = wasFainted ? 0 : Math.max(1, Math.floor(mon.maxHp * ratio));
  mon.moves = next.moves?.length ? next.moves.map(m => ({ ...m })) : mon.moves;
  mon.sprites = {
    front: frontSprite({id:toId,shiny:mon.shiny}),
    back: backSprite({id:toId,shiny:mon.shiny}),
  };
  mon.xp = mon.xp || 0;
  return mon;
}

/** Tras subir de nivel: aplica evoluciones en cadena si corresponde. */
export async function checkLevelEvolutions(mon) {
  const evolved = [];
  // Evitar bucle infinito
  for (let i = 0; i < 3; i++) {
    const evo = levelEvoReady(mon);
    if (!evo) break;
    const fromName = mon.nameEs || mon.name;
    await evolveMon(mon, evo.to);
    evolved.push({ from: fromName, to: mon.nameEs || mon.name, toId: mon.id });
  }
  return evolved;
}
