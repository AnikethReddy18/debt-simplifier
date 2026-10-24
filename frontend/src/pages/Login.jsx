import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthProvider.jsx'
import '../App.css'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Unable to log in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="simple-auth-page">
      <section className="simple-auth-card">
        <div className="simple-auth-brand"><span>↗</span> debt<span>simplifier</span></div>
        <div className="simple-auth-content">
          <p className="auth-kicker">Welcome back</p>
          <h2>Log in to your account</h2>
          <p className="auth-subtitle">Sign in to manage your group expenses.</p>
          <div className="auth-switch"><span>New to Debt Simplifier?</span> <Link to="/signup">Create an account</Link></div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>Email address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" autoComplete="email" required /></label>
            <label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" autoComplete="current-password" required /></label>
            {error && <p className="bento-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log in'} <span>→</span></button>
          </form>
        </div>
      </section>
    </main>
  )
}
