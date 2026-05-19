import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Topic } from '../types/forum.types';
import { getTopicById, addComment, toggleLike, getLikes } from '../api/forum.api';
import BottomNav from '../../plans/components/BottomNav';

function getStoredUser(): { id?: string; name?: string | null } | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function TopicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const storedUser = getStoredUser();
  const [author, setAuthor] = useState(storedUser?.name ?? '');
  const [sending, setSending] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [username, setUsername] = useState(() => localStorage.getItem('forum_username') || '');

  useEffect(() => {
    if (!id) return;
    getTopicById(id).then(setTopic).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!username || !id) return;
    getLikes(id, username).then((data) => {
      setLiked(data.liked);
      setLikeCount(data.count);
    });
  }, [id, username]);

  const handleLike = async () => {
    let name = username || author;
    if (!name) {
      name = prompt('Cual es tu nombre?') || '';
      if (!name.trim()) return;
      localStorage.setItem('forum_username', name);
      setUsername(name);
    }
    try {
      const data = await toggleLike(id!, name);
      setLiked(data.liked);
      setLikeCount(data.count);
    } catch (e) {
      console.error('Error al dar like:', e);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !author.trim() || !id) return;
    setSending(true);
    await addComment(id, { content: commentText, author, authorId: storedUser?.id });
    const updated = await getTopicById(id);
    setTopic(updated);
    setCommentText('');
    setSending(false);
  };

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <span className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm font-medium">Cargando publicacion...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Tema no encontrado</p>
      </div>
    );
  }

  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

  return (
    <div className="page-shell bg-[radial-gradient(circle_at_top,#eff6ff_0,#f8fafc_34rem)] pb-56">
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
          <div className="min-w-0">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">Comunidad</p>
            <h1 className="truncate text-xl font-black text-slate-950">Publicacion</h1>
          </div>
        </div>
      </div>

      <div className="page-content flex flex-col gap-4">
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-blue-900/5">
          {topic.imageUrl && (
            <div className="relative h-64 overflow-hidden bg-slate-100">
              <img src={`${apiUrl}${topic.imageUrl}`} alt="imagen del topic" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/40 to-transparent" />
            </div>
          )}

          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="soft-icon ring-4 ring-blue-50">{topic.author?.name?.[0]?.toUpperCase() ?? '?'}</div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-slate-900 truncate">{topic.author?.name ?? 'Anonimo'}</p>
                <p className="text-xs text-slate-400">
                  {new Date(topic.createdAt).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-blue-600">Foro</span>
            </div>

            <h2 className="font-black text-slate-950 text-xl leading-tight mb-3">{topic.title}</h2>
            <p className="whitespace-pre-line text-slate-600 text-sm leading-7">{topic.content}</p>

            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
              <button
                onClick={handleLike}
                className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black transition-all active:scale-95 ${
                  liked ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-500'
                }`}
              >
                <span className="inline-icon bg-white text-current">L</span>
                {likeCount} Me gusta
              </button>
              <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-500">
                <span className="inline-icon bg-white">C</span>
                {topic.comments?.length ?? 0} comentarios
              </span>
            </div>
          </div>
        </article>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-black text-slate-950 text-base">Comentarios</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
              {topic.comments?.length ?? 0}
            </span>
          </div>

          {!topic.comments || topic.comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
              <p className="text-slate-500 text-sm font-bold">Se el primero en comentar</p>
              <p className="mt-1 text-xs text-slate-400">Tu respuesta puede arrancar la conversacion.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {topic.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs flex-shrink-0">
                    {comment.author?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2.5 flex-1 min-w-0">
                    <p className="font-bold text-xs text-slate-900 mb-1">{comment.author?.name ?? 'Anonimo'}</p>
                    <p className="text-sm leading-relaxed text-slate-600">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="fixed bottom-[5.25rem] left-0 right-0 border-t border-slate-200/80 bg-white/95 px-4 py-3 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[34rem] flex-col gap-2">
          <input
            placeholder="Tu nombre"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="input-field"
          />
          <div className="flex gap-2">
            <input
              placeholder="Escribe un comentario..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input-field"
            />
            <button
              onClick={handleComment}
              disabled={sending}
              className="bg-blue-600 text-white font-black px-4 py-3 rounded-2xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {sending ? '...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
