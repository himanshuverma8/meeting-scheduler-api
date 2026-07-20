import z from "zod";
import { DateTime } from "luxon";

export const availabilityGetRequestQuerySchema = z.object({
    eventId: z.uuid(),
    startDate: z.iso.datetime(),
    endDate: z.iso.datetime(),
    inviteeTimeZone: z.string().refine(
        (tz) => DateTime.local().setZone(tz).isValid,
        { message: "invalid IANA timezone" },
    )
});