// Ficha detallada de Pokémon (estilo "NUEVO" del original)

const TYPE_COLORS = {
  normal: "#a8a878", fire: "#f08030", water: "#6890f0", electric: "#f8d030",
  grass: "#78c850", ice: "#98d8d8", fighting: "#c03028", poison: "#a040a0",
  ground: "#e0c068", flying: "#a890f0", psychic: "#f85888", bug: "#a8b820",
  rock: "#b8a038", ghost: "#705898", dragon: "#7038f8", dark: "#705848",
  steel: "#b8b8d0", fairy: "#ee99ac",
};

const TYPE_ES = {
  normal: "Normal", fire: "Fuego", water: "Agua", electric: "Eléctrico",
  grass: "Planta", ice: "Hielo", fighting: "Lucha", poison: "Veneno",
  ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho",
  rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro",
  steel: "Acero", fairy: "Hada",
};

/**
 * Muestra la ficha de un Pokémon recién obtenido.
 * @param {object} mon - Pokémon (de getPokemonForBattle o similar)
 * @param {object} opts - { isNew, onClose }
 */
export function showPokedexCard(mon, { isNew = true, onClose } = {}) {
  const overlay = document.createElement("div");
  overlay.id = "pokedex-overlay";
  overlay.className = "pokedex-overlay";

  const typesHtml = (mon.types || [])
    .map(t => `<span class="type-badge" style="background:${TYPE_COLORS[t] || "#666"}">${TYPE_ES[t] || t}</span>`)
    .join("");

  const sprite = mon.sprites?.front || `assets/pokemon/${mon.id}.png`;
  const name = mon.nameEs || mon.name;
  const level = mon.level ?? 5;
  const genus = mon.genus || "Pokémon";
  const flavor = mon.flavor || "";
  const height = mon.height != null ? (mon.height / 10).toFixed(1) : "?";
  const weight = mon.weight != null ? (mon.weight / 10).toFixed(1) : "?";
  const dexNum = String(mon.id).padStart(3, "0");

  overlay.innerHTML = `
    <div class="pokedex-card">
      <div class="pokedex-header">
        <span class="pokedex-name">${name}</span>
        ${isNew ? '<span class="pokedex-new">NUEVO</span>' : ""}
        <span class="pokedex-num">Nº ${dexNum} · ${mon.id > 151 ? `Johto ${mon.id - 151}/100` : `Kanto ${mon.id}/151`}</span>
      </div>
      <div class="pokedex-body">
        <div class="pokedex-sprite-wrap">
          <img src="${sprite}" alt="${name}" class="pokedex-sprite"
               onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mon.id}.png'" />
        </div>
        <div class="pokedex-info">
          <div class="pokedex-genus">${genus}</div>
          <div class="pokedex-types">${typesHtml}</div>
          <div class="pokedex-stats-row">
            <div class="stat-box"><span class="label">Nivel</span><span class="val">${level}</span></div>
            <div class="stat-box"><span class="label">Altura</span><span class="val">${height} m</span></div>
            <div class="stat-box"><span class="label">Peso</span><span class="val">${weight} kg</span></div>
          </div>
          ${mon.caughtCount != null ? `<div class="pokedex-caught">Capturados · ${mon.caughtCount}</div>` : ""}
        </div>
      </div>
      ${flavor ? `<p class="pokedex-flavor">${flavor}</p>` : ""}
      <button class="pokedex-btn" id="pokedex-close">¡GENIAL!</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => {
    overlay.remove();
    onClose?.();
  };

  overlay.querySelector("#pokedex-close").onclick = close;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
}
