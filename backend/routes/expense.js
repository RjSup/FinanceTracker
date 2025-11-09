import express from "express";
import jwt from "jsonwebtoken";
import {
  addExpense,
  getRecent,
  getExpensesByMonth,
} from "../models/expenseModel.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// Add expense
router.post("/addExpense", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const { amount, category, description, spent_at } = req.body;

    if (!amount || !category || !spent_at) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = addExpense(userId, amount, category, description, spent_at);

    return res.status(201).json({
      message: "Expense created successfully",
      expenseId: result.lastInsertRowid,
    });
  } catch (err) {
    console.error("Error adding expense:", err);
    return res.status(500).json({ message: err.message });
  }
});

// Get recent expenses
router.get("/getRecent", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const expenses = getRecent(userId, 5);

    res.json({ expenses });
  } catch (err) {
    console.error("Error getting recent expenses:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get expenses for a specific month
router.get("/getExpenses/:month", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const { month } = req.params;

    if (!month)
      return res.status(400).json({ message: "Month parameter missing" });

    const expenses = getExpensesByMonth(userId, month);

    res.json(expenses);
  } catch (err) {
    console.error("Error getting monthly expenses:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
