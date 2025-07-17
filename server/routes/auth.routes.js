import express from "express";
import { registerUser, loginUser, logoutUser, sendVerificationOtp, verifyEmail } from "../controllers/auth.controller.js";
import userAuth from "../middlewares/userAuth.middleware.js";

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.post('/send-verification-otp', userAuth, sendVerificationOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);



export default authRouter;