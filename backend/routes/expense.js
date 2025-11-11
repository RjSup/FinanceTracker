import express from "express";
import jwt from "jsonwebtoken";
import {
  addExpense,
  getMonthExpenses,
  getRecentExpenses,
  getTypeId,
} from "../models/expenseModel.js";
import { addNotification } from "../models/notificationModel.js";
import { getBudget } from "../models/userModel.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// Add expense
router.post("/addExpense", async (req, res) => {
  const { amount, category, description, spent_at } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const type_id = getTypeId(category);
    if (!type_id) return res.status(400).json({ message: "Invalid category" });

    addExpense(userId, type_id, amount, description, spent_at);
    addNotification(
      userId,
      `Expense added: £${amount} - ${description || "No description"}`,
    );

    const budget = getBudget(userId)?.budget || 0;
    const expenses = getMonthExpenses(
      userId,
      new Date().toISOString().slice(0, 7),
    );
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    if (totalSpent >= budget)
      addNotification(userId, `You have gone over your budget!`);
    else if (budget - totalSpent <= 0)
      addNotification(userId, `Budget remaining ≤ 0`);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get recent expenses
router.get("/getRecent", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const expenses = getRecentExpenses(decoded.id);
    res.json({ expenses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get monthly expenses
router.get("/getExpenses/:month", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const expenses = getMonthExpenses(decoded.id, req.params.month);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
