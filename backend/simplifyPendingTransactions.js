// Calculate the smallest set of pending transactions that settles all balances.
export function simplifyPendingTransactions(transactions) {
  const balances = new Map();

  for (const { fromId, toId, amount } of transactions) {
    if (fromId === toId || !Number.isInteger(amount) || amount <= 0) {
      continue;
    }

    balances.set(fromId, (balances.get(fromId) || 0) - amount);
    balances.set(toId, (balances.get(toId) || 0) + amount);
  }

  const debtors = [];
  const creditors = [];

  for (const [userId, balance] of balances) {
    if (balance < 0) debtors.push({ userId, amount: -balance });
    if (balance > 0) creditors.push({ userId, amount: balance });
  }

  const simplifiedPendingTransactions = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    simplifiedPendingTransactions.push({
      fromId: debtor.userId,
      toId: creditor.userId,
      amount,
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) debtorIndex += 1;
    if (creditor.amount === 0) creditorIndex += 1;
  }

  return simplifiedPendingTransactions;
}
