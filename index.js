import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from server");
});

const port = 8000;

app.listen(port, () => {
  console.log("Server started on port" + port);
});
