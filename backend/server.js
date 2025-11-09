import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

// routes
import expenseRoute from "./routes/expense.js";
import userRoute from "./routes/user.js";
import dashboardRoute from "./routes/dashboard.js";

dotenv.config();

// connect db
const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());

// define the routes
app.use("/api/expense", expenseRoute);
app.use("/api/user", userRoute);
app.use("/api/dashboard", dashboardRoute);

// random main route
app.get("/", (req, res) => {
  res.send("Helloooooooooooo from server with express");
});

// start and listen to the route
app.listen(PORT, () => {
  console.log(`Server is listening at localhost: ${PORT}`);
});
