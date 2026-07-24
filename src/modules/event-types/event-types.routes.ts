import express from "express";
import { createEventTypeHandler, deleteEventTypeHandler, getEventTypesByIdHandler, getEventTypesHandler, updateEventTypeHandler } from "./event-types.controller";
import { authenticationMiddleware } from "../../middleware/auth.middleware";

const router = express.Router();

router.use(authenticationMiddleware);

router.post('/', createEventTypeHandler);

router.get('/', getEventTypesHandler);

router.get('/:id', getEventTypesByIdHandler);

router.patch('/:id', updateEventTypeHandler);

router.delete('/:id', deleteEventTypeHandler);

export default router;