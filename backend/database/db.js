import Database from "better-sqlite3";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// init .env stuff
dotenv.config();

// path to db
const dbPath = process.env.DATABASE_FILE || "./backend/database/db.sqlite";
const fullDbPath = path.resolve(process.cwd(), dbPath);

// ensure folder exists
fs.mkdirSync(path.dirname(fullDbPath), { recursive: true });

// create new db
const db = new Database(fullDbPath);
db.pragma("foreign_keys = ON");

// create new tables for db user & expense
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  budget REAL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expense_type (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS expense (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  spent_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES expense_type(id) ON DELETE RESTRICT
);
`);

// populate some types
const expenseTypes = [
  "Housing",
  "Utilities",
  "Food",
  "Transport",
  "Debt",
  "Entertainment",
  "Other",
];
const insertType = db.prepare(
  "INSERT OR IGNORE INTO expense_type (name) VALUES (?)",
);
expenseTypes.forEach((type) => insertType.run(type));
console.log(`Database ready at: ${fullDbPath}`);

export default db;
