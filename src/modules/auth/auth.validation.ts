import z from "zod";

export const signupPostRequestBodySchema = z.object({
    name: z.string(),
    email: z.email().toLowerCase(),
    password: z.string().min(8)
})

export const loginPostRequestBodySchema = z.object({
    email: z.email().toLowerCase(),
    password: z.string().min(8)
})

export type SignupInput = z.infer<typeof signupPostRequestBodySchema>;

export type LoginInput = z.infer<typeof loginPostRequestBodySchema>;