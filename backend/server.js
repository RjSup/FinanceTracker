import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

// routes
import expenseRoute from "./routes/expense.js";
import userRoute from "./routes/user.js";

dotenv.config();

// connect db
const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());

// define the routes
app.use("/api/expenses", expenseRoute);
app.use("/api/user", userRoute);

app.get("/", (req, res) => {
  res.send("Helloooooooooooo from server with express");
});

app.listen(PORT, () => {
  console.log(`Server is listening at localhost: ${PORT}`);
});
