import type { Socket } from "socket.io";

export const handleTyping = (socket: Socket, typing: string) => {
	socket.broadcast.to(socket.conversation_id).emit("typing", typing);
};
