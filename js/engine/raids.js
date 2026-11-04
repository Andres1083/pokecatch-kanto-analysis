/**
 * Incursiones offline (estilo Poke'Catch Raids Chroma)
 * Flujo: wild → trainer → wild → trainer → heal → boss
 * Boss shiny nv.100, captura ~1%, pity Master Ball a 200.
 */
import { frontSprite } from "../data/sprites.js?v=124";

export const RAID_CFG = {
  LEVEL: 100,
  MINE: 2,
  CATCH: 0.01,
  PITY: 200,
  RUN: ["wild", "trainer", "wild", "trainer", "heal", "boss"],
  BOSS_HP_MUL: 3.3,
  BOT_LEVEL: [97, 100],
};

/** Pool Kanto no legendario (excluye Porygon 137) */
const KANTO_POOL = Array.from({ length: 151 }, (_, i) => i + 1).filter(
  (id) => ![144, 145, 146, 150, 151, 137].includes(id)
);

const EPOCH = Date.parse("2026-10-13T12:00:00");

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayIndex(dateStr) {
  return Math.round((Date.parse(dateStr + "T12:00:00") - EPOCH) / 86400000);
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Boss del día (Kanto) — rotación determinista */
export function bossOfDay(dateStr = todayKey()) {
  const idx = dayIndex(dateStr);
  const rng = mulberry32((idx * 2654435761) >>> 0);
  const pool = [...KANTO_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const id = pool[((idx % pool.length) + pool.length) % pool.length];
  return { id, level: RAID_CFG.LEVEL, shiny: true, region: "kanto", date: dateStr };
}

export function ensureRaidSave(state) {
  if (!state.raids) {
    state.raids = {
      pity: 0,
      pityDate: todayKey(),
      loops: 0,
      done: {},
      clears: 0,
    };
  }
  if (state.raids.pityDate !== todayKey()) {
    state.raids.pity = 0;
    state.raids.pityDate = todayKey();
    state.raids.loops = 0;
  }
  return state.raids;
}

export function pityReady(state) {
  const r = ensureRaidSave(state);
  return r.pity >= RAID_CFG.PITY;
}

export function tryBossCatch(state, ball = "ultra-ball") {
  const r = ensureRaidSave(state);
  if (pityReady(state) || ball === "master-ball") {
    r.pity = 0;
    return { ok: true, ball: "master-ball", pity: r.pity };
  }
  const ok = Math.random() < RAID_CFG.CATCH;
  if (!ok) r.pity = Math.min(RAID_CFG.PITY, (r.pity || 0) + 1);
  else r.pity = 0;
  return { ok, ball, pity: r.pity };
}

/** Nombres ES mínimos para UI de raid */
const NAMES = {
  1:"Bulbasaur",2:"Ivysaur",3:"Venusaur",4:"Charmander",5:"Charmeleon",6:"Charizard",
  7:"Squirtle",8:"Wartortle",9:"Blastoise",10:"Caterpie",11:"Metapod",12:"Butterfree",
  13:"Weedle",14:"Kakuna",15:"Beedrill",16:"Pidgey",17:"Pidgeotto",18:"Pidgeot",
  19:"Rattata",20:"Raticate",21:"Spearow",22:"Fearow",23:"Ekans",24:"Arbok",
  25:"Pikachu",26:"Raichu",27:"Sandshrew",28:"Sandslash",29:"Nidoran♀",30:"Nidorina",
  31:"Nidoqueen",32:"Nidoran♂",33:"Nidorino",34:"Nidoking",35:"Clefairy",36:"Clefable",
  37:"Vulpix",38:"Ninetales",39:"Jigglypuff",40:"Wigglytuff",41:"Zubat",42:"Golbat",
  43:"Oddish",44:"Gloom",45:"Vileplume",46:"Paras",47:"Parasect",48:"Venonat",49:"Venomoth",
  50:"Diglett",51:"Dugtrio",52:"Meowth",53:"Persian",54:"Psyduck",55:"Golduck",
  56:"Mankey",57:"Primeape",58:"Growlithe",59:"Arcanine",60:"Poliwag",61:"Poliwhirl",62:"Poliwrath",
  63:"Abra",64:"Kadabra",65:"Alakazam",66:"Machop",67:"Machoke",68:"Machamp",
  69:"Bellsprout",70:"Weepinbell",71:"Victreebel",72:"Tentacool",73:"Tentacruel",
  74:"Geodude",75:"Graveler",76:"Golem",77:"Ponyta",78:"Rapidash",79:"Slowpoke",80:"Slowbro",
  81:"Magnemite",82:"Magneton",83:"Farfetch'd",84:"Doduo",85:"Dodrio",86:"Seel",87:"Dewgong",
  88:"Grimer",89:"Muk",90:"Shellder",91:"Cloyster",92:"Gastly",93:"Haunter",94:"Gengar",
  95:"Onix",96:"Drowzee",97:"Hypno",98:"Krabby",99:"Kingler",100:"Voltorb",101:"Electrode",
  102:"Exeggcute",103:"Exeggutor",104:"Cubone",105:"Marowak",106:"Hitmonlee",107:"Hitmonchan",
  108:"Lickitung",109:"Koffing",110:"Weezing",111:"Rhyhorn",112:"Rhydon",113:"Chansey",
  114:"Tangela",115:"Kangaskhan",116:"Horsea",117:"Seadra",118:"Goldeen",119:"Seaking",
  120:"Staryu",121:"Starmie",122:"Mr. Mime",123:"Scyther",124:"Jynx",125:"Electabuzz",
  126:"Magmar",127:"Pinsir",128:"Tauros",129:"Magikarp",130:"Gyarados",131:"Lapras",132:"Ditto",
  133:"Eevee",134:"Vaporeon",135:"Jolteon",136:"Flareon",137:"Porygon",138:"Omanyte",139:"Omastar",
  140:"Kabuto",141:"Kabutops",142:"Aerodactyl",143:"Snorlax",144:"Articuno",145:"Zapdos",
  146:"Moltres",147:"Dratini",148:"Dragonair",149:"Dragonite",150:"Mewtwo",151:"Mew",
};

export function monName(id) {
  return NAMES[id] || `#${id}`;
}

export function raidProgressHtml(step, total = 6) {
  const icons = ["🌿", "🔴", "🌿", "🔴", "🏠", "💀"];
  return icons
    .map((ic, i) => {
      const done = i < step;
      const cur = i === step;
      return `<span style="opacity:${done || cur ? 1 : 0.35};${cur ? "filter:drop-shadow(0 0 4px #fff)" : ""}">${ic}</span>`;
    })
    .join("") + ` <b>${step + 1}/${total}</b>`;
}

/**
 * Ejecuta el run de raid usando callbacks del juego host.
 * host = {
 *   loadEnemy(id, level),
 *   runFight(enemy),           // 1v1 idle existente
 *   runRaidBossFight(boss, team), // opcional: pelea multi
 *   healTeam(),
 *   setMsg(t), delay(ms),
 *   showEnemy, hideEnemy, showVs, showFaceoff,
 *   onCatch(boss, result),
 *   save(),
 *   state
 * }
 */
export async function runRaid(host, bossSpec = null) {
  const state = host.state;
  const raid = ensureRaidSave(state);
  const bossMeta = bossSpec || bossOfDay();
  const steps = RAID_CFG.RUN;
  raid.loops = (raid.loops || 0) + 1;

  host.setMsg(`Raid · ${monName(bossMeta.id)} · intento ${raid.loops}`);
  await host.delay(600);

  for (let i = 0; i < steps.length; i++) {
    const kind = steps[i];
    host.setRaidProgress?.(i, steps.length);
    if (kind === "wild") {
      const id = KANTO_POOL[Math.floor(Math.random() * KANTO_POOL.length)];
      const lv = 90 + Math.floor(Math.random() * 11);
      const enemy = await host.loadEnemy(id, lv);
      enemy.shiny = false;
      host.showEnemy?.(enemy);
      host.setMsg(`¡Un ${enemy.nameEs || monName(id)} salvaje aparece!`);
      await host.delay(500);
      const won = await host.runFight(enemy);
      host.hideEnemy?.();
      if (!won) return { ok: false, reason: "defeat" };
    } else if (kind === "trainer") {
      const tSprite = ["youngster", "lass", "birdkeeper", "hiker"][Math.floor(Math.random() * 4)];
      const tName = ["Cazabichos Sacha", "Marinero Sacha", "Joven Ada", "Chica Dani"][Math.floor(Math.random() * 4)];
      await host.showVs?.({ name: tName, sprite: tSprite });
      const id = KANTO_POOL[Math.floor(Math.random() * KANTO_POOL.length)];
      const enemy = await host.loadEnemy(id, 95 + Math.floor(Math.random() * 6));
      host.showEnemy?.(enemy);
      host.setMsg(`¡${tName} saca a ${enemy.nameEs || monName(id)}!`);
      await host.delay(400);
      const won = await host.runFight(enemy);
      host.hideEnemy?.();
      if (!won) return { ok: false, reason: "defeat" };
    } else if (kind === "heal") {
      host.setMsg("Centro Pokémon de Campamento base");
      await host.playCenterHeal?.();
      host.healTeam();
      await host.delay(900);
    } else if (kind === "boss") {
      const boss = await host.loadEnemy(bossMeta.id, bossMeta.level);
      boss.shiny = true;
      // Buff HP estilo original
      boss.maxHp = Math.round(boss.maxHp * RAID_CFG.BOSS_HP_MUL);
      boss.currentHp = boss.maxHp;
      boss.stats = { ...boss.stats, hp: boss.maxHp };
      host.setMsg(`¡${boss.nameEs || monName(bossMeta.id)} variocolor aparece!`);
      host.showRaidBoss?.(boss);
      host.showEnemy?.(boss);
      await host.delay(700);
      let won;
      if (host.runRaidBossFight) won = await host.runRaidBossFight(boss, state.playerTeam);
      else won = await host.runFight(boss);
      if (!won) return { ok: false, reason: "defeat" };

      // Captura
      host.setMsg(`¡Lanzas una Ultra Ball! (1 %)`);
      await host.delay(800);
      const cap = tryBossCatch(state, "ultra-ball");
      host.save?.();
      if (cap.ok) {
        host.setMsg(`¡Has capturado al jefe: ${boss.nameEs || monName(bossMeta.id)} variocolor!`);
        host.onCatch?.(boss, cap);
        raid.done[`${bossMeta.region}|${bossMeta.date}`] = true;
        raid.clears = (raid.clears || 0) + 1;
        host.save?.();
        return { ok: true, caught: true, boss, pity: cap.pity };
      }
      host.setMsg(
        `${boss.nameEs || monName(bossMeta.id)} se escapa de la Ball… ¡Inténtalo de nuevo! Medidor Master Ball: ${cap.pity} / ${RAID_CFG.PITY}`
      );
      await host.delay(1400);
      host.setMsg(`¡Nuevo intento! Incursión de ${monName(bossMeta.id)} · intento ${raid.loops + 1}`);
      await host.delay(900);
      // Retry: vuelve a empezar el run
      return runRaid(host, bossMeta);
    }
  }
  return { ok: true };
}
