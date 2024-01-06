import express from "express";
const app = express();

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
	res.send("Hello from staging!");
});

app.get("/api", (req, res) => {
	res.send("api");
});

app.listen(port as number, () => {
	console.log(`Server is running on port ${port}`);
});
