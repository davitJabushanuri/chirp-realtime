import express from "express";
import { logger } from "./utils/logger";

import { chatRouter as v1ChatRoutes } from "@/api/v1/routes/chat-routes.js";
import { attachWebsocketServer } from "./api/v1/websockets/index.js";

const PORT = process.env.PORT || 8080;

const app = express();

app.use("/api/v1/chat", v1ChatRoutes);

export const expressServer = app.listen(PORT, () => {
	logger.info(`Server listening on port ${PORT}`);
});

attachWebsocketServer(expressServer);
