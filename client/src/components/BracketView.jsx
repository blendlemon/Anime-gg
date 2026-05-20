import React, { useState, useMemo } from 'react'
import './BracketView.css'

const Match = ({ match, round, onSelectWinner }) => {
  const [selected, setSelected] = useState(null)

  const handleSelectWinner = (participantId) => {
    setSelected(participantId)
    onSelectWinner(match.id, participantId)
  }

  return (
    <div className="match-container">
      <div className="match-box">
        {match.participant1 ? (
          <div
            className={`match-participant ${
              selected === match.participant1.id ? 'selected' : ''
            } ${match.winner?.id === match.participant1.id ? 'winner' : ''}`}
            onClick={() => handleSelectWinner(match.participant1.id)}
          >
            <div className="participant-rank">#{match.participant1.seed}</div>
            <div className="participant-info">
              <div className="opening-title">{match.participant1.title}</div>
              <div className="anime-title">{match.participant1.anime}</div>
            </div>
            {match.winner?.id === match.participant1.id && (
              <div className="winner-badge">✓</div>
            )}
          </div>
        ) : (
          <div className="match-participant empty">
            <div className="opening-title">Pendiente</div>
          </div>
        )}

        {match.participant2 ? (
          <div
            className={`match-participant ${
              selected === match.participant2.id ? 'selected' : ''
            } ${match.winner?.id === match.participant2.id ? 'winner' : ''}`}
            onClick={() => handleSelectWinner(match.participant2.id)}
          >
            <div className="participant-rank">#{match.participant2.seed}</div>
            <div className="participant-info">
              <div className="opening-title">{match.participant2.title}</div>
              <div className="anime-title">{match.participant2.anime}</div>
            </div>
            {match.winner?.id === match.participant2.id && (
              <div className="winner-badge">✓</div>
            )}
          </div>
        ) : (
          <div className="match-participant empty">
            <div className="opening-title">Pendiente</div>
          </div>
        )}
      </div>
    </div>
  )
}

const BracketView = ({ openings = [] }) => {
  const [matches, setMatches] = useState([])

  useMemo(() => {
    if (openings.length !== 16) {
      console.warn('BracketView requires exactly 16 openings')
      return
    }

    const generateMatches = () => {
      // Round 1: 8 matches with 16 openings
      const round1Matches = []
      for (let i = 0; i < 8; i++) {
        round1Matches.push({
          id: `r1-m${i}`,
          round: 1,
          participant1: { ...openings[i * 2], seed: i * 2 + 1 },
          participant2: { ...openings[i * 2 + 1], seed: i * 2 + 2 },
          winner: null,
        })
      }

      // Round 2: 4 matches (winners from round 1)
      const round2Matches = []
      for (let i = 0; i < 4; i++) {
        round2Matches.push({
          id: `r2-m${i}`,
          round: 2,
          participant1: null,
          participant2: null,
          winner: null,
        })
      }

      // Round 3 (Semifinal): 2 matches
      const round3Matches = [
        { id: 'r3-m0', round: 3, participant1: null, participant2: null, winner: null },
        { id: 'r3-m1', round: 3, participant1: null, participant2: null, winner: null },
      ]

      // Round 4 (Final): 1 match
      const round4Matches = [
        { id: 'r4-m0', round: 4, participant1: null, participant2: null, winner: null },
      ]

      return {
        round1: round1Matches,
        round2: round2Matches,
        round3: round3Matches,
        round4: round4Matches,
      }
    }

    const initialMatches = generateMatches()
    setMatches(initialMatches)
  }, [openings])

  const handleSelectWinner = (matchId, winnerId) => {
    setMatches((prev) => {
      const updated = { ...prev }
      let matchToUpdate = null
      let roundKey = ''

      // Find the match
      Object.entries(updated).forEach(([key, roundMatches]) => {
        const found = roundMatches.find((m) => m.id === matchId)
        if (found) {
          matchToUpdate = found
          roundKey = key
        }
      })

      if (matchToUpdate) {
        // Update the winner
        const matchIndex = updated[roundKey].indexOf(matchToUpdate)
        updated[roundKey][matchIndex].winner = {
          id: winnerId,
          title:
            matchToUpdate.participant1?.id === winnerId
              ? matchToUpdate.participant1?.title
              : matchToUpdate.participant2?.title,
          anime:
            matchToUpdate.participant1?.id === winnerId
              ? matchToUpdate.participant1?.anime
              : matchToUpdate.participant2?.anime,
        }

        // Advance to next round
        const nextRound = getNextRound(roundKey)
        if (nextRound) {
          const nextRoundMatches = updated[nextRound]
          const nextMatchIndex = Math.floor(matchIndex / 2)
          const isFirstParticipant = matchIndex % 2 === 0

          if (isFirstParticipant) {
            nextRoundMatches[nextMatchIndex].participant1 =
              matchToUpdate.winner
          } else {
            nextRoundMatches[nextMatchIndex].participant2 =
              matchToUpdate.winner
          }
        }
      }

      return updated
    })
  }

  const getNextRound = (currentRound) => {
    const roundMap = {
      round1: 'round2',
      round2: 'round3',
      round3: 'round4',
      round4: null,
    }
    return roundMap[currentRound]
  }

  return (
    <div className="bracket-container">
      <h2 className="bracket-title">Tournament Bracket</h2>
      <div className="bracket-wrapper">
        {/* Round 1 */}
        <div className="bracket-round">
          <h3 className="round-title">Round 1</h3>
          <div className="matches-column">
            {matches.round1?.map((match) => (
              <Match
                key={match.id}
                match={match}
                round={1}
                onSelectWinner={handleSelectWinner}
              />
            ))}
          </div>
        </div>

        {/* Round 2 */}
        <div className="bracket-round">
          <h3 className="round-title">Round 2</h3>
          <div className="matches-column">
            {matches.round2?.map((match) => (
              <Match
                key={match.id}
                match={match}
                round={2}
                onSelectWinner={handleSelectWinner}
              />
            ))}
          </div>
        </div>

        {/* Round 3 (Semifinal) */}
        <div className="bracket-round">
          <h3 className="round-title">Semifinal</h3>
          <div className="matches-column">
            {matches.round3?.map((match) => (
              <Match
                key={match.id}
                match={match}
                round={3}
                onSelectWinner={handleSelectWinner}
              />
            ))}
          </div>
        </div>

        {/* Round 4 (Final) */}
        <div className="bracket-round">
          <h3 className="round-title">Final</h3>
          <div className="matches-column">
            {matches.round4?.map((match) => (
              <Match
                key={match.id}
                match={match}
                round={4}
                onSelectWinner={handleSelectWinner}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BracketView
