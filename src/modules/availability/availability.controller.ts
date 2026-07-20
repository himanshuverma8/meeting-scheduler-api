import type { Request, Response, NextFunction } from "express";
import { availabilityGetRequestQuerySchema } from "./availability.validation";
import { getAvailableSlots } from "./availability.service";
import { DateTime } from "luxon";
import { AppError } from "../../lib/errors";

export async function getAvailableSlotsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = availabilityGetRequestQuerySchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    const { eventId, startDate, endDate, inviteeTimeZone } = result.data;
    const start = DateTime.fromISO(startDate).toMillis();
    const end = DateTime.fromISO(endDate).toMillis();
    if (start >= end)
      throw new AppError(400, "BAD_REQUEST", "start must be before end");
    const data = await getAvailableSlots(eventId, start, end, inviteeTimeZone);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
