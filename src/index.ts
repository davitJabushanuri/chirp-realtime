import express from "express";
import { logger } from "./utils/logger";

import { attachWebsocketServer } from "./api/v1/websockets/index.js";

const PORT = process.env.PORT || 8080;

const app = express();

const server = app.listen(PORT, () => {
	logger.info(`Server listening on port ${PORT}`);
});

attachWebsocketServer(server);
