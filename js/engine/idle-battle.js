// Motor de combate IDLE (automático en la ruta)

import { calculateDamage, chooseEnemyMove, pickBestAlly } from "./battle.js?v=135";


// ── Estados alterados (envenenamiento / parálisis) ──
const hasType = (m, t) => (m.types || []).includes(t);
function tryInflict(target, move) {
  if (!target || target.currentHp <= 0 || target.status || !move || !(move.power > 0)) return null;
  if (move.type === "poison" && !hasType(target, "poison") && !hasType(target, "steel") && Math.random() < 0.3) return "psn";
  if (move.type === "electric" && !hasType(target, "electric") && !hasType(target, "ground") && Math.random() < 0.2) return "par";
  return null;
}

/**
 * Combate idle. Los índices teamIndex corresponden a playerTeam original.
 */
export function* runIdleBattle(playerTeam, enemy, opts = {}) {
  const { speed = 1 } = opts;
  const allies = playerTeam.map((m, i) => ({
    ...m,
    currentHp: m.currentHp,
    maxHp: m.maxHp,
    teamIndex: i,
  }));
  const foe = { ...enemy, currentHp: enemy.currentHp, maxHp: enemy.maxHp };

  const autoSwitch = opts.autoSwitch !== false; // por defecto activo
  let allyIndex = autoSwitch ? pickBestAlly(allies, foe) : allies.findIndex(a => a.currentHp > 0);
  if (allyIndex < 0) {
    yield { type: "defeat" };
    return { won: false, allies, foe };
  }

  let turn = 0;

  yield {
    type: "appear",
    enemy: foe,
    allies,
    teamIndex: allyIndex,
  };

  while (foe.currentHp > 0 && allies.some(a => a.currentHp > 0)) {
    turn++;
    const ally = allies[allyIndex];
    if (!ally || ally.currentHp <= 0) {
      allyIndex = autoSwitch ? pickBestAlly(allies, foe) : allies.findIndex(a => a.currentHp > 0);
      if (allyIndex < 0) break;
      continue;
    }

    // Turno aliado
    let allySkip = false;
    if (ally.currentHp > 0 && ally.status === "par" && Math.random() < 0.25) {
      allySkip = true;
      yield { type: "status-skip", status: "par", pokemon: ally, side: "ally", teamIndex: allyIndex };
    }
    if (ally.currentHp > 0 && !allySkip) {
      const move = chooseEnemyMove(ally, foe);
      const result = calculateDamage(ally, foe, move);

      if (result.missed) {
        yield { type: "miss", attacker: ally, move, side: "ally", teamIndex: allyIndex };
      } else if (result.damage > 0) {
        foe.currentHp = Math.max(0, foe.currentHp - result.damage);
        yield {
          type: "damage",
          attacker: ally,
          target: foe,
          move,
          damage: result.damage,
          critical: result.critical,
          effectiveness: result.effectiveness,
          side: "ally",
          hpAfter: foe.currentHp,
          teamIndex: allyIndex,
        };
        if (foe.currentHp <= 0) {
          yield { type: "faint", pokemon: foe, side: "enemy" };
          break;
        }
        const st = tryInflict(foe, move);
        if (st) { foe.status = st; yield { type: "status", status: st, pokemon: foe, side: "enemy" }; }
      }
    }

    // Veneno: daño al final del turno del aliado
    if (ally.currentHp > 0 && ally.status === "psn" && foe.currentHp > 0) {
      const dmg = Math.max(1, Math.floor(ally.maxHp / 8));
      ally.currentHp = Math.max(0, ally.currentHp - dmg);
      yield { type: "status-dmg", status: "psn", pokemon: ally, side: "ally", teamIndex: allyIndex, damage: dmg, hpAfter: ally.currentHp };
      if (ally.currentHp <= 0) {
        yield { type: "faint", pokemon: ally, side: "ally", teamIndex: allyIndex };
        const next = autoSwitch ? pickBestAlly(allies, foe) : allies.findIndex(a => a.currentHp > 0);
        if (next < 0) break;
        allyIndex = next;
        yield { type: "switch", pokemon: allies[next], teamIndex: next };
        continue;
      }
    }

    // Turno enemigo
    if (foe.currentHp > 0) {
      const alive = allies.filter(a => a.currentHp > 0);
      if (!alive.length) break;

      const target = allies[allyIndex].currentHp > 0 ? allies[allyIndex] : alive[0];
      const tIndex = target.teamIndex;
      const move = chooseEnemyMove(foe, target);
      const result = calculateDamage(foe, target, move);

      let foeSkip = false;
      if (foe.status === "par" && Math.random() < 0.25) {
        foeSkip = true;
        yield { type: "status-skip", status: "par", pokemon: foe, side: "enemy" };
      }

      if (foeSkip) {
        // no actúa
      } else if (result.missed) {
        yield { type: "miss", attacker: foe, move, side: "enemy", teamIndex: tIndex };
      } else if (result.damage > 0) {
        target.currentHp = Math.max(0, target.currentHp - result.damage);
        yield {
          type: "damage",
          attacker: foe,
          target,
          move,
          damage: result.damage,
          critical: result.critical,
          effectiveness: result.effectiveness,
          side: "enemy",
          hpAfter: target.currentHp,
          teamIndex: tIndex,
        };
        if (target.currentHp <= 0) {
          yield { type: "faint", pokemon: target, side: "ally", teamIndex: tIndex };
          const next = autoSwitch ? pickBestAlly(allies, foe) : allies.findIndex(a => a.currentHp > 0);
          if (next < 0) break;
          allyIndex = next;
          yield {
            type: "switch",
            pokemon: allies[next],
            teamIndex: next,
          };
        } else {
          const st = tryInflict(target, move);
          if (st) { target.status = st; yield { type: "status", status: st, pokemon: target, side: "ally", teamIndex: tIndex }; }
        }
      }

      // Veneno: daño al final del turno del rival
      if (foe.currentHp > 0 && foe.status === "psn") {
        const dmg = Math.max(1, Math.floor(foe.maxHp / 8));
        foe.currentHp = Math.max(0, foe.currentHp - dmg);
        yield { type: "status-dmg", status: "psn", pokemon: foe, side: "enemy", damage: dmg, hpAfter: foe.currentHp };
        if (foe.currentHp <= 0) { yield { type: "faint", pokemon: foe, side: "enemy" }; break; }
      }
    }

    if (turn > 50) break;
  }

  const won = foe.currentHp <= 0;
  yield { type: won ? "victory" : "defeat", allies, foe };
  return { won, allies, foe };
}

export function pickWildEncounter(encounterList) {
  const walk = (encounterList || []).filter(e => {
    const method = e[4] || "walk";
    return method === "walk" || method.includes("walk");
  });
  const pool = walk.length ? walk : encounterList || [];
  if (!pool.length) {
    const id = Math.random() < 0.5 ? 16 : 19;
    const level = 2 + Math.floor(Math.random() * 3);
    return { id, level };
  }

  const totalWeight = pool.reduce((s, e) => s + (e[3] || 1), 0);
  let r = Math.random() * totalWeight;
  for (const e of pool) {
    r -= e[3] || 1;
    if (r <= 0) {
      const minL = e[1] || 2;
      const maxL = e[2] || minL;
      const level = minL + Math.floor(Math.random() * (maxL - minL + 1));
      return { id: e[0], level };
    }
  }
  const e = pool[0];
  return { id: e[0], level: e[1] || 3 };
}
