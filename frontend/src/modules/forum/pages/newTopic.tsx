import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTopic } from '../api/forum.api';
import BottomNav from '../../plans/components/BottomNav';

function getStoredUser(): { id?: string; name?: string | null } | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function NewTopic() {
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState(storedUser?.name ?? '');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !author.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setSending(true);
    setError('');
    try {
      await createTopic({ title, content, author, authorId: storedUser?.id }, image || undefined);
      navigate('/forum');
    } catch {
      setError('Error al crear el tema, intenta de nuevo');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-shell bg-[radial-gradient(circle_at_top,#eff6ff_0,#f8fafc_34rem)]">
      <div className="page-header">
        <div className="page-header-inner justify-start">
          <button
            onClick={() => navigate('/forum')}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">Comunidad</p>
            <h1 className="text-xl font-black text-slate-950">Nueva publicacion</h1>
          </div>
        </div>
      </div>

      <div className="page-content flex flex-col gap-4">
        <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl shadow-blue-900/5">
          <div className="bg-blue-600 px-5 py-5 text-white">
            <p className="text-xs font-black uppercase tracking-widest text-blue-100">Comparte algo bueno</p>
            <h2 className="mt-1 text-2xl font-black leading-tight">Arma una publicacion para la comunidad</h2>
          </div>
          <div className="p-5">
            <p className="text-sm leading-relaxed text-slate-500">Cuenta una recomendacion, una pregunta o una idea de plan. Que se sienta claro y facil de responder.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-3">Tu nombre</label>
          <div className="flex items-center gap-3">
            <div className="soft-icon ring-4 ring-blue-50">{author ? author[0].toUpperCase() : '?'}</div>
            <input
              placeholder="Como te llamas?"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-3">Titulo del tema</label>
          <input
            placeholder="Ej: Que bares recomiendan en Medellin?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-3">Que quieres compartir?</label>
          <textarea
            placeholder="Cuentale a la comunidad..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="input-field resize-none"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-3">Anadir imagen (opcional)</label>
          {preview ? (
            <div className="relative">
              <img src={preview} alt="preview" className="w-full rounded-2xl object-cover max-h-56" />
              <button
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2 w-9 h-9 bg-slate-950/70 text-white rounded-2xl text-sm font-black hover:bg-slate-950"
              >
                x
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 py-8 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm font-black">I</span>
              <span className="text-sm font-bold text-slate-600">Toca para seleccionar una imagen</span>
              <span className="mt-1 text-xs text-slate-400">Opcional, pero ayuda a que el tema destaque.</span>
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center font-medium bg-red-50 border border-red-100 rounded-xl py-3 px-4">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/forum')} className="btn-secondary">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={sending} className="btn-primary shadow-lg shadow-blue-600/20">
            {sending ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
