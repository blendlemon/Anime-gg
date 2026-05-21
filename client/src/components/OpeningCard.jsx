import React, { useState } from 'react'

// Componente para mostrar una card de opening
export const OpeningCard = ({ opening, onClick }) => {
  // Estado para controlar el modal de vídeo
  const [showVideoModal, setShowVideoModal] = useState(false)

  // Abre el modal de vídeo
  const handleOpenVideo = (e) => {
    e.stopPropagation()
    setShowVideoModal(true)
  }

  // Cierra el modal de vídeo
  const handleCloseVideo = () => {
    setShowVideoModal(false)
  }

  return (
    <>
      <div
        onClick={onClick}
        className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-violet-600 hover:shadow-lg hover:shadow-violet-600/20 transition-all cursor-pointer group"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-zinc-800">
          <img
            src={opening.thumbnail_url || '/placeholder.png'}
            alt={opening.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          {/* Icono de reproducción */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={handleOpenVideo}
              className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white hover:bg-violet-700 transition"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <h3 className="text-zinc-100 font-semibold text-sm line-clamp-2">
            {opening.title}
          </h3>
          <p className="text-zinc-400 text-xs">{opening.anime_title}</p>
          {opening.artist && (
            <p className="text-violet-400 text-xs">{opening.artist}</p>
          )}
          {opening.type && (
            <span className="inline-block bg-violet-600/20 text-violet-300 text-xs px-2 py-1 rounded-full">
              {opening.type}
            </span>
          )}
        </div>
      </div>

      {/* Modal de vídeo */}
      {showVideoModal && (
        <div
          onClick={handleCloseVideo}
          className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800 shadow-2xl"
          >
            {/* Botón de cerrar */}
            <button
              onClick={handleCloseVideo}
              className="absolute top-4 right-4 w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-100 transition z-10"
            >
              ✕
            </button>

            <div className="p-6 space-y-6">
              {/* Título y anime */}
              <div>
                <h2 className="text-2xl font-bold text-zinc-100">
                  {opening.title}
                </h2>
                <p className="text-zinc-400 mt-2">{opening.anime_title}</p>
              </div>

              {/* Reproductor de vídeo */}
              <div className="bg-zinc-800 rounded-xl overflow-hidden">
                {opening.video_url ? (
                  <video
                    src={opening.video_url}
                    controls
                    autoPlay
                    className="w-full rounded-xl"
                  />
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center text-zinc-400">
                    Vídeo no disponible
                  </div>
                )}
              </div>

              {/* Información adicional */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                {opening.artist && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase">Artista</p>
                    <p className="text-zinc-100 font-semibold">
                      {opening.artist}
                    </p>
                  </div>
                )}
                {opening.type && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase">Tipo</p>
                    <p className="text-zinc-100 font-semibold">
                      {opening.type === 'OP' ? 'Opening' : 'Ending'}
                    </p>
                  </div>
                )}
                {opening.year && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase">Año</p>
                    <p className="text-zinc-100 font-semibold">
                      {opening.year}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
