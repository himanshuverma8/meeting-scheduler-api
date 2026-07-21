import z from "zod";
import { DateTime } from "luxon";

export const bookingPostRequestBodySchema = z.object({
    event_type_id: z.uuid(),
    start_time: z.iso.datetime({ offset: true }),
    invitee_name: z.string(),
    invitee_email: z.email().toLowerCase(),
    invitee_timezone: z.string().refine(
        (tz) => DateTime.local().setZone(tz).isValid,
        { message: "invalid IANA timezone" }
    )
});

export type bookingInput = z.infer<typeof bookingPostRequestBodySchema>;