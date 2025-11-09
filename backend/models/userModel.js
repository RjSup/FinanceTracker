import db from "../database/db.js";
import bcrypt from "bcrypt";

// function to create a user
export async function createUser({ name, username, email, password }) {
  // hash the pass for security
  const hashedPassword = await bcrypt.hash(password, 10);
  // insert into db
  const query = db.prepare(
    "INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)",
  );
  // run the func
  return query.run(name, username, email, hashedPassword);
}

// get user by email
export function userByEmail(email) {
  // check against db
  const query = db.prepare("SELECT * FROM users WHERE email = ?");
  // return the detauls
  return query.get(email);
}

// get user by uname
export function userByUsername(username) {
  // check agasint db
  const query = db.prepare("SELECT * FROM users WHERE username = ?");
  // return the details
  return query.get(username);
}

// check pw against db pws
export async function verifyPassword(inputPassword, hashedPassword) {
  // take pw from user against hashed one in db
  return await bcrypt.compare(inputPassword, hashedPassword);
}

// set budget
export function setBudget(userId, budgetValue) {
  const query = db.prepare("UPDATE users SET budget = ? WHERE id = ?");
  return query.run(budgetValue, userId);
}

// get the budget
export function getBudget(userId) {
  const query = db.prepare("SELECT budget FROM users WHERE id = ?");
  return query.get(userId);
}
