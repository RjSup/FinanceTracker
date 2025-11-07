import express from "express";
// import cors from "cors";
import dotenv from "dotenv";
import expenseRoute from "./routes/expense.js";

dotenv.config();

const app = express();
const PORT = 3000;

// connect db

// routing

// app.use(cors());
app.use(express.json());

// define the routes
app.use("/api/expenses", expenseRoute);

app.get("/", (req, res) => {
  res.send("Helloooooooooooo!");
});

app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  res.send(`User ID: ${userId}`);
});

app.post("/users", (req, res) => {
  const { name, age } = req.body;

  res.send(`user created ${name} age: ${age}`);
});

app.get("/posts/:category/:postId", (req, res) => {
  const category = req.params.category;
  const postId = req.params.postId;

  res.send(`<h1>Post</h1><p>Category: ${category}, Post ID: ${postId}</p>`);
});

// middleware
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

// Middleware to simulate an error
app.get("/error", (req, res, next) => {
  const err = new Error("Something went wrong!");
  err.status = 500;
  next(err); // Pass error to error-handling middleware
});

app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error
  res.status(err.status || 500).send({
    message: err.message,
    status: err.status || 500,
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening at localhost: ${PORT}`);
});
