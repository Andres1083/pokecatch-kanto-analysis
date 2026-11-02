// Variocolor (shiny): probabilidad por encuentro salvaje
export const SHINY_RATE = 1 / 256;
export const shinyOdds = () => `1 / ${Math.round(1 / SHINY_RATE)}`;
