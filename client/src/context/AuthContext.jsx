import React, { createContext, useState, useEffect } from 'react'

// Contexto para autenticación y usuario
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cargar token del localStorage al montar
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('authUser')

    if (savedToken) {
      setToken(savedToken)
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    }
    setLoading(false)
  }, [])

  // Función para hacer login
  const login = (token, userData) => {
    setToken(token)
    setUser(userData)
    localStorage.setItem('authToken', token)
    localStorage.setItem('authUser', JSON.stringify(userData))
  }

  // Función para hacer logout
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
