// Motor de combate IDLE (automático en la ruta)

import { calculateDamage, chooseEnemyMove } from "./battle.js?v=2";
import { effectOf, canGet, applyStatus } from "../data/status.js?v=2";


// ── Estados alterados (tabla en data/status.js) ──
function tryInflict(target, move) {
  if (!target || target.currentHp <= 0 || !move) return null;
  const fx = effectOf(move);
  if (!fx || !canGet(target, fx.status) || Math.random() * 100 >= fx.chance) return null;
  applyStatus(target, fx.status);
  return fx.status;
}
const isStatusMove = (m) => m && !(m.power > 0) && !!effectOf(m);
// Un Pokémon con un movimiento de estado útil lo usa a veces (30 %) si el rival no tiene estado.
function chooseMove(att, def) {
  if (!def.status && Math.random() < 0.3) {
    const sm = (att.moves || []).filter((m) => isStatusMove(m) && canGet(def, effectOf(m).status));
    if (sm.length) return sm[Math.floor(Math.random() * sm.length)];
  }
  return chooseEnemyMove(att, def);
}
/** Inicio de turno: sueño, congelación, parálisis, confusión. Devuelve true si pierde el turno. */
function* beginTurn(mon, side, idx) {
  const base = { pokemon: mon, side, teamIndex: idx };
  if (mon.status === "slp") {
    mon.sleep = (mon.sleep || 1) - 1;
    if (mon.sleep <= 0) { delete mon.status; delete mon.sleep; yield { type: "status-end", status: "slp", ...base }; }
    else { yield { type: "status-skip", status: "slp", ...base }; return true; }
  }
  if (mon.status === "frz") {
    if (Math.random() < 0.2) { delete mon.status; yield { type: "status-end", status: "frz", ...base }; }
    else { yield { type: "status-skip", status: "frz", ...base }; return true; }
  }
  if (mon.status === "par" && Math.random() < 0.25) { yield { type: "status-skip", status: "par", ...base }; return true; }
  if (mon.confused) {
    mon.confused--;
    if (mon.confused <= 0) { delete mon.confused; yield { type: "status-end", status: "cnf", ...base }; }
    else if (Math.random() < 0.33) {
      const dmg = Math.max(1, Math.min(mon.currentHp - 1, Math.floor(mon.maxHp / 10)));
      mon.currentHp = Math.max(1, mon.currentHp - dmg);
      yield { type: "status-dmg", status: "cnf", damage: dmg, hpAfter: mon.currentHp, ...base };
      return true;
    }
  }
  return false;
}
const dotFrac = (st) => (st === "psn" ? 8 : st === "brn" ? 16 : 0);
const burnHalf = (att, move, res) => { if (att.status === "brn" && move.category === "physical" && res.damage > 1) res.damage = Math.floor(res.damage / 2); return res; };

/**
 * Combate idle. Los índices teamIndex corresponden a playerTeam original.
 */
export function* runIdleBattle(playerTeam, enemy, { speed = 1 } = {}) {
  const allies = playerTeam.map((m, i) => ({
    ...m,
    currentHp: m.currentHp,
    maxHp: m.maxHp,
    teamIndex: i,
  }));
  const foe = { ...enemy, currentHp: enemy.currentHp, maxHp: enemy.maxHp };

  let allyIndex = allies.findIndex(a => a.currentHp > 0);
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
      allyIndex = allies.findIndex(a => a.currentHp > 0);
      if (allyIndex < 0) break;
      continue;
    }

    // Turno aliado
    const allySkip = yield* beginTurn(ally, "ally", allyIndex);
    if (ally.currentHp > 0 && !allySkip) {
      const move = chooseMove(ally, foe);
      const result = burnHalf(ally, move, calculateDamage(ally, foe, move));

      if (isStatusMove(move)) {
        if (Math.random() * 100 > (move.accuracy ?? 100)) yield { type: "miss", attacker: ally, move, side: "ally", teamIndex: allyIndex };
        else {
          yield { type: "use-move", attacker: ally, move, side: "ally", teamIndex: allyIndex };
          const st = tryInflict(foe, move);
          if (st) yield { type: "status", status: st, pokemon: foe, side: "enemy" };
        }
      } else if (result.missed) {
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
        if (st) yield { type: "status", status: st, pokemon: foe, side: "enemy" };
      }
    }

    // Veneno: daño al final del turno del aliado
    if (ally.currentHp > 0 && dotFrac(ally.status) && foe.currentHp > 0) {
      const dmg = Math.max(1, Math.floor(ally.maxHp / dotFrac(ally.status)));
      ally.currentHp = Math.max(0, ally.currentHp - dmg);
      yield { type: "status-dmg", status: ally.status, pokemon: ally, side: "ally", teamIndex: allyIndex, damage: dmg, hpAfter: ally.currentHp };
      if (ally.currentHp <= 0) {
        yield { type: "faint", pokemon: ally, side: "ally", teamIndex: allyIndex };
        const next = allies.findIndex(a => a.currentHp > 0);
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
      const move = chooseMove(foe, target);
      const result = burnHalf(foe, move, calculateDamage(foe, target, move));

      const foeSkip = yield* beginTurn(foe, "enemy", undefined);

      if (foeSkip) {
        // no actúa
      } else if (isStatusMove(move)) {
        if (Math.random() * 100 > (move.accuracy ?? 100)) yield { type: "miss", attacker: foe, move, side: "enemy", teamIndex: tIndex };
        else {
          yield { type: "use-move", attacker: foe, move, side: "enemy", teamIndex: tIndex };
          const st = tryInflict(target, move);
          if (st) yield { type: "status", status: st, pokemon: target, side: "ally", teamIndex: tIndex };
        }
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
          const next = allies.findIndex(a => a.currentHp > 0);
          if (next < 0) break;
          allyIndex = next;
          yield {
            type: "switch",
            pokemon: allies[next],
            teamIndex: next,
          };
        } else {
          const st = tryInflict(target, move);
          if (st) yield { type: "status", status: st, pokemon: target, side: "ally", teamIndex: tIndex };
        }
      }

      // Veneno: daño al final del turno del rival
      if (foe.currentHp > 0 && dotFrac(foe.status)) {
        const dmg = Math.max(1, Math.floor(foe.maxHp / dotFrac(foe.status)));
        foe.currentHp = Math.max(0, foe.currentHp - dmg);
        yield { type: "status-dmg", status: foe.status, pokemon: foe, side: "enemy", damage: dmg, hpAfter: foe.currentHp };
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
