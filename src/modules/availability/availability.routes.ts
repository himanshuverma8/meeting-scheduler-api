import express from "express";
import { getAvailableSlotsHandler } from "./availability.controller.js";

const router = express.Router();

router.get('/', getAvailableSlotsHandler);

export default router;