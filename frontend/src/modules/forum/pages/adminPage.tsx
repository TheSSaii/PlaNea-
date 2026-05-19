import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Topic, BlockedUser } from '../types/forum.types'
import {
  getAllTopics, deleteTopic, getBlockedUsers,
  unblockUser, blockUser, deleteComment
} from '../api/forum.api'
import BottomNav from '../../plans/components/BottomNav'

const ADMIN_PASSWORD = 'admin123'

export default function AdminPage() {
  const navigate = useNavigate()
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [topics, setTopics] = useState<Topic[]>([])
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'topics' | 'users'>('topics')
  const [usernameToBlock, setUsernameToBlock] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setPasswordError('')
    } else {
      setPasswordError('Contraseña incorrecta')
    }
  }

  useEffect(() => {
    if (!authenticated) return
    Promise.all([getAllTopics(), getBlockedUsers()])
      .then(([t, b]) => { setTopics(t); setBlockedUsers(b) })
      .finally(() => setLoading(false))
  }, [authenticated])

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este tema?')) return
    await deleteTopic(id)
    setTopics(prev => prev.filter(t => t.id !== id))
    showMessage('Tema eliminado correctamente')
  }

  const handleDeleteComment = async (topicId: string, commentId: string) => {
    if (!confirm('¿Seguro que quieres eliminar este comentario?')) return
    await deleteComment(topicId, commentId)
    setTopics(prev => prev.map(t =>
      t.id === topicId
        ? { ...t, comments: t.comments.filter(c => c.id !== commentId) }
        : t
    ))
    showMessage('Comentario eliminado correctamente')
  }

  const handleBlockUser = async () => {
    if (!usernameToBlock.trim()) return
    await blockUser(usernameToBlock)
    const updated = await getBlockedUsers()
    setBlockedUsers(updated)
    setUsernameToBlock('')
    showMessage(`Usuario ${usernameToBlock} bloqueado`)
  }

  const handleUnblockUser = async (username: string) => {
    await unblockUser(username)
    setBlockedUsers(prev => prev.filter(u => u.username !== username))
    showMessage(`Usuario ${username} desbloqueado`)
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-blue-600">A</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Panel Admin</h1>
            <p className="text-sm text-gray-400 mt-1">Foro Comunidad</p>
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="input-field"
            />
            {passwordError && (
              <p className="text-xs text-red-500 text-center">{passwordError}</p>
            )}
            <button onClick={handleLogin} className="btn-primary">Entrar</button>
            <button onClick={() => navigate('/forum')} className="btn-secondary">Volver al foro</button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-28">

      <div className="bg-white px-4 pt-12 pb-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/forum')}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor"
              strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Panel Admin</h1>
        </div>
        <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-3 py-1 rounded-full">Admin</span>
      </div>

      {message && (
        <div className="max-w-lg mx-auto px-4 pt-3">
          <div className="bg-green-50 border border-green-100 text-green-700 text-sm font-medium rounded-2xl py-3 px-4 text-center">
            {message}
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('topics')}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all
              ${tab === 'topics' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
            Temas ({topics.length})
          </button>
          <button
            onClick={() => setTab('users')}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all
              ${tab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
            Bloqueados ({blockedUsers.length})
          </button>
        </div>

        {tab === 'topics' && (
          <div className="flex flex-col gap-3">
            {topics.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No hay temas</p>
            ) : (
              topics.map(topic => (
                <div key={topic.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{topic.title}</p>
                      <p className="text-xs text-gray-400">por {topic.author?.name ?? 'Anónimo'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="text-xs bg-red-50 text-red-500 font-semibold px-3 py-1.5 rounded-xl hover:bg-red-100 transition-all flex-shrink-0">
                      Eliminar
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{topic.content}</p>

                  {topic.comments?.length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2">
                        Comentarios ({topic.comments.length})
                      </p>
                      <div className="flex flex-col gap-2">
                        {topic.comments.map(comment => (
                          <div key={comment.id}
                            className="flex items-center justify-between gap-2 bg-gray-50 rounded-xl px-3 py-2">
                            <div>
                              <p className="text-xs font-semibold text-gray-700">{comment.author?.name ?? 'Anónimo'}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{comment.content}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteComment(topic.id, comment.id)}
                              className="text-xs text-red-400 hover:text-red-600 flex-shrink-0">
                              Eliminar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="flex flex-col gap-3">
            <div className="card p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Bloquear usuario</p>
              <div className="flex gap-2">
                <input
                  placeholder="Nombre del usuario"
                  value={usernameToBlock}
                  onChange={e => setUsernameToBlock(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleBlockUser()}
                  className="input-field"
                />
                <button
                  onClick={handleBlockUser}
                  className="bg-red-500 text-white font-semibold px-4 py-3 rounded-2xl hover:bg-red-600 active:scale-95 transition-all flex-shrink-0">
                  Bloquear
                </button>
              </div>
            </div>

            {blockedUsers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No hay usuarios bloqueados</p>
            ) : (
              blockedUsers.map(user => (
                <div key={user.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-400">
                      Bloqueado el {new Date(user.blockedAt).toLocaleDateString('es-CO', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnblockUser(user.username)}
                    className="text-xs bg-green-50 text-green-600 font-semibold px-3 py-1.5 rounded-xl hover:bg-green-100 transition-all">
                    Desbloquear
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
