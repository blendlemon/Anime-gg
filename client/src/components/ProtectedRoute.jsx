import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Componente para proteger rutas que requieren autenticación
export const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-zinc-400">Cargando...</div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/" replace />
  }

  return children
}
