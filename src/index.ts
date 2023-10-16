import express from "express";
import fs from "fs";
const app = express();

fs.readFile("./src/lorem.txt", "utf8", (err, data) => {
	if (err) throw err;
	console.log(data);
});

fs.appendFile("./src/lorem.txt", "appended", (err) => {
	if (err) throw err;
	console.log("File appended");
});

fs.writeFile("./src/lorem.txt", "Hello World!", (err) => {
	if (err) throw err;
	console.log("File written");
});

app.get("/", (req, res) => {
	res.send("hello");
});

app.listen(8080, () => {
	console.log("Server started on port 8080");
});
