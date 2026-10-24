import { Router } from "express";
import {
  addMemberToGroup,
  createGroupController,
  getGroupTransactions,
  removeGroup,
} from "../controllers/groupController.js";

const groupRouter = Router();

groupRouter.post("/", createGroupController);
groupRouter.post("/:id/members", addMemberToGroup);
groupRouter.delete("/:id", removeGroup);
groupRouter.get("/:id/transactions", getGroupTransactions);

export default groupRouter;
