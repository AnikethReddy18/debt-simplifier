import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../AuthProvider.jsx'
import apiClient from '../apiClient.js'
import '../App.css'

function formatPendingTransactionTime(createdAt) {
  if (!createdAt) {
    return 'Time unavailable'
  }

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) {
    return 'Time unavailable'
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function Group() {
  const { groupId } = useParams()
  const { user } = useAuth()
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [pendingTransactions, setPendingTransactions] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const [transactionSearch, setTransactionSearch] = useState('')
  const [transactionPerson, setTransactionPerson] = useState('')
  const [minimumAmount, setMinimumAmount] = useState('')
  const [maximumAmount, setMaximumAmount] = useState('')
  const [transactionSort, setTransactionSort] = useState('newest')
  const [showTransactionFilters, setShowTransactionFilters] = useState(false)

  const groupMembers = members.map((membership) => membership.user || membership)
  const memberSearchText = memberSearch.trim().toLowerCase()
  const filteredMembers = members.filter((membership) => {
    const member = membership.user || membership
    return !memberSearchText || member.name?.toLowerCase().includes(memberSearchText)
  })
  const transactionSearchText = transactionSearch.trim().toLowerCase()
  const minimum = minimumAmount === '' ? null : Number(minimumAmount)
  const maximum = maximumAmount === '' ? null : Number(maximumAmount)
  const filteredPendingTransactions = [...pendingTransactions]
    .filter((pendingTransaction) => {
      const payer = groupMembers.find((member) => member.id === pendingTransaction.fromId)
      const recipient = groupMembers.find((member) => member.id === pendingTransaction.toId)
      const people = `${payer?.name || ''} ${recipient?.name || ''}`.toLowerCase()
      const searchableText = `${people} ${pendingTransaction.description ||
         ''}`.toLowerCase()
      const matchesAmount = (minimum === null || pendingTransaction.amount >= minimum)
        && (maximum === null || pendingTransaction.amount <= maximum)
      const matchesPerson = !transactionPerson
        || pendingTransaction.fromId === transactionPerson
        || pendingTransaction.toId === transactionPerson
      return (!transactionSearchText || searchableText.includes(transactionSearchText)) && matchesAmount && matchesPerson
    })
    .sort((first, second) => {
      if (transactionSort === 'amount-high') return second.amount - first.amount
      if (transactionSort === 'amount-low') return first.amount - second.amount
      const firstTime = new Date(first.createdAt).getTime()
      const secondTime = new Date(second.createdAt).getTime()
      return transactionSort === 'oldest' ? firstTime - secondTime : secondTime - firstTime
    })


  async function copyGroupId() {
    try {
      await navigator.clipboard.writeText(group.id)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Unable to copy the group ID.')
    }
  }

  useEffect(() => {
    async function loadGroup() {
      try {
        const [groupResponse, membersResponse, pendingTransactionsResponse] = await Promise.all([
          apiClient.get(`/groups/${groupId}`),
          apiClient.get(`/groups/${groupId}/members`),
          apiClient.get(`/groups/${groupId}/pending-transactions`),
        ])
        setGroup(groupResponse.data)
        setMembers(membersResponse.data)
        setPendingTransactions(pendingTransactionsResponse.data)
      } catch (loadError) {
        setError(loadError.response?.data?.error || 'Unable to load this group.')
      } finally {
        setLoading(false)
      }
    }
    loadGroup()
  }, [groupId])

  function closePendingTransactionForm() {
    setSelectedMember(null)
    setAmount('')
    setDescription('')
    setError('')
  }

  async function addPendingTransaction(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const response = await apiClient.post(`/groups/${groupId}/pending-transactions`, {
        amount: Number(amount),
        description: description.trim(),
        fromId: selectedMember.id,
      })
      setPendingTransactions((currentPendingTransactions) => [response.data, ...currentPendingTransactions])
      closePendingTransactionForm()
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Unable to add this pending transaction.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand"><span className="brand-mark">↗</span> debt<span>simplifier</span></div>
        <Link className="back-link" to="/">← Back to groups</Link>
      </header>
      <section className="dashboard group-page">
        {loading && <p className="empty-state">Loading group...</p>}
        {error && !selectedMember && <p className="bento-error" role="alert">{error}</p>}
        {!loading && !error && group && (
          <>
            <p className="eyebrow">Group details</p>
            <h1>{group.name}</h1>
            <div className="group-id">
              <span>Group ID</span>
              <strong>{group.id}</strong>
              <button className="copy-button" type="button" onClick={copyGroupId}>{copied ? 'Copied' : 'Copy'}</button>
            </div>
            <div className="group-columns">
              <section className="panel members-panel">
                <div className="panel-heading">
                  <div><p className="eyebrow">People</p><h2>Members</h2></div>
                  <span className="group-count">{filteredMembers.length}/{members.length}</span>
                </div>
                <input className="panel-search" value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} placeholder="Search members..." aria-label="Search members" />
                {!filteredMembers.length && <p className="empty-state">{members.length ? 'No matching members.' : 'No members found.'}</p>}
                <div className="member-list">
                  {filteredMembers.map((membership) => {
                    const member = membership.user || membership
                    const isCurrentUser = member.id === user?.id || membership.userId === user?.id
                    return (
                      <div className="member-row" key={membership.userId || member.id}>
                        <span className="avatar">{(member.name || 'U').charAt(0).toUpperCase()}</span>
                        <span><strong>{member.name || 'Unknown member'}</strong></span>
                        {!isCurrentUser && <button className="pending-transaction-button" type="button" onClick={() => setSelectedMember(member)}>Add pending transaction</button>}
                      </div>
                    )
                  })}
                </div>
              </section>
              <section className="panel transactions-panel">
                <div className="panel-heading">
                  <div><p className="eyebrow">Unsettled</p><h2>Pending transactions</h2></div>
                  <div className="panel-heading-actions">
                    <span className="group-count">{filteredPendingTransactions.length}/{pendingTransactions.length}</span>
                    <button className="filter-toggle" type="button" onClick={() => setShowTransactionFilters((visible) => !visible)} aria-expanded={showTransactionFilters}>
                      {showTransactionFilters ? 'Hide filters' : 'Filters'}
                    </button>
                  </div>
                </div>
                <div className="transaction-filters transaction-search">
                  <input className="panel-search" value={transactionSearch} onChange={(event) => setTransactionSearch(event.target.value)} placeholder="Search people or descriptions..." aria-label="Search pending transactions" />
                  {showTransactionFilters && (
                    <>
                      <select value={transactionPerson} onChange={(event) => setTransactionPerson(event.target.value)} aria-label="Filter by person">
                        <option value="">Everyone</option>
                        {groupMembers.map((member) => <option value={member.id} key={member.id}>{member.name}</option>)}
                      </select>
                      <div className="amount-filters">
                        <input type="number" min="0" value={minimumAmount} onChange={(event) => setMinimumAmount(event.target.value)} placeholder="Min amount" aria-label="Minimum amount" />
                        <input type="number" min="0" value={maximumAmount} onChange={(event) => setMaximumAmount(event.target.value)} placeholder="Max amount" aria-label="Maximum amount" />
                      </div>
                      <select value={transactionSort} onChange={(event) => setTransactionSort(event.target.value)} aria-label="Sort pending transactions">
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="amount-high">Highest amount</option>
                        <option value="amount-low">Lowest amount</option>
                      </select>
                    </>
                  )}
                </div>
                {!filteredPendingTransactions.length && <p className="empty-state">{pendingTransactions.length ? 'No matching pending transactions.' : 'No pending transactions yet.'}</p>}
                <div className="transaction-list">
                  {filteredPendingTransactions.map((pendingTransaction) => {
                    const payer = groupMembers.find((member) => member.id === pendingTransaction.fromId)
                    const recipient = groupMembers.find((member) => member.id === pendingTransaction.toId)
                    return (
                      <div className="transaction-row" key={pendingTransaction.id}>
                        <span className="transaction-dot" />
                        <span><strong>{payer?.name || 'Member'} owes {recipient?.name || 'member'}</strong><small>{pendingTransaction.description || 'No description'} · Pending · {formatPendingTransactionTime(pendingTransaction.createdAt)}</small></span>
                        <b>{pendingTransaction.amount}</b>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          </>
        )}
      </section>
      {selectedMember && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closePendingTransactionForm()}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="pending-transaction-form-title">
            <button className="modal-close" type="button" onClick={closePendingTransactionForm} aria-label="Close">×</button>
            <p className="eyebrow">Add pending transaction</p>
            <h2 id="pending-transaction-form-title">{selectedMember.name} owes you</h2>
            <p className="modal-subtitle">Enter the amount and what the payment is for.</p>
            <form className="group-form" onSubmit={addPendingTransaction}>
              <label>Amount<input type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" required /></label>
              <label>Description<input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Dinner, tickets, groceries..." required /></label>
              {error && <p className="bento-error" role="alert">{error}</p>}
              <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add pending transaction'} <span>→</span></button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
