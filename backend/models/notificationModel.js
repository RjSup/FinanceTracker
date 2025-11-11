import db from "../database/db.js";

export function addNotification(userId, title) {
  return db
    .prepare("INSERT INTO notifications (user_id, title) VALUES (?, ?)")
    .run(userId, title);
}

export function getNotifications(userId) {
  return db
    .prepare(
      "SELECT id, title, read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
    )
    .all(userId);
}

// Now requires userId to ensure ownership
export function deleteNotification(id, userId) {
  const info = db
    .prepare("DELETE FROM notifications WHERE id = ? AND user_id = ?")
    .run(id, userId);
  return info.changes > 0; // true if deleted
}

// Now requires userId to ensure ownership
export function markAsRead(id, userId) {
  const info = db
    .prepare("UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?")
    .run(id, userId);
  return info.changes > 0; // true if updated
}
