// Johto: normaliza los capítulos importados al mismo formato que Kanto
// (nombres en español de líder / medalla / tipo) y marca la región.
import { JOHTO_CHAPTERS } from "./johto-story-raw.js?v=135";

const TYPE_ES = {
  normal: "Normal", fire: "Fuego", water: "Agua", electric: "Eléctrico", grass: "Planta", ice: "Hielo",
  fighting: "Lucha", poison: "Veneno", ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho",
  rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro", steel: "Acero", fairy: "Hada",
};
const BADGE_ES = { "Maître Johto": "Maestro Johto", "Légende": "Leyenda" };

export const JOHTO = JOHTO_CHAPTERS.map((ch) => ({
  ...ch,
  steps: ch.steps.map((st) => {
    if (st.kind !== "gym") return st;
    const badge = st.badge ? (BADGE_ES[st.badge] || st.badge) : null;
    return { ...st, leaderEs: st.leader, badgeEs: badge, typeEs: TYPE_ES[st.type] || st.type };
  }),
}));
