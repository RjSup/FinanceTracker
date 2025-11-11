import { updateNavbar } from "./components/navbar.js";

// GLOBAL
const token = localStorage.getItem("token");
if (!token) window.location.href = "/";
updateNavbar("dashboard");

const authHeaders = () => ({ Authorization: `Bearer ${token}` });

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: { ...options.headers, ...authHeaders() },
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    return null;
  }
}

function formatCurrency(amount) {
  return `£${amount.toFixed(2)}`;
}

function getCurrentMonthParam() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getDate() {
  const dateFooter = document.querySelector("#footerid");
  const currYear = new Date().getFullYear();
  dateFooter.textContent = `© ${currYear} Ledgerly`;
}

// ---------- BUDGET ----------

async function loadBudget() {
  const budgetEl = document.querySelector("#budget-amount");
  const data = await fetchJSON("http://localhost:3000/api/user/getBudget");
  if (budgetEl) budgetEl.textContent = formatCurrency(data?.budget || 0);
}

// ---------- EXPENSES ----------

async function getMonthExpenses() {
  const monthParam = getCurrentMonthParam();
  return (
    (await fetchJSON(
      `http://localhost:3000/api/expense/getExpenses/${monthParam}`,
    )) || []
  );
}

async function updateMonthTotal() {
  const expensesEl = document.querySelector("#spent-amount");
  if (!expensesEl) return;
  const expenses = await getMonthExpenses();
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  expensesEl.textContent = formatCurrency(total);
}

async function calcRemaining() {
  const remainingEl = document.querySelector("#remaining-amount");
  if (!remainingEl) return;

  const [budgetData, expenses] = await Promise.all([
    fetchJSON("http://localhost:3000/api/user/getBudget"),
    getMonthExpenses(),
  ]);

  const budget = Number(budgetData?.budget || 0);
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  remainingEl.textContent = formatCurrency(budget - totalSpent);
}

// ---------- RECENT EXPENSES ----------

async function loadRecentExpenses() {
  const list = document.querySelector("#recent-expenses-list");
  if (!list) return;
  list.innerHTML = "<p>Loading...</p>";

  const data = await fetchJSON("http://localhost:3000/api/expense/getRecent");
  const expenses = data?.expenses || [];

  if (expenses.length === 0) {
    list.innerHTML = "<p>No recent expenses found.</p>";
    return;
  }

  list.innerHTML = expenses
    .map(
      (exp) => `
        <div class="expense-item">
          <span>${new Date(exp.spent_at).toLocaleDateString()}</span>
          <span>${exp.category}</span>
          <span>${formatCurrency(exp.amount)}</span>
          <span>${exp.description || "-"}</span>
        </div>
      `,
    )
    .join("");
}

// ---------- NOTIFICATIONS ----------

async function loadNotifications() {
  const list = document.querySelector("#notifications-list");
  const empty = document.querySelector("#empty-notifications");

  const data = await fetchJSON("http://localhost:3000/api/notifications"); // <- plural
  const notifications = data?.notifications || [];

  if (notifications.length === 0) {
    empty.style.display = "flex";
    list.innerHTML = "";
    return;
  }

  empty.style.display = "none";

  list.innerHTML = notifications
    .map(
      (n) => `
      <div class="notification-item ${n.read ? "read" : ""}" data-id="${n.id}">
        <span class="notification-title">${n.title}</span>
        <button class="notification-delete" data-id="${n.id}">Delete</button>
      </div>
    `,
    )
    .join("");

  // Setup delete buttons
  document.querySelectorAll(".notification-delete").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation(); // Prevent triggering "mark as read"
      const id = e.target.dataset.id;
      const res = await fetchJSON(
        `http://localhost:3000/api/notifications/${id}`,
        {
          method: "DELETE",
        },
      );
      if (res?.success) loadNotifications();
    });
  });

  // Mark as read on click
  document.querySelectorAll(".notification-item").forEach((item) => {
    item.addEventListener("click", async () => {
      const id = item.dataset.id;
      if (item.classList.contains("read")) return; // already read
      const res = await fetchJSON(
        `http://localhost:3000/api/notifications/read/${id}`,
        {
          method: "POST",
        },
      );
      if (res?.success) item.classList.add("read");
    });
  });
}

