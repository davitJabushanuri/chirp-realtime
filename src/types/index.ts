import type { Message, User, Conversation } from "@prisma/client";

export interface IMessage extends Message {
	sender: User;
	receiver: User;
	conversation: Conversation;
}

export type SocketEmitStatusPayload = {
	status: "sending" | "sent" | "seen" | "failed";
	message_id: string;
};

export type SocketEmitMessagePayload = {
	message: IMessage;
};
