import { logger } from "@/utils/logger";
import type { Socket } from "socket.io";
import { prisma } from "@/lib/prisma";
import { messageSchema } from "./schemas/message-schema";
import type { IMessage } from "./types";

export const handleMessage = async (socket: Socket, message: IMessage) => {
	try {
		messageSchema.parse(message);

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
			.emit("message", { message: newMessage });

		return socket.emit("status", {
			status: "sent",
			message_id: message.id,
		});
	} catch (error) {
		if (error instanceof Error) {
			logger.error(error.message);
			return socket.emit("status", {
				status: "failed",
				message_id: message.id,
			});
		} else {
			throw error;
		}
	}
};
