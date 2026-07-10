import type { Request, Response, NextFunction } from "express";
import { createScheduleRequestBodySchema } from "./schedules.validation.js";
import { createSchedule } from "./schedules.service.js";
import { AppError } from "../../lib/errors.js";

export async function createScheduleHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = createScheduleRequestBodySchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }

    if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "authentication required");
    }

    const data = await createSchedule(result.data, req.user.id);

    return res.status(201).json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
}
