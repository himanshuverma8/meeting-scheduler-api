import type {Request, Response, NextFunction } from "express";
import { createEventTypePostRequestBodySchema, updateEventTypePostRequestBodySchema } from "./event-types.validation";
import { createEventType, getEventTypes, getEventTypesById, updateEventType } from "./event-types.service";
import { AppError } from "../../lib/errors";


export async function createEventTypeHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const result = createEventTypePostRequestBodySchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ error: result.error.flatten() });
    }

    if (!req.user) {
          throw new AppError(401, "UNAUTHORIZED", "authentication required");
        }  

    const data = await createEventType(result.data, req.user.id);
    return res.status(201).json({ success: true, data }); 
    } catch (err) {
        next(err);
    }   
}

export async function getEventTypesHandler(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
          throw new AppError(401, "UNAUTHORIZED", "authentication required");
        }  

        const data = await getEventTypes(req.user.id);

        return res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function getEventTypesByIdHandler(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) {
          throw new AppError(401, "UNAUTHORIZED", "authentication required");
        } 
        const eventTypeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!eventTypeId) {
        return res.status(400).json({ error: "event_type id doesn't exist"})
    }

    const data = await getEventTypesById(eventTypeId, req.user.id);

    return res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

export async function updateEventTypeHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const result = updateEventTypePostRequestBodySchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ error: result.error.flatten() });
    }

    if (!req.user) {
          throw new AppError(401, "UNAUTHORIZED", "authentication required");
        }  

    const eventTypeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!eventTypeId) {
        return res.status(400).json({ error: "event_type id doesn't exist"})
    }

    const data = await updateEventType(result.data, eventTypeId, req.user.id);
    return res.status(200).json({ success: true, data }); 
    } catch (err) {
        next(err);
    }   
}

