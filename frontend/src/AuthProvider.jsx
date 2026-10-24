import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "./apiClient"

const authContext = createContext()

function getStoredUser() {
    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
        return null
    }

    try {
        return JSON.parse(storedUser)
    } catch {
        localStorage.removeItem('user')
        return null
    }
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('jwt'))
    const [user, setUser] = useState(getStoredUser)
    const navigate = useNavigate()

    async function login(email, password) {
        const response = await apiClient.post("/auth/login", { email, password },
            { headers: { 'Content-Type': 'application/json'} })
        
        const nextUser = response.data.user

        setToken(response.data.token)
        setUser(nextUser)

        localStorage.setItem("jwt", response.data.token)
        localStorage.setItem("user", JSON.stringify(nextUser))

        navigate("/")
    }

    async function signup(userData) {
        const response = await apiClient.post("/auth/signup", userData,
            { headers: { 'Content-Type': 'application/json'} })

        const nextUser = response.data.user

        setToken(response.data.token)
        setUser(nextUser)

        localStorage.setItem("jwt", response.data.token)
        localStorage.setItem("user", JSON.stringify(nextUser))
        navigate("/")
        return response.data
    }

    async function logout() {
        setToken(null)
        setUser(null)
        localStorage.removeItem('jwt')
        localStorage.removeItem('user')
    }

    return (<authContext.Provider value={{ login, signup, logout, token, user }}> {children}</authContext.Provider>);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(authContext)
}
