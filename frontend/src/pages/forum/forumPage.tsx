import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Topic } from '../types/forum.types'
import { getAllTopics } from '../services/api'

export default function ForumPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getAllTopics()
      .then(setTopics)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-bold text-gray-900">Comunidad</h1>
        <button
          onClick={() => navigate('/forum/new')}
          className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-2xl hover:bg-blue-700 active:scale-95 transition-all">
          + Crear tema
        </button>
      </div>

      {/* Feed */}
      <div className="max-w-lg mx-auto px-4 pt-4 flex flex-col gap-3">
        {topics.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-gray-400 text-sm">No hay publicaciones aún.</p>
            <p className="text-gray-400 text-sm">¡Sé el primero en crear una!</p>
          </div>
        ) : (
          topics.map(topic => (
            <div key={topic.id} onClick={() => navigate(`/forum/topic/${topic.id}`)}
              className="card cursor-pointer hover:shadow-md transition-all active:scale-95">

              {/* Imagen si existe */}
              {topic.imageUrl && (
                <img
                  src={`http://localhost:3000${topic.imageUrl}`}
                  alt="imagen del topic"
                  className="w-full object-cover max-h-48 rounded-t-2xl"
                />
              )}

              <div className="p-4">
                {/* Autor */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                    {topic.author?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{topic.author}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(topic.createdAt).toLocaleDateString('es-CO', {
                        day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Contenido */}
                <h2 className="font-semibold text-gray-900 text-sm mb-1">{topic.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{topic.content}</p>

                {/* Footer */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400">🤍 Me gusta</span>
                  <span className="text-xs text-gray-400">💬 {topic.comments?.length ?? 0} comentarios</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botón flotante */}
      <button onClick={() => navigate('/forum/new')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-700 active:scale-95 transition-all">
        +
      </button>
    </div>
  )
}