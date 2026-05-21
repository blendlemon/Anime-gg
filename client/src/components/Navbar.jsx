import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Navbar con logo y botón de logout
export const Navbar = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => navigate('/home')}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="text-zinc-100 font-bold text-lg hidden sm:inline group-hover:text-violet-400 transition">
            AnimeOpening.gg
          </span>
        </div>

        {/* Menú derecha */}
        <div className="flex items-center space-x-4">
          <span className="text-zinc-400 text-sm hidden sm:inline">
            {user?.username}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
