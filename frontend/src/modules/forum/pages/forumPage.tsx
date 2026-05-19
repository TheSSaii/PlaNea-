import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Topic } from '../types/forum.types';
import { getAllTopics } from '../api/forum.api';
import BottomNav from '../../plans/components/BottomNav';

export default function ForumPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllTopics()
      .then(setTopics)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <span className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm font-medium">Cargando comunidad...</p>
        </div>
      </div>
    );
  }

  const totalComments = topics.reduce((sum, topic) => sum + (topic.comments?.length ?? 0), 0);
  const totalLikes = topics.reduce((sum, topic) => sum + (topic.likes?.length ?? 0), 0);
  const newestTopic = topics[0];

  return (
    <div className="page-shell bg-[radial-gradient(circle_at_top,#eff6ff_0,#f8fafc_34rem)]">
      <div className="page-header">
        <div className="page-header-inner flex-col items-stretch">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">quePlan</p>
              <h1 className="text-2xl font-black text-slate-950 tracking-tight">Comunidad</h1>
              <p className="mt-1 text-sm text-slate-500">Ideas, parches y recomendaciones de la gente.</p>
            </div>
            <button
              onClick={() => navigate('/forum/new')}
              className="shrink-0 bg-blue-600 text-white text-sm font-bold px-4 py-2.5 rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
            >
              Crear tema
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500">Temas</p>
              <p className="mt-1 text-lg font-black text-blue-700">{topics.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Comentarios</p>
              <p className="mt-1 text-lg font-black text-slate-800">{totalComments}</p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-rose-400">Likes</p>
              <p className="mt-1 text-lg font-black text-rose-600">{totalLikes}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content flex flex-col gap-4">
        {topics.length === 0 ? (
          <div className="section-card overflow-hidden text-center mt-4">
            <div className="bg-gradient-to-br from-blue-600 to-slate-950 px-6 py-10 text-white">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black">
                +
              </div>
              <p className="text-lg font-black">La comunidad esta esperando el primer tema.</p>
              <p className="mt-2 text-sm text-blue-100">Pregunta por planes, recomienda lugares o arma conversacion.</p>
              <button
                onClick={() => navigate('/forum/new')}
                className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-lg shadow-slate-950/20 active:scale-95 transition"
              >
                Crear primera publicacion
              </button>
            </div>
          </div>
        ) : (
          <>
            {newestTopic && (
              <button
                onClick={() => navigate(`/forum/topic/${newestTopic.id}`)}
                className="w-full rounded-3xl border border-blue-100 bg-white p-4 text-left shadow-xl shadow-blue-900/5 transition hover:-translate-y-0.5 hover:shadow-blue-900/10 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white font-black">
                    {newestTopic.author?.name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Tema destacado</p>
                    <h2 className="truncate text-base font-black text-slate-950">{newestTopic.title}</h2>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Nuevo</span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">{newestTopic.content}</p>
              </button>
            )}

            <div className="flex flex-col gap-3">
              {topics.map((topic) => (
                <article
                  key={topic.id}
                  onClick={() => navigate(`/forum/topic/${topic.id}`)}
                  className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/10 active:scale-[0.99]"
                >
                  {topic.imageUrl && (
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <img
                        src={`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}${topic.imageUrl}`}
                        alt="imagen del topic"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/45 to-transparent" />
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="soft-icon ring-4 ring-blue-50">
                        {topic.author?.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-slate-900 truncate">
                          {topic.author?.name ?? 'Anonimo'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(topic.createdAt).toLocaleDateString('es-CO', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                        Foro
                      </span>
                    </div>

                    <h2 className="font-black text-slate-950 text-base leading-snug group-hover:text-blue-700 transition-colors">
                      {topic.title}
                    </h2>
                    <p className="mt-2 text-slate-500 text-sm leading-relaxed line-clamp-2">{topic.content}</p>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500 inline-flex items-center gap-1.5">
                          <span className="inline-icon bg-rose-50 text-rose-500">L</span>
                          {topic.likes?.length ?? 0}
                        </span>
                        <span className="text-xs font-bold text-slate-500 inline-flex items-center gap-1.5">
                          <span className="inline-icon">C</span>
                          {topic.comments?.length ?? 0}
                        </span>
                      </div>
                      <span className="text-xs font-black text-blue-600">Abrir</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-24 left-1/2 z-40 flex w-[min(calc(100%_-_1.5rem),34rem)] -translate-x-1/2 justify-end pointer-events-none">
        <button
          onClick={() => navigate('/forum/new')}
          className="h-14 w-14 rounded-2xl bg-blue-600 text-xl font-black text-white shadow-xl shadow-blue-900/25 hover:bg-blue-700 active:scale-95 transition-all pointer-events-auto"
        >
          +
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
