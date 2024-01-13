import { prisma } from "@/lib/prisma";
import express from "express";
import { Server } from "socket.io";
import { logger } from "@/utils/logger";
import { z } from "zod";

const PORT = process.env.PORT || 8080;

const app = express();

const expressServer = app.listen(PORT, () => {
	logger.info(`Server listening on port ${PORT}`);
});

const io = new Server(expressServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

io.on("connection", async (socket) => {
	io.use(async (socket, next) => {
		const conversation_id = socket.handshake.auth.conversation_id;
		if (!conversation_id) {
			return next(new Error("invalid username"));
		}

		socket.conversation_id = conversation_id;
		next();
	});

	socket.join(socket.conversation_id);

	const onMessage = async (message) => {
		const messageSchema = z.object({
			text: z.string(),
			conversation_id: z.string(),
			sender_id: z.string().cuid(),
			receiver_id: z.string().cuid(),
		});

		const zod = messageSchema.safeParse(message);

		if (!zod.success) {
			console.log(zod.error.formErrors);
			return socket.emit("error", { error: zod.error.formErrors });
		}

		io.to(socket.conversation_id).emit("message", message);
		io.to(socket.conversation_id).emit("status", "sending");

		try {
			await prisma.message.create({
				data: {
					...message,
				},
			});
			io.to(socket.conversation_id).emit("status", "sent");
		} catch (error) {
			logger.error(error);
			io.to(socket.conversation_id).emit("status", "failed");
		}
	};

	const onStatus = (status: string) => {
		io.to(socket.conversation_id).emit("status", status);
	};

	const onTyping = (typing: string) => {
		io.to(socket.conversation_id).emit("typing", typing);
	};

	socket.on("message", (message) => onMessage(message));
	socket.on("status", (status) => onStatus(status));
	socket.on("typing", (typing) => onTyping(typing));
});
