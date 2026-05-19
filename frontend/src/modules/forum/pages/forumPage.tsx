import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Topic } from '../types/forum.types';
import { getAllTopics } from '../api/forum.api';
import BottomNav from '../../plans/components/BottomNav';
import {
  Avatar,
  Button,
  EmptyState,
  LoadingScreen,
  PageContent,
  PageHeader,
  PageShell,
  PageTitleBlock,
  StatGrid,
} from '../../../shared/ui';

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
    return <LoadingScreen message="Cargando comunidad..." />;
  }

  const totalComments = topics.reduce((sum, topic) => sum + (topic.comments?.length ?? 0), 0);
  const totalLikes = topics.reduce((sum, topic) => sum + (topic.likes?.length ?? 0), 0);
  const newestTopic = topics[0];

  return (
    <PageShell>
      <PageHeader>
        <PageTitleBlock
          eyebrow="QuePlan"
          title="Comunidad"
          subtitle="Ideas, parches y recomendaciones de la gente."
          action={
            <Button variant="primary" size="sm" onClick={() => navigate('/forum/new')}>
              Crear tema
            </Button>
          }
        />
        <StatGrid
          items={[
            { label: 'Temas', value: topics.length, tone: 'brand' },
            { label: 'Comentarios', value: totalComments, tone: 'neutral' },
            { label: 'Likes', value: totalLikes, tone: 'danger' },
          ]}
        />
      </PageHeader>

      <PageContent>
        {topics.length === 0 ? (
          <EmptyState
            tone="brand"
            title="La comunidad está esperando el primer tema"
            description="Pregunta por planes, recomienda lugares o arma conversación."
            actionLabel="Crear primera publicación"
            onAction={() => navigate('/forum/new')}
          />
        ) : (
          <>
            {newestTopic && (
              <button
                type="button"
                onClick={() => navigate(`/forum/topic/${newestTopic.id}`)}
                className="content-card w-full text-left"
              >
                <div className="content-card-body">
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar name={newestTopic.author?.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Tema destacado</p>
                      <h2 className="truncate text-base font-semibold text-slate-900">{newestTopic.title}</h2>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Nuevo
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{newestTopic.content}</p>
                </div>
              </button>
            )}

            <div className="flex flex-col gap-3">
              {topics.map((topic) => (
                <article
                  key={topic.id}
                  onClick={() => navigate(`/forum/topic/${topic.id}`)}
                  className="content-card"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/forum/topic/${topic.id}`)}
                >
                  {topic.imageUrl && (
                    <div className="content-card-media">
                      <img
                        src={`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}${topic.imageUrl}`}
                        alt=""
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="content-card-body">
                    <div className="mb-3 flex items-center gap-3">
                      <Avatar name={topic.author?.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {topic.author?.name ?? 'Anónimo'}
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
                    </div>

                    <h2 className="text-base font-semibold leading-snug text-slate-950">{topic.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{topic.content}</p>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                        <span>{topic.likes?.length ?? 0} likes</span>
                        <span>{topic.comments?.length ?? 0} comentarios</span>
                      </div>
                      <span className="text-xs font-semibold text-blue-600">Abrir</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </PageContent>

      {topics.length > 0 && (
        <div
          className="fixed z-30"
          style={{
            bottom: 'calc(var(--nav-height) + var(--bottom-safe) + 0.5rem)',
            right: 'max(1rem, calc((100% - min(100% - 2rem, var(--page-max))) / 2 + 1rem))',
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/forum/new')}
            className="bottom-nav-fab text-xl font-semibold"
            aria-label="Nueva publicación"
          >
            +
          </button>
        </div>
      )}

      <BottomNav />
    </PageShell>
  );
}
