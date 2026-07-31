import express from "express";
import { createBookingHandler } from "./bookings.controller.js";

const router = express.Router();

router.post('/', createBookingHandler);

export default router;