import { Router } from "express";
import {
  addMemberToGroup,
  addGroupTransaction,
  createGroupController,
  getGroupMembers,
  getGroupTransactions,
  removeGroup,
} from "../controllers/groupController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const groupRouter = Router();

groupRouter.use(authMiddleware);
groupRouter.post("/", createGroupController);
groupRouter.post("/:id/members", addMemberToGroup);
groupRouter.post("/:id/transactions", addGroupTransaction);
groupRouter.get("/:id/members", getGroupMembers);
groupRouter.delete("/:id", removeGroup);
groupRouter.get("/:id/transactions", getGroupTransactions);

export default groupRouter;
