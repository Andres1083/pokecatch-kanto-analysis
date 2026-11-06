import { startIntro } from "./ui/intro.js?v=136";
import { showConfirm } from "./ui/confirm.js?v=136";
import { showTitle } from "./ui/title.js?v=136";
import { showOptions } from "./ui/options.js?v=136";
import { playVsIntro, playBossIntro, playLegendAnnounce } from "./engine/presentations.js?v=136";
import { playMewtwoIntro } from "./engine/mewtwo-intro.js?v=136";
import { LEGENDS } from "./data/legends.js?v=136";
import { TYPE_DEX_IDS } from "./data/legend-unlocks.js?v=136";
import { installSpriteFit, fitSprite } from "./ui/sprite-fit.js?v=136";
installSpriteFit();
import { showPokedexCard } from "./ui/pokedex-card.js?v=136";
import { getPokemonForBattle } from "./data/pokeapi.js?v=136";
import { runIdleBattle } from "./engine/idle-battle.js?v=136";
import { frontSprite, backSprite, battleSprite, artSprite, spriteSizeStyle, spriteSizePx } from "./data/sprites.js?v=136";
import { DEX_NAMES } from "./data/dex-names.js?v=136";
import { showTeamScreen } from "./ui/team.js?v=136";
import { showCollection } from "./ui/collection.js?v=136";
import { showPokemonDetail } from "./ui/pokemon-detail.js?v=136";
import { tryCapture, storeCaptured, releasePokemon } from "./engine/capture.js?v=136";
import { playMoveFx, playCaptureFx } from "./engine/battle-fx.js?v=136";
import { runRaid, bossOfDay, ensureRaidSave, RAID_CFG, monName, raidProgressHtml } from "./engine/raids.js?v=136";
import { openRaidsLobby } from "./ui/raids-lobby.js?v=136";
import { avatarHtml, getAspect, openPlayerEditor } from "./ui/player-avatar.js?v=136";
import { Sfx } from "./engine/sfx.js?v=136";
import { checkLevelEvolutions, stoneEvoReady, evolveMon } from "./engine/evolve.js?v=136";
import { randomNature, getNature, applyNatureToStats } from "./data/natures.js?v=136";
import { weatherForNow, getGameWeather, formatClock, formatHour } from "./data/weather.js?v=136";
import { randomTrainerName, randomTrainer } from "./data/route-map.js?v=136";
import { CHAPTERS, buildChapter, pickEncounter, makeTrainerTeam, periodOf, chapterSpecies } from "./engine/story.js?v=136";
import { SCENES } from "./data/scenes.js?v=136";
import { BG_DATA } from "./data/backgrounds.js?v=136";
import { renderProgress, bindProgress, leagueTrainers, leagueOf, REGION_DEFS, LEAGUE_FIRST, LEAGUE_LAST } from "./ui/progress.js?v=136";
import { evosOf } from "./data/evolutions.js?v=136";
import { renderDex, bindDex, showTrainerCard } from "./ui/dex.js?v=136";
import { showBriefing, showLeague } from "./ui/briefing.js?v=136";
import { rollReward, applyReward, addItem, ITEMS } from "./data/items.js?v=136";
import { renderRouteBar } from "./ui/route-bar.js?v=136";
import { renderBag, bindBag } from "./ui/bag.js?v=136";
import { showWelcomeBack } from "./ui/welcome-back.js?v=136";
import { simulateOffline, OFFLINE } from "./engine/offline.js?v=136";
import { itemImg } from "./ui/item-icon.js?v=136";
import { pixelIcon } from "./ui/pixel.js?v=136";
import { SHINY_RATE } from "./data/shiny.js?v=136";
import { badgeHtml, badgeIndex } from "./ui/badge.js?v=136";
import { renderNursery, bindNursery, showHatchAnim } from "./ui/nursery.js?v=136";
import { ensureNursery, produceEggs, readyIncubators } from "./engine/nursery.js?v=136";
import { EGG_LEVEL } from "./data/breeding.js?v=136";
import { renderCasino, bindCasino, casinoBusy } from "./ui/casino.js?v=136";
import { openAchievements } from "./ui/achievements.js?v=136";
import { ACHIEVEMENTS, evaluateAchievements, FRAME_REWARD_MAP } from "./data/achievements.js?v=136";
import { casinoUnlocked } from "./data/casino.js?v=136";
import { sceneWipe } from "./ui/transition.js?v=136";
import { dissolve, imgReady } from "./ui/sendout.js?v=136";

// BASE_EXP simplificado (valores del original)
const BASE_EXP = {
  16: 50, 17: 122, 18: 216, 19: 51, 20: 145,
  1: 64, 4: 62, 7: 63, 10: 39, 13: 39, 21: 52, 23: 58, 25: 112,
};

const XP_WINS_PER_LEVEL = 15;
const XP_BASE_REF = 60;

const state = {
  player: null,
  playerTeam: [],
  badges: [],
  money: 3000,
  routeProgress: 0,
  routeTotal: 18,
  chapter: 0,
  chapSegs: [],
  fighting: false,
  speed: 2,
  busy: false,
  weather: "clear",
  auto: true,
  box: [],
  activeIndex: 0,
  autoSwitch: true,
  bag: {},
  bagOpen: true,
  view: "adventure",
  routeNodes: [],
  epoch: 0,
  stats: { battles: 0, wins: 0, balls: 0, captures: 0, playMs: 0, startedAt: Date.now(), seen: [], caught: [], caughtOrder: [], shiny: [] },
  captureFilter: {},
  unlockedAchievements: [],
  feats: {},
  storyFlags: [],
  legendaryEncounters: [],
  fichas: 0,
  nursery: { parents: [null, null], eggs: [], incubators: [null, null], lastEggAt: null },
};

function dexAdd(kind, id) {
  const st = state.stats;
  if (!st[kind].includes(id)) st[kind].push(id);
  if (kind === "caught" && !st.caughtOrder.includes(id)) st.caughtOrder.push(id);
}


const SAVE_KEY = "pokecatch-kanto-save-v1";

window.__pokeSave = saveGame;
window.__pokeRelease = (mon, fromTeam) => {
  if (mon.locked) return { ok: false, reason: "Este Pokémon está bloqueado" };
  const r = releasePokemon(state, mon, { fromTeam });
  if (r.ok) { state.epoch++; state.activeIndex = 0; saveGame(); }
  return r;
};
window.__pokeState = () => state;
window.__pokeEvolve = async (mon, to) => {
  const e = evosOf(mon.id).find(x => x.to === to);
  if (!e) return { ok: false, reason: "Evolución no válida" };
  if (e.kind === "lvl" && mon.level < e.v) return { ok: false, reason: `Necesita nivel ${e.v}` };
  if (e.kind === "stone" && !(state.bag[e.item] > 0)) return { ok: false, reason: "No tienes la piedra necesaria" };
  let data;
  try { data = await getPokemonForBattle(to, mon.level); }
  catch (_) { return { ok: false, reason: "Sin conexión para cargar la evolución" }; }
  const ratio = mon.maxHp ? mon.currentHp / mon.maxHp : 1;
  if (e.kind === "stone") { state.bag[e.item]--; if (state.bag[e.item] <= 0) delete state.bag[e.item]; }
  Object.assign(mon, {
    id: data.id, name: data.name, nameEs: data.nameEs, types: data.types, genus: data.genus,
    stats: applyNatureToStats(data.stats, mon.natureIndex ?? 0), maxHp: data.maxHp,
    currentHp: mon.currentHp <= 0 ? 0 : Math.max(1, Math.round(data.maxHp * ratio)),
    sprites: { front: frontSprite(data.id), back: backSprite(data.id) },
  });
  if (!(mon.moves || []).length || (data.moves || []).length) mon.moves = data.moves;
  state.stats.evolutions = (state.stats.evolutions || 0) + 1;
  dexAdd("seen", data.id); dexAdd("caught", data.id);
  state.epoch++;
  saveGame();
  try { refreshBag(); } catch (_) {}
  return { ok: true };
};

function syncAchievementUnlocks() {
  const unlocked = new Set(state.unlockedAchievements || []);
  for (const a of evaluateAchievements(state)) if (a.done) unlocked.add(a.id);
  state.unlockedAchievements = [...unlocked];
}

function saveGame() {
  try {
    syncAchievementUnlocks();
    const data = {
      player: state.player,
      playerTeam: state.playerTeam,
      box: state.box || [],
      badges: state.badges,
      money: state.money,
      routeProgress: state.routeProgress,
      chapter: state.chapter,
      chapSegs: state.chapSegs,
      routeNodes: state.routeNodes,
      bag: state.bag,
      speed: state.speed,
      autoSwitch: state.autoSwitch !== false,
      weather: state.weather,
      stats: state.stats,
      captureFilter: state.captureFilter || {},
      teamPresets: (syncActivePreset(), teamPresets()),
      unlockedAchievements: state.unlockedAchievements || [],
      feats: state.feats || {},
      storyFlags: state.storyFlags || [],
      legendaryEncounters: state.legendaryEncounters || [],
      nursery: state.nursery,
      fichas: state.fichas || 0,
      savedAt: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("save failed", e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
}

function $(sel) { return document.querySelector(sel); }
document.addEventListener("pointerdown", () => { try { Sfx.unlock(); } catch (_) {} }, { once: true });

function getActiveMon() {
  // Primer miembro del equipo con PS > 0
  const idx = state.playerTeam.findIndex(m => m.currentHp > 0);
  state.activeIndex = idx >= 0 ? idx : 0;
  return state.playerTeam[state.activeIndex] || state.playerTeam[0];
}

async function syncAllySprite(mon) {
  if (!mon) return;
  const img = $("#ally-img");
  if (img) {
    // Reset total: el faint deja opacity/transform y sin esto el sprite "se encoge"
    img.classList.remove("anim-faint", "anim-hit", "anim-attack");
    img.style.animation = "none";
    img.style.opacity = "1";
    img.style.filter = "";
    img.style.transform = "";
    img.style.visibility = "hidden";
    delete img.dataset.fit;
    img.src = battleSprite(mon);
    img.style.cssText = spriteSizeStyle(mon) + "visibility:hidden;opacity:1;";
    img.onerror = () => {
      img.onerror = null;
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mon.id}.png`;
    };
    try {
      await imgReady(img);
      await fitSprite(img);
    } catch (_) {}
  }
  if ($("#ally-hp")) $("#ally-hp").style.width = `${(mon.currentHp / mon.maxHp) * 100}%`;
  const lv = document.querySelector("#ally-side .lv");
  if (lv) lv.textContent = `Nv.${mon.level}`;
  document.querySelectorAll("[data-team-idx]").forEach(el => {
    el.classList.toggle("active", Number(el.dataset.teamIdx) === state.activeIndex);
  });
}


/** XP necesaria para subir del nivel actual (curva simple) */
function xpForNext(level) {
  return Math.floor(level * level * 8 + level * 20);
}

/** XP ganada al derrotar un enemigo (fórmula inspirada en el original) */
function calcXpGain(enemy) {
  const base = BASE_EXP[enemy.id] || XP_BASE_REF;
  // levelXp aproximado ~ enemy.level * 20
  const levelXp = enemy.level * 20;
  const amount = (levelXp / XP_WINS_PER_LEVEL) * Math.sqrt(base / XP_BASE_REF) * 1.1;
  return Math.max(1, Math.round(amount));
}

function applyXp(mon, amount) {
  if (!mon.xp && mon.xp !== 0) mon.xp = 0;
  mon.xp += amount;
  let levels = 0;
  while (mon.xp >= xpForNext(mon.level)) {
    mon.xp -= xpForNext(mon.level);
    mon.level += 1;
    levels += 1;
    try { Sfx.levelUp(); } catch (_) {}
    // Recalc approx HP on level up
    const wasFainted = mon.currentHp <= 0;
    const ratio = wasFainted ? 0 : mon.currentHp / mon.maxHp;
    mon.maxHp = Math.floor(mon.maxHp * 1.08);
    mon.stats.hp = mon.maxHp;
    mon.currentHp = wasFainted ? 0 : Math.max(1, Math.floor(mon.maxHp * ratio));
    mon.stats.atk = Math.floor(mon.stats.atk * 1.06);
    mon.stats.def = Math.floor(mon.stats.def * 1.06);
    mon.stats.spa = Math.floor(mon.stats.spa * 1.06);
    mon.stats.spd = Math.floor(mon.stats.spd * 1.06);
    mon.stats.spe = Math.floor(mon.stats.spe * 1.06);
  }
  return levels;
}

async function processTeamEvolutions({ animate = true } = {}) {
  const msgs = [];
  const process = async (mon, inTeam) => {
    const evos = await checkLevelEvolutions(mon);
    for (const e of evos) {
      // Las evoluciones automáticas también deben quedar registradas en el Pokédex.
      dexAdd("seen", e.toId);
      dexAdd("caught", e.toId);
      const message = `¡${e.from} evolucionó a ${e.to}!`;
      msgs.push(message);
      if (animate && inTeam) {
        try { Sfx.evolve(); } catch (_) {}
        await showEvolveFx(mon, e);
      }
    }
  };
  for (const mon of state.playerTeam) await process(mon, true);
  for (const mon of (state.box || [])) await process(mon, false);
  if (msgs.length) saveGame();
  return msgs;
}

async function showEvolveFx(mon, e) {
  setMsg(`¡${e.from} está evolucionando!`);
  await delay(700);
  const img = $("#ally-img");
  if (img && state.playerTeam[state.activeIndex] === mon) {
    img.classList.add("evo-flash");
    await delay(1000);
    img.src = battleSprite(mon); img.style.cssText = spriteSizeStyle(mon);
    img.onerror = () => { img.onerror = null; img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mon.id}.png`; };
    img.classList.remove("evo-flash");
  }
  setMsg(`¡${e.from} evolucionó a ${e.to}!`);
  await delay(1000);
}

async function tryStoneEvolve(itemId, mon) {
  const evo = stoneEvoReady(mon, itemId);
  if (!evo) {
    return { ok: false, msg: `${mon.nameEs || mon.name} no puede usar ese objeto.` };
  }
  if (!(state.bag?.[itemId] > 0)) {
    return { ok: false, msg: "No te queda ese objeto." };
  }
  const from = mon.nameEs || mon.name;
  state.bag[itemId] -= 1;
  if (state.bag[itemId] <= 0) delete state.bag[itemId];
  await evolveMon(mon, evo.to);
  try { Sfx.evolve(); } catch (_) {}
  saveGame();
  return { ok: true, msg: `¡${from} evolucionó a ${mon.nameEs || mon.name}!` };
}


async function onIntroComplete({ name, gender, starterId }) {
  state.player = { name, gender };
  document.getElementById("app").innerHTML = `
    <div id="status-bar" class="top-status">Cargando...</div>
    <div id="main"></div>
  `;

  try {
    const mon = await getPokemonForBattle(starterId, 5);
    mon.sprites.front = frontSprite(mon);
    mon.sprites.back = backSprite(mon);
    mon.xp = 0;
    mon.uid = mon.uid || (Date.now() + Math.random());
    mon.natureIndex = randomNature();
    mon.stats = applyNatureToStats(mon.stats, mon.natureIndex);
    mon.caughtCount = 1;
    state.playerTeam = [mon];
    state.weather = Math.random() < 0.3 ? "rain" : "clear";
    ensureRoute();
    state.showBriefingOnStart = true;
    saveGame();

    showPokedexCard(mon, {
      isNew: true,
      onClose: () => startRoute(),
    });
  } catch (err) {
    console.error(err);
    $("#status-bar").textContent = "Error al cargar. ¿Tienes internet?";
  }
}


// ───────────────────────── Ruta, pausa y progreso offline ─────────────────────────

class AbortFight extends Error {}

const enemyCache = new Map();
const fmtMoney = (n) => Number(n).toLocaleString("es-ES");

function loadChapter() {
  const c = buildChapter(state.chapter);
  state.chapSegs = c.segs;
  state.routeNodes = c.nodes;
  state.routeTotal = c.nodes.length;
  state.routeProgress = 0;
}

/** Asegura que haya un capítulo válido (también migra partidas antiguas). */
function ensureRoute() {
  const ok = Array.isArray(state.routeNodes) && state.routeNodes.length
    && typeof state.routeNodes[0] === "object" && Array.isArray(state.chapSegs) && state.chapSegs.length;
  if (!ok) { state.chapter = state.chapter || 0; loadChapter(); }
  state.routeTotal = state.routeNodes.length;
  state.routeProgress = Math.max(0, Math.min(state.routeProgress || 0, state.routeTotal - 1));
}

const curNode = () => state.routeNodes[state.routeProgress];
const curSeg = () => state.chapSegs[curNode()?.seg ?? 0];
const routeLabel = () => curSeg()?.name || "Ruta";
const encCtx = () => ({ period: periodOf(), weather: state.weather });

/** Gimnasio superado: medalla, premio y siguiente capítulo. */
function finishChapter(gym) {
  if (gym) {
    state.money += gym.reward;
    if (gym.badgeEs && !state.badges.includes(gym.badgeEs)) state.badges.push(gym.badgeEs);
  }
  // Tras el último capítulo (Monte Plateado) se repite como endgame; no vuelve a Kanto
  state.chapter = Math.min(state.chapter + 1, CHAPTERS.length - 1);
  loadChapter();
}

/** Tras una derrota total: vuelve al inicio del mapa (nivel 1 del capítulo actual). */
function retreat() {
  // Liga: una derrota te devuelve al primer entrenador
  const lg = leagueOf(state.chapter);
  if (lg && state.chapter > lg.lf) { state.chapter = lg.lf; loadChapter(); return; }
  state.routeProgress = 0;
}

// Puerta de pausa: el combate se detiene mientras la pestaña está oculta
// o mientras el modal de bienvenida está abierto.
let gate = null;
function openGate(promise) {
  const g = promise.then(() => {}, (e) => console.warn("gate", e)).finally(() => { if (gate === g) gate = null; });
  gate = g;
  return g;
}
async function pauseGate() {
  while (document.hidden || gate) {
    if (gate) { await gate; continue; }
    await new Promise((resolve) => {
      const f = () => {
        if (!document.hidden) { document.removeEventListener("visibilitychange", f); resolve(); }
      };
      document.addEventListener("visibilitychange", f);
    });
  }
}

let fightEpoch = 0;
async function delay(ms) {
  await new Promise(r => setTimeout(r, ms / state.speed));
  await pauseGate();
  if (fightEpoch !== state.epoch) throw new AbortFight();
}

const FALLBACK_HEIGHT = {
  1:7,2:10,3:20,4:6,5:11,6:17,7:5,8:10,9:16,10:3,11:7,12:11,13:3,14:6,15:10,
  16:3,17:11,18:15,19:3,20:7,21:3,22:12,23:20,24:35,25:4,26:8,27:6,28:10,
  29:4,30:8,31:13,32:5,33:9,34:14,35:6,36:13,37:6,38:11,39:5,40:10,
  41:8,42:16,43:5,44:8,45:12,46:3,47:10,48:10,49:15,50:2,51:7,
  52:4,53:10,54:8,55:17,56:5,57:10,58:7,59:19,60:6,61:10,62:13,
  63:9,64:13,65:15,66:8,67:15,68:16,69:7,70:10,71:17,72:9,73:16,
  74:4,75:10,76:14,77:10,78:17,79:12,80:16,81:3,82:10,83:8,84:14,85:18,
  86:11,87:17,88:9,89:12,90:3,91:15,92:13,93:16,94:15,95:88,
  96:10,97:16,98:4,99:13,100:5,101:12,102:4,103:20,104:4,105:10,
  106:15,107:14,108:12,109:6,110:12,111:10,112:19,113:11,114:10,115:22,
  116:4,117:12,118:6,119:13,120:8,121:11,122:13,123:15,124:14,125:11,
  126:13,127:15,128:14,129:9,130:65,131:25,132:3,133:3,134:10,135:8,136:9,
  137:8,138:4,139:10,140:5,141:13,142:18,143:21,144:17,145:16,146:20,
  147:18,148:40,149:22,150:20,151:4
};
function fallbackEnemy(id, level) {
  const names = { 16: "Pidgey", 19: "Rattata" };
  const hp = 10 + level * 3;
  return {
    id, nameEs: names[id] || `#${id}`, name: names[id] || `#${id}`, level,
    types: id === 16 ? ["normal", "flying"] : ["normal"],
    stats: { hp, atk: 5 + level * 2, def: 5 + level * 2, spa: 5 + level, spd: 5 + level, spe: 8 + level * 2 },
    maxHp: hp, currentHp: hp,
    moves: [{ name: "tackle", nameEs: "Placaje", type: "normal", power: 40, accuracy: 100, category: "physical" }],
    sprites: { front: frontSprite(id) },
    height: FALLBACK_HEIGHT[id] || 10,
  };
}

function cloneEnemy(e) {
  return { ...e, stats: { ...e.stats }, moves: e.moves.map(m => ({ ...m })), sprites: { ...e.sprites }, currentHp: e.maxHp };
}

async function loadEnemy(id, level) {
  const key = `${id}:${level}`;
  if (enemyCache.has(key)) return cloneEnemy(enemyCache.get(key));
  try {
    const e = await Promise.race([
      getPokemonForBattle(id, level),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 8000)),
    ]);
    e.sprites.front = frontSprite(e.id);
    enemyCache.set(key, e);
    return cloneEnemy(e);
  } catch (err) {
    console.warn("fallback enemy", err);
    return fallbackEnemy(id, level);
  }
}

