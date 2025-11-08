import express from "express";
import {
  createUser,
  userByEmail,
  userByUsername,
} from "../models/userModel.js";
const router = express.Router();

// add routes for user from a database

// signup
router.post("/signup", async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (userByEmail(email) || userByUsername(username)) {
    return res.status(409).json({ message: "User already exists." });
  }

  try {
    const result = await createUser({ name, username, email, password });
    return res
      .status(201)
      .json({ message: "User created", userId: result.lastInsertRowid });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
