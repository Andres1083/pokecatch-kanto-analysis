// Captura + almacenamiento por familia + PE a la familia si está llena

import { familyRoot, familySlots, countFamily, canStore } from "../data/families.js?v=134";

export function captureChance(enemy, { ball = "poke" } = {}) {
  const ballMod = { poke: 1, great: 1.5, ultra: 2 }[ball] || 1;
  const base = 0.55 + Math.min(0.25, (50 - (enemy.level || 5)) * 0.01);
  return Math.min(0.92, base * ballMod);
}

export function tryCapture(enemy, opts) {
  const chance = captureChance(enemy, opts);
  return { ok: Math.random() < chance, chance };
}

/**
 * PE que daría un repetido (inspirado en el original).
 * Más nivel del enemigo → más PE.
 */
export function familyCandyXp(enemy) {
  const base = 40 + (enemy.level || 1) * 12;
  return Math.round(base * (0.9 + Math.random() * 0.3));
}

/**
 * Intenta guardar. Si la familia está llena, reparte PE entre la familia.
 */
export function storeCaptured(mon, state, { applyXpFn, forceFamilyXp = false, extraFamily = [] } = {}) {
  const all = [...state.playerTeam, ...(state.box || []), ...extraFamily];

  // Un variocolor siempre se guarda, aunque la familia esté llena (o el filtro lo convierta en PE)
  if (!mon.shiny && (forceFamilyXp || !canStore(all, mon.id))) {
    const root = familyRoot(mon.id);
    const family = all.filter(m => familyRoot(m.id) === root);
    const totalXp = familyCandyXp(mon);
    const share = family.length ? Math.max(1, Math.floor(totalXp / family.length)) : totalXp;
    const gains = [];
    if (applyXpFn) {
      for (const m of family) {
        const levels = applyXpFn(m, share);
        gains.push({ mon: m, share, levels });
      }
    }
    return {
      added: false,
      where: null,
      familyXp: true,
      totalXp,
      share,
      family,
      gains,
      reason: `Repetido: +${totalXp} PE para la familia`,
    };
  }

  if (state.playerTeam.length < 6) {
    state.playerTeam.push(mon);
    return { added: true, where: "team" };
  }
  if (!state.box) state.box = [];
  state.box.push(mon);
  return { added: true, where: "box" };
}

export function releasePokemon(state, mon, { fromTeam = true } = {}) {
  if (fromTeam) {
    const i = state.playerTeam.findIndex(m => m === mon || (m.id === mon.id && m.uid === mon.uid));
    if (i >= 0) {
      // No liberar si es el único del equipo
      if (state.playerTeam.length <= 1) return { ok: false, reason: "No puedes liberar tu único Pokémon" };
      state.playerTeam.splice(i, 1);
      return { ok: true };
    }
  }
  const box = state.box || [];
  const j = box.findIndex(m => m === mon || (m.id === mon.id && m.uid === mon.uid));
  if (j >= 0) {
    box.splice(j, 1);
    return { ok: true };
  }
  return { ok: false, reason: "No encontrado" };
}

export { familyRoot, familySlots, countFamily, canStore };
