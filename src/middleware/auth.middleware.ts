import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";


export async function authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
    const tokenHeader = req.headers["authorization"];

    if (!tokenHeader?.startsWith("Bearer")) {
        return next(new AppError(401, "UNAUTHORIZED", "missing or malformed token header"));
    }

    const token = tokenHeader?.split(' ')[1];

    try {
        const { userId } = jwt.verify(token!, env.JWT_SECRET_KEY) as JwtPayload;

        req.user = { id: userId };

        return next();
        
    } catch (error) {
        return next(new AppError(401, "UNAUTHORIZED", "invalid or expired token"));
    }
}