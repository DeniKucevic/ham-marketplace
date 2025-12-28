import { z } from "zod";

export const CallsignSchema = z
  .string()
  .regex(/^[A-Z0-9]{3,7}$/i, "Invalid callsign format")
  .transform((val) => val.toUpperCase());

export const CreateProfileSchema = z.object({
  callsign: CallsignSchema.optional(),
  display_name: z.string().min(2).max(100),
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
  email: z.string().email().max(255).optional(),
  phone: z.string().max(50).optional(),
  show_email: z.boolean().default(false),
  show_phone: z.boolean().default(false),
  location_city: z.string().max(100).optional(),
  location_country: z.string().max(100).optional(),
});

export const UpdateProfileSchema = CreateProfileSchema.partial();

export type CreateProfile = z.infer<typeof CreateProfileSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
