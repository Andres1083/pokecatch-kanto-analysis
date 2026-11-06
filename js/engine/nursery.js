// Lógica de guardería (crianza) e incubadora. Sin red ni DOM.
import { BREED_MS, HATCH_MS, EGG_CAP, INCUBATORS, INC_PRICES, PAIRS, pairUnlocked, BREED_BERRIES } from "../data/breeding.js?v=135";
import { familyRoot } from "../data/families.js?v=135";
import { familyStages } from "../data/evolutions.js?v=135";

export function ensureNursery(state) {
  const n = state.nursery || (state.nursery = {});
  if (!Array.isArray(n.parents)) n.parents = [];
  while (n.parents.length < PAIRS * 2) n.parents.push(null);
  if (!Array.isArray(n.lastEgg)) n.lastEgg = [n.lastEggAt ?? null, null];
  while (n.lastEgg.length < PAIRS) n.lastEgg.push(null);
  if (!Array.isArray(n.held)) n.held = [];
  while (n.held.length < PAIRS * 2) n.held.push(null);
  if (!Array.isArray(n.eggs)) n.eggs = [];
  if (!Array.isArray(n.incubators)) n.incubators = [];
  while (n.incubators.length < INCUBATORS) n.incubators.push(null);
  if (!(n.incUnlocked >= 1)) n.incUnlocked = 1;
  return n;
}

const DITTO = 132;
/** Misma familia, o un Ditto con cualquier otro Pokémon (dos Ditto no sirven). */
export const compatible = (a, b) => {
  if (!a || !b) return false;
  if (a.id === DITTO || b.id === DITTO) return !(a.id === DITTO && b.id === DITTO);
  return familyRoot(a.id) === familyRoot(b.id);
};
export const eggSpecies = (mon) => familyStages(mon.id)[0][0];
export const eggSpeciesPair = (a, b) => eggSpecies(a.id === DITTO ? b : a);

/** Coloca un Pokémon de la caja como huésped (slot 0..3). */
export function setParent(state, slot, mon, now = Date.now()) {
  const n = ensureNursery(state);
  const pair = slot >> 1;
  if (!pairUnlocked(state, pair)) return { ok: false, reason: "Esta pareja aún está bloqueada" };
  const other = n.parents[slot ^ 1];
  if (other && !compatible(other, mon)) return { ok: false, reason: "Deben ser de la misma familia (o uno Ditto)" };
  const i = (state.box || []).indexOf(mon);
  if (i < 0) return { ok: false, reason: "El Pokémon debe estar en la caja" };
  state.box.splice(i, 1);
  n.parents[slot] = mon;
  if (n.parents[pair * 2] && n.parents[pair * 2 + 1]) n.lastEgg[pair] = now;
  return { ok: true };
}

export function retrieveParent(state, slot) {
  const n = ensureNursery(state);
  const m = n.parents[slot];
  if (!m) return;
  (state.box || (state.box = [])).push(m);
  n.parents[slot] = null;
  if (n.held[slot]) { state.bag = state.bag || {}; state.bag[n.held[slot]] = (state.bag[n.held[slot]] || 0) + 1; n.held[slot] = null; }
  n.lastEgg[slot >> 1] = null;
}

const pairReady = (n, p) => n.parents[p * 2] && n.parents[p * 2 + 1] && n.lastEgg[p] != null;

/** Genera los huevos que correspondan al tiempo transcurrido. Devuelve cuántos. */
export function produceEggs(state, now = Date.now()) {
  const n = ensureNursery(state);
  let made = 0;
  for (let p = 0; p < PAIRS; p++) {
    if (!pairUnlocked(state, p) || !pairReady(n, p)) continue;
    if (n.eggs.length >= EGG_CAP) { n.lastEgg[p] = now; continue; }
    while (now - n.lastEgg[p] >= BREED_MS && n.eggs.length < EGG_CAP) {
      const egg = { id: eggSpeciesPair(n.parents[p * 2], n.parents[p * 2 + 1]), uid: now + Math.random() };
      // Piedra Eterna: la cría hereda la naturaleza del padre que la lleve (100 %, como en los juegos actuales)
      const carriers = [p * 2, p * 2 + 1].filter(s => n.held[s] === "everstone");
      if (carriers.length) egg.nature = n.parents[carriers[Math.floor(Math.random() * carriers.length)]].natureIndex ?? 0;
      n.eggs.push(egg);
      n.lastEgg[p] += BREED_MS;
      made++;
    }
    if (n.eggs.length >= EGG_CAP) n.lastEgg[p] = now;
  }
  return made;
}

export const nextEggMs = (n, p, now = Date.now()) =>
  pairReady(n, p) && n.eggs.length < EGG_CAP ? Math.max(0, BREED_MS - (now - n.lastEgg[p])) : null;

/** Usa una baya para acortar el apareamiento de la pareja p. */
export function useBerry(state, p, berryId) {
  const n = ensureNursery(state);
  const cut = BREED_BERRIES[berryId];
  if (!cut || !pairReady(n, p)) return { ok: false, reason: "La pareja aún no está completa" };
  if (!(state.bag?.[berryId] > 0)) return { ok: false, reason: "No tienes esa baya" };
  state.bag[berryId]--;
  n.lastEgg[p] -= cut;
  return { ok: true };
}

/** Equipa (o quita) la Piedra Eterna de un huésped. */
export function toggleHeld(state, slot, itemId = "everstone") {
  const n = ensureNursery(state);
  if (!n.parents[slot]) return { ok: false, reason: "Primero elige un huésped" };
  state.bag = state.bag || {};
  if (n.held[slot]) { state.bag[n.held[slot]] = (state.bag[n.held[slot]] || 0) + 1; n.held[slot] = null; return { ok: true }; }
  if (!(state.bag[itemId] > 0)) return { ok: false, reason: "No tienes ese objeto (se encuentra en los nodos «?»)" };
  state.bag[itemId]--;
  n.held[slot] = itemId;
  return { ok: true };
}

export function startIncubation(n, eggIdx, slot, now = Date.now()) {
  if (slot >= n.incUnlocked || n.incubators[slot] || !n.eggs[eggIdx]) return false;
  const [egg] = n.eggs.splice(eggIdx, 1);
  n.incubators[slot] = { egg, startedAt: now };
  return true;
}

export const freeIncubator = (n) => n.incubators.findIndex((x, i) => i < n.incUnlocked && !x);

export function unlockIncubator(state) {
  const n = ensureNursery(state);
  if (n.incUnlocked >= INCUBATORS) return { ok: false, reason: "Ya tienes todas" };
  const price = INC_PRICES[n.incUnlocked];
  if (state.money < price) return { ok: false, reason: "No te alcanza el dinero" };
  state.money -= price;
  n.incUnlocked++;
  return { ok: true, price };
}

export const readyIncubators = (n, now = Date.now()) =>
  n.incubators.map((x, i) => (x && now - x.startedAt >= HATCH_MS ? i : -1)).filter(i => i >= 0);