async function warmEnemies() {
  await Promise.all(chapterSpecies(state.chapSegs).map(e => loadEnemy(e.id, e.level)));
}

function makeTrainer(seg) {
  if (seg?.named) return { name: seg.named.trainer, sprite: seg.named.sprite, mons: seg.named.team.map(([id, level]) => ({ id, level })) };
  return { ...randomTrainer(seg), mons: makeTrainerTeam(seg, encCtx()) };
}

function scaleLegend(e, lg) {
  e.stats.hp = Math.round(e.stats.hp * (lg.hp || 1));
  for (const k of ["atk", "spa"]) e.stats[k] = Math.round(e.stats[k] * (lg.power || 1));
  e.maxHp = e.stats.hp; e.currentHp = e.maxHp;
  return e;
}
const ORIGINAL_LEGENDS = {
  151: { needDex: [1, 150] }, // Mew (nivel propio): Pokédex de Kanto completa, sin contar a Mew
  150: { level: 100, hp: 3.29, power: 0.55, ball: 0.01176, balls: 40, needLeague: true },
  145: { level: 100, hp: 5.97, power: 0.99, ball: 0.01176, balls: 40, needType: "electric", weather: "storm" },
  144: { level: 100, hp: 5.83, power: 0.77, ball: 0.01176, balls: 40, needType: "ice" },
  146: { level: 100, hp: 6.14, power: 0.76, ball: 0.01176, balls: 40, needType: "fire" },
};
function scaleEnemy(e, power) {
  if (!power || power === 1) return e;
  for (const k of Object.keys(e.stats)) e.stats[k] = Math.round(e.stats[k] * power);
  e.maxHp = e.stats.hp; e.currentHp = e.maxHp;
  return e;
}

/** Calcula y aplica lo ganado durante `elapsedMs` de ausencia. Devuelve el informe o null. */
async function processOffline(elapsedMs) {
  if (!state.playerTeam.length || !state.routeNodes.length) return null;
  if (!Number.isFinite(elapsedMs) || elapsedMs < OFFLINE.MIN_MS) return null;
  await warmEnemies();

  const before = new Map(state.playerTeam.map(m => [m, m.level]));
  const moneyBefore = state.money;
  const result = simulateOffline({
    state,
    elapsedMs,
    weatherForTime: (timestamp) => weatherForNow(new Date(timestamp)),
    enemyFor: (id, level, power) => {
      const c = enemyCache.get(`${id}:${level}`);
      return scaleEnemy(c ? cloneEnemy(c) : fallbackEnemy(id, level), power);
    },
    pickEncounter: (seg) => pickEncounter(seg, encCtx()),
    makeTrainer,
    xpGain: calcXpGain,
    applyXp,
    rollReward,
    addItem,
    finishChapter,
    retreat,
    captureWild: captureWildOffline,
  });
  if (!result.steps) return null;
  // Las subidas de nivel durante el progreso offline también deben evolucionar
  // y registrar las nuevas especies, aunque no haya animación en segundo plano.
  await processTeamEvolutions({ animate: false });
  state.routeTotal = state.routeNodes.length;

  const team = state.playerTeam.map((m, i) => ({
    id: m.id,
    name: m.nameEs || m.name,
    level: m.level,
    levels: before.has(m) ? m.level - before.get(m) : 0,
    xpPct: Math.min(100, ((m.xp || 0) / xpForNext(m.level)) * 100),
    fainted: m.currentHp <= 0,
  }));
  saveGame();
  return {
    elapsedMs,
    capped: elapsedMs > OFFLINE.MAX_MS,
    wins: result.wins,
    losses: result.losses,
    chapters: result.chapters,
    money: state.money - moneyBefore,
    team,
    totalLevels: team.reduce((s, t) => s + t.levels, 0),
    items: Object.entries(result.items).map(([id, qty]) => ({ id, qty })),
    captures: result.captures || [],
  };
}

let hiddenAt = null;

function onBecameVisible() {
  if (hiddenAt == null) return;
  const elapsed = Date.now() - hiddenAt;
  hiddenAt = null;
  state.epoch++; // aborta cualquier combate que estuviera en curso
  openGate((async () => {
    const report = await processOffline(elapsed);
    if (report) {
      if ($("#main .route-screen")) renderRoute();
      await showWelcomeBack(report);
    }
  })());
}

document.addEventListener("visibilitychange", () => {
  if (!state.playerTeam.length) return;
  if (document.hidden) {
    hiddenAt = Date.now();
    saveGame(); // fija savedAt = momento en que te fuiste
  } else {
    onBecameVisible();
  }
});
window.addEventListener("pagehide", () => { if (state.playerTeam.length) saveGame(); });
// Latido: mantiene savedAt al día para calcular bien la ausencia si el navegador cierra la pestaña.
setInterval(() => { if (!document.hidden) state.stats.playMs += 5000; }, 5000);
setInterval(() => { if (!document.hidden && state.playerTeam.length) saveGame(); }, 5000);

// Para probar sin esperar: en la consola → __pokeAway(30 * 60 * 1000)  (simula 30 min ausente)

async function openRaidsScreen() {
  ensureRaidSave(state);
  await openRaidsLobby({
    state,
    save: saveGame,
    startRun: async ({ boss, picks }) => {
      // Usa los 2 elegidos como equipo activo temporalmente
      const backup = state.playerTeam.slice();
      const backupIdx = state.activeIndex;
      const team = picks.map(m => ({ ...m, currentHp: m.maxHp || m.currentHp || 1, maxHp: m.maxHp || m.currentHp || 1 }));
      // si maxHp falta, deja como está
      state.playerTeam = team.length ? team : backup;
      state.activeIndex = 0;
      try {
        return await startRaid(boss);
      } finally {
        // Restaura equipo original pero actualiza HP de los que participaron por uid/id
        for (const m of state.playerTeam) {
          const orig = backup.find(o => (o.uid && o.uid === m.uid) || o.id === m.id);
          if (orig) orig.currentHp = m.currentHp;
        }
        state.playerTeam = backup;
        state.activeIndex = Math.min(backupIdx, backup.length - 1);
        saveGame();
        if ($("#main .route-screen")) try { renderRoute(); } catch (_) {}
      }
    },
  });
}

async function startRaid(bossSpec) {
  ensureRaidSave(state);
  const boss = bossSpec || bossOfDay();
  setMsg(`Incursión variocolor · Kanto · ${monName(boss.id)}`);
  const host = {
    state,
    loadEnemy,
    runFight,
    healTeam: () => { state.playerTeam.forEach(m => { m.currentHp = m.maxHp; }); state.activeIndex = 0; },
    setMsg,
    delay,
    showEnemy,
    hideEnemy,
    showVs: async (t) => { try { await showVs(t); } catch (_) {} },
    playCenterHeal: async () => { try { await playCenterHealFx(); } catch (_) { await delay(800); } },
    showRaidBoss: (bossMon) => {
      const sc = document.getElementById("scene");
      if (!sc) return;
      let row = sc.querySelector(".raid-allies");
      if (!row) { row = document.createElement("div"); row.className = "raid-allies"; sc.appendChild(row); }
      row.innerHTML = state.playerTeam.filter(m => m.currentHp > 0).map(m =>
        `<img src="${frontSprite(m.id)}" alt="" />`
      ).join("");
    },
    setRaidProgress: (i, total) => {
      const bar = document.querySelector(".route-bar, #route-bar, .raid-progress");
      if (bar) bar.innerHTML = raidProgressHtml(i, total);
    },
    onCatch: (bossMon, cap) => {
      try {
        const mon = {
          id: bossMon.id,
          name: bossMon.nameEs || bossMon.name || monName(bossMon.id),
          nameEs: bossMon.nameEs || monName(bossMon.id),
          level: bossMon.level || 100,
          shiny: true,
          currentHp: bossMon.maxHp || 1,
          maxHp: bossMon.maxHp || 1,
          xp: 0,
          nature: bossMon.nature ?? 15,
          uid: "raid-" + Date.now().toString(36),
        };
        if (state.playerTeam.length < 6) state.playerTeam.push(mon);
        else (state.box ||= []).push(mon);
      } catch (_) {}
    },
    save: saveGame,
  };
  const sc = document.getElementById("scene");
  if (sc) sc.dataset.raid = "1";
  // Cierra lobby visualmente al entrar en combate
  document.getElementById("raids-lobby")?.style && (document.getElementById("raids-lobby").style.display = "none");
  try {
    const r = await runRaid(host, boss);
    setMsg(r?.caught ? "¡Incursión completada!" : (r?.reason === "defeat" ? "Equipo debilitado… la incursión falla" : "Raid terminada"));
    return r;
  } finally {
    if (sc) delete sc.dataset.raid;
    document.querySelector(".raid-allies")?.remove();
    const lobby = document.getElementById("raids-lobby");
    if (lobby) lobby.style.display = "";
  }
}

window.__startRaid = startRaid;
window.__openRaids = openRaidsScreen;

window.__pokeAway = (ms) => { hiddenAt = Date.now() - ms; onBecameVisible(); };

function showChapterBriefing() {
  const owned = new Set([...state.playerTeam, ...(state.box || [])].map(m => m.id));
  const ch = CHAPTERS[Math.min(state.chapter, CHAPTERS.length - 1)];
  const gymSeg = state.chapSegs.find(x => x.gym);
  return showBriefing({ chapterName: ch.name, segs: state.chapSegs, owned, weather: state.weather, bg: sceneBg(gymSeg?.bg), have: { bag: state.bag, flags: state.storyFlags } });
}

