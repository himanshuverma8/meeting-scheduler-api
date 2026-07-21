import { eq, and, lt, gt } from "drizzle-orm";
import { db } from "../../db";
import { bookings, event_types } from "../../db/schema";
import type { bookingInput } from "./bookings.validation";
import { AppError } from "../../lib/errors";

export async function createBooking(data: bookingInput) {
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

    //need to check if this is already booked then don't allow the booking
    //conflict check
    const conflict = await db.select({ id: bookings.id })
        .from(bookings)
        .innerJoin(event_types, eq(bookings.event_type_id, event_types.id))
        .where(and(
            eq(event_types.user_id, eventDetails.user_id),
            lt(bookings.start_time, endTime),
            gt(bookings.end_time, startTime)
        ));

    if (conflict.length > 0) {
        throw new AppError(409, "CONFLICT", "this slot is already booked");
    }    
    

    try {
        const [newBooking] = await db.insert(bookings)
        .values({
            host_id: eventDetails.user_id,
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
        if (err?.cause?.code === "23P01") {
            throw new AppError(409, "CONFLICT", "this slot was just booked");
        }
        throw err;
    }
}