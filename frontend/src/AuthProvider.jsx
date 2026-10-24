import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "./apiClient"

const authContext = createContext()

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('jwt'))
    const [user, setUser] = useState(localStorage.getItem('user'))
    const navigate = useNavigate()

    async function login(email, password) {
        const response = await apiClient.post("/auth/login", { email, password },
            { headers: { 'Content-Type': 'application/json'} })
        
        setToken(response.data.token)
        setUser(JSON.stringify(response.data.user))

        localStorage.setItem("jwt", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))

        navigate("/")
    }

    async function signup(userData) {
        const response = await apiClient.post("/auth/signup", userData,
            { headers: { 'Content-Type': 'application/json'} })

        setToken(response.data.token)
        setUser(JSON.stringify(response.data.user))
        localStorage.setItem("jwt", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
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