async function startRoute() {
  state.busy = false;
  ensureRoute();
  try {
    state.weatherInfo = await getGameWeather();
    state.weather = state.weatherInfo.key;
  } catch (_) { state.weatherInfo = weatherForNow(); state.weather = state.weatherInfo.key; }
  renderRoute();
  if (state.showBriefingOnStart) {
    state.showBriefingOnStart = false;
    openGate(showChapterBriefing());
  }
  setTimeout(() => { if (!state.busy) doEncounter(); }, 400);
}

function weatherLabel() {
  if (state.weather === "rain") return "🌧️ Lluvia";
  if (state.weather === "sun") return "☀️ Sol";
  return "🌤️ Despejado";
}

// ───────────────────────── Pantalla de ruta ─────────────────────────

const bagApi = {
  state,
  applyXp,
  xpForNext,
  tryStoneEvolve,
  onChange(persist) {
    if (persist) saveGame();
    refreshBag();
    updateHud();
  },
};

function refreshBag() {
  const el = $("#bag-card");
  if (!el) return;
  el.outerHTML = renderBag(state);
  bindBag(bagApi);
}

function updateRouteBar() {
  const el = $("#route-bar");
  if (!el) return;
  el.outerHTML = renderRouteBar({ name: routeLabel(), nodes: state.routeNodes, progress: state.routeProgress, fighting: state.fighting });
}

function updateHud() {
  const money = $("#money");
  if (money) money.textContent = `${fmtMoney(state.money)} ₽`;
  const cm = document.getElementById("cs-money"); if (cm) cm.textContent = `${fmtMoney(state.money)} ₽`;
  state.playerTeam.forEach((m, i) => {
    const slot = document.querySelector(`[data-team-idx="${i}"]`);
    if (!slot) return;
    slot.querySelector("span").textContent = `Nv.${m.level}`;
    slot.querySelector(".rail-hp .fill").style.width = `${Math.max(0, (m.currentHp / m.maxHp) * 100)}%`;
    slot.querySelector(".rail-xp .fill").style.width = `${Math.min(100, ((m.xp || 0) / xpForNext(m.level)) * 100)}%`;
  });
}

const BG_FILES = {
  prairie: "assets/bg/scenes/01-prairie-ouverte-710x400.webp",
  forest: "assets/bg/scenes/12-foret-jade-v2-710x400.webp",
  mountain: "assets/bg/scenes/03-sentier-rocheux-710x400.webp",
  cave: "assets/bg/scenes/15-grotte-sombre-710x400.webp",
  "cave-moon": "assets/bg/scenes/14-grotte-taupiqueur-710x400.webp",
  lake: "assets/bg/scenes/05-pont-pepite-v2-710x400.webp",
  river: "assets/bg/scenes/04-berge-riviere-710x400.webp",
  beach: "assets/bg/scenes/09-plage-710x400.webp",
  sea: "assets/bg/scenes/10-pleine-mer-710x400.webp",
  town: "assets/bg/scenes/42-azuria-710x400.webp",
  lab: "assets/bg/scenes/labo-professeur-chen-710x400.webp",
  tower: "assets/bg/scenes/16-tour-pokemon-710x400.webp",
  safari: "assets/bg/scenes/17-safari-prairie-710x400.webp",
  mansion: "assets/bg/scenes/21-manoir-pokemon-710x400.webp",
  rocket: "assets/bg/scenes/22-repaire-rocket-710x400.webp",
  silph: "assets/bg/scenes/23-sylphe-sarl-710x400.webp",
  victory: "assets/bg/scenes/24-route-victoire-710x400.webp",
  "cerulean-cave": "assets/bg/scenes/25-caverne-azuree-710x400.webp",
  "gym-rock": "assets/bg/scenes/26-arene-pierre-710x400.webp",
  "gym-water": "assets/bg/scenes/27-arene-ondine-710x400.webp",
  "gym-electric": "assets/bg/scenes/28-arene-major-bob-710x400.webp",
  "gym-grass": "assets/bg/scenes/29-arene-erika-710x400.webp",
  "gym-poison": "assets/bg/scenes/30-arene-koga-710x400.webp",
  "gym-psychic": "assets/bg/scenes/31-arene-morgane-710x400.webp",
  "gym-fire": "assets/bg/scenes/32-arene-auguste-710x400.webp",
  "gym-ground": "assets/bg/scenes/33-arene-giovanni-710x400.webp",
  "league-ice": "assets/bg/scenes/34-ligue-olga-710x400.webp",
  "league-fighting": "assets/bg/scenes/35-ligue-aldo-v2-710x400.webp",
  "league-ghost": "assets/bg/scenes/36-ligue-agatha-710x400.webp",
  "league-dragon": "assets/bg/scenes/37-ligue-peter-710x400.webp",
  "league-master": "assets/bg/scenes/38-maitre-blue-710x400.webp",
  center: "assets/bg/scenes/50-centre-pokemon-v2-710x400.webp",
  casino: "assets/bg/scenes/55-casino-celadopole-710x400.webp",
  shop: "assets/bg/scenes/60-boutique-pokemon-710x400.webp",

  // Johto (original)
  "johto-acajou": "assets/bg/scenes/johto-acajou-710x400.webp",
  "johto-antre-dragon-v2": "assets/bg/scenes/johto-antre-dragon-v2-710x400.webp",
  "johto-arene-acajou": "assets/bg/scenes/johto-arene-acajou-710x400.webp",
  "johto-arene-doublonville": "assets/bg/scenes/johto-arene-doublonville-710x400.webp",
  "johto-arene-ebenelle": "assets/bg/scenes/johto-arene-ebenelle-710x400.webp",
  "johto-arene-ecorcia": "assets/bg/scenes/johto-arene-ecorcia-710x400.webp",
  "johto-arene-irisia": "assets/bg/scenes/johto-arene-irisia-710x400.webp",
  "johto-arene-mauville": "assets/bg/scenes/johto-arene-mauville-710x400.webp",
  "johto-arene-oliville": "assets/bg/scenes/johto-arene-oliville-710x400.webp",
  "johto-arene-rosalia": "assets/bg/scenes/johto-arene-rosalia-710x400.webp",
  "johto-bois-chenes-v2": "assets/bg/scenes/johto-bois-chenes-v2-710x400.webp",
  "johto-bourg-geon": "assets/bg/scenes/johto-bourg-geon-710x400.webp",
  "johto-caves-jumelles-v8": "assets/bg/scenes/johto-caves-jumelles-v8-710x400.webp",
  "johto-cote": "assets/bg/scenes/johto-cote-710x400.webp",
  "johto-doublonville": "assets/bg/scenes/johto-doublonville-710x400.webp",
  "johto-ebenelle": "assets/bg/scenes/johto-ebenelle-710x400.webp",
  "johto-ecorcia": "assets/bg/scenes/johto-ecorcia-710x400.webp",
  "johto-iles-tourbillon": "assets/bg/scenes/johto-iles-tourbillon-710x400.webp",
  "johto-irisia": "assets/bg/scenes/johto-irisia-710x400.webp",
  "johto-labo-orme": "assets/bg/scenes/johto-labo-orme-710x400.webp",
  "johto-lac-colere-v2": "assets/bg/scenes/johto-lac-colere-v2-710x400.webp",
  "johto-ligue-aldo": "assets/bg/scenes/johto-ligue-aldo-710x400.webp",
  "johto-ligue-clement": "assets/bg/scenes/johto-ligue-clement-710x400.webp",
  "johto-ligue-koga": "assets/bg/scenes/johto-ligue-koga-710x400.webp",
  "johto-ligue-marion-v2": "assets/bg/scenes/johto-ligue-marion-v2-710x400.webp",
  "johto-maison-irisia": "assets/bg/scenes/johto-maison-irisia-710x400.webp",
  "johto-maitre-peter": "assets/bg/scenes/johto-maitre-peter-710x400.webp",
  "johto-mauville": "assets/bg/scenes/johto-mauville-710x400.webp",
  "johto-mont-argente-v2": "assets/bg/scenes/johto-mont-argente-v2-710x400.webp",
  "johto-mont-creuset": "assets/bg/scenes/johto-mont-creuset-710x400.webp",
  "johto-oliville": "assets/bg/scenes/johto-oliville-710x400.webp",
  "johto-parc-naturel": "assets/bg/scenes/johto-parc-naturel-710x400.webp",
  "johto-phare-oliville": "assets/bg/scenes/johto-phare-oliville-710x400.webp",
  "johto-prairies": "assets/bg/scenes/johto-prairies-710x400.webp",
  "johto-puits-ramoloss": "assets/bg/scenes/johto-puits-ramoloss-710x400.webp",
  "johto-repaire-rocket": "assets/bg/scenes/johto-repaire-rocket-710x400.webp",
  "johto-rosalia": "assets/bg/scenes/johto-rosalia-710x400.webp",
  "johto-route-glace-v2": "assets/bg/scenes/johto-route-glace-v2-710x400.webp",
  "johto-ruines-alpha": "assets/bg/scenes/johto-ruines-alpha-710x400.webp",
  "johto-sentier-montagne": "assets/bg/scenes/johto-sentier-montagne-710x400.webp",
  "johto-sommet-mont-argente": "assets/bg/scenes/johto-sommet-mont-argente-710x400.webp",
  "johto-sous-sol-doublonville": "assets/bg/scenes/johto-sous-sol-doublonville-710x400.webp",
  "johto-theatre-rosalia": "assets/bg/scenes/johto-theatre-rosalia-710x400.webp",
  "johto-tour-carillon-v2": "assets/bg/scenes/johto-tour-carillon-v2-710x400.webp",
  "johto-tour-cendree": "assets/bg/scenes/johto-tour-cendree-710x400.webp",
  "johto-tour-chetiflor": "assets/bg/scenes/johto-tour-chetiflor-710x400.webp",
  "johto-tour-radio-v2": "assets/bg/scenes/johto-tour-radio-v2-710x400.webp",
  "johto-ville-griotte": "assets/bg/scenes/johto-ville-griotte-710x400.webp",
};

function sceneKey(key) {
  if (key && BG_FILES[key]) return key;
  if (key && SCENES[key]) return key;
  const GYM_ALIAS = {
    "gym-flying": "johto-arene-mauville",
    "gym-bug": "johto-arene-ecorcia",
    "gym-normal": "johto-arene-doublonville",
    "gym-ghost": "johto-arene-rosalia",
    "gym-fighting": "johto-arene-irisia",
    "gym-steel": "johto-arene-oliville",
    "gym-ice": "johto-arene-acajou",
    "gym-dragon": "johto-arene-ebenelle",
    "gym-dark": "johto-repaire-rocket",
  };
  if (key && GYM_ALIAS[key]) return GYM_ALIAS[key];
  if (key && String(key).startsWith("gym")) return "gym-rock";
  if (key && String(key).startsWith("league")) return "league-master";
  return "prairie";
}
function sceneBg(key) {
  const k = sceneKey(key);
  // Preferir archivos locales (rápidos); base64 solo de respaldo
  return BG_FILES[k] || SCENES[k] || (BG_DATA && BG_DATA.prairie) || BG_FILES.prairie;
}

const progressApi = {
  state,
  onOpen(i) {
    const owned = new Set([...state.playerTeam, ...(state.box || [])].map(m => m.id));
    const c = buildChapter(i);
    const gym = c.segs.find(x => x.gym)?.gym;
    const isBadge = !!gym?.badgeEs && !/^Maestro/.test(gym.badgeEs) && gym.badgeEs !== "Leyenda";
    const status = i < state.chapter ? "done" : i === state.chapter ? "current" : "todo";
    const bi = isBadge ? badgeIndex(gym.badgeEs) : -1;
    showBriefing({
      chapterName: CHAPTERS[i].name, segs: c.segs, owned, weather: state.weather, bg: sceneBg(c.segs.find(x => x.gym)?.bg), closeLabel: "CERRAR",
      have: { bag: state.bag, flags: state.storyFlags },
      status, color: gym?.color,
      badgeHtmlStr: bi >= 0 ? badgeHtml(bi, true, 44) : null,
      actionLabel: status === "todo" ? null : "REPETIR EL CAPÍTULO",
      onAction: () => progressApi.onReplay(i),
    });
  },
  onLeague(ri = 0) {
    const rd = REGION_DEFS[ri] || REGION_DEFS[0];
    const lt = leagueTrainers(ri);
    showLeague({
      trainers: lt, bg: sceneBg("gym-psychic"), title: rd.leagueName,
      unlocked: state.chapter >= rd.lf,
      beaten: state.chapter > rd.ll,
      onAction: () => progressApi.onReplay(rd.lf, true),
    });
  },
  rerender() {
    const el = $(".view-progress");
    if (el) { el.innerHTML = renderProgress(state, sceneBg); bindProgress(progressApi); }
  },
  async onReplay(i, noConfirm) {
    if (!noConfirm && !(await showConfirm({ title: `¿Volver a «${CHAPTERS[i].name}»? Se reinicia el recorrido de ese capítulo.`, confirmLabel: "Repetir" }))) return;
    state.chapter = i;
    loadChapter();
    state.epoch++;
    state.view = "adventure";
    saveGame();
    if ($("#main .route-screen")) renderRoute();
  },
};

function teamPresets() {
  const p = state.teamPresets;
  if (!p || !Array.isArray(p.teams) || p.teams.length !== 5) state.teamPresets = { teams: [[], [], [], [], []], active: 0 };
  return state.teamPresets;
}
/** Guarda en el equipo activo los uid de los Pokémon que lo forman ahora. */
function syncActivePreset() {
  if (state.playerTeam.some(m => String(m.uid).startsWith("raid-"))) return; // equipo temporal de incursión
  const p = teamPresets();
  p.teams[p.active] = state.playerTeam.map(m => m.uid).filter(Boolean);
}

function openTeam() {
  state.view = "team";
  try { ensureNav(); } catch (_) {}
  syncActivePreset();
  showTeamScreen({
    team: state.playerTeam,
    box: state.box || (state.box = []),
    presets: teamPresets(),
    onChange: () => {
      // El orden del equipo cambió: se descarta el combate en curso y se guarda
      state.epoch++;
      state.activeIndex = 0;
      syncActivePreset();
      saveGame();
    },
    onClose: () => {
      // Al cerrar el PC se vuelve siempre al mapa de aventura (donde se está peleando)
      state.view = "adventure";
      try { setView("adventure"); } catch (_) {}
      try { ensureNav(); } catch (_) {}
      if (!$("#scene") || !state.busy) renderRoute();
    },
  });
}

const NAV = [
  { id: "adventure", icon: "ball", label: "Aventura" },
  { id: "progress", icon: "map", label: "Progreso" },
  { id: "team", icon: "pc", label: "Equipo/PC", act: true },
  { id: "dex", icon: "dex", label: "Pokédex" },
  { id: "bag", icon: "store", label: "Mochila" },
  { id: "act", icon: "card", label: "Actividades", act: true },
];

