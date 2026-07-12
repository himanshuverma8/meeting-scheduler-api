import express from "express";
import authRouter from "./modules/auth/auth.routes";
import schedulesRouter from "./modules/schedules/schedules.routes"
import eventTypesRouter from "./modules/event-types/event-types.routes";
import { errorHandler } from "./middleware/error.middleware";


const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
    return res.json({"message": "hi this is hv"});
})

app.use('/auth', authRouter);
app.use('/schedules', schedulesRouter);
app.use('/event-types', eventTypesRouter);
app.use(errorHandler);


export default app;