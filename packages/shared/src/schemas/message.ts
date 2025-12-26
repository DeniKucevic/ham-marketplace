import { z } from "zod";

export const CreateMessageSchema = z.object({
  listing_id: z.string().uuid(),
  recipient_id: z.string().uuid(),
  content: z.string().min(1).max(2000),
});

export type CreateMessage = z.infer<typeof CreateMessageSchema>;
