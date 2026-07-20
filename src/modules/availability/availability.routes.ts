import express from "express";
import { getAvailableSlotsHandler } from "./availability.controller";

const router = express.Router();

router.get('/', getAvailableSlotsHandler);

export default router;