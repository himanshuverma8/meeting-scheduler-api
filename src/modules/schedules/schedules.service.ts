import { eq, and, inArray } from "drizzle-orm";
import { db } from "../../db/index";
import { schedule_entries, schedules } from "../../db/schema";
import { AppError } from "../../lib/errors";
import type { CreateScheduleInput, UpdateScheduleInput } from "./schedules.validation";

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

    return { schedule, entries: insertedEntries };
  });
}


export async function getSchedules(userId: string) {
    const allSchedules = await db.select().from(schedules)
        .where(eq(schedules.user_id, userId))

    const scheduleIds = allSchedules.map((s) => s.id);    

    const allEntries = await db.select().from(schedule_entries)
        .where(inArray(schedule_entries.schedule_id, scheduleIds));

    const entriesBySchedule = new Map<string, typeof allEntries>();
    for(const entry of allEntries) {
        const listOfSchedules = entriesBySchedule.get(entry.schedule_id) ?? [];
        listOfSchedules.push(entry);
        entriesBySchedule.set(entry.schedule_id, listOfSchedules);
    }

    const allSchedulesWithEntries = allSchedules.map((schedule) => ({
        ...schedule,
        entries: entriesBySchedule.get(schedule.id) ?? []
    }))

    return { schedules: allSchedulesWithEntries };
}

export async function getSchedulesById(scheduleId: string, userId: string){
    const [schedule] = await db.select().from(schedules)
        .where(and(eq(schedules.user_id, userId), eq(schedules.id, scheduleId)));

    if (!schedule) {
        throw new AppError(404, "NOT_FOUND", "schedule not found");
    }
    const scheduleEntry = await db.select().from(schedule_entries)
    .where(eq(schedule_entries.schedule_id, schedule.id));
    
    return { ...schedule, entries: scheduleEntry };
}


export async function updateSchedule(data: UpdateScheduleInput, scheduleId: string, userId: string) {
    return await db.transaction(async (tx) => {
        //first updating the user schedule
        const [schedule] = await tx.update(schedules)
            .set({
                name: data.name,
                timezone: data.timezone
            })
            .where(and(eq(schedules.user_id, userId), eq(schedules.id, scheduleId)))
            .returning();

        if (!schedule) throw new AppError(404, "NOT_FOUND", "schedule not found");


        //remove old list of schedule entries
        await tx.delete(schedule_entries).where(
            eq(schedule_entries.schedule_id, scheduleId)
        )  
        
        //insert new list of schedules entries
        const insertedEntries = await tx.insert(schedule_entries).values(
            data.entries.map((entry) => ({
                ...entry,
                schedule_id: scheduleId
            }))
        ).returning();

        return {schedule, entries: insertedEntries};
    })
}

export async function deleteSchedule(scheduleId: string, userId: string) {
    const [deletedSchedule] = await db.delete(schedules)
        .where(and(eq(schedules.id, scheduleId), eq(schedules.user_id, userId)))
        .returning();

    if (!deletedSchedule) throw new AppError(404, "NOT_FOUND", "schedule not found");

    return { schedule: deletedSchedule };   
}