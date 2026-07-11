import express from "express";
import { createScheduleHandler, deleteScheduleHandler, getScheduleByIdHandler, getSchedulesHandler, updateScheduleHandler } from "./schedules.controller";
import { authenticationMiddleware } from "../../middleware/auth.middleware";

const router = express.Router();

router.use(authenticationMiddleware);

router.post('/', createScheduleHandler);

router.get('/', getSchedulesHandler);

router.get('/:id', getScheduleByIdHandler);

router.patch('/:id', updateScheduleHandler);

router.delete('/:id', deleteScheduleHandler);


export default router;