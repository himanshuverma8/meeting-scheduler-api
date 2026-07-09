import express from "express";
import authRouter from "./modules/auth/auth.routes.js"
import { errorHandler } from "./middleware/error.middleware.js";
import { env } from "./config/env.js";

const PORT = 3000;


const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    return res.json({"message": "hi this is hv"});
})

app.use('/auth', authRouter);
app.use(errorHandler);

app.listen(env.PORT, () => {
    console.log(`server is running on port ${env.PORT}`)
})