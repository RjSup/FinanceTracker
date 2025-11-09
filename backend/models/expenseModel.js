import db from "../database/db.js";

// Add expense
export function addExpense(userId, amount, category, description, spent_at) {
  const typeStmt = db.prepare("SELECT id FROM expense_type WHERE name = ?");
  let type = typeStmt.get(category);

  if (!type) {
    const insertType = db.prepare("INSERT INTO expense_type (name) VALUES (?)");
    const typeResult = insertType.run(category);
    type = { id: typeResult.lastInsertRowid };
  }

  const stmt = db.prepare(`
    INSERT INTO expense (user_id, type_id, amount, description, spent_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  return stmt.run(userId, type.id, amount, description || "", spent_at);
}

// Get recent expenses
export function getRecent(userId, limit = 5) {
  const stmt = db.prepare(`
    SELECT e.id, e.amount, e.description, e.spent_at, t.name as category
    FROM expense e
    JOIN expense_type t ON e.type_id = t.id
    WHERE e.user_id = ?
    ORDER BY e.spent_at DESC
    LIMIT ?
  `);
  const rows = stmt.all(userId, limit);
  return rows.map((r) => ({ ...r, amount: Number(r.amount) }));
}

// Get expenses by month (YYYY-MM)
export function getExpensesByMonth(userId, month) {
  if (!month) return [];

  const stmt = db.prepare(`
    SELECT e.id, e.amount, e.description, e.spent_at, t.name as category
    FROM expense e
    JOIN expense_type t ON e.type_id = t.id
    WHERE e.user_id = ?
      AND strftime('%Y-%m', e.spent_at) = ?
    ORDER BY e.spent_at DESC
  `);

  const rows = stmt.all(userId, month);
  return rows.map((r) => ({ ...r, amount: Number(r.amount) }));
}
