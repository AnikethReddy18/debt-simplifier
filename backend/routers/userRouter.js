import { Router } from "express";
import { getUserDetails } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const userRouter = Router();

userRouter.get("/:id", authMiddleware, getUserDetails);

export default userRouter;
