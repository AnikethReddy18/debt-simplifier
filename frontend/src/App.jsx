import { useAuth } from './AuthProvider.jsx'
import './App.css'

function App() {
  const { user, logout } = useAuth()
  let parsedUser

  try {
    parsedUser = typeof user === 'string' ? JSON.parse(user) : user
  } catch {
    parsedUser = null
  }

  return (
    <main className="simple-app">
      <h1>Hello, {parsedUser?.name || parsedUser?.username || 'there'}!</h1>
      <button className="logout-button" type="button" onClick={logout}>Log out</button>
    </main>
  )
}

export default App
