import { Router } from "express";
import { getUserDetails } from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/:id", getUserDetails);

export default userRouter;
