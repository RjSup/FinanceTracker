export function updateNavbar(pageContext = "landing") {
  const loginBtn = document.querySelector("#login");
  const signupBtn = document.querySelector("#signup");
  const homeBtn = document.querySelector("#home");
  let dashboardBtn = document.querySelector("#dashboard");

  const token = localStorage.getItem("token");

  if (token) {
    // Logged in → show logout
    if (loginBtn) loginBtn.textContent = "Logout";
    if (signupBtn) signupBtn.style.display = "none";

    if (loginBtn) {
      loginBtn.onclick = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
      };
    }

    // Show Dashboard button if missing (both landing & dashboard)
    if (!dashboardBtn) {
      const dashboardLink = document.createElement("a");
      dashboardLink.href = "/dashboard.html";
      dashboardLink.id = "dashboard";
      dashboardLink.innerHTML = `<i class="fa fa-fw fa-tachometer"></i> Dashboard`;
      homeBtn.insertAdjacentElement("afterend", dashboardLink);
      dashboardBtn = dashboardLink;
    }

    // Home button always goes to landing
    if (homeBtn) {
      homeBtn.onclick = (e) => {
        e.preventDefault();
        window.location.href = "/"; // landing page
      };
    }
  } else {
    // Not logged in → show login/signup/home
    if (loginBtn) loginBtn.textContent = "Login";
    if (signupBtn) signupBtn.style.display = "inline-block";

    if (loginBtn) loginBtn.onclick = null;
    if (homeBtn) homeBtn.onclick = null;

    if (dashboardBtn) dashboardBtn.remove();
  }

  // what button/page is active
  document
    .querySelectorAll("#navbar a")
    // remove status to start
    .forEach((link) => link.classList.remove("active"));

  // decide which buttons to put as active based on what page is actually active
  if (pageContext === "landing" && homeBtn) {
    homeBtn.classList.add("active");
  } else if (pageContext === "dashboard" && dashboardBtn) {
    dashboardBtn.classList.add("active");
  }
}
