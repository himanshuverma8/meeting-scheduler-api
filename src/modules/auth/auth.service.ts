import jwt from "jsonwebtoken";
import { db } from "../../db/index";
import { users } from "../../db/schema";
import { AppError } from "../../lib/errors";
import type { LoginInput, SignupInput } from "./auth.validation";
import argon2 from "argon2";
import { env } from "../../config/env";
import { eq } from "drizzle-orm";

export async function signup(data: SignupInput) {
    const {name, email, password} = data;
    //existing user check
    const [existingUser] = await db.select().from(users)
        .where(eq(users.email, email));
    if (existingUser) throw new AppError(409, "CONFLICT_ERROR", "user already exist");

    const hashedPassword = await argon2.hash(password);

    const [newUser] = await db.insert(users).values({
        name,
        email,
        hashedPassword
    }).returning();

    const token = jwt.sign({ userId: newUser?.id}, env.JWT_SECRET_KEY, { expiresIn: "1d" });

    return { user: { id: newUser?.id, name: newUser?.name, email: newUser?.email }, token };
}

export async function login(data: LoginInput) {
    const {email, password} = data;

    const [existingUser] = await db.select().from(users)
        .where(eq(users.email, email));

    if (!existingUser) throw new AppError(401, "INVALID_CREDENTIALS", "invalid email or password");

    const isCorrectPassword = await argon2.verify(existingUser?.hashedPassword, password);    
    if (!isCorrectPassword) throw new AppError(401, "INVALID_CREDENTIALS", "invalid email or password");

    const token = jwt.sign({ userId: existingUser?.id}, env.JWT_SECRET_KEY, { expiresIn: "1d" });

    return { user: { id: existingUser?.id, name: existingUser?.name, email: existingUser?.email }, token };
}