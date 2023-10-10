import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.send("sdf!");
});

const user: { name: string; age: number } = {
  name: "Jack",
  age: "30",
};

app.listen(8080, () => {
  console.log("Server started on port 3000");
});
