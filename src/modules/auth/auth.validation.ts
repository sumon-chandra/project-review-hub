import { z } from "zod";

const signupSchema = z.object({
	body: z.object({
		name: z
			.string()
			.trim()
			.min(2, "Name must be at least 2 characters long")
			.max(100, "Name cannot exceed 100 characters"),
		email: z.string().trim().email("Please provide a valid email address").toLowerCase(),
		password: z
			.string()
			.min(6, "Password must be at least 6 characters long")
			.max(100, "Password cannot exceed 100 characters"),
	}),
});

const loginSchema = z.object({
	body: z.object({
		email: z.string().trim().email("Please provide a valid email address").toLowerCase(),
		password: z.string().min(1, "Password is required"),
	}),
});

export const authValidation = {
	signupSchema,
	loginSchema,
};

export type SignupInput = z.infer<typeof signupSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
