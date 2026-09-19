import dotenv from "dotenv";
import express from "express";
import connectDB from './config/db.js';
import userRouter from './routes/user.routes.js';
import cors from 'cors';
import cookie from 'cookie-parser';
import report_Router from "./routes/report.routes.js";

const app = express();
dotenv.config()
app.use(cors(
  {
    origin: true,
    credentials: true
  }
))
app.use(express.json())
app.use(cookie());

await connectDB();

app.use('/api/users', userRouter);
app.use("/api/report-api", report_Router)
app.get("/", (req, res) => {
  res.send("Hello from server");
});

const port = 8000;

app.listen(port, () => {
  console.log("Server started on port" + port);
});
