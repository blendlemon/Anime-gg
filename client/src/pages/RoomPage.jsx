import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { useSocket } from '../hooks/useAuth'
import { useAuth } from '../hooks/useAuth'

// Página de sala de votación con sistema de host
export const RoomPage = () => {
  const { inviteCode } = useParams()
  const navigate = useNavigate()
  const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/$/, '')
  const { user } = useAuth()
  const {
    socket,
    joinRoom,
    startTournament,
    submitVote,
    nextMatch,
    leaveRoom,
    onRoomUpdated,
    onTournamentStarted,
    onVoteUpdate,
    onMatchChanged,
    onTournamentEnded,
    onRoomClosed,
    onError
  } = useSocket()

  // Estados
  const [roomStatus, setRoomStatus] = useState('waiting') // waiting | voting | results
  const [roomData, setRoomData] = useState(null)
  const [connectedUsers, setConnectedUsers] = useState([])
  const [currentMatch, setCurrentMatch] = useState(null)
  const [votes, setVotes] = useState({ participant1: 0, participant2: 0 })
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showRoomClosedModal, setShowRoomClosedModal] = useState(false)
  const userId = user?.id || user?._id
  const hostUserId = roomData?.host_user_id
  const isHost = !!hostUserId && (
    hostUserId.toString() === user?.id?.toString() ||
    hostUserId.toString() === user?._id?.toString()
  )

  const getVideoUrl = (participant) => {
    const videoUrl = participant?.video_url || participant?.opening_id?.video_url
    if (!videoUrl || videoUrl === 'undefined' || videoUrl === 'null') return null
    return `${apiUrl}/proxy/video?url=${encodeURIComponent(videoUrl)}`
  }

  const getParticipantId = (participant) => {
    return participant?._id || participant?.id || null
  }

  // Conectar a la sala cuando Socket.IO esté listo
  useEffect(() => {
    console.log('RoomPage useEffect check:', {
      hasSocket: !!socket,
      hasUser: !!user,
      hasInviteCode: !!inviteCode,
      user: user
    })

    if (!socket || !user || !inviteCode || !userId) {
      console.log('Esperando socket, user o inviteCode...')
      return
    }

    console.log('Emitiendo join_room con:', { inviteCode, user })
    joinRoom(inviteCode, userId, user.username)
  }, [socket, user, inviteCode, joinRoom, userId])

  // Listeners para eventos de la sala
  useEffect(() => {
    if (!socket) return

    // Cuando la sala se actualiza (usuario se une/sale)
    onRoomUpdated((data) => {
      console.log('Room updated:', data)
      setRoomData(data)
      setConnectedUsers(data.connected_users || [])
      setRoomStatus(data.status || 'waiting')
      setLoading(false)
    })

    // Cuando el host inicia el torneo
    onTournamentStarted((data) => {
      console.log('Tournament started:', data)
      setRoomStatus('voting')
      if (data.currentMatch) {
        setCurrentMatch(data.currentMatch)
        setVotes({ participant1: 0, participant2: 0 })
        setHasVoted(false)
      }
    })

    // Cuando se actualiza el contador de votos
    onVoteUpdate((data) => {
      console.log('Vote update:', data)
      setVotes(data.votes || { participant1: 0, participant2: 0 })
    })

    // Cuando cambia al siguiente match
    onMatchChanged((data) => {
      console.log('Match changed:', data)
      if (data.currentMatch) {
        setCurrentMatch(data.currentMatch)
        setVotes({ participant1: 0, participant2: 0 })
        setHasVoted(false)
      }
    })

    // Cuando termina el torneo
    onTournamentEnded((data) => {
      console.log('Tournament ended:', data)
      setRoomStatus('results')
      const tournamentId = data?.tournament?._id
      // Navegar a página de ranking en 2 segundos
      setTimeout(() => {
        if (tournamentId) {
          navigate(`/ranking/${tournamentId}`)
          return
        }
        navigate('/home')
      }, 2000)
    })

    // Cuando se cierra la sala (host abandonó)
    onRoomClosed((data) => {
      console.log('Room closed:', data)
      setShowRoomClosedModal(true)
    })

    // Cuando hay un error
    onError((data) => {
      console.error('Socket error:', data)
      setError(data.message)
    })
  }, [socket, onRoomUpdated, onTournamentStarted, onVoteUpdate, onMatchChanged, onTournamentEnded, onRoomClosed, onError, navigate])

  // Manejar voto
  const handleVote = (participantId) => {
    if (!participantId) {
      setError('No se pudo identificar el participante para votar')
      return
    }

    if (!hasVoted && currentMatch && userId) {
      submitVote(inviteCode, currentMatch._id, participantId, userId)
      setHasVoted(true)
    }
  }

  // Iniciar torneo (solo host)
  const handleStartTournament = () => {
    if (isHost && userId) {
      startTournament(inviteCode, userId)
    }
  }

  // Avanzar al siguiente match (solo host)
  const handleNextMatch = () => {
    if (isHost && userId) {
      nextMatch(inviteCode, userId)
    }
  }

  // Abandonar sala
  const handleLeaveRoom = () => {
    if (userId) {
      leaveRoom(inviteCode, userId)
      navigate('/home')
    }
  }

  // Copiar código de invitación
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${inviteCode}`)
  }

  // Calcular porcentajes de votos
  const total = votes.participant1 + votes.participant2 || 1
  const percent1 = (votes.participant1 / total) * 100
  const percent2 = (votes.participant2 / total) * 100

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center space-y-4">
            <div className="text-4xl">⏳</div>
            <p className="text-zinc-400">Conectando a la sala...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center space-y-4 bg-red-500/10 border border-red-500/50 rounded-lg p-8 max-w-md">
            <div className="text-4xl">❌</div>
            <p className="text-red-400 font-semibold">{error}</p>
            <button
              onClick={() => navigate('/home')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Modal cuando se cierra la sala
  if (showRoomClosedModal) {
    return (
      <div className="w-full min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center space-y-4 bg-zinc-900 border border-zinc-800 rounded-lg p-8 max-w-md">
            <div className="text-4xl">🚪</div>
            <h2 className="text-2xl font-bold text-zinc-100">Sala Cerrada</h2>
            <p className="text-zinc-400">El host ha abandonado la sala</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  // SALA DE ESPERA (waiting)
  if (roomStatus === 'waiting') {
    return (
      <div className="w-full min-h-screen bg-zinc-950">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Título y código */}
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl font-bold text-zinc-100">
              Sala de Espera
            </h1>

            <div className="space-y-3">
              <p className="text-zinc-400">Código de invitación:</p>
              <div className="flex items-center justify-center gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-8 py-4">
                  <p className="text-3xl font-mono font-bold text-violet-400">
                    {inviteCode}
                  </p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition"
                  title="Copiar enlace"
                >
                  📋
                </button>
              </div>
            </div>
          </div>

          {/* Lista de usuarios conectados */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-100 mb-6">
              Usuarios Conectados ({connectedUsers.length})
            </h2>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
              {connectedUsers.length > 0 ? (
                connectedUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg"
                  >
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-zinc-100 font-medium">
                      {u.username}
                    </span>
                    {u._id?.toString() === hostUserId?.toString() && (
                      <span className="ml-auto px-3 py-1 bg-violet-600/20 text-violet-300 text-sm rounded-full">
                        👑 Host
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-zinc-400">Esperando usuarios...</p>
              )}
            </div>
          </section>

          {/* Botones de acción */}
          <div className="space-y-4">
            {isHost ? (
              <div className="space-y-4">
                <button
                  onClick={handleStartTournament}
                  className="w-full px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition text-lg"
                >
                  🎮 Iniciar Torneo
                </button>
                <p className="text-center text-zinc-400 text-sm">
                  Eres el host de esta sala
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-zinc-400">
                  ⏳ Esperando a que el host inicie el torneo...
                </p>
              </div>
            )}

            <button
              onClick={handleLeaveRoom}
              className="w-full px-8 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition"
            >
              Abandonar Sala
            </button>
          </div>
        </main>
      </div>
    )
  }

  // SALA DE VOTACIÓN (voting)
  if (roomStatus === 'voting' && currentMatch) {
    return (
      <div className="w-full min-h-screen bg-zinc-950">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Información del match */}
            <div className="text-center space-y-2">
              <p className="text-zinc-400">
                Match {currentMatch.match_number} • Ronda {currentMatch.round}
              </p>
              <h1 className="text-3xl font-bold text-zinc-100">
                Elige tu Favorito
              </h1>
              <p className="text-zinc-400 text-sm">
                Usuarios conectados: {connectedUsers.length}
              </p>
            </div>

            {/* Dos openings enfrentados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Participante 1 */}
              <div className="space-y-4">
                <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-900 border-2 border-zinc-800">
                  <video
                    key={getVideoUrl(currentMatch.participant1)}
                    controls
                    className="w-full h-full"
                  >
                    {getVideoUrl(currentMatch.participant1) && (
                      <source
                        src={getVideoUrl(currentMatch.participant1)}
                        type="video/webm"
                      />
                    )}
                    Tu navegador no soporta vídeo WebM
                  </video>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-zinc-100">
                    {currentMatch.participant1?.title}
                  </h3>
                  <p className="text-zinc-400">
                    {currentMatch.participant1?.anime_title}
                  </p>
                  {currentMatch.participant1?.artist && (
                    <p className="text-violet-400 text-sm">
                      {currentMatch.participant1.artist}
                    </p>
                  )}
                </div>

                <button
                  onClick={() =>
                    handleVote(getParticipantId(currentMatch.participant1))
                  }
                  disabled={hasVoted}
                  className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 text-white font-bold rounded-xl transition text-lg"
                >
                  {hasVoted ? '✓ Votado' : 'Votar'}
                </button>

                {/* Barra de progreso */}
                <div className="space-y-2">
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-600 transition-all duration-300"
                      style={{ width: `${percent1}%` }}
                    />
                  </div>
                  <p className="text-center text-zinc-400 text-sm">
                    {votes.participant1} votos ({percent1.toFixed(0)}%)
                  </p>
                </div>
              </div>

              {/* Participante 2 */}
              <div className="space-y-4">
                <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-900 border-2 border-zinc-800">
                  <video
                    key={getVideoUrl(currentMatch.participant2)}
                    controls
                    className="w-full h-full"
                  >
                    {getVideoUrl(currentMatch.participant2) && (
                      <source
                        src={getVideoUrl(currentMatch.participant2)}
                        type="video/webm"
                      />
                    )}
                    Tu navegador no soporta vídeo WebM
                  </video>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-zinc-100">
                    {currentMatch.participant2?.title}
                  </h3>
                  <p className="text-zinc-400">
                    {currentMatch.participant2?.anime_title}
                  </p>
                  {currentMatch.participant2?.artist && (
                    <p className="text-violet-400 text-sm">
                      {currentMatch.participant2.artist}
                    </p>
                  )}
                </div>

                <button
                  onClick={() =>
                    handleVote(getParticipantId(currentMatch.participant2))
                  }
                  disabled={hasVoted}
                  className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 text-white font-bold rounded-xl transition text-lg"
                >
                  {hasVoted ? '✓ Votado' : 'Votar'}
                </button>

                {/* Barra de progreso */}
                <div className="space-y-2">
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-600 transition-all duration-300"
                      style={{ width: `${percent2}%` }}
                    />
                  </div>
                  <p className="text-center text-zinc-400 text-sm">
                    {votes.participant2} votos ({percent2.toFixed(0)}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de control */}
            {isHost && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleNextMatch}
                  className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition"
                >
                  ⏭️ Siguiente Match
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  // Estado por defecto
  return (
    <div className="w-full min-h-screen bg-zinc-950">
      <Navbar />
      <div className="flex items-center justify-center min-h-[600px]">
        <p className="text-zinc-400">Cargando sala...</p>
      </div>
    </div>
  )
}
