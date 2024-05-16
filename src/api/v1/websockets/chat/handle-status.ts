import { logger } from "@/utils/logger";
import { prisma } from "@/lib/prisma";
import type { Socket } from "socket.io";
import type { IStatus } from "./types";

export const handleStatus = async (socket: Socket, data: IStatus) => {
	try {
		if (data.status === "sent" || data.status === "failed") {
			socket.emit("status", data);
		} else {
			socket.broadcast.to(socket.conversation_id).emit("status", data);

			await prisma.message.update({
				where: { id: data.message_id },
				data: { status: "seen" },
			});
		}
	} catch (error) {
		if (error instanceof Error) {
			logger.error(error.message);
			socket.emit("error", {
				message: "Failed to update message status",
				error: error.message,
			});
		} else {
			throw error;
		}
	}
};
