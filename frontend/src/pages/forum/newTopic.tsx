import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTopic } from '../../services/api'

export default function NewTopic() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !author.trim()) {
      setError('Por favor completa todos los campos')
      return
    }
    setSending(true)
    setError('')
    try {
      await createTopic({ title, content, author }, image || undefined)
      navigate('/forum')
    } catch {
      setError('Error al crear el tema, intenta de nuevo')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      <div className="bg-white px-4 pt-12 pb-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate('/forum')}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor"
            strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Nueva publicación</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-4">

        <div className="card p-4">
          <label className="text-sm font-semibold text-gray-700 block mb-2">Tu nombre</label>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
              {author ? author[0].toUpperCase() : '?'}
            </div>
            <input
              placeholder="¿Cómo te llamas?"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="card p-4">
          <label className="text-sm font-semibold text-gray-700 block mb-2">Título del tema</label>
          <input
            placeholder="Ej: ¿Qué bares recomiendan en Medellín?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="card p-4">
          <label className="text-sm font-semibold text-gray-700 block mb-2">¿Qué quieres compartir?</label>
          <textarea
            placeholder="Cuéntale a la comunidad..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 transition-all resize-none"
          />
        </div>

        <div className="card p-4">
          <label className="text-sm font-semibold text-gray-700 block mb-3">📷 Añadir imagen (opcional)</label>
          {preview ? (
            <div className="relative">
              <img src={preview} alt="preview" className="w-full rounded-2xl object-cover max-h-48" />
              <button
                onClick={() => { setImage(null); setPreview(null) }}
                className="absolute top-2 right-2 w-7 h-7 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center text-sm hover:bg-opacity-70">
                ✕
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl py-6 cursor-pointer hover:border-blue-400 transition-all">
              <span className="text-2xl mb-1">🖼️</span>
              <span className="text-sm text-gray-400">Toca para seleccionar una imagen</span>
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center font-medium bg-red-50 border border-red-100 rounded-2xl py-3 px-4">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button onClick={() => navigate('/forum')} className="btn-secondary">Cancelar</button>
          <button onClick={handleSubmit} disabled={sending} className="btn-primary">
            {sending ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}
