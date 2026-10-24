import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../apiClient.js'
import '../App.css'

export default function Group() {
  const { groupId } = useParams()
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
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
        const [groupResponse, membersResponse] = await Promise.all([
          apiClient.get(`/groups/${groupId}`),
          apiClient.get(`/groups/${groupId}/members`),
        ])
        setGroup(groupResponse.data)
        setMembers(membersResponse.data)
      } catch (loadError) {
        setError(loadError.response?.data?.error || 'Unable to load this group.')
      } finally {
        setLoading(false)
      }
    }
    loadGroup()
  }, [groupId])

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand"><span className="brand-mark">↗</span> debt<span>simplifier</span></div>
        <Link className="back-link" to="/">← Back to groups</Link>
      </header>
      <section className="dashboard group-page">
        {loading && <p className="empty-state">Loading group...</p>}
        {error && <p className="bento-error" role="alert">{error}</p>}
        {!loading && !error && group && (
          <>
            <p className="eyebrow">Group details</p>
            <h1>{group.name}</h1>
            <div className="group-id">
              <span>Group ID</span>
              <strong>{group.id}</strong>
              <button className="copy-button" type="button" onClick={copyGroupId}>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <section className="panel members-panel">
              <div className="panel-heading">
                <div><p className="eyebrow">People</p><h2>Members</h2></div>
                <span className="group-count">{members.length}</span>
              </div>
              {!members.length && <p className="empty-state">No members found.</p>}
              <div className="member-list">
                {members.map((membership) => {
                  const member = membership.user || membership
                  return <div className="member-row" key={membership.userId || member.id}><span className="avatar">{(member.name || 'U').charAt(0).toUpperCase()}</span><span><strong>{member.name || 'Unknown member'}</strong></span></div>
                })}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  )
}
