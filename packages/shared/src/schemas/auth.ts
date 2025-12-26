import { z } from "zod";
import { CallsignSchema } from "./profile";

export const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  callsign: CallsignSchema.optional().or(z.literal("")), // ← Promeni ovo
  display_name: z.string().min(2, "Display name must be at least 2 characters"),
});

export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignUp = z.infer<typeof SignUpSchema>;
export type SignIn = z.infer<typeof SignInSchema>;
