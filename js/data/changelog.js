// Registro de cambios mostrado en el título (el más reciente primero).
export const CHANGELOG = [
  { v: "1.8", date: "2 nov 2026", title: "Logros + restauración", items: [
    "Fusionados los Logros, recompensas, marcos y el nuevo orden de gimnasios/encuentros legendarios con los cambios anteriores.",
    "Legendarios como el original: Mewtwo, Zapdos, Articuno y Moltres a nivel 100 con su vida/poder, 40 Poké Balls al 1,176 % y requisito de tipo para las aves.",
    "Recuperados: botón Changelogs, animación del inicial, iconos de la barra inferior y arreglo del recuadro vacío del rival.",
  ] },
  { v: "1.7", date: "2 nov 2026", title: "Menú, título y Cueva Celeste", items: [
    "Barra inferior como el original: iconos pixel-art y solo la pestaña activa muestra su nombre.",
    "Título: CONTINUAR más grande y botón Changelogs con los cambios.",
    "Se corrigió el recuadro vacío que aparecía antes de que saliera el Pokémon rival.",
  ] },
  { v: "1.6", date: "1 nov 2026", title: "Estados alterados", items: [
    "Quemadura, sueño, congelación y confusión además de veneno y parálisis, con la tabla de movimientos del original.",
    "Los Pokémon usan movimientos de estado (Hipnosis, Onda Trueno, Tóxico…).",
    "Tipografía Jersey del original, autoalojada.",
    "Animaciones de ataque para 22 movimientos que no tenían.",
  ] },
  { v: "1.5", date: "31 oct 2026", title: "Combates y presentaciones", items: [
    "Intro de líderes y Alto Mando con efectos, y pantalla VS con retratos.",
    "Mensajes de combate, banner de victoria y XP flotante dentro de la escena.",
    "Poké Balls reales en el equipo rival y en la captura.",
    "La medalla de Campeón solo se da al vencer al último de la Liga.",
  ] },
];
export const LATEST = CHANGELOG[0].v;
