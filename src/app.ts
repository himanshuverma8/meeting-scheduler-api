import express from "express";
import authRouter from "./modules/auth/auth.routes";
import schedulesRouter from "./modules/schedules/schedules.routes"
import eventTypesRouter from "./modules/event-types/event-types.routes";
import availabilityRouter from "./modules/availability/availability.routes";
import bookingsRouter from "./modules/bookings/bookings.routes";
import { errorHandler } from "./middleware/error.middleware";


const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
    return res.json({"message": "hi this is hv"});
})

app.use('/auth', authRouter);
app.use('/schedules', schedulesRouter);
app.use('/event-types', eventTypesRouter);
app.use('/availability', availabilityRouter);
app.use('/bookings', bookingsRouter);
app.use(errorHandler);


export default app;