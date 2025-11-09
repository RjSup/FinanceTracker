import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// GET /api/dashboard
router.get("/", (req, res) => {
  // get auth heade for authorization
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // token for user to keep logged in
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    // decode the token with .env and decoder
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ message: `Welcome, ${decoded.username}!` });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

export default router;
