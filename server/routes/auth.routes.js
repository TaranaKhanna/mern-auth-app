import express from "express";
import { registerUser, loginUser, logoutUser, sendVerificationOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword } from "../controllers/auth.controller.js";
import userAuth from "../middlewares/userAuth.middleware.js";

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.post('/send-verification-otp', userAuth, sendVerificationOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.get('/is-auth', userAuth, isAuthenticated)
authRouter.post('/send-reset-otp', sendResetOtp)
authRouter.post('/reset-password', resetPassword)



export default authRouter;