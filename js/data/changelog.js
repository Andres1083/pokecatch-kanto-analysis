// Registro de cambios mostrado en el título (el más reciente primero).
export const CHANGELOG = [
  { v: "5.0", date: "6 nov 2026", title: "¡Johto!", items: [
    "Segunda región: 17 capítulos tras la Liga de Kanto (Céfiro a Dragón, Calle Victoria, Alto Mando de Johto, Campeón y Monte Plateado).",
    "Elige tu inicial de Johto, recibe huevos (Togepi y otros) y encuentros fijos como el Gyarados rojo.",
    "Progreso con selector Kanto/Johto, medallas de Johto y su Liga; Pokédex hasta 251 con sección propia.",
    "Evoluciones y familias de Johto (incluido Pichu, Cleffa, Crobat, Steelix…) y nuevos objetos: Piedra Solar, Roca del Rey, Revestimiento Metálico y Escama Dragón.",
  ] },
  { v: "4.2", date: "6 nov 2026", title: "Requisitos de Mewtwo y Mew", items: [
    "Mewtwo solo aparece tras ganar la Liga Pokémon de Kanto.",
    "Mew solo aparece con la Pokédex de Kanto completa (1–150, sin contar a Mew); el aviso muestra tu progreso.",
    "Si un legendario está bloqueado, el juego avisa y sigue la ruta en vez de quedarse atascado en ese paso (también las aves).",
  ] },
  { v: "4.1", date: "5 nov 2026", title: "Filtro de naturaleza en los huevos", items: [
    "Al eclosionar, la cría pasa por tu filtro de naturaleza: si no coincide, se cambia por PE para su familia (incluidos los padres de la guardería). Los variocolor siempre se guardan.",
  ] },
  { v: "4.0", date: "5 nov 2026", title: "Guardería como el original", items: [
    "Nueva Guardería: cabecera rosa, aviso de Ditto, prado con los padres paseando animados, bayas con su cantidad y estado de la puesta.",
    "Pestañas Huéspedes e Incubadora con contadores; huevos en espera e incubadoras ahora van juntos en la segunda pestaña.",
    "Tu caja aparece debajo con buscador y 5 por fila: toca un Pokémon y se coloca solo en el hueco que le toca.",
    "El selector de huéspedes también tiene buscador y 5 por fila.",
  ] },
  { v: "3.9", date: "5 nov 2026", title: "Requisito de las aves legendarias", items: [
    "Zapdos, Articuno y Moltres, como en el original, piden haber capturado a todos los Pokémon de su tipo en Kanto (Eléctrico, Hielo y Fuego), sin contar legendarios, en lugar de llevar uno en el equipo.",
    "El aviso muestra tu progreso, por ejemplo 3/8.",
  ] },
  { v: "3.8", date: "5 nov 2026", title: "Inicio sin scroll", items: [
    "Al pulsar Continuar el juego empieza siempre arriba, sin heredar el scroll de la pantalla de título.",
  ] },
  { v: "3.7", date: "4 nov 2026", title: "Captura con verificación de naturaleza", items: [
    "Con filtro de naturaleza activo, tras capturar la Poké Ball vuelve a la mano del entrenador y se comprueba la naturaleza.",
    "Si no coincide, la ball se abre, el Pokémon se libera con su mensaje y el juego sigue al siguiente combate.",
  ] },
  { v: "3.6", date: "4 nov 2026", title: "Avisos con el estilo del juego", items: [
    "Repetir capítulo, borrar partida, desbloquear incubadora y los avisos de liberar/evolucionar/guardería ya usan el modal del juego en lugar del cuadro del navegador.",
  ] },
  { v: "3.5", date: "4 nov 2026", title: "Detalle de capítulo por franja y objetos", items: [
    "Progreso → detalle de un gimnasio: ahora muestra «Objetos que se encuentran» (el objeto único del capítulo y los que dan los «?»).",
    "Los Pokémon se reparten sin repetirse: generales, y los que salen sobre todo de Noche, de Día, con Lluvia o con Tormenta.",
  ] },
  { v: "3.4", date: "4 nov 2026", title: "Canje del casino más fiel", items: [
    "El Pokémon del canje ahora aparece como GIF animado y más grande.",
    "Plataforma azul pixelada y tipografía pixel más grande, como el original.",
  ] },
  { v: "3.3", date: "3 nov 2026", title: "Casino: canje animado", items: [
    "Tienda del Casino más compacta (filas más bajas, como el original).",
    "Al canjear fichas hay una escena a pantalla completa: una Poké Ball cae a la plataforma, aparece la silueta y se revela el Pokémon («¡Recibes a X Nv. N!»), con botón SALTAR.",
    "Después se muestra su ficha (NUEVO si es la primera vez).",
    "La confirmación del canje ahora es un cuadro del juego en vez del del navegador.",
  ] },
  { v: "3.2", date: "3 nov 2026", title: "Arreglo del clima en combate", items: [
    "Corregido el «Error en combate (getGameWeather().catch is not a function)» que aparecía al cambiar la hora del juego.",
  ] },
  { v: "3.1", date: "3 nov 2026", title: "PC sin tileteo", items: [
    "PC: al bajar por la lista, la barra fija con tu equipo ya no mueve la pantalla (antes aparecía y desaparecía empujando el scroll).",
  ] },
  { v: "3.0", date: "3 nov 2026", title: "Deslizar entre pestañas y casino enmarcado", items: [
    "Móvil en vertical: desliza a izquierda/derecha para pasar de Aventura → Progreso → PC → Pokédex → Mochila (y volver).",
    "PC: se quita la ✕, queda solo el botón Volver.",
    "Casino: ahora va dentro de un marco rosado con título, fichas y pestañas.",
    "Los botones «?» abren un globo de ayuda en vez del aviso del navegador.",
    "Detalle del Pokémon: barras de estadísticas gruesas y redondeadas como el original (PS amarillo, resto naranja).",
  ] },
  { v: "2.9", date: "3 nov 2026", title: "Opciones con pestañas", items: [
    "Ajustes: nueva ventana con pestañas (General, Guardado, Novedades, Avanzado) en vez del cuadro de texto.",
    "Changelogs: la última versión abierta y las anteriores plegadas con una flecha.",
    "Fondo de Poké Balls en diagonal (sin movimiento) también dentro del juego.",
    "PC: sprites con escala entera (más nítidos) y se oculta el desplegable de naturalezas.",
  ] },
  { v: "2.8", date: "3 nov 2026", title: "Pokédex 4 por fila y ajustes", items: [
    "Pokédex: 4 Pokémon por fila.",
    "Repetir un gimnasio ya ganado ya no vuelve a mostrar la felicitación de medalla.",
    "Equipo en combate: el Pokémon queda centrado y no lo tapan el nivel ni las barras de vida/XP.",
  ] },
  { v: "2.7", date: "3 nov 2026", title: "Medallas completas", items: [
    "Progreso: la tarjeta de la región se ajusta para mostrar todas las medallas sin desbordar.",
    "Si un combate falla, el aviso ahora indica el motivo para poder corregirlo.",
  ] },
  { v: "2.6", date: "3 nov 2026", title: "Sprites uniformes y Progreso compacto", items: [
    "PC: todos los sprites usan la misma escala de píxel (como en el original); los variocolor grandes ya no se ven más pixelados ni desbordan.",
    "Progreso: cabecera, regiones y filas de gimnasio más compactas para aprovechar el espacio en el móvil.",
    "Cada gimnasio muestra su propio fondo (agua, eléctrico, planta…) en vez de la roca para todos.",
  ] },
  { v: "2.5", date: "3 nov 2026", title: "PC y filtros pulidos", items: [
    "Filtros en fuente pixel y alineados (buscador, Estado y ✦ a la misma altura); menús propios en vez del selector del sistema.",
    "PC: orden, naturaleza y ✦ en una sola fila; la caja muestra 4 por fila con el Pokémon más grande dentro de su casilla.",
    "Se quitó el número repetido (#25) y los nombres vacíos usan el de la Pokédex.",
    "Detalle del Pokémon: el botón ✕ siempre queda visible.",
  ] },
  { v: "2.4", date: "3 nov 2026", title: "5 equipos y Pokédex", items: [
    "Equipo/PC: 5 equipos configurables; cada uno guarda sus 6 Pokémon y se cambia con los botones de arriba.",
    "Al bajar por la lista del PC aparece una barra fija con tus 6 Pokémon; toca uno para quitarlo del equipo.",
    "Al cerrar el PC siempre vuelves al mapa de aventura.",
    "Pokédex: la flecha de Kanto oculta toda la región; filtro Estado como menú propio; Variocolor ahora es el icono ✦.",
  ] },
  { v: "2.3", date: "2 nov 2026", title: "Posición de los Pokémon en combate", items: [
    "El Pokémon enemigo ya aparece sobre su nivel y su barra de vida (antes salía desplazado hacia el aliado y a veces se superponían).",
    "El ajuste de sprites ahora también descuenta el margen transparente lateral del dibujo.",
  ] },
  { v: "2.2", date: "2 nov 2026", title: "Menús en horizontal", items: [
    "Al cambiar de pestaña con el panel Equipo/PC abierto, el panel se cierra y se ve la pestaña elegida.",
    "Logros: la cabecera con ✕ queda fija arriba; también se cierra tocando fuera o con Esc.",
    "Actividades: tarjeta compacta junto al menú en pantalla ancha.",
  ] },
  { v: "2.1", date: "2 nov 2026", title: "Cabecera, equipo y PC", items: [
    "Pantalla ancha: la barra con tu perfil va de esquina a esquina y el menú queda debajo.",
    "Equipo/PC ya no se queda en blanco tras unos segundos.",
    "Los 6 Pokémon del equipo caben dentro del mapa y el mensaje de combate ya no los pisa.",
    "iPhone apaisado: menú y cabecera más compactos.",
  ] },
  { v: "2.0", date: "2 nov 2026", title: "Pantalla ancha", items: [
    "Pantalla ancha como el original: menú lateral a la izquierda, barra superior y escena grande.",
    "El equipo se abre dentro del panel central sin tapar el menú; el mensaje de combate ya no se sale de la escena.",
  ] },
  { v: "1.9", date: "2 nov 2026", title: "Pokédex nítida + iPhone/Deck", items: [
    "Pokédex con texto nítido y diseño tipo original (banner, anillo, regiones, últimas capturas).",
    "Ajustes para iPhone (notch, sin zoom al tocar) y Steam Deck (pantalla ancha, foco visible con mando).",
  ] },
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
