import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { AuthContext } from '../context/AuthContext'

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

// Hook para Socket.IO
export const useSocket = () => {
  const [socket, setSocket] = useState(null)
  const { token, user } = useAuth()
  const apiUrl = import.meta.env.VITE_API_URL || '/api'
  // En desarrollo, socket conecta directo al backend (bypass Vite proxy para WebSocket)
  // En producción, mismo origen funciona
  const socketUrl = import.meta.env.VITE_SOCKET_URL || (
    import.meta.env.DEV ? 'http://localhost:5001' : window.location.origin
  )

  useEffect(() => {
    if (!token || !user) return

    // Conectar a Socket.IO
    const newSocket = io(socketUrl, {
      auth: {
        token
      }
    })

    newSocket.on('connect', () => {
      console.log('✓ Conectado a Socket.IO')
    })

    newSocket.on('disconnect', () => {
      console.log('✗ Desconectado de Socket.IO')
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [token, user, socketUrl])

  // Funciones para interactuar con Socket.IO

  const joinRoom = (inviteCode, userId, username) => {
    if (socket) {
      socket.emit('join_room', {
        inviteCode: inviteCode,
        userId: userId,
        username: username
      })
    }
  }

  const startTournament = (inviteCode, userId) => {
    if (socket) {
      socket.emit('start_tournament', {
        inviteCode: inviteCode,
        userId: userId
      })
    }
  }

  const submitVote = (inviteCode, matchId, participantId, userId) => {
    if (socket) {
      socket.emit('submit_vote', {
        inviteCode: inviteCode,
        matchId: matchId,
        participantId: participantId,
        userId: userId
      })
    }
  }

  const nextMatch = (inviteCode, userId) => {
    if (socket) {
      socket.emit('next_match', {
        inviteCode: inviteCode,
        userId: userId
      })
    }
  }

  const skipP1 = (inviteCode, matchId, userId) => {
    if (socket) {
      socket.emit('skip_p1', {
        inviteCode: inviteCode,
        matchId: matchId,
        userId: userId
      })
    }
  }

  const videoEnded = (inviteCode, matchId, participant) => {
    if (socket) {
      socket.emit('video_ended', {
        inviteCode: inviteCode,
        matchId: matchId,
        participant: participant
      })
    }
  }

  const p2Ready = (inviteCode, matchId) => {
    if (socket) {
      socket.emit('p2_ready', {
        inviteCode: inviteCode,
        matchId: matchId
      })
    }
  }

  const leaveRoom = (inviteCode, userId) => {
    if (socket) {
      socket.emit('leave_room', {
        inviteCode: inviteCode,
        userId: userId
      })
    }
  }

  // Listeners para eventos del servidor
  const onRoomUpdated = (callback) => {
    if (socket) {
      socket.on('room_updated', callback)
    }
  }

  const onTournamentStarted = (callback) => {
    if (socket) {
      socket.on('tournament_started', callback)
    }
  }

  const onVoteUpdate = (callback) => {
    if (socket) {
      socket.on('vote_update', callback)
    }
  }

  const onMatchChanged = (callback) => {
    if (socket) {
      socket.on('match_changed', callback)
    }
  }

  const onTournamentEnded = (callback) => {
    if (socket) {
      socket.on('tournament_ended', callback)
    }
  }

  const onRoomClosed = (callback) => {
    if (socket) {
      socket.on('room_closed', callback)
    }
  }

  const onP1Skipped = (callback) => {
    if (socket) {
      socket.on('p1_skipped', callback)
    }
  }

  const onP1SkipUpdate = (callback) => {
    if (socket) {
      socket.on('p1_skip_update', callback)
    }
  }

  const onError = (callback) => {
    if (socket) {
      socket.on('error', callback)
    }
  }

  return {
    socket,
    joinRoom,
    startTournament,
    submitVote,
    nextMatch,
    skipP1,
    videoEnded,
    p2Ready,
    leaveRoom,
    onRoomUpdated,
    onTournamentStarted,
    onVoteUpdate,
    onMatchChanged,
    onTournamentEnded,
    onRoomClosed,
    onP1Skipped,
    onP1SkipUpdate,
    onError
  }
}
