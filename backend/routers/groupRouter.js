import { Router } from "express";
import {
  addMemberToGroup,
  addPendingTransaction,
  createGroupController,
  getGroupMembers,
  getGroup,
  listMyGroups,
  getGroupPendingTransactions,
  simplifyGroupPendingTransactions,
  removeGroup,
} from "../controllers/groupController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const groupRouter = Router();

groupRouter.use(authMiddleware);
groupRouter.post("/", createGroupController);
groupRouter.get("/", listMyGroups);
groupRouter.get("/:id", getGroup);
groupRouter.post("/:id/members", addMemberToGroup);
groupRouter.post("/:id/pending-transactions", addPendingTransaction);
groupRouter.get("/:id/members", getGroupMembers);
groupRouter.delete("/:id", removeGroup);
groupRouter.get("/:id/pending-transactions", getGroupPendingTransactions);
groupRouter.post("/:id/simplify-pending-transactions", simplifyGroupPendingTransactions);

export default groupRouter;
