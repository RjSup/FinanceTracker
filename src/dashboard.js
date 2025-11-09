import { updateNavbar } from "./components/navbar.js";

// global
const token = localStorage.getItem("token");
if (!token) window.location.href = "/";

updateNavbar("dashboard");

// helpers
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

// budget
async function loadBudget() {
  const budgetEl = document.querySelector("#budget-amount");
  const data = await fetchJSON("http://localhost:3000/api/user/getBudget");
  if (budgetEl) budgetEl.textContent = formatCurrency(data?.budget || 0);
}

// expenses
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

// forms
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

    if (!amount || !category || !description || !spent_at) {
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
  });
}

function setupBudgetForm() {
  const budgetForm = document.querySelector("#budget-form");
  const errorEl = document.querySelector("#errors");
  if (!budgetForm || !errorEl) return;

  budgetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const budgetInput = document.getElementById("budget-input");
    if (!budgetInput) return;

    const budgetValue = parseFloat(budgetInput.value);
    if (isNaN(budgetValue) || budgetValue < 0) {
      errorEl.textContent = "Error: Please enter a valid budget amount";
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

    errorEl.textContent = "Budget updated successfully!";
    errorEl.style.color = "green";
    budgetInput.value = "";

    await loadBudget();
    await calcRemaining();
  });
}

// Navigation
function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-button");
  const views = document.querySelectorAll(".view");

  function switchView(viewName) {
    views.forEach((v) => v.classList.remove("active"));
    navButtons.forEach((b) => b.classList.remove("active"));

    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) targetView.classList.add("active");

    const activeButton = document.querySelector(`[data-view="${viewName}"]`);
    if (activeButton) activeButton.classList.add("active");
  }

  navButtons.forEach((b) =>
    b.addEventListener("click", () => switchView(b.dataset.view)),
  );
}

// init
document.addEventListener("DOMContentLoaded", async () => {
  const title = document.getElementById("title");
  const username = document.querySelector("#user");
  if (title) title.textContent = "Dashboard";

  const userData = await fetchJSON("http://localhost:3000/api/user/getUser");
  if (!userData) {
    localStorage.removeItem("token");
    window.location.href = "/";
    return;
  }

  if (username) {
    username.textContent = `Welcome back, ${userData.name.toUpperCase()}!`;
    username.style.color = "black";
  }

  await Promise.all([
    loadBudget(),
    loadRecentExpenses(),
    updateMonthTotal(),
    calcRemaining(),
  ]);

  setupAddExpenseForm();
  setupBudgetForm();
  setupNavigation();

  const expenseDateInput = document.getElementById("expense-date");
  if (expenseDateInput)
    expenseDateInput.value = new Date().toISOString().split("T")[0];
});
