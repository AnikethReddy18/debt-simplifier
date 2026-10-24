import {
  addUserToGroup,
  createGroup,
  deleteGroup,
  getGroupById,
  getMembership,
  listGroupTransactions,
} from "../queries.js";

export async function createGroupController(req, res) {
  const { name } = req.body;
  const userId = req.user?.sub;

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Group name is required" });
  }

  if (!userId) {
    return res.status(401).json({ error: "Authentication is required" });
  }

  try {
    const group = await createGroup(name.trim());
    await addUserToGroup(userId, group.id);

    return res.status(201).json({
      ...group,
      createdBy: userId,
    });
  } catch (error) {
    console.error("Unable to create group:", error);
    return res.status(500).json({ error: "Unable to create group" });
  }
}

export async function addMemberToGroup(req, res) {
  const groupId = req.params.id;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      error: "userId is required",
    });
  }

  try {
    const group = await getGroupById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const membership = await getMembership(userId, groupId);
    if (membership) {
      return res.status(409).json({ error: "User is already in this group" });
    }

    const createdMembership = await addUserToGroup(userId, groupId);
    return res.status(201).json(createdMembership);
  } catch (error) {
    console.error("Unable to add user to group:", error);
    return res.status(500).json({ error: "Unable to add user to group" });
  }
}

export async function removeGroup(req, res) {
  try {
    const group = await deleteGroup(req.params.id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Unable to delete group:", error);
    return res.status(500).json({ error: "Unable to delete group" });
  }
}

export async function getGroupTransactions(req, res) {
  try {
    const group = await getGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const transactions = await listGroupTransactions(req.params.id);
    return res.json(transactions);
  } catch (error) {
    console.error("Unable to fetch group transactions:", error);
    return res.status(500).json({
      error: "Unable to fetch group transactions",
    });
  }
}

export default {
  createGroupController,
  addMemberToGroup,
  removeGroup,
  getGroupTransactions,
};