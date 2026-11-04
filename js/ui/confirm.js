/** Modal de confirmación in-game (estilo original, no window.confirm) */
export function showConfirm({
  title = "¿Confirmas?",
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  danger = false,
  single = false,
} = {}) {
  return new Promise((resolve) => {
    const root = document.createElement("div");
    root.className = "pc-confirm-overlay";
    root.innerHTML = `
      <div class="pc-confirm" role="dialog" aria-modal="true">
        <p class="pc-confirm-msg">${title}</p>
        <div class="pc-confirm-actions">
          ${single ? "" : `<button type="button" class="pc-confirm-btn cancel" data-v="0">${cancelLabel}</button>`}
          <button type="button" class="pc-confirm-btn ${danger ? "danger" : "ok"}" data-v="1">${confirmLabel}</button>
        </div>
      </div>`;
    const done = (v) => {
      root.remove();
      resolve(!!v);
    };
    root.addEventListener("click", (e) => {
      if (e.target === root) return done(false);
      const b = e.target.closest("[data-v]");
      if (b) done(b.dataset.v === "1");
    });
    document.body.appendChild(root);
    root.querySelector(".pc-confirm-btn.cancel, .pc-confirm-btn.ok")?.focus();
  });
}

/** Aviso in-game con un solo botón (en lugar de window.alert) */
export function showAlert(msg, label = "Entendido") {
  return showConfirm({ title: String(msg ?? ""), confirmLabel: label, single: true });
}
