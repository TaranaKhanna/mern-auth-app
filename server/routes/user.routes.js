import express from "express";
import { getUserDetail } from "../controllers/user.controller.js";
import userAuth from "../middlewares/userAuth.middleware.js";

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserDetail);

export default userRouter;