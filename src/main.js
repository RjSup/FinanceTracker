console.log("working");
// styling
import "./style.css";

// components
import { showModal } from "./components/modal.js";

// routes
// import expenseRoute from "../backend/routes/expense.js";
// import userRoute from "../backend/routes/user.js";

// use this to send/query the express routes
// using await fetch(route)

// user things
document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.querySelector("#signup");

  if (!signupBtn) {
    console.error("#signup element not found");
    return;
  }

  signupBtn.addEventListener("click", (event) => {
    event.preventDefault();
    console.log("Worked");

    showModal(`
      <h2>Sign Up</h2>
          <form id="signupForm" class="auth-form">
            <input type="text" id="signupName" placeholder="Name" required />
            <input type="text" id="signupUsername" placeholder="Username" required />
            <input type="email" id="signupEmail" placeholder="Email" required />
            <input type="password" id="signupPassword" placeholder="Password" required />
            <button type="submit">Sign Up</button>
          </form>
          <div id="signupMessage"></div>
    `);

    // wait for modal form to exist in DOM
    const signupForm = document.querySelector("#signupForm");
    const signupMsg = document.querySelector("#signupMessage");

    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // get info
      const name = document.querySelector("#signupName");
      const username = document.querySelector("#signupUsername");
      const email = document.querySelector("#signupEmail");
      const password = document.querySelector("#signupPassword");

      // validate
      if (!name || !username || !email || !password) {
        signupMsg.textContent = "Please fill all fields.";
        signupMsg.style.color = "red";
        return;
      }

      try {
        // send POST
        const response = await fetch("http://localhost:3000/api/user/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.value,
            username: username.value,
            email: email.value,
            password: password.value,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          signupMsg.textContent = data.message || "Signup failed.";
          signupMsg.style.color = "red";
        } else {
          signupMsg.textContent = "Signup successful.";
          signupMsg.style.color = "green";
          signupForm.reset();
        }
      } catch (err) {
        console.error("Signup error:", err);
        signupMsg.textContent = "An error occurred. Try again.";
        signupMsg.style.color = "red";
      }
    });
  });
});
//expense things
