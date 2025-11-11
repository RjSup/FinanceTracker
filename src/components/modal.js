export function showModal(contentHTML) {
  // Remove existing modal if present
  closeModal();

  // Create overlay container
  const modalOverlay = document.createElement("div");
  modalOverlay.classList.add("modal-overlay");

  // Inner modal content
  modalOverlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" aria-label="Close">&times;</button>
      <div class="modal-body">${contentHTML}</div>
    </div>
  `;

  // Add to DOM
  document.body.appendChild(modalOverlay);

  // Add event listeners
  modalOverlay
    .querySelector(".modal-close")
    .addEventListener("click", () => closeModal(modalOverlay));

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal(modalOverlay);
  });
}

export function closeModal(modalOverlay) {
  // If no argument, find existing modal
  if (!modalOverlay) modalOverlay = document.querySelector(".modal-overlay");
  if (!modalOverlay) return;

  modalOverlay.classList.add("closing");
  setTimeout(() => modalOverlay.remove(), 300);
}
