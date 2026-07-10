import { db } from "../../db/index.js";
import { schedule_entries, schedules } from "../../db/schema.js";
import { AppError } from "../../lib/errors.js";
import type { CreateScheduleInput } from "./schedules.validation.js";

export async function createSchedule(
  data: CreateScheduleInput,
  userId: string,
) {
  //transaction
  return await db.transaction(async (tx) => {
    //parent create
    const [schedule] = await tx
      .insert(schedules)
      .values({
        user_id: userId,
        name: data.name,
        timezone: data.timezone,
      })
      .returning();

    if (!schedule)
      throw new AppError(500, "INTERNAL_ERROR", "failed to create schedule");

    const insertedEntries = await tx
      .insert(schedule_entries)
      .values(
        data.entries.map((entry) => {
          return {
            ...entry,
            schedule_id: schedule.id,
          };
        }),
      )
      .returning();

    return { schedule, insertedEntries };
  });
}