/** Deslizar a izquierda/derecha cambia de pestaña (solo móvil en vertical), igual que tocar el menú inferior. */
function initSwipeNav() {
  if (window.__swipeNav) return;
  window.__swipeNav = true;
  const ORDER = ["adventure", "progress", "team", "dex", "bag"];
  const BLOCK = "input,textarea,select,canvas,.tip-pop,.opt-overlay,.tc-overlay,.ach-screen,.detail-x,#act-menu,.ttl,.cs-machine,[data-zone],.coll-card,.tp-btn,.dx-pick,.pixel-dd,.dd-menu,[data-noswipe]";
  let sx = 0, sy = 0, st = 0, ok = false;
  document.addEventListener("touchstart", (e) => {
    ok = false;
    if (e.touches.length !== 1 || !window.matchMedia("(max-width: 799px)").matches) return;
    if (document.querySelector(".detail-x, .opt-overlay, .tc-overlay, .ach-screen, .ttl, .pk-overlay")) return;
    const t = e.target;
    if (!(t instanceof Element) || t.closest(BLOCK)) return;
    for (let n = t; n && n !== document.body; n = n.parentElement) {
      if (n.scrollWidth > n.clientWidth + 4 && /(auto|scroll)/.test(getComputedStyle(n).overflowX)) return; // listas que se desplazan en horizontal
    }
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); ok = true;
  }, { passive: true });
  document.addEventListener("touchend", (e) => {
    if (!ok) return;
    ok = false;
    const c = e.changedTouches[0];
    const dx = c.clientX - sx, dy = c.clientY - sy;
    if (Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy) * 1.8 || Date.now() - st > 800) return;
    const i = ORDER.indexOf(state.view);
    const next = ORDER[i + (dx < 0 ? 1 : -1)];
    if (i < 0 || !next) return;
    document.querySelector(`#bottom-nav [data-nav="${next}"]`)?.click();
  }, { passive: true });
}

function ensureNav() {
  let nav = document.getElementById("bottom-nav");
  if (!nav) {
    nav = document.createElement("nav");
    nav.id = "bottom-nav";
    nav.innerHTML = NAV.map(n => `<button type="button" data-nav="${n.id}" aria-label="${n.label}"><img class="nav-ico" src="assets/nav/${n.icon}.png" alt="" draggable="false" /><em>${n.label}</em></button>`).join("");
    nav.addEventListener("click", (e) => {
      const b = e.target.closest("[data-nav]");
      if (!b) return;
      const id = b.dataset.nav;
      // Si el panel de Equipo/PC está abierto, se cierra antes de cambiar de pestaña
      const openTeamPanel = document.querySelector(".team-overlay .team-close");
      if (openTeamPanel) { openTeamPanel.click(); if (id === "team") return; }
      if (id === "team") return openTeam();
      if (id === "coll") return showCollection({ team: state.playerTeam, box: state.box || [] });
      if (id === "act") return toggleActMenu();
      closeActMenu();
      setView(id);
    });
    (document.getElementById("app") || document.body).appendChild(nav);
  }
  const cur = (state.view === "nursery" || state.view === "casino") ? "act" : (state.view === "team" ? "team" : state.view);
  nav.querySelectorAll("[data-nav]").forEach(b => b.classList.toggle("active", b.dataset.nav === cur));
}

function closeActMenu() { document.getElementById("act-menu")?.remove(); }

function openAchievementsScreen() {
  closeActMenu();
  syncAchievementUnlocks();
  return openAchievements(state, { onEquip: equipAchievement, onPlayScene: playAchievementScene });
}

function equipAchievement(id) {
  syncAchievementUnlocks();
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (!a || !evaluateAchievements(state).some(x => x.id === id && x.done)) return false;
  state.player = state.player || {};
  if (a.kind === "aspect") state.player.aspect = a.reward;
  else if (a.kind === "frame") state.player.frame = FRAME_REWARD_MAP[a.reward] || "base";
  saveGame();
  try { renderRoute(); } catch (_) {}
  return true;
}

async function playAchievementScene(id) {
  const root = $("#scene") || $("#main") || document.body;
  const mons = { "scene-zapdos": 145, "scene-articuno": 144, "scene-moltres": 146, "scene-mewtwo": 150, "scene-mew": 151 };
  const monId = mons[id];
  if (monId) {
    const info = LEGENDS[monId] || {};
    await playLegendAnnounce({ root, name: info.name || "Pokémon legendario", text: info.text || "Una presencia legendaria aparece…", color: info.color || "#c9a0ff", sprite: `assets/pokemon/${monId}.png`, holdMs: 1700 });
    return;
  }
  if (id === "scene-blue") await playBossIntro({ root, trainer: "Azul", title: "Campeón de Kanto", subtitle: "Liga Pokémon", type: "normal", color: "#e8c050", sprite: "assets/trainers/blue.png", holdMs: 1300 });
}
function toggleActMenu() {
  if (document.getElementById("act-menu")) return closeActMenu();
  const unlocked = casinoUnlocked(state);
  const items = [
    { id: "ach", label: "LOGROS", ic: "🏅" },
    { id: "nursery", label: "Guardería", ic: "🥚" },
    { id: "casino", label: "Casino", ic: "🎰", lock: !unlocked, hint: "Medalla Trueno" },
    { id: "raids", label: "Incursiones", ic: "💜" },
    { id: "tower", label: "Torre Batalla", lock: true },
  ];
  const m = document.createElement("div");
  m.id = "act-menu";
  m.innerHTML = `<h4>ACTIVIDADES</h4>${items.map(i => `<button type="button" data-act="${i.id}" class="${state.view === i.id ? "on" : ""} ${i.lock ? "lock" : ""}"><span>${i.ic || "•"}</span><b>${i.label}</b>${i.lock ? `<i>🔒${i.hint ? ` <small>${i.hint}</small>` : ""}</i>` : ""}</button>`).join("")}`;
  m.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b || b.classList.contains("lock")) return;
    closeActMenu();
    if (b.dataset.act === "ach") { openAchievementsScreen(); return; }
    if (b.dataset.act === "raids") {
      if (!state.playerTeam.length) { setMsg("Necesitas un equipo"); return; }
      openRaidsScreen();
      return;
    }
    setView(b.dataset.act);
  });
  document.body.appendChild(m);
  setTimeout(() => document.addEventListener("click", function h(ev) { if (!ev.target.closest("#act-menu, [data-nav=act]")) { closeActMenu(); document.removeEventListener("click", h); } }), 0);
}

/** Canjea fichas por un Pokémon del casino (repetido → PE a su familia). */
async function buyPrize(p) {
  state.fichas = (state.fichas || 0) - p.price;
  const enemy = await loadEnemy(p.id, p.level);
  const natureIndex = randomNature();
  const mon = {
    ...enemy, currentHp: enemy.maxHp, xp: 0, uid: Date.now() + Math.random(), capturedAt: Date.now(),
    place: "Casino", wins: 0, natureIndex,
    moves: (enemy.moves || []).map(m => ({ ...m })),
    stats: applyNatureToStats({ ...enemy.stats }, natureIndex),
    sprites: { front: frontSprite(enemy), back: backSprite(enemy) },
  };
  dexAdd("seen", mon.id); dexAdd("caught", mon.id);
  const r = storeCaptured(mon, state, { applyXpFn: applyXp });
  state.stats.casinoBought = (state.stats.casinoBought || 0) + 1;
  saveGame();
  try { refreshBag(); } catch (_) {}
  updateHud();
  const msg = r.added ? `¡${enemy.nameEs} ${r.where === "team" ? "se unió al equipo" : "fue enviado a la caja"}!`
    : r.familyXp ? `¡Repetido! ${enemy.nameEs} → +${r.totalXp} PE para su familia`
    : (r.reason || "No se pudo guardar");
  return { msg, mon, added: !!r.added, repeated: !!r.familyXp };
}
const casinoApi = { state, save: () => saveGame(), hud: () => updateHud(), toast: (m) => toast(m), buy: (p) => buyPrize(p), sfx: () => { try { Sfx.capture(); } catch (_) {} } };

const nurseryApi = { state, save: () => saveGame(), refresh: () => refreshNursery(), tick: () => tickNursery(), money: () => { const m = $("#money"); if (m) m.textContent = `${fmtMoney(state.money)} ₽`; } };
function refreshNursery() {
  const el = $(".view-nursery");
  if (el) { el.innerHTML = renderNursery(state); bindNursery(nurseryApi); }
}

function toast(msg) {
  const d = document.createElement("div");
  d.className = "poke-toast";
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 4200);
}

/** Eclosión: crea el Pokémon de Nv. 5 y lo guarda en la caja (siempre, sin límite de familia). */
async function hatchEgg(egg) {
  const enemy = await loadEnemy(egg.id, EGG_LEVEL);
  enemy.shiny = Math.random() < SHINY_RATE;
  const natureIndex = egg.nature != null ? egg.nature : randomNature();
  const mon = {
    ...enemy,
    currentHp: enemy.maxHp,
    xp: 0,
    uid: Date.now() + Math.random(),
    capturedAt: Date.now(),
    place: "Huevo",
    wins: 0,
    natureIndex,
    moves: (enemy.moves || []).map(m => ({ ...m })),
    stats: applyNatureToStats({ ...enemy.stats }, natureIndex),
    sprites: { front: frontSprite(enemy), back: backSprite(enemy) },
  };
  dexAdd("seen", mon.id);
  dexAdd("caught", mon.id);
  if (mon.shiny) dexAdd("shiny", mon.id);
  // Filtro de naturaleza: si la cría no es de las que quieres, se cambia por PE para su familia (los variocolor siempre se guardan)
  const want = state.captureFilter?.[mon.id];
  const filtered = !mon.shiny && want && want.length && !want.includes(natureIndex);
  const nur = ensureNursery(state);
  const stored = storeCaptured(mon, state, { applyXpFn: applyXp, forceFamilyXp: !!filtered, extraFamily: nur.parents.filter(Boolean) });
  state.stats.hatched = (state.stats.hatched || 0) + 1;
  if (filtered) state.stats.autoReleased = (state.stats.autoReleased || 0) + 1;
  if (!stored.added && stored.familyXp) { mon._familyXp = stored.totalXp; if (filtered) mon._filtered = true; }
  return mon;
}

let nurseryBusy = false;
async function tickNursery() {
  if (nurseryBusy || !state.playerTeam.length) return;
  nurseryBusy = true;
  try {
    const n = ensureNursery(state);
    const now = Date.now();
    const made = produceEggs(state, now);
    const hatched = [];
    for (const slot of readyIncubators(n, now)) {
      const x = n.incubators[slot];
      n.incubators[slot] = null;
      try { hatched.push(await hatchEgg(x.egg)); } catch (e) { n.incubators[slot] = x; console.warn("hatch", e); }
    }
    if (made || hatched.length) {
      saveGame();
      if (hatched.length) {
        if (hatched.length <= 3 && !document.hidden) { for (const m of hatched) await showHatchAnim(m); }
        else toast(`🥚 ¡Eclosionaron ${hatched.map(m => (m.shiny ? "✦ " : "") + (m.nameEs || m.name) + (m._filtered ? ` (no coincide: +${m._familyXp} PE)` : "")).join(", ")}!`);
      }
      else toast(`🥚 ¡Hay ${made} huevo${made > 1 ? "s" : ""} nuevo${made > 1 ? "s" : ""} en la guardería!`);
      if (state.view === "nursery") refreshNursery();
    }
  } finally { nurseryBusy = false; }
}
setInterval(() => { if (!document.hidden) tickNursery(); }, 5000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) setTimeout(tickNursery, 1500); });

function setView(id) {
  state.view = id;
  const main = $("#main");
  if (main) main.dataset.view = id;
  if (id === "progress") { const el = $(".view-progress"); if (el) { el.innerHTML = renderProgress(state, sceneBg); bindProgress(progressApi); } }
  if (id === "dex") { const el = $(".view-dex"); if (el) { el.innerHTML = renderDex(state); bindDex(state); } }
  if (id === "nursery") refreshNursery();
  if (id === "casino" && !casinoBusy()) { const el = $(".view-casino"); if (el) { el.innerHTML = renderCasino(state); bindCasino(casinoApi); } }
  ensureNav();
  window.scrollTo(0, 0);
}

function renderRoute() {
  const mon = getActiveMon();
  if (!mon) return;
  const name = state.player?.name || "Entrenador";
  const bg = sceneBg(curSeg()?.bg);

  const keepCasino = casinoBusy() ? document.querySelector(".view-casino[data-bound]") : null;
  if (keepCasino) keepCasino.remove();
  $("#main").innerHTML = `
    <div class="route-screen">
      <div class="route-header hud">
        <div class="trainer-chip" id="trainer-chip" role="button">
          ${avatarHtml(state, { cls: "chip-av" })}
          <span class="hud-dex">${(state.stats?.caught || []).length} / ${state.chapter >= 15 || (state.stats?.caught || []).some(i => i > 151) ? 251 : 151}</span>
        </div>
        <span class="money hud-money" id="money">${fmtMoney(state.money)} ₽</span>
        <button type="button" class="hud-btn" id="hud-save" aria-label="Guardar"><i class="hud-floppy"></i><b class="hud-dot"></b></button>
        <button type="button" class="hud-btn" id="hud-gear" aria-label="Ajustes"><i class="hud-cog">⚙</i></button>
      </div>

      <div class="view view-adventure">
      ${renderRouteBar({ name: routeLabel(), nodes: state.routeNodes, progress: state.routeProgress, fighting: state.fighting })}

      <div class="battle-scene bgk-${sceneKey(curSeg()?.bg)} weather-${state.weather}${state.weatherInfo?.night ? " is-night" : ""}" id="scene"
           style="background-image:url('${bg}')">
        <div class="weather-layer" id="weather-layer"></div>
        <div class="speed-controls in-scene">
          <button data-spd="1" class="${state.speed===1?"active":""}">×1</button>
          <button data-spd="2" class="${state.speed===2?"active":""}">×2</button>
          <button data-spd="4" class="${state.speed===4?"active":""}">×4</button>
        </div>
        <div class="scene-topbar">
          <div class="clock-chip"><span class="clock-icon">${state.weatherInfo?.night ? "🌙" : "☀️"}</span> ${formatClock()}</div>
          <div class="weather-chip">${state.weatherInfo?.icon || "🌤️"} <span>${state.weatherInfo?.label || "Despejado"} hasta las ${formatHour(state.weatherInfo?.untilHour ?? 0)}</span></div>
        </div>

        <div class="scene-overlay">
          <div class="team-rail">
            ${state.playerTeam.map((m, i) => {
              const xpP = Math.min(100, ((m.xp || 0) / xpForNext(m.level)) * 100);
              const hpP = Math.max(0, (m.currentHp / m.maxHp) * 100);
              return `
              <button type="button" class="rail-slot ${i===state.activeIndex?"active":""} ${m.currentHp<=0?"ko":""}" data-team-idx="${i}">${m.status ? `<b class="st-badge ${m.status}">${STATUS_LBL[m.status]}</b>` : ""}
                <img src="${frontSprite(m)}" alt="${m.nameEs}" />
                <span>Nv.${m.level}</span>
                <div class="rail-hp"><div class="fill" style="width:${hpP}%"></div></div>
                <div class="rail-xp"><div class="fill" style="width:${xpP}%"></div></div>
              </button>`;
            }).join("")}
          </div>

          <div class="battle-field">
            <div class="battle-mon ally" id="ally-side">
              <div class="hp-mini"><div class="fill" id="ally-hp" style="width:${(mon.currentHp/mon.maxHp)*100}%"></div></div>
              <img id="ally-img" class="mon-sprite" src="${battleSprite(mon)}" alt="${mon.nameEs}"
                   style="${spriteSizeStyle(mon)}"
                   onerror="this.src='${frontSprite(mon)}'" />
              <span class="lv">Nv.${mon.level}</span>
            </div>
            <div class="battle-mon enemy" id="enemy-side" style="visibility:hidden">
              <div class="hp-mini"><div class="fill" id="enemy-hp" style="width:100%"></div></div>
              <img id="enemy-img" class="mon-sprite" src="" alt="" />
              <span class="lv" id="enemy-lv"></span><b class="st-badge enemy-st" id="enemy-st" hidden></b>
            </div>
          </div>
        </div>
      </div>

      <div class="battle-msg" id="msg">Explorando ${routeLabel()}...</div>

      </div>

      <div class="view view-progress">${renderProgress(state, sceneBg)}</div>
      <div class="view view-dex">${renderDex(state)}</div>
      <div class="view view-bag">${renderBag(state)}</div>
      <div class="view view-nursery">${renderNursery(state)}</div>
      <div class="view view-casino">${renderCasino(state)}</div>
    </div>
  `;
  $("#main").dataset.view = state.view;

  initWeatherParticles();
  bindBag(bagApi);
  bindProgress(progressApi);
  bindDex(state);
  bindNursery(nurseryApi);
  if (keepCasino) { const fresh = document.querySelector(".view-casino"); if (fresh) fresh.replaceWith(keepCasino); }
  bindCasino(casinoApi);
  $("#trainer-chip").onclick = () => showTrainerCard(state, {
    sprite: playerSprite(),
    onRename: (n) => {
      const el = document.querySelector("#trainer-chip strong"); if (el) el.textContent = n;
      saveGame();
    },
    onSave: () => { saveGame(); try { renderRoute(); } catch (_) {} },
  });
  ensureNav();
  initSwipeNav();
  $("#hud-save").onclick = () => {
    saveGame();
    const d = $("#hud-save .hud-dot"); if (d) { d.classList.remove("pulse"); void d.offsetWidth; d.classList.add("pulse"); }
    setMsg("Partida guardada");
  };
  $("#hud-gear").onclick = () => showOptions({ state, saveGame, clearSave });
  document.querySelectorAll(".speed-controls button").forEach(btn => {
    btn.onclick = () => {
      state.speed = Number(btn.dataset.spd);
      document.querySelectorAll(".speed-controls button").forEach(b => b.classList.toggle("active", b === btn));
      saveGame();
    };
  });
  document.querySelectorAll("[data-team-idx]").forEach(el => {
    el.onclick = () => {
      const i = Number(el.dataset.teamIdx);
      const mon = state.playerTeam[i];
      if (mon) {
        showPokemonDetail(mon, { inTeam: true });
      }
    };
  });
}

