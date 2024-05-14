import { Server } from "socket.io";
import { chatNamespace } from "./chat";
import { notificationsNamespace } from "./notifications";

export const attachWebsocketServer = (server) => {
	const io = new Server(server, {
		cors: {
			origin: process.env.CLIENT_URL,
			methods: ["GET", "POST"],
		},
		connectionStateRecovery: {},
	});

	chatNamespace(io);
	notificationsNamespace(io);
};
