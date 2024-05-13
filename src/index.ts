import type {
	SocketEmitMessagePayload,
	SocketEmitStatusPayload,
} from "../src/types/index.ts";
import { prisma } from "./lib/prisma";
import express from "express";
import { Server } from "socket.io";
import { logger } from "./utils/logger";
import { z } from "zod";
import { postImage } from "./utils/upload-image";

import { v1Router } from "@/api/v1/routes";

const PORT = process.env.PORT || 8080;

const app = express();

app.use("/api/v1", v1Router);

const expressServer = app.listen(PORT, () => {
	logger.info(`Server listening on port ${PORT}`);
});

const io = new Server(expressServer, {
	cors: {
		origin: process.env.CLIENT_URL,
		methods: ["GET", "POST"],
	},
	connectionStateRecovery: {},
});

io.on("connection", async (socket) => {
	io.use(async (socket, next) => {
		const conversation_id = socket.handshake.auth.conversation_id;
		if (!conversation_id) {
			return next(new Error("invalid id"));
		}

		socket.conversation_id = conversation_id;
		next();
	});

	socket.join(socket.conversation_id);

	const onMessage = async (message) => {
		const messageSchema = z.object({
			text: z.string(),
			image: z
				.custom((val) => Buffer.isBuffer(val), { message: "Must be a Buffer" })
				.nullable(),
			image_width: z.number().nullable(),
			image_height: z.number().nullable(),
			conversation_id: z.string(),
			sender_id: z.string().cuid(),
			receiver_id: z.string().cuid(),
		});

		const zod = messageSchema.safeParse(message);

		if (!zod.success) {
			logger.error(zod.error);
			return socket.emit("status", {
				status: "failed",
				message_id: message.id,
			} as SocketEmitStatusPayload);
		}

		try {
			if (message.image) {
				const { url } = await postImage(message.image, "messages");

				message.image = url;
			}

			const newMessage = await prisma.message.create({
				data: {
					id: message.id,
					text: message.text,
					conversation_id: message.conversation_id,
					sender_id: message.sender_id,
					receiver_id: message.receiver_id,
					image: message.image,
					image_width: message.image_width,
					image_height: message.image_height,
					status: "sent",
				},
			});

			socket.broadcast
				.to(socket.conversation_id)
				.emit("message", { message: newMessage } as SocketEmitMessagePayload);
			return socket.emit("status", {
				status: "sent",
				message_id: message.id,
			} as SocketEmitStatusPayload);
		} catch (error) {
			if (error instanceof Error) {
				logger.error(error.message);
				return socket.emit("status", {
					status: "failed",
					message_id: message.id,
				} as SocketEmitStatusPayload);
			} else {
				throw error;
			}
		}
	};

	const onStatus = async (data: SocketEmitStatusPayload) => {
		if (data.status === "sent" || data.status === "failed") {
			socket.emit("status", data);
		} else {
			socket.broadcast.to(socket.conversation_id).emit("status", data);

			try {
				await prisma.message.update({
					where: { id: data.message_id },
					data: { status: "seen" },
				});
			} catch (error) {
				if (error instanceof Error) {
					logger.error(error.message);
				} else {
					throw error;
				}
			}
		}
	};

	const onTyping = (typing: string) => {
		io.to(socket.conversation_id).emit("typing", typing);
	};

	socket.on("message", (message) => onMessage(message));
	socket.on("status", (status) => onStatus(status));
	socket.on("typing", (typing) => onTyping(typing));
});
