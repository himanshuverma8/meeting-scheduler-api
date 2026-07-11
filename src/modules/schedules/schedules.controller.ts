import type { Request, Response, NextFunction } from "express";
import { createScheduleRequestBodySchema } from "./schedules.validation";
import { createSchedule, deleteSchedule, getSchedules, getSchedulesById, updateSchedule } from "./schedules.service";
import { AppError } from "../../lib/errors";

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

    return res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getSchedulesHandler(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "authentication required");
    }
    const data = await getSchedules(req.user.id);
    return res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function getScheduleByIdHandler(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "authentication required");
    }

    const scheduleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!scheduleId) {
        return res.status(400).json({ error: "schedule id doesn't exist"})
    };

    const data = await getSchedulesById(scheduleId, req.user.id);

    return res.status(200).json({ success: true, data});
    } catch (err) {
        next(err);
    }
}

export async function updateScheduleHandler(req: Request, res: Response, next: NextFunction) {
   try {
    const result = createScheduleRequestBodySchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }

    if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "authentication required");
    }

    const scheduleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!scheduleId) {
        return res.status(400).json({ error: "schedule id doesn't exist"})
    };

    const data = await updateSchedule(result.data, scheduleId, req.user.id);

    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteScheduleHandler(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "authentication required");
    }

    const scheduleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!scheduleId) {
        return res.status(400).json({ error: "schedule id doesn't exist"})
    };
    const data = await deleteSchedule(scheduleId, req.user.id);

    return res.status(200).json({ success: true, data});
    } catch (err) {
        next(err);
    }
}
