import Database from "better-sqlite3";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// get .env stuff
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_FILE || "./server/database/db.js";
fs.mkdirSync(path.resolve(__dirname, path.dirname(dbPath)), {
  recursive: true,
});

// create db from info in db.js
const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXIST users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now))
  );

  CREATE TABLE IF NOT EXIST EXPENSE (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  spent_at TEXT DEFAULT (datetime('now)),
  created_at TEXT DEFAULT )datetime('now),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

console.log(`"Database ready at: ${dbPath}`);

export default db;
