import 'dotenv/config';
import express from "express";
import connectDB from './config/db.js';
import userRouter from './routes/user.routes.js';
import cors from 'cors';
import cookie from 'cookie-parser';

const app = express();
app.use('/api/users', userRouter);
app.use(cookieParser());
await connectDB();

app.get("/", (req, res) => {
  res.send("Hello from server");
});

const port = 8000;

app.listen(port, () => {
  console.log("Server started on port" + port);
});
