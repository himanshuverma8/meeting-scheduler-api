import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import schedulesRouter from "./modules/schedules/schedules.routes.js"
import eventTypesRouter from "./modules/event-types/event-types.routes.js";
import availabilityRouter from "./modules/availability/availability.routes.js";
import bookingsRouter from "./modules/bookings/bookings.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { sql } from "drizzle-orm";
import { db } from "./db/index.js";

const app = express();

app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await db.execute(sql`select 1`);
    return res.status(200).json({ status: "ok", db: "up" });
  } catch {
    return res.status(503).json({ status: "error", db: "down" });
  }
});
app.use('/auth', authRouter);
app.use('/schedules', schedulesRouter);
app.use('/event-types', eventTypesRouter);
app.use('/availability', availabilityRouter);
app.use('/bookings', bookingsRouter);
app.use(errorHandler);


export default app;