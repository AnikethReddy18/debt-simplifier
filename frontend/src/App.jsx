import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'
import apiClient from './apiClient.js'
import './App.css'

function App() {
  const { user, logout } = useAuth()
  const [groups, setGroups] = useState([])
  const [activeForm, setActiveForm] = useState(null)
  const [groupName, setGroupName] = useState('')
  const [groupId, setGroupId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [netBalance, setNetBalance] = useState(null)
  const [calculatingNet, setCalculatingNet] = useState(false)

  useEffect(() => {
    async function loadGroups() {
      try {
        const response = await apiClient.get('/groups')
        setGroups(response.data)
      } catch (loadError) {
        setError(loadError.response?.data?.error || 'Unable to load your groups.')
      } finally {
        setLoading(false)
      }
    }
    loadGroups()
  }, [])

  function openForm(form) {
    setError('')
    setActiveForm(form)
  }

  function closeForm() {
    setActiveForm(null)
    setGroupName('')
    setGroupId('')
    setError('')
  }

  async function createGroup(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const response = await apiClient.post('/groups', { name: groupName.trim() })
      setGroups((currentGroups) => [...currentGroups, response.data])
      setNetBalance(null)
      closeForm()
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Unable to create the group.')
    } finally {
      setSubmitting(false)
    }
  }

  async function joinGroup(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const response = await apiClient.post(`/groups/${groupId.trim()}/members`)
      setGroups((currentGroups) => [...currentGroups, response.data.group])
      setNetBalance(null)
      closeForm()
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Unable to join the group.')
    } finally {
      setSubmitting(false)
    }
  }

  async function calculateNetBalance() {
    setCalculatingNet(true)
    setError('')
    try {
      const responses = await Promise.all(
        groups.map((group) => apiClient.get(`/groups/${group.id}/pending-transactions`)),
      )
      const balance = responses
        .flatMap((response) => response.data)
        .reduce((total, transaction) => {
          const amount = Number(transaction.amount)
          if (transaction.toId === user?.id) return total + amount
          if (transaction.fromId === user?.id) return total - amount
          return total
        }, 0)
      setNetBalance(balance)
    } catch (netError) {
      setError(netError.response?.data?.error || 'Unable to calculate your net balance.')
      setNetBalance(null)
    } finally {
      setCalculatingNet(false)
    }
  }

  function formatNetBalance(balance) {
    if (balance === 0) return '0'
    return `${balance > 0 ? '+' : '-'}${Math.abs(balance).toLocaleString()}`
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand"><span className="brand-mark">↗</span> debt<span>simplifier</span></div>
        <div className="profile">
          <span className="avatar">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
          <span>{user?.name || user?.username || 'there'}</span>
          <button type="button" onClick={logout}>Log out</button>
        </div>
      </header>

      <section className="dashboard">
        <div className="dashboard-intro">
          <div>
            <p className="eyebrow">Your workspace</p>
            <h1>Hello, {user?.name?.split(' ')[0] || user?.username || 'there'}!</h1>
            <p>Keep your shared expenses simple and organized.</p>
          </div>
          <div className="dashboard-actions">
            <button className="secondary-button compact" type="button" onClick={calculateNetBalance} disabled={calculatingNet}>
              {calculatingNet ? 'Calculating...' : 'Get net'}
            </button>
            <button className="primary-button compact" type="button" onClick={() => openForm('create')}>+ Create group</button>
            <button className="secondary-button compact" type="button" onClick={() => openForm('join')}>Join a group</button>
          </div>
        </div>
        {netBalance !== null && (
          <section className="net-balance" aria-live="polite">
            <span>Your net across all groups</span>
            <strong className={netBalance >= 0 ? 'positive' : 'negative'}>{formatNetBalance(netBalance)}</strong>
            <small>{netBalance > 0 ? 'You are owed' : netBalance < 0 ? 'You owe' : 'You are settled up'}</small>
          </section>
        )}

        <section className="panel groups-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Connected spaces</p>
              <h2>Your groups</h2>
            </div>
            <span className="group-count">{groups.length} {groups.length === 1 ? 'group' : 'groups'}</span>
          </div>
          {loading && <p className="empty-state">Loading your groups...</p>}
          {!loading && !groups.length && <p className="empty-state">You are not in any groups yet. Create one or join with a group ID.</p>}
          <div className="groups-grid">
            {groups.map((group) => (
              <Link className="group-card" to={`/groups/${group.id}`} key={group.id}>
                <span className="group-icon orange">◎</span>
                <span>
                  <strong>{group.name}</strong>
                  <small>ID: {group.id}</small>
                </span>
                <b>→</b>
              </Link>
            ))}
          </div>
          {error && !activeForm && <p className="bento-error" role="alert">{error}</p>}
        </section>
      </section>

      {activeForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeForm()}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="group-form-title">
            <button className="modal-close" type="button" onClick={closeForm} aria-label="Close">×</button>
            <p className="eyebrow">{activeForm === 'create' ? 'Start sharing' : 'Join your friends'}</p>
            <h2 id="group-form-title">{activeForm === 'create' ? 'Create a group' : 'Join a group'}</h2>
            <p className="modal-subtitle">{activeForm === 'create' ? 'Give your group a name to get started.' : 'Enter the group ID shared by a group member.'}</p>
            <form className="group-form" onSubmit={activeForm === 'create' ? createGroup : joinGroup}>
              <label>{activeForm === 'create' ? 'Group name' : 'Group ID'}
                <input value={activeForm === 'create' ? groupName : groupId} onChange={(event) => activeForm === 'create' ? setGroupName(event.target.value) : setGroupId(event.target.value)} placeholder={activeForm === 'create' ? 'Weekend trip' : 'Paste the group ID'} required />
              </label>
              {error && <p className="bento-error" role="alert">{error}</p>}
              <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Working...' : activeForm === 'create' ? 'Create group' : 'Join group'} <span>→</span></button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