function initWeatherParticles() {
  const layer = $("#weather-layer");
  if (!layer) return;
  layer.innerHTML = "";
  const w = state.weather;
  if (w === "rain" || w === "storm") {
    const n = w === "storm" ? 55 : 36;
    for (let i = 0; i < n; i++) {
      const d = document.createElement("div");
      d.className = w === "storm" ? "rain-drop storm" : "rain-drop";
      d.style.left = Math.random() * 100 + "%";
      d.style.animationDelay = Math.random() * 1.2 + "s";
      d.style.animationDuration = (w === "storm" ? 0.28 : 0.4) + Math.random() * 0.4 + "s";
      layer.appendChild(d);
    }
    if (w === "storm") {
      const flash = document.createElement("div");
      flash.className = "lightning";
      layer.appendChild(flash);
    }
  } else if (w === "sun") {
    layer.innerHTML = `<div class="sun-glow"></div>`;
  }
}

const STATUS_LBL = { psn: "ENV", par: "PAR" };
const STATUS_TXT = { psn: "fue envenenado", par: "está paralizado" };
function setStatusBadge(side, idx, status) {
  if (side === "ally") {
    const slot = document.querySelector(`.rail-slot[data-team-idx="${idx}"]`);
    if (!slot) return;
    slot.querySelector(".st-badge")?.remove();
    if (status) slot.insertAdjacentHTML("afterbegin", `<b class="st-badge ${status}">${STATUS_LBL[status]}</b>`);
  } else {
    const b = document.querySelector("#enemy-st");
    if (!b) return;
    b.className = "st-badge enemy-st" + (status ? " " + status : "");
    b.textContent = status ? STATUS_LBL[status] : "";
    b.hidden = !status;
  }
}

function setMsg(text) {
  const el = $("#msg");
  if (el) el.textContent = text;
  // Mensaje dentro del mapa (caja blanca con marco azul, como el original)
  const scene = $("#scene");
  if (!scene) return;
  let m = scene.querySelector(".scene-msg");
  if (!m) { m = document.createElement("div"); m.className = "scene-msg"; scene.appendChild(m); }
  if (m.textContent !== text) {
    m.textContent = text;
    m.classList.remove("pop"); void m.offsetWidth; m.classList.add("pop");
  }
}

/** Cartel central azul sobre el mapa (p. ej. "¡Has derrotado a Lorelei!"). */
async function showBanner(text, ms = 1500) {
  const scene = $("#scene");
  if (!scene || document.hidden) return;
  const b = document.createElement("div");
  b.className = "scene-banner";
  b.textContent = text;
  scene.appendChild(b);
  await delay(ms / Math.max(1, state.speed || 1));
  b.classList.add("out");
  await delay(200);
  b.remove();
}

/** "+N PE" verde junto a la ficha del Pokémon en el riel del equipo. */
function floatXp(idx, amount) {
  const scene = $("#scene");
  const slot = document.querySelector(`.rail-slot[data-team-idx="${idx}"]`);
  if (!scene || !slot || !amount) return;
  const s = scene.getBoundingClientRect(), r = slot.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "xp-float";
  el.innerHTML = `+${fmtMoney(amount)} <small>PE</small>`;
  el.style.left = `${r.right - s.left + 6}px`;
  el.style.top = `${r.top - s.top + r.height * 0.32}px`;
  scene.appendChild(el);
  setTimeout(() => el.remove(), 1700);
}

