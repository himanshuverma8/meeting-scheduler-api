import express from "express";
import { createBookingHandler } from "./bookings.controller";

const router = express.Router();

router.post('/', createBookingHandler);

export default router;