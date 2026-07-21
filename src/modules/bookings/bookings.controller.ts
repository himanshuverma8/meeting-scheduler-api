import type { Response, Request, NextFunction } from "express";
import { bookingPostRequestBodySchema } from "./bookings.validation";
import { createBooking } from "./bookings.service";

export async function createBookingHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const result = bookingPostRequestBodySchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error.flatten() });
    }
    const data = await createBooking(result.data);
    return res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
}