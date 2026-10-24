import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../AuthProvider.jsx'
import apiClient from '../apiClient.js'
import '../App.css'

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
                  <span className="group-count">{members.length}</span>
                </div>
                {!members.length && <p className="empty-state">No members found.</p>}
                <div className="member-list">
                  {members.map((membership) => {
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
                  <span className="group-count">{pendingTransactions.length}</span>
                </div>
                {!pendingTransactions.length && <p className="empty-state">No pending transactions yet.</p>}
                <div className="transaction-list">
                  {pendingTransactions.map((pendingTransaction) => {
                    const payer = members.map((membership) => membership.user || membership).find((member) => member.id === pendingTransaction.fromId)
                    const recipient = members.map((membership) => membership.user || membership).find((member) => member.id === pendingTransaction.toId)
                    return (
                      <div className="transaction-row" key={pendingTransaction.id}>
                        <span className="transaction-dot" />
                        <span><strong>{payer?.name || 'Member'} owes {recipient?.name || 'member'}</strong><small>{pendingTransaction.description || 'No description'} · Pending</small></span>
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
