import type { SocketEmitStatusPayload } from "@/types";
import type { Socket } from "socket.io";
import { prisma } from "@/lib/prisma";
import { logger } from "@/utils/logger";

export const handleStatus = async (
	socket: Socket,
	data: SocketEmitStatusPayload,
) => {
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