// ---------- FORMS ----------

function setupAddExpenseForm() {
  const form = document.querySelector("#add-expense-form");
  const message = document.querySelector("#form-message");
  if (!form || !message) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.querySelector("#expense-amount").value);
    const category = document.querySelector("#expense-category").value;
    const description = document
      .querySelector("#expense-description")
      .value.trim();
    const spent_at = document.querySelector("#expense-date").value;

    if (!amount || !category || !spent_at) {
      message.textContent = "Please fill required fields";
      message.style.color = "red";
      return;
    }

    const res = await fetchJSON(
      "http://localhost:3000/api/expense/addExpense",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, category, description, spent_at }),
      },
    );

    if (!res) {
      message.textContent = "Error adding expense";
      message.style.color = "red";
      return;
    }

    message.textContent = "Expense added successfully!";
    message.style.color = "green";
    form.reset();
    document.querySelector("#expense-date").value = new Date()
      .toISOString()
      .split("T")[0];

    await loadRecentExpenses();
    await updateMonthTotal();
    await calcRemaining();
    await loadNotifications();
  });
}

function setupBudgetForm() {
  const form = document.querySelector("#budget-form");
  const errorEl = document.querySelector("#errors");
  if (!form || !errorEl) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const budgetInput = document.getElementById("budget-input");
    const budgetValue = parseFloat(budgetInput.value);
    if (isNaN(budgetValue) || budgetValue < 0) {
      errorEl.textContent = "Enter valid budget";
      errorEl.style.color = "red";
      return;
    }

    const res = await fetchJSON("http://localhost:3000/api/user/setBudget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budgetValue }),
    });

    if (!res) {
      errorEl.textContent = "Error setting budget";
      errorEl.style.color = "red";
      return;
    }

    errorEl.textContent = "Budget updated!";
    errorEl.style.color = "green";
    budgetInput.value = "";

    await loadBudget();
    await calcRemaining();
    await loadNotifications();
  });
}

// ---------- NAVIGATION ----------

function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-button");
  const views = document.querySelectorAll(".view");

  function switchView(viewName) {
    views.forEach((v) => v.classList.remove("active"));
    navButtons.forEach((b) => b.classList.remove("active"));

    const target = document.getElementById(`${viewName}-view`);
    if (target) target.classList.add("active");

    const activeButton = document.querySelector(`[data-view="${viewName}"]`);
    if (activeButton) activeButton.classList.add("active");
  }

  navButtons.forEach((btn) =>
    btn.addEventListener("click", () => switchView(btn.dataset.view)),
  );
}

// ---------- DELETE ACCOUNT ----------

function setupDeleteAccount() {
  const deleteBtn = document.querySelector("#clear-data");
  const statusEl = document.querySelector("#status");
  if (!deleteBtn || !statusEl) return;

  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    const res = await fetchJSON("http://localhost:3000/api/user/deleteUser", {
      method: "DELETE",
    });
    if (!res?.success) {
      statusEl.textContent = "Failed to delete account";
      return;
    }
    statusEl.textContent = "Account deleted";
    localStorage.removeItem("token");
    window.location.href = "/";
  });
}

// ---------- INIT ----------

document.addEventListener("DOMContentLoaded", async () => {
  const usernameEl = document.querySelector("#user");
  const titleEl = document.getElementById("title");
  if (titleEl) titleEl.textContent = "Dashboard";

  const userData = await fetchJSON("http://localhost:3000/api/user/getUser");
  if (!userData) {
    localStorage.removeItem("token");
    window.location.href = "/";
    return;
  }

  if (usernameEl) {
    usernameEl.textContent = `Welcome back, ${userData.name.toUpperCase()}!`;
    usernameEl.style.color = "black";
  }

  const today = new Date().toISOString().split("T")[0];
  const expenseDateInput = document.getElementById("expense-date");
  if (expenseDateInput) expenseDateInput.value = today;

  await Promise.all([
    loadBudget(),
    loadRecentExpenses(),
    updateMonthTotal(),
    calcRemaining(),
    loadNotifications(),
  ]);
  setupAddExpenseForm();
  setupBudgetForm();
  setupNavigation();
  setupDeleteAccount();
  getDate();
});
