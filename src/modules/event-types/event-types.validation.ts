import z from "zod";

export const createEventTypePostRequestBodySchema = z.object({
    schedule_id: z.uuid(),
    name: z.string().min(1),
    duration: z.number().int().positive(),
    buffer_before: z.number().int().min(0),
    buffer_after: z.number().int().min(0),
    min_notice_minutes: z.number().int().min(0),
    max_days_in_advance: z.number().int().positive()
});

export const updateEventTypePostRequestBodySchema = z.object({
    schedule_id: z.uuid().optional(),
    name: z.string().min(1).optional(),
    duration: z.number().int().positive().optional(),
    buffer_before: z.number().int().min(0).optional(),
    buffer_after: z.number().int().min(0).optional(),
    min_notice_minutes: z.number().int().min(0).optional(),
    max_days_in_advance: z.number().int().positive().optional()
});

export type CreateEventTypeInput = z.infer<typeof createEventTypePostRequestBodySchema>;
export type UpdateEventTypeInput = z.infer<typeof updateEventTypePostRequestBodySchema>;