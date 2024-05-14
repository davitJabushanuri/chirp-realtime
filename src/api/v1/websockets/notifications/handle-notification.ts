import type { Socket } from "socket.io";

export const handleNotification = async (socket: Socket, notification) => {
	console.log("notification", notification);

	socket.broadcast
		.to(socket.conversation_id)
		.emit("notification", { notification });
	return socket.emit("status", {
		status: "sent",
		notification_id: notification.id,
	});
};
