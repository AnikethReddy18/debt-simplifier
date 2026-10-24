import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthProvider.jsx'

export default function Signup() {
  const { signup } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(form)
    } catch (submitError) {
      const validationErrors = submitError.response?.data?.errors
      setError(
        validationErrors?.map(({ message }) => message).join(' ')
          || submitError.response?.data?.error
          || 'Unable to create your account. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="simple-auth-page">
      <section className="simple-auth-card">
        <div className="simple-auth-brand"><span>↗</span> debt<span>simplifier</span></div>
        <div className="simple-auth-content">
          <p className="auth-kicker">Get started free</p>
          <h2>Create your account</h2>
          <p className="auth-subtitle">Track group expenses with less effort.</p>
          <div className="auth-switch"><span>Already have an account?</span> <Link to="/login">Log in</Link></div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>Full name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Alex Morgan" autoComplete="name" required /></label>
            <label>Email address<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" autoComplete="email" required /></label>
            <label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" autoComplete="new-password" minLength="8" required /></label>
            {error && <p className="bento-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'} <span>→</span></button>
          </form>
        </div>
      </section>
    </main>
  )
}
