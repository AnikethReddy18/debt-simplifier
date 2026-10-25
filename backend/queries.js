import { db } from "./src/prisma/db.ts";

const User = db.orm.public.User;
const Group = db.orm.public.Group;
const GroupMember = db.orm.public.GroupMember;
const Transaction = db.orm.public.Transaction;

// Users
export function createUser({ name, email, passwordHash }) {
  return User.create({ name, email, passwordHash });
}

export function getUserById(id) {
  return User.where({ id }).first();
}

export function getUserByEmail(email) {
  return User.where({ email }).first();
}

export function listUsers() {
  return User.all();
}

export function updateUser(id, changes) {
  return User.where({ id }).update(changes);
}

export function deleteUser(id) {
  return User.where({ id }).delete();
}

// Groups
export function createGroup(name) {
  return Group.create({ name });
}

export function getGroupById(id) {
  return Group.where({ id }).first();
}

export function listGroups() {
  return Group.all();
}

export function updateGroup(id, changes) {
  return Group.where({ id }).update(changes);
}

export function deleteGroup(id) {
  return Group.where({ id }).delete();
}

// Group membership
export function addUserToGroup(userId, groupId) {
  return GroupMember.create({ userId, groupId });
}

export function getMembership(userId, groupId) {
  return GroupMember.where({ userId, groupId }).first();
}

export function listUserGroups(userId) {
  return GroupMember
    .where({ userId })
    .include("group")
    .all();
}

export function listGroupMembers(groupId) {
  return GroupMember
    .where({ groupId })
    .include("user")
    .all();
}

export function removeUserFromGroup(userId, groupId) {
  return GroupMember.where({ userId, groupId }).delete();
}

export function removeAllMembersFromGroup(groupId) {
  return GroupMember.where({ groupId }).deleteAll();
}

// Pending transactions
export function createPendingTransaction({
  amount,
  description = null,
  groupId,
  fromId,
  toId,
}) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new TypeError("amount must be a positive integer");
  }

  return Transaction.create({
    amount,
    description,
    groupId,
    fromId,
    toId,
  });
}

export function getPendingTransactionById(id) {
  return Transaction.where({ id }).first();
}

export function listGroupPendingTransactions(groupId) {
  return Transaction
    .where({ groupId })
    .orderBy((transaction) => transaction.createdAt.desc())
    .all();
}

export function deleteGroupPendingTransactions(groupId) {
  return Transaction.where({ groupId }).deleteAll();
}

export function updatePendingTransaction(id, changes) {
  if (changes.amount !== undefined &&
      (!Number.isInteger(changes.amount) || changes.amount <= 0)) {
    throw new TypeError("amount must be a positive integer");
  }

  return Transaction.where({ id }).update(changes);
}

export function deletePendingTransaction(id) {
  return Transaction.where({ id }).delete();
}
