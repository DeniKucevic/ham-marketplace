import { z } from "zod";

export const CallsignSchema = z
  .string()
  .regex(/^[A-Z0-9]{3,7}$/i, "Invalid callsign format")
  .transform((val) => val.toUpperCase());

export const CreateProfileSchema = z.object({
  callsign: CallsignSchema,
  display_name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  location: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
  qth_locator: z
    .string()
    .regex(/^[A-R]{2}[0-9]{2}[A-X]{2}$/i)
    .optional(),
});

export const UpdateProfileSchema = CreateProfileSchema.partial();

export type CreateProfile = z.infer<typeof CreateProfileSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