function floatDamage(side, amount, strong = false) {
  const scene = $("#scene");
  if (!scene) return;
  const el = document.createElement("div");
  el.className = "damage-float" + (strong ? " crit" : "");
  el.textContent = `-${amount}`;
  el.style.left = side === "enemy" ? "68%" : "22%";
  el.style.bottom = "42%";
  scene.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

function shakeMon(side) {
  const el = side === "enemy" ? $("#enemy-img") : $("#ally-img");
  if (!el) return;
  el.classList.remove("anim-hit", "anim-attack");
  void el.offsetWidth;
  el.classList.add("anim-hit");
}

function attackAnim(side) {
  const el = side === "ally" ? $("#ally-img") : $("#enemy-img");
  if (!el) return;
  el.classList.remove("anim-hit", "anim-attack");
  void el.offsetWidth;
  el.classList.add("anim-attack");
}

const playerSprite = () => getAspect(state);

/** Careo: tu sprite a la izquierda, el rival a la derecha y el texto de desafío. */
async function showFaceoff(rivalSprite, text, ms = 1700) {
  const scene = $("#scene");
  if (!scene) return;
  const me = playerSprite();
  const rival = rivalSprite || "youngster";
  const el = document.createElement("div");
  el.className = "faceoff";
  el.innerHTML = `
    <div class="vs-stand left" style="opacity:1">
      <img class="fo-me vs-body" src="assets/trainers/${me}.png" alt="" onerror="this.onerror=null;this.src='assets/trainers/youngster.png'" />
      <span class="vs-label">${state.player?.name || "Tú"}</span>
    </div>
    <div class="vs-flash" style="opacity:1">VS</div>
    <div class="vs-stand right" style="opacity:1">
      <img class="fo-rival vs-body" src="assets/trainers/${rival}.png" alt="" onerror="this.onerror=null;this.src='assets/trainers/youngster.png'" />
      <span class="vs-label">${(text || "").replace(/^¡|!$| quiere luchar/gi, "").trim() || rival}</span>
    </div>`;
  scene.appendChild(el);
  setMsg(text);
  try { await delay(ms); } finally { el.remove(); }
}

/** El rival asoma en la esquina mientras saca a su Pokémon; se oculta al aparecer el Pokémon. */
async function peekRival(rivalSprite, text) {
  // Igual que el careo inicial: tú a la izquierda, el rival grande a la derecha
  await showFaceoff(rivalSprite, text, 1100);
}

// ───────────────────────── Presentaciones ─────────────────────────

// Panel con las Poké Balls del equipo rival (gris = ya derrotado)
function foeTeam(name, total, done) {
  const scene = $("#scene"); if (!scene) return;
  let el = scene.querySelector(".foe-team");
  if (!el) { el = document.createElement("div"); el.className = "foe-team"; scene.appendChild(el); }
  const n = Math.max(1, Math.min(6, total | 0));
  const balls = Array.from({ length: n }, (_, i) => {
    const doneCls = i < done ? " done" : "";
    return `<img class="ft-ball${doneCls}" src="assets/items/poke-ball.png" alt="" width="22" height="22" onerror="this.onerror=null;this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'" />`;
  }).join("");
  el.innerHTML = `<b>${name}</b><span class="ft-balls">${balls}</span>`;
  el.style.display = "block";
}
function clearFoeTeam() { document.querySelector("#scene .foe-team")?.remove(); }

/** Pantalla VS (tú vs entrenador de ruta). */
async function showVs(t) {
  const scene = $("#scene");
  setMsg(`¡${t.name} quiere luchar!`);
  if (!scene || document.hidden) return;
  const sp = Math.max(1, state.speed || 1);
  let avHtml = "";
  try { avHtml = avatarHtml(state, { cls: "vs-av" }); } catch (_) {}
  await playVsIntro({
    root: scene,
    playerName: state.player?.name || "Tú",
    playerSprite: `assets/trainers/${playerSprite()}.png`,
    playerAvatarHtml: avHtml,
    trainerName: t.name,
    trainerSprite: `assets/trainers/${t.sprite || "youngster"}.png`,
    duration: 1600 / sp,
  });
}

/** Líder de gimnasio / Alto Mando / Campeón / Rival (estilo boss-intro del original). */
async function showBoss(gym) {
  const scene = $("#scene");
  setMsg(`¡${gym.leaderEs} quiere luchar!`);
  if (!scene || document.hidden) return;
  const ch = state.chapter;
  let title = "Líder de gimnasio", subtitle = gym.name || "";
  if (gym.champion) { title = "Campeón"; subtitle = "Liga Pokémon"; }
  else if (ch >= 9 && ch <= 12) { title = "Alto Mando"; subtitle = `Sala ${ch - 8}`; }
  else if (!gym.badgeEs) { title = "Rival"; subtitle = gym.name || ""; }
  const sp = Math.max(1, state.speed || 1);
  await playBossIntro({
    root: scene,
    trainer: gym.leaderEs, title, subtitle,
    type: gym.type, color: gym.color,
    sprite: `assets/trainers/${gym.sprite}.png`,
    holdMs: 900 / sp,
  });
}

/** Presentación de un legendario (Mewtwo: cinemática completa; el resto: aviso). */
async function playLegendIntro(id, root = $("#scene")) {
  const L = LEGENDS[id];
  if (!L || !root) return;
  if (L.cine) { await playMewtwoIntro(root, { speed: Math.max(1, state.speed || 1) }); return; }
  let bg = null;
  if (L.bg) { // fondo de la zona detrás del aviso
    bg = document.createElement("div");
    bg.style.cssText = `position:absolute;inset:0;z-index:39;background:#000 url('${L.bg}') center/cover;image-rendering:pixelated;opacity:.55;pointer-events:none`;
    root.appendChild(bg);
  }
  try {
    await playLegendAnnounce({
      root, name: L.name, color: L.color,
      text: (L.announce || L.text).replace("{zona}", "Kanto"),
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      holdMs: 1600 / Math.max(1, state.speed || 1),
    });
  } finally { bg?.remove(); }
}

/** El entrenador rival aparece, lanza su Poké Ball y su Pokémon se forma a píxeles. */
async function foeSendOut(spriteName, enemy) {
  const scene = document.querySelector("#scene");
  const img = document.querySelector("#enemy-img");
  if (!scene || !img || document.hidden) { if (img) img.style.visibility = "visible"; return; }
  scene.querySelectorAll(".so-trainer.foe, .so-ball.foe").forEach((n) => n.remove());
  const sp = Math.max(1, state.speed || 1);
  await imgReady(img);
  try { await fitSprite(img); } catch (_) {}
  const s = scene.getBoundingClientRect();
  const H = Math.round(Math.min(132, Math.max(96, s.height * 0.34)));
  const tr = document.createElement("img");
  tr.className = "so-trainer foe";
  tr.src = `assets/trainers/${spriteName}.png`;
  tr.style.cssText = `height:${H}px;width:auto;max-height:${H}px;right:${Math.round(s.width * 0.06)}px;bottom:${Math.round(s.height * 0.12)}px;top:auto;transform-origin:center bottom;`;
  scene.appendChild(tr);
  await imgReady(tr).catch(() => {});
  await delay(260 / sp);
  const trR = tr.getBoundingClientRect(), r = img.getBoundingClientRect();
  const handX = trR.left - s.left + trR.width * 0.2, handY = trR.top - s.top + trR.height * 0.36;
  const toX = r.left - s.left + r.width / 2 - 9, toY = r.top - s.top + r.height * 0.55;
  const ball = document.createElement("img");
  ball.className = "so-ball foe";
  ball.src = "assets/items/poke-ball.png";
  ball.alt = "";
  scene.appendChild(ball);
  try {
    await ball.animate([
      { transform: `translate(${handX}px,${handY}px) scale(.85)` },
      { transform: `translate(${(handX + toX) / 2}px,${Math.min(handY, toY) - Math.round(s.height * 0.12)}px) scale(1) rotate(-200deg)`, offset: 0.55 },
      { transform: `translate(${toX}px,${toY}px) scale(1.05) rotate(-400deg)` },
    ], { duration: 420 / sp, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }).finished.catch(() => {});
    ball.classList.add("pop");
    const ring = document.createElement("i");
    ring.className = "so-ring";
    ring.style.cssText = `left:${toX + 9}px;top:${toY + 9}px`;
    scene.appendChild(ring);
    setTimeout(() => ring.remove(), 600 / sp);
    tr.classList.add("out");
    await dissolve(img, "in", 560 / sp, false);
    await delay(120 / sp);
  } finally {
    ball.remove(); tr.remove();
    img.style.visibility = "visible";
  }
}

/** Entrenador lanza la Poké Ball y tu Pokémon se forma a píxeles (mode "in"), o lo retira (mode "out"). */
async function showTrainerSendOut(mode = "in", quiet = false) {
  const scene = document.querySelector("#scene");
  const ally = document.querySelector("#ally-img");
  if (!scene || !ally || document.hidden) return;
  scene.querySelectorAll(".so-trainer:not(.foe), .so-ball:not(.foe), .capture-throw-layer").forEach((n) => n.remove());

  const sp = Math.max(1, state.speed || 1);
  const mon = state.playerTeam[state.activeIndex] || state.playerTeam[0];
  if (mode === "in") { ally.style.visibility = "hidden"; if (!quiet) setMsg(`¡Adelante, ${mon?.nameEs || "Pokémon"}!`); }
  else setMsg(`¡Vuelve, ${mon?.nameEs || "Pokémon"}!`);
  await imgReady(ally);
  try { await fitSprite(ally); } catch (_) {}

  const s = scene.getBoundingClientRect();
  // Mismo tamaño que captura / original: ~34% del alto del campo, tope 132px
  const H = Math.round(Math.min(132, Math.max(96, s.height * 0.34)));

  const tr = document.createElement("img");
  tr.className = "so-trainer";
  tr.src = `assets/trainers/${playerSprite()}.png`;
  tr.onerror = () => { tr.src = "assets/trainers/red.png"; };
  // Anclado al suelo (bottom), izquierda, mira al enemigo
  tr.style.cssText = [
    `height:${H}px`,
    `width:auto`,
    `max-height:${H}px`,
    `left:${Math.round(s.width * 0.08)}px`,
    `bottom:${Math.round(s.height * 0.12)}px`,
    `top:auto`,
    `transform:scaleX(-1)`,
    `transform-origin:center bottom`,
    `z-index:6`,
  ].join(";");
  scene.appendChild(tr);
  await imgReady(tr).catch(() => {});

  const trR = tr.getBoundingClientRect();
  const r = ally.getBoundingClientRect();
  const handX = trR.left - s.left + trR.width * 0.78;
  const handY = trR.top - s.top + trR.height * 0.36;
  const toX = r.left - s.left + r.width / 2 - 9;
  const toY = r.top - s.top + r.height * 0.5;

  const ball = document.createElement("img");
  ball.className = "so-ball";
  ball.src = "assets/items/poke-ball.png";
  ball.alt = "";
  scene.appendChild(ball);

  try {
    if (mode === "in") {
      const a = ball.animate([
        { transform: `translate(${handX}px,${handY}px) scale(.85)`, offset: 0 },
        { transform: `translate(${(handX + toX) / 2}px,${Math.min(handY, toY) - Math.round(s.height * 0.1)}px) scale(1) rotate(200deg)`, offset: 0.55 },
        { transform: `translate(${toX}px,${toY}px) scale(1.05) rotate(400deg)`, offset: 1 },
      ], { duration: 420 / sp, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" });
      await a.finished.catch(() => {});
      ball.classList.add("pop");
      await dissolve(ally, "in", 560 / sp, true);
      ball.remove();
      await delay(140 / sp);
    } else {
      ball.style.transform = `translate(${toX}px,${toY}px)`;
      await delay(80 / sp);
      await dissolve(ally, "out", 480 / sp, true);
      try {
        await ball.animate([
          { transform: `translate(${toX}px,${toY}px) scale(1)` },
          { transform: `translate(${handX}px,${handY}px) scale(.8)` },
        ], { duration: 280 / sp, fill: "forwards" }).finished;
      } catch (_) {}
    }
  } finally {
    ball.remove();
    tr.classList.add("out");
    await delay(160 / sp);
    tr.remove();
  }
}


function showEnemy(enemy) {
  const enemySide = $("#enemy-side");
  if (!enemySide) return;
  enemySide.style.visibility = "visible";
  enemySide.style.opacity = "1";
  const img = $("#enemy-img");
  if (img) {
    const src = battleSprite(enemy);
    img.style.visibility = "visible";
    img.style.opacity = "1";
    img.style.display = "block";
    img.style.cssText = spriteSizeStyle(enemy) + "visibility:visible;opacity:1;display:block;";
    // Hasta que el dibujo cargue no se muestra (evita el recuadro vacío); si falla, cae a la copia local
    img.dataset.pending = "1";
    img.style.visibility = "hidden";
    const reveal = () => { if (img.dataset.pending) { delete img.dataset.pending; img.style.visibility = "visible"; try { fitSprite(img); } catch (_) {} } };
    img.dataset.loading = "1"; // CSS: invisible hasta que haya dibujo (en cualquier flujo: salvaje, entrenador, gimnasio)
    const done = () => { delete img.dataset.loading; reveal(); };
    img.onload = done;
    img.onerror = () => {
      img.onerror = () => { img.onerror = () => { img.onerror = null; delete img.dataset.loading; }; img.src = `assets/pokemon/${enemy.id}.png`; };
      img.src = frontSprite(enemy);
    };
    img.src = src;
    if (img.complete && img.naturalWidth) done();
    img.classList.remove("anim-faint", "anim-hit", "anim-attack");
    img.decode?.().then(() => { try { fitSprite(img); } catch (_) {} }).catch(() => {});
    try { fitSprite(img); } catch (_) {}
  }
  if ($("#enemy-lv")) $("#enemy-lv").textContent = `Nv.${enemy.level}`;
  enemy.status = null; setStatusBadge("enemy", 0, null);
  if ($("#enemy-hp")) $("#enemy-hp").style.width = "100%";
}

function hideEnemy() {
  if ($("#enemy-side")) $("#enemy-side").style.visibility = "hidden";
}

/** Ejecuta un combate animado. Devuelve true si ganas. */
async function runFight(enemy) {
  state.fighting = true; updateRouteBar();
  dexAdd("seen", enemy.id);
  try { const r = await runFightInner(enemy); state.stats.battles++; if (r) state.stats.wins++; return r; }
  finally {
    state.fighting = false; updateRouteBar();
    state.playerTeam.forEach((m, i) => { if (m.status) { m.status = null; setStatusBadge("ally", i, null); } });
  }
}

async function runFightInner(enemy) {
  const gen = runIdleBattle(state.playerTeam, enemy, { speed: state.speed, autoSwitch: state.autoSwitch !== false });
  let result = gen.next();
  let won = false;

  while (!result.done) {
    const ev = result.value;

    if (ev.type === "damage") {
      const atkName = ev.attacker.nameEs || ev.attacker.name;
      const moveName = ev.move.nameEs || ev.move.name;
      setMsg(`¡${atkName} usa ${moveName}!`);
      try { Sfx.attack(); } catch (_) {}
      try { await playMoveFx({ move: ev.move, side: ev.side === "ally" ? "ally" : "enemy", speed: state.speed }); } catch (_) {
        attackAnim(ev.side === "ally" ? "ally" : "enemy");
        await delay(160);
      }
      shakeMon(ev.side === "ally" ? "enemy" : "ally");
      floatDamage(ev.side === "ally" ? "enemy" : "ally", ev.damage, !!(ev.critical || ev.effectiveness > 1));

      if (ev.side === "ally") {
        if ($("#enemy-hp")) $("#enemy-hp").style.width = `${(ev.hpAfter / enemy.maxHp) * 100}%`;
      } else {
        const idx = typeof ev.teamIndex === "number" ? ev.teamIndex : state.activeIndex;
        const mon = state.playerTeam[idx];
        if (mon) {
          mon.currentHp = Math.max(0, ev.hpAfter);
          state.activeIndex = idx;
          if ($("#ally-hp")) $("#ally-hp").style.width = `${(mon.currentHp / mon.maxHp) * 100}%`;
          const rail = document.querySelector(`[data-team-idx="${idx}"] .rail-hp .fill`);
          if (rail) rail.style.width = `${(mon.currentHp / mon.maxHp) * 100}%`;
        }
      }
      await delay(420);
    } else if (ev.type === "faint") {
      setMsg(`¡${ev.pokemon.nameEs || ev.pokemon.name} se ha debilitado!`);
      try { Sfx.faint(); } catch (_) {}
      if (ev.side === "ally") {
        const idx = typeof ev.teamIndex === "number" ? ev.teamIndex : state.activeIndex;
        if (state.playerTeam[idx]) state.playerTeam[idx].currentHp = 0;
        const rail = document.querySelector(`[data-team-idx="${idx}"] .rail-hp .fill`);
        if (rail) rail.style.width = "0%";
        const faintEl = $("#ally-img");
        if (faintEl) faintEl.classList.add("anim-faint");
        await delay(550);
      } else {
        const faintEl = $("#enemy-img");
        if (state.keepEnemyOnFaint) {
          // Salvaje: queda en pie (debilitado) para que la Poké Ball lo capture
          if (faintEl) faintEl.style.filter = "brightness(.85) saturate(.7)";
          await delay(450);
        } else {
          if (faintEl) faintEl.classList.add("anim-faint");
          await delay(600);
        }
      }
    } else if (ev.type === "status") {
      const nm = ev.pokemon.nameEs || ev.pokemon.name;
      if (ev.side === "ally") { const m = state.playerTeam[ev.teamIndex]; if (m) m.status = ev.status; }
      else enemy.status = ev.status;
      setStatusBadge(ev.side, ev.teamIndex, ev.status);
      setMsg(ev.status === "psn" ? `¡${nm} fue envenenado!` : `¡${nm} está paralizado! Quizá no pueda moverse`);
      await delay(650 / Math.max(1, state.speed || 1));
    } else if (ev.type === "status-skip") {
      setMsg(`¡${ev.pokemon.nameEs || ev.pokemon.name} está paralizado! ¡No se puede mover!`);
      shakeMon(ev.side);
      await delay(600 / Math.max(1, state.speed || 1));
    } else if (ev.type === "status-dmg") {
      setMsg(`¡${ev.pokemon.nameEs || ev.pokemon.name} sufre por el veneno!`);
      floatDamage(ev.side, ev.damage);
      if (ev.side === "ally") {
        const m = state.playerTeam[ev.teamIndex];
        if (m) { m.currentHp = Math.max(0, ev.hpAfter); }
        if ($("#ally-hp")) $("#ally-hp").style.width = `${(ev.hpAfter / ev.pokemon.maxHp) * 100}%`;
        const rail = document.querySelector(`[data-team-idx="${ev.teamIndex}"] .rail-hp .fill`);
        if (rail) rail.style.width = `${(ev.hpAfter / ev.pokemon.maxHp) * 100}%`;
      } else if ($("#enemy-hp")) $("#enemy-hp").style.width = `${(ev.hpAfter / enemy.maxHp) * 100}%`;
      await delay(550 / Math.max(1, state.speed || 1));
    } else if (ev.type === "switch") {
      const idx = typeof ev.teamIndex === "number" ? ev.teamIndex : state.playerTeam.findIndex(m => m.currentHp > 0);
      if (idx >= 0) {
        state.activeIndex = idx;
        const nextMon = state.playerTeam[idx];
        setMsg(`¡Adelante, ${nextMon.nameEs}!`);
        const ai = $("#ally-img");
        if (ai) {
          ai.classList.remove("anim-faint", "anim-hit", "anim-attack");
          ai.style.animation = "none";
          ai.style.opacity = "1";
          ai.style.filter = "";
        }
        await syncAllySprite(nextMon);
        if (ai) {
          ai.style.visibility = "hidden";
          try { await fitSprite(ai); } catch (_) {}
          await dissolve(ai, "in", 480 / Math.max(1, state.speed || 1));
          ai.style.visibility = "visible";
          ai.style.opacity = "1";
        }
        await delay(250);
      }
    } else if (ev.type === "victory") {
      won = true;
      { const am = state.playerTeam[state.activeIndex]; if (am) am.wins = (am.wins || 0) + 1; }
    } else if (ev.type === "defeat") {
      // se gestiona fuera
    } else if (ev.type === "miss") {
      setMsg("¡El ataque falló!");
      await delay(350);
    }
    result = gen.next();
  }
  return won;
}

/** Reparte XP a todo el equipo y devuelve los que subieron de nivel. */
function giveTeamXp(xp) {
  const leveled = [];
  for (const mon of state.playerTeam) {
    const share = mon.currentHp > 0 ? xp : Math.max(1, Math.floor(xp * 0.5));
    const lv = applyXp(mon, share);
    floatXp(state.playerTeam.indexOf(mon), share);
    if (lv > 0) leveled.push(`${mon.nameEs} Nv.${mon.level}`);
  }
  updateHud();
  return leveled;
}

function advanceRoute() {
  state.routeProgress++;
  updateRouteBar();
  updateHud();
}

/** Aplica una captura exitosa: naturaleza, variocolor, filtro y almacenamiento. Sin mensajes. */
function resolveCapture(enemy, { ignoreFilter = false, natureIndex: preNature = null } = {}) {
  state.stats.captures++;
  dexAdd("caught", enemy.id);
  const natureIndex = preNature != null ? preNature : randomNature();
  const caught = {
    ...enemy,
    currentHp: enemy.maxHp,
    xp: 0,
    uid: Date.now() + Math.random(),
    capturedAt: Date.now(),
    place: routeLabel(),
    wins: 0,
    natureIndex,
    moves: (enemy.moves || []).map(m => ({ ...m })),
    stats: applyNatureToStats({ ...enemy.stats }, natureIndex),
    sprites: { front: frontSprite(enemy), back: backSprite(enemy) },
  };
  if (caught.shiny) dexAdd("shiny", enemy.id);
  const want = state.captureFilter?.[enemy.id];
  if (!ignoreFilter && !caught.shiny && want && want.length && !want.includes(natureIndex)) {
    state.stats.autoReleased = (state.stats.autoReleased || 0) + 1;
    return { status: "filtered", natureIndex };
  }
  const stored = storeCaptured(caught, state, { applyXpFn: applyXp });
  if (stored.added) return { status: stored.where === "team" ? "team" : "box", natureIndex };
  if (stored.familyXp) return { status: "family", natureIndex, totalXp: stored.totalXp };
  return { status: "fail", natureIndex, reason: stored.reason };
}

/** Captura sin animación (progreso offline). Devuelve null si el Pokémon se escapa. */
function captureWildOffline(enemy) {
  enemy.shiny = Math.random() < SHINY_RATE;
  state.stats.balls++;
  dexAdd("seen", enemy.id);
  if (!tryCapture(enemy).ok) return null;
  const r = resolveCapture(enemy);
  return { ...r, id: enemy.id, name: enemy.nameEs || enemy.name, shiny: !!enemy.shiny, level: enemy.level };
}

async function nodeWild(forced = null) {
  const { id, level } = forced || pickEncounter(curSeg(), encCtx());
  const enemy = await loadEnemy(id, level);
  try { await showTrainerSendOut(); } catch (e) { if (e instanceof AbortFight) throw e; }

  enemy.shiny = forced?.shiny != null ? !!forced.shiny : Math.random() < SHINY_RATE;
  showEnemy(enemy);
  setMsg(forced?.text && !enemy.shiny ? forced.text : enemy.shiny ? `✦ ¡Un ${enemy.nameEs} VARIOCOLOR salvaje apareció! ✦` : `¡Un ${enemy.nameEs} salvaje apareció!`);
  await delay(600);

  state.keepEnemyOnFaint = true;
  let won;
  try { won = await runFight(enemy); } finally { state.keepEnemyOnFaint = false; }
  if (!won) { const im = $("#enemy-img"); if (im) im.style.filter = ""; return false; }

  const xp = calcXpGain(enemy);
  const leveled = giveTeamXp(xp);
  const evoMsgs = await processTeamEvolutions();
  state.money += 30 + enemy.level * 4;
  advanceRoute();
  const bits = [];
  if (leveled.length) bits.push(leveled.join(", "));
  if (evoMsgs.length) bits.push(evoMsgs.join(" "));
  setMsg(bits.length ? `+${xp} XP · ¡${bits.join(" · ")}!` : `Equipo +${xp} XP`);
  await delay(700);

  // Lanzar Poké Ball al salvaje derrotado
  setMsg(`¡Se lanza una Poké Ball a ${enemy.nameEs}!`);
  const cap = tryCapture(enemy);
  state.stats.balls++;
  // Si hay filtro de naturaleza para esta especie, la naturaleza se decide antes y la ball vuelve a la mano para comprobarla
  let preNature = null, verify = null;
  const wantNat = state.captureFilter?.[enemy.id];
  if (cap.ok && !enemy.shiny && wantNat && wantNat.length) {
    preNature = randomNature();
    const okNat = wantNat.includes(preNature);
    const natName = getNature(preNature).nameEs;
    verify = {
      ok: okNat, label: natName,
      onVerdict: () => setMsg(okNat ? `${enemy.nameEs} (${natName}) coincide con tu filtro` : `${enemy.nameEs} (${natName}) no coincide con tu filtro: liberado`),
    };
  }
  try { Sfx.ball(); await playCaptureFx({ success: !!cap.ok, speed: state.speed, verify }); if (cap.ok) Sfx.capture(); else Sfx.escape(); } catch (_) { await delay(900); }
  if (cap.ok) {
    const r = resolveCapture(enemy, { natureIndex: preNature });
    if (r.status === "filtered") {
      setMsg(`${enemy.nameEs} (${getNature(r.natureIndex).nameEs}) no coincide con tu filtro: liberado`);
      saveGame();
      await delay(verify ? 300 : 900);
      return true;
    }
    if (r.status === "team") setMsg(`¡${enemy.nameEs} capturado! Se unió al equipo`);
    else if (r.status === "box") setMsg(`¡${enemy.nameEs} capturado! Enviado a la caja`);
    else if (r.status === "family") setMsg(`¡Repetido! ${enemy.nameEs} → +${r.totalXp} PE a su familia`);
    else setMsg(r.reason || "No se pudo guardar");
  } else {
    setMsg(`¡Oh no! ${enemy.nameEs} se escapó de la Poké Ball`);
    const im = $("#enemy-img");
    if (im) { im.style.filter = ""; im.classList.add("anim-faint"); }
  }
  saveGame();
  await delay(900);
  return true;
}


/** Encuentro fijo (estático): Sudowoodo, Gyarados rojo, Lugia… Con `once` solo ocurre una vez. */
async function nodeStatic() {
  const node = curNode();
  const flag = node.key ? `static-${node.key}` : null;
  state.storyFlags = state.storyFlags || [];
  if (flag && state.storyFlags.includes(flag)) { advanceRoute(); saveGame(); return true; }
  const prevWeather = state.weather;
  if (node.weather) state.weather = node.weather;
  let ok;
  try { ok = await nodeWild({ id: node.id, level: node.level, shiny: node.shiny ? true : null, text: node.text }); }
  finally { state.weather = prevWeather; }
  if (ok && flag && !state.storyFlags.includes(flag)) { state.storyFlags.push(flag); saveGame(); }
  return ok;
}

/** Elegir un Pokémon entre varios (inicial de Johto, etc.). Devuelve el id elegido. */
function chooseGift(choices, title) {
  return new Promise((resolve) => {
    const ov = document.createElement("div");
    ov.className = "gift-ov";
    ov.innerHTML = `<div class="gift-box"><h3>${title}</h3><div class="gift-row">${choices.map(id => `<button type="button" class="gift-card" data-id="${id}"><img src="${artSprite({ id })}" alt="" draggable="false" onerror="this.onerror=null;this.src='${frontSprite({ id })}'"><b>${DEX_NAMES[id - 1] || "#" + id}</b></button>`).join("")}</div><small>Toca uno para elegirlo</small></div>`;
    document.body.appendChild(ov);
    ov.onclick = (e) => { const b = e.target.closest("[data-id]"); if (!b) return; ov.remove(); resolve(Number(b.dataset.id)); };
  });
}

/** Regalo de la historia (inicial, Eevee, Tyrogue…). Pasa a tu equipo o a la caja. */
async function nodeGift() {
  const node = curNode();
  const g = node.gift;
  state.storyFlags = state.storyFlags || [];
  const flag = `gift-${g.key}`;
  if (state.storyFlags.includes(flag)) { advanceRoute(); saveGame(); return true; }
  setMsg(g.text || "¡Te regalan un Pokémon!");
  await delay(700);
  let id = g.choices[0];
  if (g.choices.length > 1) id = await chooseGift(g.choices, g.text || "Elige un Pokémon");
  const mon = await loadEnemy(id, g.level);
  mon.shiny = false;
  const r = resolveCapture(mon, { ignoreFilter: true });
  state.storyFlags.push(flag);
  advanceRoute();
  setMsg(r.status === "team" ? `¡${mon.nameEs} se unió al equipo!` : r.status === "box" ? `¡${mon.nameEs} fue a tu caja!` : `¡${mon.nameEs} recibido!`);
  saveGame();
  await delay(1400);
  return true;
}

/** Huevo regalado: va a la cola de huevos de la Guardería. */
async function nodeEgg() {
  const node = curNode();
  state.storyFlags = state.storyFlags || [];
  const flag = `egg-${node.key}`;
  if (state.storyFlags.includes(flag)) { advanceRoute(); saveGame(); return true; }
  const n = ensureNursery(state);
  const ids = Array.isArray(node.id) ? node.id : [node.id];
  const id = ids[Math.floor(Math.random() * ids.length)];
  n.eggs.push({ id, uid: Date.now() + Math.random(), gift: true });
  state.storyFlags.push(flag);
  advanceRoute();
  setMsg(node.text || "¡Recibiste un huevo! Irá a incubar a la Guardería.");
  saveGame();
  await delay(1800);
  return true;
}

async function nodeUnlock() {
  const node = curNode();
  state.storyFlags = [...new Set([...(state.storyFlags || []), node.key].filter(Boolean))];
  advanceRoute();
  setMsg(node.text || "¡Has desbloqueado un nuevo acceso!");
  saveGame();
  await delay(900);
  return true;
}

async function nodeLegend() {
  const node = curNode();
  state.legendaryEncounters = state.legendaryEncounters || [];
  if (state.legendaryEncounters.includes(node.id) || state.stats.caught?.includes(node.id)) {
    if (!state.legendaryEncounters.includes(node.id)) state.legendaryEncounters.push(node.id);
    setMsg(`${LEGENDS[node.id]?.name || "Este Pokémon legendario"} ya está registrado en tu Pokédex.`);
    advanceRoute();
    saveGame();
    await delay(650);
    return true;
  }

  // Valores del original: nivel 100, vida/poder escalados, 40 Poké Balls con 1,176 % cada una
  const lg = { ...(ORIGINAL_LEGENDS[node.id] || {}), id: node.id };
  const level = lg.level || node.level;
  // Requisitos como el original: aves → todos los de su tipo; Mewtwo → Liga de Kanto; Mew → Pokédex de Kanto completa
  const got = new Set(state.stats.caught || []);
  const name = LEGENDS[node.id]?.name || "este legendario";
  let lock = null;
  if (lg.needType) {
    const ids = TYPE_DEX_IDS[lg.needType] || [];
    const have = ids.filter(id => got.has(id)).length;
    const typeNames = { electric: "Eléctrico", ice: "Hielo", fire: "Fuego" };
    if (have < ids.length) lock = `Para encontrar a ${name}: captura a todos los Pokémon de tipo ${typeNames[lg.needType] || lg.needType} (${have}/${ids.length})`;
  }
  if (!lock && lg.needLeague && !(state.chapter > LEAGUE_LAST)) lock = `${name} solo aparece tras ganar la Liga Pokémon de Kanto`;
  if (!lock && lg.needDex) {
    let have = 0; const need = lg.needDex[1] - lg.needDex[0] + 1;
    for (let i = lg.needDex[0]; i <= lg.needDex[1]; i++) if (got.has(i)) have++;
    if (have < need) lock = `Para encontrar a ${name}: completa la Pokédex de Kanto (${have}/${need}, sin contar a Mew)`;
  }
  if (lock) {
    // Bloqueado: se avisa y se sigue la ruta (volverá a intentarse en las próximas vueltas)
    setMsg(lock);
    advanceRoute();
    saveGame();
    await delay(1400);
    return true;
  }
  const prevWeather = state.weather;
  const restoreWeather = () => { if (state.weather !== prevWeather) { state.weather = prevWeather; try { initWeatherParticles(); } catch (_) {} } };
  if (lg.weather === "storm") { state.weather = "storm"; try { initWeatherParticles(); } catch (_) {} }
  try { return await legendBody(node, lg, level); } finally { restoreWeather(); }
}
async function legendBody(node, lg, level) {
  const enemy = scaleLegend(await loadEnemy(node.id, level), lg);
  dexAdd("seen", enemy.id);
  await playLegendIntro(node.id, $("#scene"));
  showEnemy(enemy);
  setMsg(`¡${enemy.nameEs} ha aparecido!`);
  await delay(700);

  state.keepEnemyOnFaint = true;
  let won;
  try { won = await runFight(enemy); }
  finally { state.keepEnemyOnFaint = false; }
  if (!won) {
    const im = $("#enemy-img");
    if (im) im.style.filter = "";
    return false;
  }

  const xp = Math.round(calcXpGain(enemy) * 2);
  const leveled = giveTeamXp(xp);
  const evoMsgs = await processTeamEvolutions();
  await showBanner(`¡Has vencido a ${enemy.nameEs}!`);

  const BALLS = lg.balls ?? 1, CHANCE = lg.ball ?? 1;
  let caught = false;
  for (let n = 1; n <= BALLS && !caught; n++) {
    setMsg(`¡Poké Ball ${n}/${BALLS} a ${enemy.nameEs}!`);
    state.stats.balls++;
    const ok = Math.random() < CHANCE;
    if (n <= 3 || ok) {
      try { Sfx.ball(); await playCaptureFx({ success: ok, speed: state.speed }); if (ok) Sfx.capture(); else Sfx.escape(); } catch (_) { await delay(900); }
    } else await delay(90);
    caught = ok;
  }
  if (!caught) {
    setMsg(`${enemy.nameEs} huyó… volverá a aparecer`);
    const im = $("#enemy-img"); if (im) { im.style.filter = ""; im.classList.add("anim-faint"); }
    saveGame();
    await delay(1100);
    return false;
  }
  const result = resolveCapture(enemy, { ignoreFilter: true });
  if (!state.legendaryEncounters.includes(node.id)) state.legendaryEncounters.push(node.id);
  advanceRoute();
  const reward = result.status === "team" ? "se unió a tu equipo"
    : result.status === "box" ? "fue enviado a la caja"
    : result.status === "family" ? "ya estaba registrado; su familia recibió PE"
    : "quedó registrado";
  setMsg(`¡${enemy.nameEs} ${reward}! +${xp} XP${leveled.length || evoMsgs.length ? " · ¡Tu equipo progresó!" : ""}`);
  saveGame();
  await delay(1100);
  return true;
}

async function nodeTrainer() {
  const t = makeTrainer(curSeg());
  await showVs(t);
  let totalXp = 0, money = 40;
  const leveled = [];
  let first = true, foeDone = 0;
  foeTeam(t.name, t.mons.length, 0);
  for (const m of t.mons) {
    const enemy = await loadEnemy(m.id, m.level);
    if (first) {
      first = false;
      showEnemy(enemy);
      const ei = $("#enemy-img"); if (ei) { delete ei.dataset.pending; ei.style.visibility = "hidden"; }
      setMsg(`¡${t.name} quiere luchar! ¡${t.name} saca a ${enemy.nameEs}!`);
      try { await Promise.all([showTrainerSendOut("in", true), foeSendOut(t.sprite, enemy)]); } catch (e) { if (e instanceof AbortFight) throw e; }
    } else { await peekRival(t.sprite, `¡${t.name} saca a ${enemy.nameEs}!`); showEnemy(enemy); }
    await delay(400);
    const won = await runFight(enemy);
    if (!won) { clearFoeTeam(); return false; }
    foeTeam(t.name, t.mons.length, ++foeDone);
    const xp = Math.round(calcXpGain(enemy) * 1.2);
    totalXp += xp;
    money += Math.round((30 + enemy.level * 4) * 1.5);
    leveled.push(...giveTeamXp(xp));
    (await processTeamEvolutions()).forEach(m => leveled.push(m));
    hideEnemy();
    await delay(300);
  }
  clearFoeTeam();
  await showBanner(`¡Has derrotado a ${t.name}!`);
  state.money += money;
  advanceRoute();
  setMsg(`¡Ganaste a ${t.name}! +${totalXp} XP · +${fmtMoney(money)} ₽${leveled.length ? ` · ¡${[...new Set(leveled)].join(", ")}!` : ""}`);
  saveGame();
  await delay(1200);
  return true;
}

async function nodeItem() {
  setMsg("¡Hay algo brillando en el camino!");
  await delay(700);
  const reward = rollReward();
  const text = applyReward(state, reward);
  popReward(reward);
  advanceRoute();
  refreshBag();
  setMsg(text);
  saveGame();
  await delay(1300);
}

async function nodeCenter() {
  showCenterScene();
  setMsg("¡Llegaste a un Centro Pokémon!");
  await delay(900);
  await playCenterHealFx();
  state.playerTeam.forEach(m => { m.currentHp = m.maxHp; });
  state.activeIndex = 0;
  advanceRoute();
  setMsg("Tu equipo se recuperó por completo");
  try { Sfx.heal(); } catch (_) {}
  saveGame();
  await syncAllySprite(getActiveMon());
  await delay(1100);
}

function showCenterScene() {
  const sc = $("#scene");
  if (!sc) return;
  sc.className = sc.className.replace(/bgk-\S+/g, "bgk-center");
  const bg = (typeof BG_FILES !== "undefined" && BG_FILES.center) || sceneBg("center") || SCENES.center;
  sc.style.backgroundImage = `url('${bg}')`;
  const al = $("#ally-side"), en = $("#enemy-side");
  if (al) al.style.visibility = "hidden";
  if (en) en.style.visibility = "hidden";
}

async function playCenterHealFx() {
  const scene = $("#scene");
  if (!scene) { await delay(800); return; }
  const n = Math.max(1, Math.min(6, state.playerTeam.length || 1));
  const el = document.createElement("div");
  el.className = "heal-fx";
  const slotsHtml = Array.from({ length: 6 }, (_, i) => {
    const ball = i < n ? '<img src="assets/items/poke-ball.png" alt="" />' : "";
    return '<span class="hm-slot' + (i < n ? " filled" : "") + '" style="--i:' + i + '">' + ball + '<i class="hm-pad"></i></span>';
  }).join("");
  el.innerHTML = '<i class="hf-dim"></i><div class="hm-stage"><div class="hm-title">Centro Pokémon</div><div class="hm-machine"><div class="hm-tray">' + slotsHtml + '</div></div><div class="hm-msg" hidden>¡Tu equipo está en plena forma!</div><button type="button" class="hm-skip">SALTAR ▶▶</button></div>';
  scene.appendChild(el);

  let skipped = false;
  el.querySelector(".hm-skip")?.addEventListener("click", () => { skipped = true; }, { once: true });

  const sp = Math.max(1, state.speed || 1);
  const wait = (ms) => new Promise((r) => {
    const t0 = Date.now();
    const tick = () => {
      if (skipped || Date.now() - t0 >= ms / sp) r();
      else requestAnimationFrame(tick);
    };
    tick();
  });

  try { Sfx.heal(); } catch (_) {}

  el.style.opacity = "0";
  await el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280 / sp, fill: "forwards" }).finished.catch(() => {});
  if (skipped) { el.remove(); return; }

  const slots = [...el.querySelectorAll(".hm-slot.filled")];
  for (const slot of slots) {
    if (skipped) break;
    slot.classList.add("drop");
    await wait(90);
  }
  await wait(200);
  if (skipped) { el.remove(); return; }

  slots.forEach((s) => s.classList.add("on"));
  await wait(350);
  slots.forEach((s) => s.classList.add("heal"));
  const fx = document.createElement("div");
  fx.className = "hm-sparkles";
  el.querySelector(".hm-stage")?.appendChild(fx);
  for (let i = 0; i < 18; i++) {
    const p = document.createElement("i");
    p.textContent = "+";
    p.style.setProperty("--x", (20 + Math.random() * 60) + "%");
    p.style.setProperty("--d", (0.4 + Math.random() * 0.9) + "s");
    p.style.setProperty("--dx", ((Math.random() - 0.5) * 40) + "px");
    fx.appendChild(p);
  }
  await wait(700);
  if (skipped) { el.remove(); return; }

  const msg = el.querySelector(".hm-msg");
  if (msg) { msg.hidden = false; msg.classList.add("show"); }
  await wait(900);

  await el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280 / sp, fill: "forwards" }).finished.catch(() => {});
  el.remove();
}

