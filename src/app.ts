import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import schedulesRouter from "./modules/schedules/schedules.routes.js"
import { errorHandler } from "./middleware/error.middleware.js";


const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    return res.json({"message": "hi this is hv"});
})

app.use('/auth', authRouter);
app.use('/schedules', schedulesRouter);
app.use(errorHandler);


export default app;