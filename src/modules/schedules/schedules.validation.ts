import z from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; 

export const scheduleEntryInputSchema = z.object({
    day_of_week: z.number().int().min(0).max(6).optional(),
    specific_date: z.iso.date().optional(),
    start_time: z.string().regex(timeRegex, "start_time must be in HH:MM format"),
    end_time: z.string().regex(timeRegex, "end_time must be in HH:MM format")
}).superRefine((entry, ctx) => {
    const hasDay = entry.day_of_week !== undefined;
    const hasDate = entry.specific_date !== undefined;

    if (hasDay === hasDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "exactly one of day_of_week or specific_date is required, not both or neither",
            path: ["day_of_week"],
        })
    }
}).refine(entry => entry.end_time > entry.start_time, {
    message: "end_time must be after start_time"
})


export const createScheduleRequestBodySchema = z.object({
    name: z.string().min(1),
    timezone: z.string().min(1),
    entries: z.array(scheduleEntryInputSchema).min(1, "at least one entry is required")
})

export type CreateScheduleInput = z.infer<typeof createScheduleRequestBodySchema>;

export type UpdateScheduleInput = z.infer<typeof createScheduleRequestBodySchema>;

