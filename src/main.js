import "./style.css";
import expenseRoute from "../server/routes/expense.js";

// use this to send/query the express routes
app.use("/api", expenseRoute);
