import express from "express";
import jwt from "jsonwebtoken";
import {
  createUser,
  userByEmail,
  userByUsername,
  verifyPassword,
  setBudget,
  getBudget,
  deleteUser,
} from "../models/userModel.js";
import { getMonthExpenses, getAllExpenses } from "../models/expenseModel.js";
import { addNotification } from "../models/notificationModel.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// Signup
router.post("/signup", async (req, res) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password)
    return res.status(400).json({ message: "All fields required" });
  if (userByEmail(email) || userByUsername(username))
    return res.status(409).json({ message: "User exists" });
  try {
    const result = await createUser({ name, username, email, password });
    res
      .status(201)
      .json({ message: "User created", userId: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Set budget
router.post("/setBudget", async (req, res) => {
  const { budgetValue } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    setBudget(userId, budgetValue);

    // check budget notification
    const expenses = getMonthExpenses(
      userId,
      new Date().toISOString().slice(0, 7),
    );
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    if (totalSpent >= budgetValue)
      addNotification(userId, `Budget reached or exceeded!`);
    else if (budgetValue - totalSpent <= 0)
      addNotification(userId, `Budget remaining ≤ 0`);

    res.status(200).json({ message: "Budget updated", budget: budgetValue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get budget
router.get("/getBudget", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const budget = getBudget(decoded.id)?.budget || 0;
    res.json({ budget });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "All fields required" });
  const user = userByUsername(username);
  if (!user)
    return res.status(401).json({ message: "Invalid username or password" });
  const valid = await verifyPassword(password, user.password);
  if (!valid)
    return res.status(401).json({ message: "Invalid username or password" });
  const token = jwt.sign(
    { id: user.id, username: user.username, name: user.name },
    JWT_SECRET,
    { expiresIn: "1h" },
  );
  res.json({
    message: "Login success",
    token,
    user: { id: user.id, name: user.name, username: user.username },
  });
});

// Get user info
router.get("/getUser", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = userByUsername(decoded.username);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
});

// Delete user
router.delete("/deleteUser", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    deleteUser(decoded.id);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
