import { z } from "zod";

export const userRegisterSchema = z.object({
  firstName: z.string().min(3, "Name must be at least 3 characters"),
  lastName: z.string(),
  email: z.string().email("Invalid email"),
  password: z.string().min(6),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
  role: z.string().default("customer"),
});

export const verifyEmailOptSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6),
});
