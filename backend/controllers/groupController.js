import {
  addUserToGroup,
  createGroup,
  createPendingTransaction,
  deleteGroup,
  deleteGroupPendingTransactions,
  getGroupById,
  getMembership,
  listGroupMembers,
  listGroupPendingTransactions,
  listUserGroups,
} from "../queries.js";
import { simplifyPendingTransactions } from "../simplifyPendingTransactions.js";

function publicGroup(group) {
  return { id: group.id, name: group.name };
}

export async function listMyGroups(req, res) {
  try {
    const memberships = await listUserGroups(req.user.sub);
    return res.json(memberships.map(({ group }) => publicGroup(group)));
  } catch (error) {
    console.error("Unable to fetch user groups:", error);
    return res.status(500).json({ error: "Unable to fetch groups" });
  }
}

export async function getGroup(req, res) {
  try {
    const group = await getGroupById(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    return res.json(publicGroup(group));
  } catch (error) {
    console.error("Unable to fetch group:", error);
    return res.status(500).json({ error: "Unable to fetch group" });
  }
}

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
  const userId = req.user?.sub;

  try {
    const group = await getGroupById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const membership = await getMembership(userId, groupId);
    if (membership) {
      return res.status(409).json({ error: "User is already in this group" });
    }

    await addUserToGroup(userId, groupId);
    return res.status(201).json({ group: publicGroup(group) });
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

export async function getGroupPendingTransactions(req, res) {
  try {
    const group = await getGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const pendingTransactions = await listGroupPendingTransactions(req.params.id);
    return res.json(pendingTransactions);
  } catch (error) {
    console.error("Unable to fetch group pending transactions:", error);
    return res.status(500).json({
      error: "Unable to fetch pending transactions",
    });
  }
}

export async function simplifyGroupPendingTransactions(req, res) {
  const groupId = req.params.id;
  const userId = req.user?.sub;

  try {
    const group = await getGroupById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (!userId || !(await getMembership(userId, groupId))) {
      return res.status(403).json({
        error: "You must be a member of the group",
      });
    }

    const pendingTransactions = await listGroupPendingTransactions(groupId);
    const simplifiedPendingTransactions = simplifyPendingTransactions(pendingTransactions);

    await deleteGroupPendingTransactions(groupId);

    const createdTransactions = [];
    for (const pendingTransaction of simplifiedPendingTransactions) {
      createdTransactions.push(await createPendingTransaction({
        ...pendingTransaction,
        description: "simplified",
        groupId,
      }));
    }

    return res.json(createdTransactions);
  } catch (error) {
    console.error("Unable to simplify group pending transactions:", error);
    return res.status(500).json({
      error: "Unable to simplify group pending transactions",
    });
  }
}

export async function getGroupMembers(req, res) {
  try {
    const group = await getGroupById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const members = await listGroupMembers(req.params.id);
    return res.json(members);
  } catch (error) {
    console.error("Unable to fetch group members:", error);
    return res.status(500).json({
      error: "Unable to fetch group members",
    });
  }
}

export async function addPendingTransaction(req, res) {
  const groupId = req.params.id;
  const { amount, description, fromId } = req.body ?? {};
  const recipientId = req.user?.sub;

  if (!Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({
      error: "amount must be a positive integer",
    });
  }

  if (!recipientId || !fromId) {
    return res.status(400).json({
      error: "fromId is required",
    });
  }

  if (description !== undefined &&
      description !== null &&
      typeof description !== "string") {
    return res.status(400).json({
      error: "description must be a string",
    });
  }

  try {
    const group = await getGroupById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const [recipientMembership, payerMembership] = await Promise.all([
      getMembership(recipientId, groupId),
      getMembership(fromId, groupId),
    ]);

    if (!recipientMembership) {
      return res.status(403).json({
        error: "You must be a member of the group",
      });
    }

    if (!payerMembership) {
      return res.status(403).json({
        error: "The other person must be a member of the group",
      });
    }

    const pendingTransaction = await createPendingTransaction({
      amount,
      description: description?.trim() || null,
      groupId,
      fromId,
      toId: recipientId,
    });

    return res.status(201).json(pendingTransaction);
  } catch (error) {
    console.error("Unable to add pending transaction:", error);
    return res.status(500).json({
      error: "Unable to add pending transaction",
    });
  }
}

export default {
  createGroupController,
  addMemberToGroup,
  removeGroup,
  getGroupMembers,
  addPendingTransaction,
  getGroupPendingTransactions,
  simplifyGroupPendingTransactions,
};