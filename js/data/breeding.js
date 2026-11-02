// Ajustes de crianza e incubadora (tiempos reales: siguen corriendo con el juego cerrado)
export const BREED_MS = 6 * 3600 * 1000;  // tiempo de apareamiento hasta que aparece un huevo
export const HATCH_MS = 8 * 3600 * 1000;   // tiempo de incubación
export const EGG_CAP = 6;                 // huevos en espera como máximo
export const EGG_LEVEL = 5;               // nivel de la cría al nacer

// Incubadoras: la 1.ª viene desbloqueada; el resto se compra
export const INCUBATORS = 4;
export const INC_PRICES = [0, 100000, 500000, 1000000];

// Guardería: 2 parejas (4 huéspedes). La 2.ª pareja se abre al pasar la historia de Johto.
export const PAIRS = 2;
export const pairUnlocked = (state, i) => i === 0 || !!state.johtoDone;

// Bayas que acortan el apareamiento (ms que restan)
export const BREED_BERRIES = {
  "berry-oran": 30 * 60 * 1000,
  "berry-pecha": 60 * 60 * 1000,
  "berry-sitrus": 2 * 3600 * 1000,
};
