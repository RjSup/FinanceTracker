import db from "../database/db.js";

// Add expense
export function addExpense(userId, type_id, amount, description, spent_at) {
  return db
    .prepare(
      "INSERT INTO expense (user_id, type_id, amount, description, spent_at) VALUES (?, ?, ?, ?, ?)",
    )
    .run(userId, type_id, amount, description, spent_at);
}

// Get recent expenses
export function getRecentExpenses(userId) {
  return db
    .prepare(
      "SELECT e.*, t.name AS category FROM expense e JOIN expense_type t ON e.type_id = t.id WHERE e.user_id = ? ORDER BY e.spent_at DESC LIMIT 5",
    )
    .all(userId);
}

// Get expenses for a specific month
export function getMonthExpenses(userId, monthParam) {
  return db
    .prepare(
      "SELECT * FROM expense WHERE user_id = ? AND strftime('%Y-%m', spent_at) = ?",
    )
    .all(userId, monthParam);
}

// Get all expenses
export function getAllExpenses(userId) {
  return db
    .prepare("SELECT * FROM expense WHERE user_id = ? ORDER BY spent_at DESC")
    .all(userId);
}

export function getTypeId(categoryName) {
  const row = db
    .prepare("SELECT id FROM expense_type WHERE LOWER(name) = LOWER(?)")
    .get(categoryName);
  return row ? row.id : null;
}
