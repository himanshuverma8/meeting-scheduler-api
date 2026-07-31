import type { Response, Request, NextFunction } from "express";
import { signup, login } from "./auth.service.js";
import { signupPostRequestBodySchema, loginPostRequestBodySchema } from "./auth.validation.js";

export async function signupHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const result = signupPostRequestBodySchema.safeParse(req.body);

        if (!result.success) {
           return res.status(400).json({ error: result.error.flatten() })
        }

        const data = await signup(result.data);

        return res.status(201).json({ success: true, ...data})
    } catch (err) {
        next(err)
    }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const result = loginPostRequestBodySchema.safeParse(req.body);

        if(!result.success) {
            return res.status(400).json({ error: result.error.flatten() })
        }

        const data = await login(result.data);

        return res.status(200).json({ success: true, ...data});
    } catch (err) {
        next(err);
    }
}
