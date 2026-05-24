import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { useSocket } from '../hooks/useAuth'
import { useAuth } from '../hooks/useAuth'

const VolumeSlider = () => {
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    const v = document.querySelector('video')
    if (v) {
      v.volume = val
      v.muted = val === 0
    }
    setMuted(val === 0)
  }

  const toggleMute = () => {
    const v = document.querySelector('video')
    if (!v) return
    const next = !v.muted
    v.muted = next
    setMuted(next)
    if (!next) {
      setVolume(v.volume)
    }
  }

  return (
    <div className="flex items-center gap-2 px-1">
      <button
        onClick={toggleMute}
        className="text-zinc-400 hover:text-zinc-200 text-sm w-6 text-left"
        title={muted ? 'Activar sonido' : 'Silenciar'}
      >
        {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={muted ? 0 : volume}
        onChange={handleVolume}
        className="w-20 h-1 accent-violet-500 cursor-pointer"
      />
    </div>
  )
}

export const RoomPage = () => {
  const { inviteCode } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    socket,
    joinRoom,
    startTournament,
    submitVote,
    skipP1,
    videoEnded,
    p2Ready,
    leaveRoom
  } = useSocket()

  const [roomStatus, setRoomStatus] = useState('waiting')
  const [roomData, setRoomData] = useState(null)
  const [connectedUsers, setConnectedUsers] = useState([])
  const [currentMatch, setCurrentMatch] = useState(null)
  const [phase, setPhase] = useState('playing_p1')
  const [votes, setVotes] = useState({ participant1: 0, participant2: 0 })
  const [hasVoted, setHasVoted] = useState(false)
  const [skipCount, setSkipCount] = useState({ skipped: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showRoomClosedModal, setShowRoomClosedModal] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [votingTimeLeft, setVotingTimeLeft] = useState(null)
  const userId = user?.id || user?._id
  const hostUserId = roomData?.host_user_id
  const isHost = !!hostUserId && (
    hostUserId.toString() === user?.id?.toString() ||
    hostUserId.toString() === user?._id?.toString()
  )
  const videoRef = useRef(null)

  const getParticipantId = (participant) => {
    return participant?._id || participant?.id || null
  }

  // Reiniciar estado al cambiar de match
  useEffect(() => {
    setVideoError(false)
    setHasVoted(false)
    setSkipCount({ skipped: 0, total: 0 })
    setVotingTimeLeft(null)
  }, [currentMatch?._id, phase])
  
  // Cuenta regresiva cuando P2 termina
  useEffect(() => {
    if (votingTimeLeft == null || votingTimeLeft <= 0) return
    const timer = setTimeout(() => {
      setVotingTimeLeft((prev) => (prev != null ? prev - 1 : null))
    }, 1000)
    return () => clearTimeout(timer)
  }, [votingTimeLeft])

  // Reproducir automáticamente al cambiar de fase
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [phase, currentMatch?._id])

  // Detectar fin del vídeo
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const pNum = phase === 'playing_p1' ? 1 : 2
    const handleEnded = () => {
      if (currentMatch && inviteCode) {
        videoEnded(inviteCode, currentMatch._id, pNum)
      }
    }
    el.addEventListener('ended', handleEnded)
    return () => el.removeEventListener('ended', handleEnded)
  }, [phase, currentMatch, inviteCode, videoEnded])

  // Conectar a la sala
  useEffect(() => {
    if (!socket || !user || !inviteCode || !userId) return
    joinRoom(inviteCode, userId, user.username)
  }, [socket, user, inviteCode, userId])

  // Listeners con cleanup para evitar acumulación
  useEffect(() => {
    if (!socket) return

    const handleRoomUpdated = (data) => {
      setRoomData(data)
      setConnectedUsers(data.connected_users || [])
      setRoomStatus(data.status || 'waiting')
      setLoading(false)
    }

    const handleTournamentStarted = (data) => {
      setRoomStatus('voting')
      setPhase(data.phase || 'playing_p1')
      setSkipCount({ skipped: 0, total: data.totalUsers || 0 })
      if (data.currentMatch) {
        setCurrentMatch(data.currentMatch)
        setVotes({ participant1: 0, participant2: 0 })
        setHasVoted(false)
      }
    }

    const handleP1SkipUpdate = (data) => {
      setSkipCount({ skipped: data.skippedCount, total: data.totalUsers })
    }

    const handleP1Skipped = () => {
      setPhase('playing_p2')
      setVideoError(false)
    }

    const handleP2Ended = (data) => {
      setVotingTimeLeft(10)
    }

    const handleVoteUpdate = (data) => {
      setVotes(data.votes || { participant1: 0, participant2: 0 })
    }

    const handleMatchChanged = (data) => {
      if (data.currentMatch) {
        setCurrentMatch(data.currentMatch)
        setPhase(data.phase || 'playing_p1')
        setVotes({ participant1: 0, participant2: 0 })
        setHasVoted(false)
        setVideoError(false)
        setSkipCount({ skipped: 0, total: data.totalUsers || 0 })
      }
    }

    const handleTournamentEnded = (data) => {
      setRoomStatus('results')
      setTimeout(() => {
        if (data?.tournament?._id) {
          navigate(`/ranking/${data.tournament._id}`)
          return
        }
        navigate('/home')
      }, 2000)
    }

    const handleRoomClosed = () => {
      setShowRoomClosedModal(true)
    }

    const handleError = (data) => {
      setError(data.message)
    }

    socket.on('room_updated', handleRoomUpdated)
    socket.on('tournament_started', handleTournamentStarted)
    socket.on('p1_skip_update', handleP1SkipUpdate)
    socket.on('p1_skipped', handleP1Skipped)
    socket.on('p2_ended', handleP2Ended)
    socket.on('vote_update', handleVoteUpdate)
    socket.on('match_changed', handleMatchChanged)
    socket.on('tournament_ended', handleTournamentEnded)
    socket.on('room_closed', handleRoomClosed)
    socket.on('error', handleError)

    return () => {
      socket.off('room_updated', handleRoomUpdated)
      socket.off('tournament_started', handleTournamentStarted)
      socket.off('p1_skip_update', handleP1SkipUpdate)
      socket.off('p1_skipped', handleP1Skipped)
      socket.off('p2_ended', handleP2Ended)
      socket.off('vote_update', handleVoteUpdate)
      socket.off('match_changed', handleMatchChanged)
      socket.off('tournament_ended', handleTournamentEnded)
      socket.off('room_closed', handleRoomClosed)
      socket.off('error', handleError)
    }
  }, [socket, navigate])

  // Emitir p2_ready cuando el vídeo P2 comienza a reproducirse
  const handleP2Play = () => {
    if (currentMatch && inviteCode) {
      p2Ready(inviteCode, currentMatch._id)
    }
  }

  const handleSkipP1 = () => {
    if (currentMatch && userId && inviteCode) {
      skipP1(inviteCode, currentMatch._id, userId)
    }
  }

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

  const handleStartTournament = () => {
    if (isHost && userId) {
      startTournament(inviteCode, userId)
    }
  }

  const handleLeaveRoom = () => {
    if (userId) {
      leaveRoom(inviteCode, userId)
      navigate('/home')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${inviteCode}`)
  }

  const total = votes.participant1 + votes.participant2 || 1
  const percent1 = (votes.participant1 / total) * 100
  const percent2 = (votes.participant2 / total) * 100

  // --- LOADING ---
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

  // --- ERROR ---
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

  // --- ROOM CLOSED MODAL ---
  if (showRoomClosedModal) {
    return (
      <div className="w-full min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center space-y-4 bg-zinc-900 border border-zinc-800 rounded-lg p-8 max-w-md">
            <div className="text-4xl">🚪</div>
            <h2 className="text-2xl font-bold text-zinc-100">Sala Cerrada</h2>
            <p className="text-zinc-400">La sala se ha cerrado</p>
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

  // --- WAITING ROOM ---
  if (roomStatus === 'waiting') {
    return (
      <div className="w-full min-h-screen bg-zinc-950">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl font-bold text-zinc-100">Sala de Espera</h1>
            <div className="space-y-3">
              <p className="text-zinc-400">Código de invitación:</p>
              <div className="flex items-center justify-center gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-8 py-4">
                  <p className="text-3xl font-mono font-bold text-violet-400">{inviteCode}</p>
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

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-100 mb-6">
              Usuarios Conectados ({connectedUsers.length})
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
              {connectedUsers.length > 0 ? (
                connectedUsers.map((u) => (
                  <div key={u._id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-zinc-100 font-medium">{u.username}</span>
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

          <div className="space-y-4">
            {isHost ? (
              <div className="space-y-4">
                <button
                  onClick={handleStartTournament}
                  disabled={!roomData?.videos_ready}
                  className={`w-full px-8 py-4 font-bold rounded-xl transition text-lg ${
                    roomData?.videos_ready
                      ? 'bg-violet-600 hover:bg-violet-700 text-white'
                      : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  {roomData?.videos_ready ? '🎮 Iniciar Torneo' : '⏳ Preparando videos...'}
                </button>
              </div>
            ) : (
              <p className="text-center text-zinc-400">⏳ Esperando a que el host inicie el torneo...</p>
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

  // --- RESULTS ---
  if (roomStatus === 'results') {
    return (
      <div className="w-full min-h-screen bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[600px]">
          <p className="text-zinc-400">Torneo finalizado. Redirigiendo...</p>
        </div>
      </div>
    )
  }

  // Helper para renderizar un video con placeholder
  const renderVideo = (participant, phaseType) => {
    if (videoError) {
      return (
        <div className="aspect-video rounded-2xl bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-zinc-500 text-4xl">🎵</p>
            <p className="text-zinc-400 text-sm">Vídeo no disponible</p>
            <button
              onClick={() => setVideoError(false)}
              className="text-violet-400 text-xs hover:underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-900 border-2 border-zinc-800">
        <video
          key={phaseType}
          ref={videoRef}
          src={participant?.video_url}
          preload="auto"
          playsInline
          className="w-full h-full"
          onError={() => setVideoError(true)}
          onPlay={phaseType === 'playing_p2' ? handleP2Play : undefined}
        >
          Tu navegador no soporta vídeo WebM
        </video>
      </div>
    )
  }

  // VOTING UI (playing_p1 or playing_p2)
  if (currentMatch) {
    const currentParticipant = phase === 'playing_p1' ? currentMatch.participant1 : currentMatch.participant2

    return (
      <div className="w-full min-h-screen bg-zinc-950">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-2 mb-8">
            <p className="text-zinc-400">
              Match {currentMatch.match_number} • Ronda {currentMatch.round}
            </p>
            <h1 className="text-3xl font-bold text-zinc-100">
              {phase === 'playing_p1' ? 'Opening 1' : 'Opening 2'}
            </h1>

            {phase === 'playing_p1' && (
              <p className="text-zinc-500 text-sm">
                Todos deben saltar para continuar ({skipCount.skipped}/{skipCount.total})
              </p>
            )}

            {phase === 'playing_p2' && (
              <p className="text-zinc-500 text-sm">
                {votingTimeLeft != null
                  ? `Vota por tu opening favorito (${votingTimeLeft}s)`
                  : 'Reproduciendo segundo opening...'}
              </p>
            )}
          </div>

          {/* Reproductor */}
          <div className="space-y-4">
            {renderVideo(currentParticipant, phase)}

            <div className="flex justify-center">
              <VolumeSlider />
            </div>

            {currentParticipant && (
              <div className="text-center">
                <h3 className="text-xl font-bold text-zinc-100">{currentParticipant.title}</h3>
                <p className="text-zinc-400">{currentParticipant.anime_title}</p>
                {currentParticipant.artist && (
                  <p className="text-violet-400 text-sm">{currentParticipant.artist}</p>
                )}
              </div>
            )}

            {/* Fase P1: Botón de skip */}
            {phase === 'playing_p1' && (
              <button
                onClick={handleSkipP1}
                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition text-lg"
              >
                Saltar ⏭️
              </button>
            )}

            {/* Fase P2: Botones de voto */}
            {phase === 'playing_p2' && (
              <div className="space-y-6">
                {/* Votar por el opening actual */}
                <button
                  onClick={() => handleVote(getParticipantId(currentMatch.participant2))}
                  disabled={hasVoted}
                  className={`w-full py-4 font-bold rounded-xl transition text-lg ${
                    hasVoted
                      ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                      : 'bg-violet-600 hover:bg-violet-700 text-white'
                  }`}
                >
                  {hasVoted ? '✓ Votado' : 'Votar por este Opening 🎵'}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-950 px-4 text-zinc-500">vs</span>
                  </div>
                </div>

                {/* Votar por el opening anterior (P1) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <p className="text-zinc-400 text-sm mb-2">O vota por el opening anterior:</p>
                  <p className="text-zinc-100 font-semibold">{currentMatch.participant1?.title}</p>
                  <p className="text-zinc-500 text-xs mb-3">{currentMatch.participant1?.anime_title}</p>
                  <button
                    onClick={() => handleVote(getParticipantId(currentMatch.participant1))}
                    disabled={hasVoted}
                    className={`w-full py-3 font-bold rounded-xl transition text-base ${
                      hasVoted
                        ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
                    }`}
                  >
                    {hasVoted ? '✓ Votado' : 'Votar por este'}
                  </button>
                </div>
              </div>
            )}

            {/* Barras de votos (visibles durante P2) */}
            {phase === 'playing_p2' && (
              <div className="space-y-3 pt-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-300">{currentMatch.participant1?.title}</span>
                    <span className="text-zinc-400">{votes.participant1} votos</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 transition-all duration-300" style={{ width: `${percent1}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-300">{currentMatch.participant2?.title}</span>
                    <span className="text-zinc-400">{votes.participant2} votos</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 transition-all duration-300" style={{ width: `${percent2}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-zinc-950">
      <Navbar />
      <div className="flex items-center justify-center min-h-[600px]">
        <p className="text-zinc-400">Cargando sala...</p>
      </div>
    </div>
  )
}
