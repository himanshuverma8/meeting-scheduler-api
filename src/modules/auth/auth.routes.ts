import express from "express";
import { signupHandler, loginHandler } from "./auth.controller";
const router = express.Router();

//signup
router.post('/signup', signupHandler);

//login
router.post('/login', loginHandler);

export default router;