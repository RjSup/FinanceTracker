import { showModal, closeModal } from "./components/modal.js";
import { updateNavbar } from "./components/navbar.js";

// heelpers
const API_URL = "http://localhost:3000/api/user";

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    return { error: err.message };
  }
}

function showMessage(el, message, color = "red") {
  if (!el) return;
  el.textContent = message;
  el.style.color = color;
}

function createAuthModal(title, fields) {
  const inputsHTML = fields
    .map(
      (f) =>
        `<input type="${f.type}" id="${f.id}" placeholder="${f.placeholder}" required />`,
    )
    .join("");
  return `
    <h2>${title}</h2>
    <form id="${title.toLowerCase()}Form" class="auth-form">
      ${inputsHTML}
      <button type="submit">${title}</button>
    </form>
    <div id="${title.toLowerCase()}Message"></div>
  `;
}

// event Handlers
function handleLogin() {
  const loginBtn = document.querySelector("#login");
  if (!loginBtn || localStorage.getItem("token")) return;

  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();

    showModal(
      createAuthModal("Login", [
        { type: "text", id: "loginUsername", placeholder: "Username" },
        { type: "password", id: "loginPassword", placeholder: "Password" },
      ]),
    );

    const loginForm = document.querySelector("#loginForm");
    const loginMsg = document.querySelector("#loginMessage");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const username = document.querySelector("#loginUsername").value.trim();
      const password = document.querySelector("#loginPassword").value.trim();

      if (!username || !password) {
        showMessage(loginMsg, "Please fill all fields.");
        return;
      }

      const data = await fetchJSON(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (data.error) {
        showMessage(loginMsg, data.error);
      } else {
        localStorage.setItem("token", data.token);
        closeModal();
        updateNavbar("landing");
        window.location.href = "/dashboard.html";
      }
    });
  });
}

function handleSignup() {
  const signupBtn = document.querySelector("#signup");
  if (!signupBtn) return;

  signupBtn.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();

    showModal(
      createAuthModal("SignUp", [
        { type: "text", id: "signupName", placeholder: "Name" },
        { type: "text", id: "signupUsername", placeholder: "Username" },
        { type: "email", id: "signupEmail", placeholder: "Email" },
        { type: "password", id: "signupPassword", placeholder: "Password" },
      ]),
    );

    const signupForm = document.querySelector("#signupForm");
    const signupMsg = document.querySelector("#signupMessage");

    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.querySelector("#signupName").value.trim();
      const username = document.querySelector("#signupUsername").value.trim();
      const email = document.querySelector("#signupEmail").value.trim();
      const password = document.querySelector("#signupPassword").value.trim();

      if (!name || !username || !email || !password) {
        showMessage(signupMsg, "Please fill all fields.");
        return;
      }

      const data = await fetchJSON(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });

      if (data.error) {
        showMessage(signupMsg, data.error);
      } else {
        showMessage(
          signupMsg,
          "Signup successful. You can now log in.",
          "green",
        );
        signupForm.reset();
      }
    });
  });
}

// init
document.addEventListener("DOMContentLoaded", () => {
  updateNavbar("landing");
  handleLogin();
  handleSignup();
});
