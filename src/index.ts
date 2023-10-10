import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.send("sdf!");
});

app.listen(8080, () => {
  console.log("Server started on port 3000");
});
