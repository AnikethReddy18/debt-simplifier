import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { AuthProvider } from './AuthProvider.jsx'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import PrivateRoute from './PrivateRoute.jsx'
import Signup from './pages/Signup.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <Routes>

          <Route path='/login' element={<Login />}/>
          <Route path='/signup' element={<Signup />} />

          <Route element={<PrivateRoute />}>
              <Route path="/" element={<App />} />
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
  </StrictMode>,
)