import { db } from "../../db";
import { and, eq } from "drizzle-orm";
import { event_types, schedules } from "../../db/schema";
import type {
  CreateEventTypeInput,
  UpdateEventTypeInput,
} from "./event-types.validation";
import { AppError } from "../../lib/errors";

export async function createEventType(
  data: CreateEventTypeInput,
  userId: string,
) {
  const [schedule] = await db
    .select()
    .from(schedules)
    .where(
      and(eq(schedules.id, data.schedule_id), eq(schedules.user_id, userId)),
    );

  if (!schedule) {
    throw new AppError(404, "NOT_FOUND", "schedule not found");
  }

  const [event] = await db
    .insert(event_types)
    .values({
      ...data,
      user_id: userId,
    })
    .returning();

  if (!event)
    throw new AppError(500, "INTERNAL_ERROR", "failed to create event type");

  return { event_types: event };
}

export async function getEventTypes(userId: string) {
    const allEventsTypes = await db.select().from(event_types)
        .where(eq(event_types.user_id, userId));

    return { event_types : allEventsTypes };    
}

export async function getEventTypesById(eventTypeId: string, userId: string) {
    const [event] = await db.select().from(event_types)
        .where(and(eq(event_types.id, eventTypeId), eq(event_types.user_id, userId)))
    
    return { event_types: event };
}

export async function updateEventType(
  data: UpdateEventTypeInput,
  eventTypeId: string,
  userId: string,
) {
  if (data.schedule_id) {
    const [schedule] = await db
      .select()
      .from(schedules)
      .where(
        and(eq(schedules.id, data.schedule_id), eq(schedules.user_id, userId)),
      );

    if (!schedule) {
      throw new AppError(404, "NOT_FOUND", "schedule not found");
    }
  }

  const [event] = await db
    .update(event_types)
    .set({
      ...data,
    })
    .where(
      and(eq(event_types.user_id, userId), eq(event_types.id, eventTypeId)),
    )
    .returning();

  if (!event) throw new AppError(404, "NOT_FOUND", "event type not found");

  return { event_types: event };
}
