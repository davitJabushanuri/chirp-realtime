import { z } from "zod";

export const messageSchema = z.object({
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
