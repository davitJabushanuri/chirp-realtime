import express from "express";
export const v1Router = express.Router();

v1Router.route("/").get((req, res) => {
	res.send("Hello World");
});
