import { Router } from "express";
import {
  login,
  signup,
  validateLogin,
  validateSignup,
} from "../controllers/authController.js";

const authRouter = Router();

authRouter.post("/signup", validateSignup, signup);
authRouter.post("/login", validateLogin, login);

export default authRouter;
