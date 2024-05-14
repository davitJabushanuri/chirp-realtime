import type {
	SocketEmitMessagePayload,
	SocketEmitStatusPayload,
} from "@/types";
import { logger } from "@/utils/logger";
import { postImage } from "@/utils/upload-image";
import type { Socket } from "socket.io";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const handleMessage = async (socket: Socket, message) => {
	console.log("message", message);
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
