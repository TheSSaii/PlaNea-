import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Topic } from '../../types/forum.types'
import { getTopicById, addComment, toggleLike, getLikes } from '../../services/api'

export default function TopicDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [author, setAuthor] = useState('')
  const [sending, setSending] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [username, setUsername] = useState(() => localStorage.getItem('forum_username') || '')

  useEffect(() => {
    if (!id) return
    getTopicById(id).then(setTopic).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!username || !id) return
    getLikes(id, username).then(data => {
      setLiked(data.liked)
      setLikeCount(data.count)
    })
  }, [id, username])

  const handleLike = async () => {
    let name = username || author
    if (!name) {
      name = prompt('¿Cuál es tu nombre?') || ''
      if (!name.trim()) return
      localStorage.setItem('forum_username', name)
      setUsername(name)
    }
    try {
      const data = await toggleLike(id!, name)
      setLiked(data.liked)
      setLikeCount(data.count)
    } catch (e) {
      console.error('Error al dar like:', e)
    }
  }

  const handleComment = async () => {
    if (!commentText.trim() || !author.trim() || !id) return
    setSending(true)
    await addComment(id, { content: commentText, author })
    const updated = await getTopicById(id)
    setTopic(updated)
    setCommentText('')
    setAuthor('')
    setSending(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )

  if (!topic) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Tema no encontrado</p>
    </div>
  )

  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

  return (
    <div className="min-h-screen bg-gray-50 pb-36">

      <div className="bg-white px-4 pt-12 pb-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate('/forum')}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor"
            strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Publicación</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 flex flex-col gap-3">

        <div className="card overflow-hidden">
          {topic.imageUrl && (
            <img
              src={`${apiUrl}${topic.imageUrl}`}
              alt="imagen del topic"
              className="w-full object-cover max-h-64"
            />
          )}

          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-base flex-shrink-0">
                {topic.author?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{topic.author?.name ?? 'Anónimo'}</p>
                <p className="text-xs text-gray-400">
                  {new Date(topic.createdAt).toLocaleDateString('es-CO', {
                    day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <h2 className="font-bold text-gray-900 text-base mb-2">{topic.title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{topic.content}</p>

            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 text-xs font-medium transition-all active:scale-95
                  ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                {liked ? '❤️' : '🤍'} {likeCount} Me gusta
              </button>
              <span className="text-xs text-gray-400">
                💬 {topic.comments?.length ?? 0} comentarios
              </span>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">
            Comentarios ({topic.comments?.length ?? 0})
          </h3>

          {!topic.comments || topic.comments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Sé el primero en comentar
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {topic.comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs flex-shrink-0">
                    {comment.author?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="bg-gray-50 rounded-2xl px-3 py-2 flex-1">
                    <p className="font-semibold text-xs text-gray-900 mb-1">{comment.author?.name ?? 'Anónimo'}</p>
                    <p className="text-sm text-gray-600">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          <input
            placeholder="Tu nombre (necesario para comentar y dar like)"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            className="input-field"
          />
          <div className="flex gap-2">
            <input
              placeholder="Escribe un comentario..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="input-field"
            />
            <button
              onClick={handleComment}
              disabled={sending}
              className="bg-blue-600 text-white font-semibold px-4 py-3 rounded-2xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50">
              {sending ? '...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
