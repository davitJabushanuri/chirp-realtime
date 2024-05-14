import { handleNotification } from "./handle-notification";

export const notificationsNamespace = (io) => {
	const notifications = io.of("/api/v1/notifications");

	notifications.on("connection", (socket) => {
		socket.on("notification", (notification) =>
			handleNotification(socket, notification),
		);
	});
};