async function nodeFind() {
  const node = curNode();
  setMsg("¡Encontraste algo en el lugar!");
  await delay(700);
  addItem(state, node.item, 1);
  popReward({ kind: "item", id: node.item });
  advanceRoute();
  refreshBag();
  setMsg(`¡Conseguiste ${ITEMS[node.item].name}!`);
  saveGame();
  await delay(1400);
}

async function nodeGym() {
  const gym = curSeg().gym;
  await showBoss(gym);
  let totalXp = 0;
  const giovanniPerfectStart = gym.leaderEs === "Giovanni" && state.playerTeam.every(m => m.currentHp > 0);
  let firstG = true, gDone = 0;
  foeTeam(gym.leaderEs, gym.team.length, 0);
  for (const [id, level] of gym.team) {
    const enemy = scaleEnemy(await loadEnemy(id, level), gym.power);
    if (firstG) {
      firstG = false;
      showEnemy(enemy);
      const ei = $("#enemy-img"); if (ei) { delete ei.dataset.pending; ei.style.visibility = "hidden"; }
      setMsg(`¡${gym.leaderEs} quiere luchar! ¡${gym.leaderEs} saca a ${enemy.nameEs}!`);
      try { await Promise.all([showTrainerSendOut("in", true), foeSendOut(gym.sprite, enemy)]); } catch (e) { if (e instanceof AbortFight) throw e; }
    } else { await peekRival(gym.sprite, `¡${gym.leaderEs} saca a ${enemy.nameEs}!`); showEnemy(enemy); }
    await delay(500);
    const won = await runFight(enemy);
    if (!won) { clearFoeTeam(); return false; }
    foeTeam(gym.leaderEs, gym.team.length, ++gDone);
    const xp = Math.round(calcXpGain(enemy) * 1.5);
    totalXp += xp;
    giveTeamXp(xp);
    hideEnemy();
    await delay(300);
  }
  clearFoeTeam();
  if (giovanniPerfectStart && state.playerTeam.every(m => m.currentHp > 0)) {
    state.feats = state.feats || {};
    state.feats.giovanni = true;
  }
  // Procesar las evoluciones que hayan quedado disponibles tras ganar el gimnasio.
  const evoMsgs = await processTeamEvolutions();
  if (evoMsgs.length) {
    setMsg(evoMsgs.join(" · "));
    await delay(900);
  }
  await showBanner(`¡Has derrotado a ${gym.leaderEs}!`);
  setMsg(/^Maestro/.test(gym.badgeEs || "") ? `¡Eres el Campeón de la Liga! +${fmtMoney(gym.reward)} ₽`
    : gym.badgeEs ? (state.badges.includes(gym.badgeEs) ? `¡Gimnasio repetido! +${fmtMoney(gym.reward)} ₽` : `¡Ganaste la Medalla ${gym.badgeEs}! +${fmtMoney(gym.reward)} ₽`)
    : `¡Derrotaste a ${gym.leaderEs}! +${fmtMoney(gym.reward)} ₽`);
  const repeat = !!gym.badgeEs && state.badges.includes(gym.badgeEs); // ya la tenías: sin felicitación
  finishChapter(gym);
  saveGame();
  if (!repeat) await showMedalWin(gym);
  state.pendingBriefing = true;
  return true;
}

