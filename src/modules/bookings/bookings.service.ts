import { eq } from "drizzle-orm";
import { db } from "../../db";
import { bookings, event_types } from "../../db/schema";
import type { bookingInput } from "./bookings.validation";
import { AppError } from "../../lib/errors";

export async function createBooking(data: bookingInput, idempotencyKey?: string) {
    //create a booking
    const [eventDetails] = await db.select({
        duration: event_types.duration,
        user_id: event_types.user_id
    }).from(event_types)
    .where(eq(event_types.id, data.event_type_id))

    if (!eventDetails) {
        throw new AppError(404, "NOT_FOUND", "event details not found");
    }
    const duration = eventDetails.duration;
    const startTime = new Date(data.start_time);
    const endTime = new Date(startTime.getTime() + duration * 60_000);

    //precheck
    if (idempotencyKey) {
        const [existing] = await db.select().from(bookings)
            .where(eq(bookings.idempotency_key, idempotencyKey));
        if (existing) return { booking: existing };    
    }
    

    try {
        const [newBooking] = await db.insert(bookings)
        .values({
            host_id: eventDetails.user_id,
            idempotency_key: idempotencyKey ?? null,
            event_type_id: data.event_type_id,
            start_time: startTime,
            end_time: endTime,
            duration,
            invitee_name: data.invitee_name,
            invitee_email: data.invitee_email,
            invitee_timezone: data.invitee_timezone
        })
        .returning();



    if (!newBooking) {
        throw new AppError(500, "INTERNAL_ERROR", "failed to create booking");
    }    
    return { booking: newBooking };
    } catch (err: any) {
        if (err instanceof AppError) throw err;
        if (idempotencyKey) {
            const [existing] = await db.select().from(bookings)
                .where(eq(bookings.idempotency_key, idempotencyKey));

         if(existing) return { booking: existing };       
        }
        if (err?.cause?.code === "23P01") {
            throw new AppError(409, "CONFLICT", "this slot was just booked");
        }
        throw err;
    }
}