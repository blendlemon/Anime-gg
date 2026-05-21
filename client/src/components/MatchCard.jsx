import React from 'react'
import { OpeningCard } from './OpeningCard'

// Componente para mostrar un match con dos openings enfrentados
export const MatchCard = ({ match, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-violet-600 hover:shadow-lg hover:shadow-violet-600/20 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="bg-zinc-800 px-4 py-2 border-b border-zinc-700">
        <p className="text-zinc-400 text-xs font-medium">
          Match {match.match_number} • Ronda {match.round}
        </p>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Participant 1 */}
        <div className="mb-3">
          <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800 mb-2">
            <img
              src={match.participant1?.thumbnail_url || '/placeholder.png'}
              alt={match.participant1?.title}
              className="w-full h-full object-cover"
            />
          </div>
          <h4 className="text-zinc-100 font-semibold text-sm line-clamp-1">
            {match.participant1?.title}
          </h4>
          <p className="text-zinc-400 text-xs">{match.participant1?.anime_title}</p>
        </div>

        {/* VS */}
        <div className="text-center py-2 mb-3">
          <span className="text-violet-400 font-bold">VS</span>
        </div>

        {/* Participant 2 */}
        <div>
          <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800 mb-2">
            <img
              src={match.participant2?.thumbnail_url || '/placeholder.png'}
              alt={match.participant2?.title}
              className="w-full h-full object-cover"
            />
          </div>
          <h4 className="text-zinc-100 font-semibold text-sm line-clamp-1">
            {match.participant2?.title}
          </h4>
          <p className="text-zinc-400 text-xs">{match.participant2?.anime_title}</p>
        </div>
      </div>
    </div>
  )
}
