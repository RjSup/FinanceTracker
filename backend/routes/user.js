import express from "express";
import jwt from "jsonwebtoken";
// import funtcions
import {
  createUser,
  userByEmail,
  userByUsername,
  verifyPassword,
  setBudget,
  getBudget,
} from "../models/userModel.js";

const router = express.Router();
// get jwt secret from .env
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// Signup route
router.post("/signup", async (req, res) => {
  // info to send
  const { name, username, email, password } = req.body;
  // check valid input
  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // cuse functions to check agasint db the details given y user
  if (userByEmail(email) || userByUsername(username)) {
    return res.status(409).json({ message: "User already exists." });
  }

  try {
    // try to create a new user with the details
    const result = await createUser({ name, username, email, password });
    return res
      .status(201)
      .json({ message: "User created", userId: result.lastInsertRowid });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// set budget
router.post("/setBudget", async (req, res) => {
  const { budgetValue } = req.body;

  // Validate budget value
  if (budgetValue === undefined || budgetValue === null) {
    return res.status(400).json({ message: "Budget value is required" });
  }

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify token and get user info
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    // Update budget in database
    const result = setBudget(userId, budgetValue);

    return res.status(200).json({
      message: "Budget updated successfully",
      budget: budgetValue,
    });
  } catch (err) {
    console.error("Error in setBudget:", err);
    return res.status(500).json({ message: err.message });
  }
});

// get budget
router.get("/getBudget", async (req, res) => {
  // extract token
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    // verify token and get user
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const result = getBudget(userId);

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      budget: result.budget || 0,
    });
  } catch (err) {
    console.error("Error in getBudget:", err);
    return res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  // data to use
  const { username, password } = req.body;
  // ensure valid input by user
  if (!username || !password)
    return res.status(400).json({ message: "All fields required" });

  // check user input for username agasint db
  const user = userByUsername(username);
  if (!user)
    return res.status(401).json({ message: "Invalid username or password" });

  try {
    // check password in db agasint user input password
    const valid = await verifyPassword(password, user.password);
    if (!valid)
      return res.status(401).json({ message: "Invalid username or password" });

    // Generate JWT for user - keeps them logged in
    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      message: "Login success",
      token,
      user: { id: user.id, name: user.name, username: user.username },
    });
  } catch (err) {
    return res.status(500).json({ message: "Login failed: " + err.message });
  }
});

// Get user info by verifying token
router.get("/getUser", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch the actual user from the database
    const user = userByUsername(decoded.username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send back user details
    res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
});

export default router;
