import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { roomAPI } from '../utils/api'

export const OpenRoomsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return

    const fetchRooms = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await roomAPI.getOpen()
        setRooms(response.rooms || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [isOpen])

  if (!isOpen) return null

  const handleJoinRoom = (inviteCode) => {
    onClose()
    navigate(`/room/${inviteCode}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-100">Salas Abiertas</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-12">
              <p className="text-zinc-400">Cargando salas...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && rooms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500 text-lg mb-2">No hay salas abiertas</p>
              <p className="text-zinc-600 text-sm">Crea un torneo para invitar a otros jugadores</p>
            </div>
          )}

          {!loading && rooms.length > 0 && (
            <div className="space-y-3">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 hover:border-violet-600/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-zinc-100 font-semibold truncate">
                        {room.tournament?.name || 'Torneo sin nombre'}
                      </h3>
                      <p className="text-zinc-500 text-sm mt-1">
                        {room.tournament?.size || '?'} participantes
                        {room.tournament?.filterType && ` — ${room.tournament.filterType === 'OP' ? 'Openings' : room.tournament.filterType === 'ED' ? 'Endings' : 'Mixto'}`}
                      </p>
                      <p className="text-zinc-600 text-xs mt-1">
                        {room.connected_users} jugador{room.connected_users !== 1 ? 'es' : ''} conectado{room.connected_users !== 1 ? 's' : ''}
                        {' — '}Código: {room.invite_code}
                      </p>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(room.invite_code)}
                      className="ml-4 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition shrink-0"
                    >
                      Unirse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
