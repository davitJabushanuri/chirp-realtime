export interface IMessage {
	text: string;
	image: Buffer | null;
	image_width: number | null;
	image_height: number | null;
	conversation_id: string;
	sender_id: string;
	receiver_id: string;
}

export interface IStatus {
	status: "sending" | "sent" | "seen" | "failed";
	message_id: string;
}

export interface ITyping {
	typing: string;
}
