const DIALOGUES = [
  "¡Hola! ¡Bienvenido al mundo de los Pokémon! Me llamo Oak, pero la gente me llama el Profesor Pokémon.",
  "Aquí tu aventura avanza sola: tu equipo combate y captura Pokémon salvajes... ¡incluso cuando no estás!",
  "Derrota a los Líderes de Gimnasio para ganar sus medallas y abrir nuevas rutas.",
  "Y no les quites ojo: los Pokémon legendarios aparecen en eventos por tiempo limitado.",
  "Pero dime... ¿qué personaje te representa mejor?",
];

import { starterMarkup, playStarterReveal } from "./starter-reveal.js?v=125";

export function startIntro({ onComplete }) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="intro" class="intro">
      <div class="lab-bg" style="background-image:url('https://pokecatch-online.pages.dev/assets/bg/scenes/labo-professeur-chen-710x400.webp')">
        <div class="oak-container">
          <img id="oak-sprite" src="assets/trainers/oak.png" alt="Profesor Oak"
               onerror="this.style.opacity=0.5" />
        </div>
      </div>

      <div class="intro-bottom">
        <div id="dialogue-box" class="dialogue-box">
          <div class="speaker">Prof. Oak</div>
          <div id="dialogue-text" class="dialogue-text"></div>
          <div class="dialogue-hint">▼</div>
        </div>
        <button id="btn-skip" class="btn-skip" type="button">SALTAR ▶▶</button>
      </div>

      <div id="char-select" class="char-select hidden">
        <div class="char-options">
          <button class="char-card" data-gender="m" type="button">
            <img src="assets/trainers/red.png" alt="Chico" />
          </button>
          <button class="char-card" data-gender="f" type="button">
            <img src="assets/trainers/leaf.png" alt="Chica" onerror="this.src='assets/trainers/red.png'" />
          </button>
        </div>
        <button id="btn-confirm-char" class="btn-confirm" disabled type="button">CONFIRMAR</button>
      </div>

      <div id="name-input" class="name-input hidden">
        <div class="name-row">
          <img id="name-sprite" src="assets/trainers/red.png" alt="" />
          <input type="text" id="player-name" maxlength="12" placeholder="Tu nombre" value="Nino" />
          <button id="btn-confirm-name" class="btn-confirm" type="button">CONFIRMAR</button>
        </div>
      </div>

      <div id="starter-select" class="starter-select hidden">${starterMarkup()}</div>
    </div>
  `;

  let step = 0;
  let selectedGender = null;
  let playerName = "Nino";
  let selectedStarter = null;

  const dialogueText = document.getElementById("dialogue-text");
  const dialogueBox = document.getElementById("dialogue-box");
  const charSelect = document.getElementById("char-select");
  const nameInput = document.getElementById("name-input");
  const starterSelect = document.getElementById("starter-select");
  const btnSkip = document.getElementById("btn-skip");
  const introBottom = document.querySelector(".intro-bottom");

  function showDialogue(index) {
    if (index >= DIALOGUES.length) {
      dialogueBox.classList.add("hidden");
      btnSkip.classList.add("hidden");
      if (introBottom) introBottom.classList.add("hidden");
      charSelect.classList.remove("hidden");
      return;
    }
    dialogueText.textContent = DIALOGUES[index];
  }

  showDialogue(0);

  dialogueBox.addEventListener("click", () => {
    step++;
    showDialogue(step);
  });

  btnSkip.addEventListener("click", (e) => {
    e.stopPropagation();
    step = DIALOGUES.length;
    showDialogue(step);
  });

  charSelect.querySelectorAll(".char-card").forEach(card => {
    card.addEventListener("click", () => {
      charSelect.querySelectorAll(".char-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedGender = card.dataset.gender;
      document.getElementById("btn-confirm-char").disabled = false;
      document.getElementById("name-sprite").src =
        selectedGender === "m" ? "assets/trainers/red.png" : "assets/trainers/leaf.png";
    });
  });

  document.getElementById("btn-confirm-char").addEventListener("click", () => {
    charSelect.classList.add("hidden");
    nameInput.classList.remove("hidden");
    if (introBottom) introBottom.classList.remove("hidden");
    dialogueBox.classList.remove("hidden");
    dialogueText.textContent = "¿Y cuál es tu nombre?";
  });

  document.getElementById("btn-confirm-name").addEventListener("click", () => {
    const input = document.getElementById("player-name");
    playerName = (input.value || "Nino").trim().slice(0, 12) || "Nino";
    nameInput.classList.add("hidden");
    dialogueText.textContent = `¡${playerName}! ¡Tu aventura Pokémon está a punto de empezar!`;
    setTimeout(() => {
      dialogueText.textContent = "Pero primero necesitas un compañero. ¡Ven, elige tu primer Pokémon!";
      setTimeout(() => {
        dialogueBox.classList.add("hidden");
        btnSkip.classList.add("hidden");
        if (introBottom) introBottom.classList.add("hidden");
        starterSelect.classList.remove("hidden");
        playStarterReveal(starterSelect);
      }, 1600);
    }, 1400);
  });

  starterSelect.querySelectorAll(".starter-card").forEach(card => {
    card.addEventListener("click", () => {
      if (!starterSelect.dataset.ready && card.disabled) return;
      starterSelect.querySelectorAll(".starter-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedStarter = Number(card.dataset.id);
      document.getElementById("btn-choose-starter").disabled = false;
    });
  });

  document.getElementById("btn-choose-starter").addEventListener("click", () => {
    if (!selectedStarter) return;
    onComplete({
      name: playerName,
      gender: selectedGender || "m",
      starterId: selectedStarter,
    });
  });
}
