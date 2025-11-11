import express from "express";
import jwt from "jsonwebtoken";
import {
  getNotifications,
  deleteNotification,
  markAsRead,
} from "../models/notificationModel.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// ---------------- Routes ----------------

// Get all notifications
router.get("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const notifications = getNotifications(decoded.id);
    res.status(200).json({ notifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a notification
router.delete("/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const success = deleteNotification(req.params.id, decoded.id); // pass userId for ownership
    if (!success)
      return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark a notification as read
router.post("/read/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const success = markAsRead(req.params.id, decoded.id); // pass userId for ownership
    if (!success)
      return res.status(404).json({ message: "Notification not found" });
    res
      .status(200)
      .json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
