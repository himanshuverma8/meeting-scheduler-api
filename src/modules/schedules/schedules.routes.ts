import express from "express";
import { createScheduleHandler } from "./schedules.controller.js";
import { authenticationMiddleware } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticationMiddleware);

router.post('/', createScheduleHandler);

export default router;