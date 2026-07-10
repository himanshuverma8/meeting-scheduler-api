import express from "express";
import { createScheduleHandler, deleteScheduleHandler, updateScheduleHandler } from "./schedules.controller.js";
import { authenticationMiddleware } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticationMiddleware);

router.post('/', createScheduleHandler);

router.patch('/:id', updateScheduleHandler);

router.delete('/:id', deleteScheduleHandler);

export default router;