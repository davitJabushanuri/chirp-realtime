import type { Socket } from "socket.io";
import { handleMessage } from "./handle-message";
import { handleStatus } from "./handle-status";
import { handleTyping } from "./handle-typing";

export const chatNamespace = (io) => {
	const chat = io.of("/api/v1/chat");

	chat.on("connection", (socket: Socket) => {
		io.use(async (socket: Socket, next) => {
			const conversation_id = socket.handshake.auth.conversation_id;
			if (!conversation_id) {
				return next(new Error("invalid id"));
			}

			socket.conversation_id = conversation_id;
			next();
		});

		socket.join(socket.conversation_id);

		socket.on("message", (message) => handleMessage(socket, message));
		socket.on("status", (status) => handleStatus(socket, status));
		socket.on("typing", (typing) => handleTyping(socket, typing));
	});
};
