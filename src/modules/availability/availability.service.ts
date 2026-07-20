import { eq } from "drizzle-orm";
import { db } from "../../db";
import { bookings, event_types, schedule_entries, schedules } from "../../db/schema";
import { AppError } from "../../lib/errors";
import { computeSlots, resolveWindowsForDate } from "./availability.engine";
import { DateTime } from "luxon";
import type { Interval, EventConfig } from "./availability.engine";


export async function getAvailableSlots(eventTypeId: string, startDate: number, endDate: number, inviteeTimeZone: string) {

    const [eventDetails] = await db.select().from(event_types)
        .where(eq(event_types.id, eventTypeId));
    if (!eventDetails) throw new AppError(404, "NOT_FOUND", "event type not found");

    const [scheduleDetails] = await db.select().from(schedules)
        .where(eq(schedules.id, eventDetails.schedule_id));

    if (!scheduleDetails) throw new AppError(404, "NOT_FOUND", "scheduleDetails not found");    

    const scheduleListDetails = await db.select({
        day_of_week: schedule_entries.day_of_week,
        specific_date: schedule_entries.specific_date,
        start_time: schedule_entries.start_time,
        end_time: schedule_entries.end_time
    }).from(schedule_entries)
        .where(eq(schedule_entries.schedule_id, eventDetails.schedule_id));

    const allBookings = await db
        .select({ start_time: bookings.start_time, end_time: bookings.end_time })
        .from(bookings)
        .innerJoin(event_types, eq(bookings.event_type_id, event_types.id))
        .where(eq(event_types.user_id, eventDetails.user_id));
    const blockedBookings: Interval[] = allBookings.map((b): Interval => [b.start_time.getTime(), b.end_time.getTime()]);        
    const config: EventConfig = {
        duration: eventDetails.duration * 60_000,
        bufferBefore: eventDetails.buffer_before * 60_000,
        bufferAfter: eventDetails.buffer_after * 60_000,
        minNotice: eventDetails.min_notice_minutes * 60_000,
        maxDays: eventDetails.max_days_in_advance * 86_400_000
    }    
    //events, schedule details, scheduleListDetails
    const zone = scheduleDetails.timezone;
    let cursor = DateTime.fromMillis(startDate).setZone(zone).startOf("day");
    const lastDay = DateTime.fromMillis(endDate).setZone(zone).startOf("day");

    const allSlots: number[] = [];
    const now = Date.now();
    while (cursor <= lastDay) {
        const dateStr = cursor.toISODate();
        if (dateStr) {
            const windows = resolveWindowsForDate(scheduleListDetails, dateStr, zone);
            for (const window of windows) {
                allSlots.push(...computeSlots({ now, window, bookings: blockedBookings, config, queryStart: startDate, queryEnd: endDate}));
            }
        }
        cursor = cursor.plus({ days: 1 });
    }
   return allSlots.map((ms) => DateTime.fromMillis(ms).setZone(inviteeTimeZone).toISO()!);
}