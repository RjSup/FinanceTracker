import db from "../database/db.js";
import bcrypt from "bcrypt";

// create a user with hashed password
export async function createUser({ name, username, email, password }) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const query = db.prepare(`
    INSERT INTO users (name, username, email, password)
    VALUES (?, ?, ?, ?)
  `);
  return query.run(name, username, email, hashedPassword);
}

// check user in db by email
export function userByEmail(email) {
  const query = db.prepare(`SELECT * FROM users WHERE email = ?`);
  return query.get(email);
}

// check by username
export function userByUsername(username) {
  const query = db.prepare(`SELECT * FROM users WHERE username = ?`);
  return query.get(username);
}

// verify password during login
export async function verifyPassword(inputPassword, hashedPassword) {
  return await bcrypt.compare(inputPassword, hashedPassword);
}