function showMedalWin(gym) {
  const next = CHAPTERS[state.chapter];
  const champ = /^Maestro/.test(gym.badgeEs || "") || gym.badgeEs === "Leyenda";
  const isMedal = !!gym.badgeEs && !champ;
  return new Promise(res => {
    const ov = document.createElement("div");
    ov.className = "tc-overlay medal-win";
    ov.innerHTML = `<div class="tc-panel mw-panel">
      ${isMedal ? `<div class="mw-gem">${badgeHtml(badgeIndex(gym.badgeEs), true, 72, "mw-badge")}</div>`
        : `<div class="mw-gem" style="font-size:56px;line-height:72px">${champ ? "🏆" : "⚔️"}</div>`}
      <h2>${champ ? "¡Eres el Campeón de la Liga!" : isMedal ? `¡Medalla ${gym.badgeEs} conseguida!` : `¡Derrotaste a ${gym.leaderEs}!`}</h2>
      <p>${champ || isMedal ? `Derrotaste a ${gym.leaderEs}. ` : ""}+${fmtMoney(gym.reward)} ₽</p>
      ${next ? `<p class="mw-next">🔓 Nuevo mapa desbloqueado:<br><b>${next.name}</b></p>` : ""}
      <button type="button" class="mw-ok">¡GENIAL!</button></div>`;
    document.body.appendChild(ov);
    const done = () => { ov.remove(); res(); };
    ov.querySelector(".mw-ok").onclick = done;
    setTimeout(done, 15000);
  });
}

async function showLeader(gym) {
  const scene = $("#scene");
  if (!scene) return;
  const el = document.createElement("div");
  el.className = "trainer-send";
  el.innerHTML = `<img src="assets/trainers/${gym.sprite}.png" alt="" /><span>¡${gym.leaderEs}!</span>`;
  scene.appendChild(el);
  await delay(1100);
  el.remove();
}

function popReward(reward) {
  const scene = $("#scene");
  if (!scene) return;
  const el = document.createElement("div");
  el.className = "reward-pop";
  el.innerHTML = reward.kind === "money"
    ? `<span>+${reward.amount} ₽</span>`
    : `${itemImg(reward.id, 30)}<span>${ITEMS[reward.id].name}</span>`;
  scene.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

async function doEncounter() {
  if (state.busy) return;
  state.busy = true;

  try {
    await pauseGate();
    fightEpoch = state.epoch;

    // Actualizar clima si cambió la hora
    const nowW = weatherForNow();
    if (!state.weatherInfo || state.weatherInfo.hour !== nowW.hour) {
      try { state.weatherInfo = await getGameWeather(); } catch (_) { state.weatherInfo = nowW; }
      state.weather = state.weatherInfo.key;
    }
    await pauseGate();
    if (fightEpoch !== state.epoch) throw new AbortFight();

    const node = curNode() || { t: "wild", seg: 0 };
    let ok = true;
    if (node.t === "trainer") ok = await nodeTrainer();
    else if (node.t === "gym") ok = await nodeGym();
    else if (node.t === "find") await nodeFind();
    else if (node.t === "item") await nodeItem();
    else if (node.t === "center") await nodeCenter();
    else if (node.t === "unlock") await nodeUnlock();
    else if (node.t === "legend") ok = await nodeLegend();
    else if (node.t === "static") ok = await nodeStatic();
    else if (node.t === "gift") await nodeGift();
    else if (node.t === "egg") await nodeEgg();
    else ok = await nodeWild();

    hideEnemy();
    if (ok && (node.t === "wild" || node.t === "trainer" || node.t === "gym" || node.t === "legend" || node.t === "static") && state.playerTeam[state.activeIndex]?.currentHp > 0) {
      try { await showTrainerSendOut("out"); } catch (_) {}
    }
    state.busy = false;

    // Derrota: solo si TODO el equipo está debilitado (black-out)
    if (!ok) {
      if (state.playerTeam.every(m => m.currentHp <= 0)) {
        setMsg("Tu equipo se debilitó... Te llevan al Centro Pokémon");
        await delay(1000);
        showCenterScene();
        await playCenterHealFx();
        retreat();
        state.playerTeam.forEach(m => { m.currentHp = m.maxHp; });
        state.activeIndex = 0;
        setMsg("Tu equipo se recuperó. Vuelves al inicio del mapa");
        try { Sfx.heal(); } catch (_) {}
        saveGame();
        await delay(1100);
        renderRoute();
        setTimeout(() => doEncounter(), 600);
        return;
      }
    }

    // Si el activo está KO, pasar al siguiente vivo (sin curar)
    if (state.playerTeam[state.activeIndex]?.currentHp <= 0) {
      const next = state.playerTeam.findIndex(m => m.currentHp > 0);
      if (next >= 0) state.activeIndex = next;
    }

    // Ruta completada → nueva vuelta (el juego sigue en bucle)
    if (state.routeProgress >= state.routeNodes.length) { finishChapter(null); saveGame(); }

    if (state.view === "adventure") await sceneWipe(() => renderRoute(), state.speed);
    else renderRoute();
    if (state.pendingBriefing) {
      state.pendingBriefing = false;
      await showChapterBriefing();
    }
    setTimeout(() => doEncounter(), 450);
  } catch (err) {
    state.busy = false;
    hideEnemy();
    if (err instanceof AbortFight) {
      // Volviste de estar ausente: el combate en curso se descarta y se continúa.
      renderRoute();
      setTimeout(() => doEncounter(), 300);
      return;
    }
    console.error("encounter error", err);
    setMsg(`Error en combate (${String(err && err.message || err).slice(0, 70)}). Reintentando...`);
    setTimeout(() => doEncounter(), 1000);
  }
}

// ───────────────────────── Arranque ─────────────────────────

(function boot() {
  const existing = loadGame();
  const hasSave = !!(existing && existing.playerTeam?.length);
  showTitle({
    hasSave,
    onContinue: () => bootGame(),
    onNew: () => { if (hasSave) clearSave(); startIntro({ onComplete: onIntroComplete }); },
  });
})();

async function bootGame() {
  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; window.scrollTo(0, 0); } catch (_) {}
  const existing = loadGame();
  if (!(existing && existing.playerTeam?.length)) {
    startIntro({ onComplete: onIntroComplete });
    return;
  }

  Object.assign(state, {
    player: existing.player,
    playerTeam: existing.playerTeam,
    unlockedAchievements: existing.unlockedAchievements || [],
    feats: existing.feats || {},
    storyFlags: existing.storyFlags || [],
    legendaryEncounters: existing.legendaryEncounters || [],
    box: existing.box || [],
    badges: existing.badges || [],
    money: existing.money ?? 3000,
    routeProgress: existing.routeProgress || 0,
    routeNodes: existing.routeNodes || [],
    chapter: existing.chapter || 0,
    chapSegs: existing.chapSegs || [],
    badges: existing.badges || [],
    bag: existing.bag || {},
    speed: existing.speed || 2,
    autoSwitch: existing.autoSwitch !== false,
    weather: existing.weather || "clear",
    busy: false,
  });
  state.captureFilter = existing.captureFilter || {};
  state.teamPresets = existing.teamPresets || null;
  state.storyFlags = Array.isArray(existing.storyFlags) ? existing.storyFlags : [];
  state.legendaryEncounters = Array.isArray(existing.legendaryEncounters) ? existing.legendaryEncounters : [];
  // Partidas antiguas: reintroducir la Guarida Rocket antes de la Torre si Koga
  // todavía no fue derrotado y el Scope Silph aún no figura como conseguido.
  if (state.chapter === 4 && !state.badges.includes("Alma") && !state.storyFlags.includes("silph-scope")) {
    state.routeNodes = [];
    state.routeProgress = 0;
  }
  state.nursery = existing.nursery || state.nursery;
  state.fichas = Number(existing.fichas) || 0;
  ensureNursery(state);
  if (existing.stats) state.stats = { ...state.stats, ...existing.stats };
  if (!state.stats.shiny) state.stats.shiny = [];
  else state.stats.startedAt = Number(existing.savedAt) || Date.now();
  [...state.playerTeam, ...state.box].forEach(m => { dexAdd("seen", m.id); dexAdd("caught", m.id); });
  // Partidas antiguas: si ya tienes una medalla, su capítulo cuenta como superado
  {
    let want = state.chapter;
    CHAPTERS.forEach((c, i) => {
      const g = c.steps?.find?.(x => x.badgeEs) || null;
      const b = g?.badgeEs;
      if (b && state.badges.includes(b)) want = Math.max(want, i + 1);
    });
    if (want > state.chapter && want < CHAPTERS.length) { state.chapter = want; state.routeNodes = []; }
  }
  ensureRoute();
  document.getElementById("app").innerHTML = `
    <div id="status-bar" class="top-status">Partida cargada</div>
    <div id="main"></div>
  `;
  // Rehidratar sprites por si acaso
  state.playerTeam.forEach(m => {
    m.sprites = m.sprites || {};
    m.sprites.front = frontSprite(m);
    m.sprites.back = backSprite(m);
    if (m.natureIndex == null) {
      m.natureIndex = randomNature();
      m.stats = applyNatureToStats(m.stats || {}, m.natureIndex);
    }
  });
  (state.box || []).forEach(m => {
    if (m.natureIndex == null) {
      m.natureIndex = randomNature();
      m.stats = applyNatureToStats(m.stats || {}, m.natureIndex);
    }
  });

  // Progreso mientras la app estuvo cerrada
  let report = null;
  try { report = await processOffline(Date.now() - Number(existing.savedAt)); }
  catch (e) { console.error("offline", e); }

  if (report) openGate(showWelcomeBack(report));
  startRoute();
  // Al entrar desde el título el navegador puede conservar el scroll de esa pantalla: empezar siempre arriba
  const toTop = () => { try { window.scrollTo(0, 0); document.documentElement.scrollTop = 0; document.body.scrollTop = 0; } catch (_) {} };
  toTop(); requestAnimationFrame(toTop); setTimeout(toTop, 120); setTimeout(toTop, 600);

  // Vista previa de presentaciones: index.html?demo=mewtwo | zapdos | mew | lance | vs
  const demo = new URLSearchParams(location.search).get("demo");
  if (demo) setTimeout(async () => {
    const root = $("#scene"); if (!root) return;
    const L = Object.entries(LEGENDS).find(([, v]) => v.name.toLowerCase() === demo.toLowerCase());
    if (L) await playLegendIntro(Number(L[0]), root);
    else if (demo === "lance") await playBossIntro({ root, trainer: "Lance", title: "Alto Mando", subtitle: "Sala 4", type: "dragon", color: "#7038f8", sprite: "assets/trainers/lance.png" });
    else if (demo === "vs") await playVsIntro({ root, playerName: state.player?.name || "Tú", playerSprite: `assets/trainers/${playerSprite()}.png`, trainerName: "Brock", trainerSprite: "assets/trainers/brock.png" });
  }, 1800);
}


// Logros (UI)
try { window.openLogros = () => openAchievementsScreen(); } catch (_) {}
