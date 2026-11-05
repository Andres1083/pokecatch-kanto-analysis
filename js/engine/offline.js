// Simulación del progreso mientras el juego está cerrado o en segundo plano.
// Usa el mismo motor de combate que el juego (runIdleBattle) y recorre los
// nodos de la ruta igual que en directo: arbustos, entrenadores, "?" y centro.

import { runIdleBattle } from "./idle-battle.js?v=130";

export const OFFLINE = {
  MAX_MS: 8 * 3600 * 1000,   // máximo de tiempo que cuenta
  MIN_MS: 20 * 1000,         // por debajo de esto no se muestra nada
  STEP_MS: 10 * 1000,        // un nodo de ruta ≈ 10 s de juego activo
  MULT: 0.5,                 // rendimiento offline (50 %)
  MAX_LEVELS: 12,            // tope de niveles por Pokémon
  ITEM_LIMIT: 10,            // tope de objetos encontrados
};

/** Combate síncrono. Aplica los PS al equipo real. Devuelve true si gana. */
function simBattle(team, enemy) {
  const gen = runIdleBattle(team, enemy, { autoSwitch: true });
  let r = gen.next();
  let won = false;
  while (!r.done) {
    const ev = r.value;
    if (ev.type === "damage" && ev.side === "enemy") {
      const m = team[ev.teamIndex];
      if (m) m.currentHp = Math.max(0, ev.hpAfter);
    } else if (ev.type === "faint" && ev.side === "ally") {
      const m = team[ev.teamIndex];
      if (m) m.currentHp = 0;
    } else if (ev.type === "victory") {
      won = true;
    }
    r = gen.next();
  }
  return won;
}

/**
 * @param ctx.state          estado del juego (se modifica)
 * @param ctx.elapsedMs      tiempo ausente
 * @param ctx.enemyFor       (id, level, power?) => enemigo (síncrono, ya precargado)
 * @param ctx.pickEncounter  (seg) => {id, level}
 * @param ctx.makeTrainer    (seg) => {name, mons:[{id,level}]}
 * @param ctx.xpGain         (enemy) => xp
 * @param ctx.applyXp        (mon, xp) => niveles ganados
 * @param ctx.rollReward / addItem
 * @param ctx.finishChapter  (gym) => aplica medalla, dinero y carga el siguiente capítulo
 * @param ctx.retreat        () => reubica el progreso tras una derrota total
 */
export function simulateOffline(ctx) {
  const { state } = ctx;
  const ms = Math.min(ctx.elapsedMs, OFFLINE.MAX_MS);
  const steps = Math.floor((ms / OFFLINE.STEP_MS) * OFFLINE.MULT);
  const out = { steps: 0, wins: 0, losses: 0, chapters: [], xp: 0, items: {}, itemsCount: 0, moneyFound: 0, captures: [] };
  if (steps < 1) return out;

  const levelsGained = new Map(state.playerTeam.map(m => [m, 0]));
  const giveXp = (xp) => {
    for (const mon of state.playerTeam) {
      if (levelsGained.get(mon) >= OFFLINE.MAX_LEVELS) continue;
      const share = mon.currentHp > 0 ? xp : Math.max(1, Math.floor(xp * 0.5));
      levelsGained.set(mon, levelsGained.get(mon) + ctx.applyXp(mon, share));
      out.xp += share;
    }
  };
  const healAll = () => state.playerTeam.forEach(m => { m.currentHp = m.maxHp; });
  const blackout = () => { out.losses++; healAll(); ctx.retreat(); };
  const gainItem = (id, qty) => {
    if (out.itemsCount >= OFFLINE.ITEM_LIMIT) return;
    ctx.addItem(state, id, qty);
    out.items[id] = (out.items[id] || 0) + qty;
    out.itemsCount += qty;
  };

  const offlineStart = Date.now() - ms;
  const realMsPerStep = OFFLINE.STEP_MS / OFFLINE.MULT;

  for (let s = 0; s < steps; s++) {
    // El clima avanza con el tiempo que habría transcurrido mientras el jugador estaba ausente.
    if (ctx.weatherForTime) {
      const weather = ctx.weatherForTime(offlineStart + (s + 1) * realMsPerStep);
      if (weather?.key) state.weather = weather.key;
    }
    out.steps++;
    const node = state.routeNodes[state.routeProgress];
    if (!node) break;
    const seg = state.chapSegs[node.seg];

    if (node.t === "wild") {
      const { id, level } = ctx.pickEncounter(seg);
      const enemy = ctx.enemyFor(id, level);
      if (simBattle(state.playerTeam, enemy)) {
        out.wins++;
        giveXp(ctx.xpGain(enemy));
        state.money += 30 + enemy.level * 4;
        state.routeProgress++;
        if (ctx.captureWild) { const c = ctx.captureWild(enemy); if (c) out.captures.push(c); }
      } else blackout();
    } else if (node.t === "trainer") {
      const t = ctx.makeTrainer(seg);
      let ok = true, xp = 0, money = 40;
      for (const m of t.mons) {
        const enemy = ctx.enemyFor(m.id, m.level);
        if (!simBattle(state.playerTeam, enemy)) { ok = false; break; }
        xp += ctx.xpGain(enemy);
        money += Math.round((30 + enemy.level * 4) * 1.5);
      }
      if (ok) {
        out.wins++;
        giveXp(Math.round(xp * 1.2));
        state.money += money;
        state.routeProgress++;
      } else blackout();
    } else if (node.t === "gym") {
      const gym = seg.gym;
      let ok = true, xp = 0;
      for (const [id, level] of gym.team) {
        const enemy = ctx.enemyFor(id, level, gym.power);
        if (!simBattle(state.playerTeam, enemy)) { ok = false; break; }
        xp += ctx.xpGain(enemy);
      }
      if (ok) {
        out.wins++;
        giveXp(Math.round(xp * 1.5));
        out.chapters.push({ badge: gym.badgeEs, leader: gym.leaderEs, reward: gym.reward });
        ctx.finishChapter(gym);
      } else blackout();
    } else if (node.t === "item") {
      const reward = ctx.rollReward();
      if (reward.kind === "money") { state.money += reward.amount; out.moneyFound += reward.amount; }
      else gainItem(reward.id, reward.qty);
      state.routeProgress++;
    } else if (node.t === "find") {
      gainItem(node.item, 1);
      state.routeProgress++;
    } else if (node.t === "center") {
      healAll();
      state.routeProgress++;
    }

    // Fin de capítulo sin gimnasio (no debería ocurrir): recargar
    if (state.routeProgress >= state.routeNodes.length) ctx.finishChapter(null);
  }

  out.levelsGained = levelsGained;
  return out;
}
