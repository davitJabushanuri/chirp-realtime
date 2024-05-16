import { z } from "zod";

export const messageSchema = z.object({
	id: z.string().cuid(),
	text: z.string().nullable(),
	image: z.string().nullable(),
	image_width: z.number().nullable(),
	image_height: z.number().nullable(),
	conversation_id: z.string(),
	sender_id: z.string().cuid(),
	receiver_id: z.string().cuid(),
});
