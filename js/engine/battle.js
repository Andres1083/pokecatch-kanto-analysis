// Motor de combates simple pero sólido (Gen 1 style)

import { getTypeEffectiveness } from "../data/pokeapi.js?v=133";

/**
 * Calcula el daño usando la fórmula clásica de Pokémon
 */
export function calculateDamage(attacker, defender, move) {
  if (move.category === "status" || move.power <= 0) {
    return { damage: 0, effectiveness: 1, critical: false, missed: false };
  }

  // Precisión
  const accuracy = move.accuracy ?? 100;
  if (Math.random() * 100 > accuracy) {
    return { damage: 0, effectiveness: 1, critical: false, missed: true };
  }

  const level = attacker.level;
  const power = move.power;
  const isPhysical = move.category === "physical";

  const attackStat = isPhysical ? attacker.stats.atk : attacker.stats.spa;
  const defenseStat = isPhysical ? defender.stats.def : defender.stats.spd;

  // Fórmula base (igual que el original de Poke'Catch / juegos clásicos)
  let base = ((2 * level / 5 + 2) * power * attackStat / defenseStat / 50) + 2;

  // STAB
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;

  // Efectividad de tipos
  const effectiveness = getTypeEffectiveness(move.type, defender.types);

  // Crítico (1/16 chance como Gen 1 aprox)
  const critical = Math.random() < 1 / 16;
  const critMult = critical ? 1.5 : 1;

  // Random 0.85 - 1.00
  const random = 0.85 + Math.random() * 0.15;

  const damage = Math.max(1, Math.floor(base * stab * effectiveness * critMult * random));

  return { damage, effectiveness, critical, missed: false };
}

/**
 * Aplica daño a un Pokémon
 */
export function applyDamage(pokemon, damage) {
  pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
  return pokemon.currentHp <= 0;
}

/**
 * Elige el mejor movimiento del enemigo (IA muy simple)
 */
export function chooseEnemyMove(enemy, player) {
  // Prioriza movimientos con daño efectivo
  let best = enemy.moves[0];
  let bestScore = -1;

  for (const move of enemy.moves) {
    if (move.category === "status") continue;
    const eff = getTypeEffectiveness(move.type, player.types);
    const score = (move.power || 0) * eff;
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best || enemy.moves[0];
}

/**
 * Resuelve un turno completo (jugador elige movimiento)
 */
export function resolveTurn(player, enemy, playerMove) {
  const log = [];
  const events = [];

  // Orden por velocidad (simplificado)
  const playerFirst = player.stats.spe >= enemy.stats.spe;

  const order = playerFirst
    ? [{ mon: player, move: playerMove, isPlayer: true }, { mon: enemy, move: chooseEnemyMove(enemy, player), isPlayer: false }]
    : [{ mon: enemy, move: chooseEnemyMove(enemy, player), isPlayer: false }, { mon: player, move: playerMove, isPlayer: true }];

  for (const { mon, move, isPlayer } of order) {
    if (mon.currentHp <= 0) continue;

    const target = isPlayer ? enemy : player;
    const result = calculateDamage(mon, target, move);

    const name = mon.nameEs || mon.name;
    const moveName = move.nameEs || move.name;

    if (result.missed) {
      log.push(`${name} usó ${moveName}... ¡pero falló!`);
      events.push({ type: "miss", attacker: mon, move });
      continue;
    }

    if (result.damage === 0) {
      log.push(`${name} usó ${moveName}.`);
      events.push({ type: "status-move", attacker: mon, move });
      continue;
    }

    const fainted = applyDamage(target, result.damage);

    let msg = `${name} usó ${moveName}.`;
    if (result.critical) msg += " ¡Golpe crítico!";
    if (result.effectiveness > 1) msg += " ¡Es muy efectivo!";
    if (result.effectiveness < 1 && result.effectiveness > 0) msg += " No es muy efectivo...";
    if (result.effectiveness === 0) msg += " No afecta al Pokémon enemigo...";

    log.push(msg);
    events.push({
      type: "damage",
      attacker: mon,
      target,
      move,
      damage: result.damage,
      critical: result.critical,
      effectiveness: result.effectiveness,
    });

    if (fainted) {
      const targetName = target.nameEs || target.name;
      log.push(`¡${targetName} se debilitó!`);
      events.push({ type: "faint", pokemon: target });
      break; // Fin del combate si uno cae
    }
  }

  return { log, events, playerFainted: player.currentHp <= 0, enemyFainted: enemy.currentHp <= 0 };
}

/**
 * Puntuación de un aliado frente a un rival (mayor = mejor cambio).
 * Combina: resistencia a los tipos del rival + poder ofensivo efectivo + PS restantes.
 */
export function scoreAllyVsEnemy(ally, enemy) {
  if (!ally || ally.currentHp <= 0) return -Infinity;
  const eTypes = enemy.types || [];
  const aTypes = ally.types || [];

  // Resistencia: qué tan poco duele que el rival ataque con sus tipos
  let resist = 0;
  for (const t of eTypes) {
    const mult = getTypeEffectiveness(t, aTypes);
    if (mult === 0) resist += 3;
    else if (mult < 1) resist += 2 / Math.max(mult, 0.25);
    else if (mult > 1) resist -= mult;
    else resist += 0.5;
  }

  // Ofensiva: mejor STAB del aliado contra el rival
  let offense = 0;
  for (const t of aTypes) {
    const mult = getTypeEffectiveness(t, eTypes);
    offense = Math.max(offense, mult);
  }
  // También mirar movimientos si hay
  for (const mv of ally.moves || []) {
    if (!(mv.power > 0)) continue;
    const mult = getTypeEffectiveness(mv.type, eTypes);
    const stab = aTypes.includes(mv.type) ? 1.5 : 1;
    offense = Math.max(offense, mult * stab * (0.5 + (mv.power || 0) / 120));
  }

  const hpRatio = ally.currentHp / Math.max(1, ally.maxHp);
  const levelBias = (ally.level || 1) * 0.02;

  return resist * 2.2 + offense * 3.5 + hpRatio * 1.5 + levelBias;
}

/** Elige el mejor aliado vivo contra el enemigo. */
export function pickBestAlly(allies, enemy) {
  let best = -1;
  let bestScore = -Infinity;
  for (let i = 0; i < allies.length; i++) {
    const a = allies[i];
    if (!a || a.currentHp <= 0) continue;
    const s = scoreAllyVsEnemy(a, enemy);
    if (s > bestScore) {
      bestScore = s;
      best = i;
    }
  }
  return best;
}
