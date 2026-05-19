import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Topic } from "../types/forum.types";
import {
  getTopicById,
  addComment,
  toggleLike,
  getLikes,
} from "../api/forum.api";
import BottomNav from "../../plans/components/BottomNav";
import {
  Avatar,
  BackButton,
  Button,
  Input,
  Textarea,
  LoadingScreen,
  PageContent,
  PageHeader,
  PageShell,
} from "../../../shared/ui";

function getStoredUser(): { id?: string; name?: string | null } | null {
  try {
    const raw = localStorage.getItem("user");
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
  const [commentText, setCommentText] = useState("");
  const storedUser = getStoredUser();
  const [author, setAuthor] = useState(storedUser?.name ?? "");
  const [sending, setSending] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [username, setUsername] = useState(
    () => localStorage.getItem("forum_username") || "",
  );

  useEffect(() => {
    if (!id) return;
    getTopicById(id)
      .then(setTopic)
      .finally(() => setLoading(false));
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
      name = prompt("¿Cuál es tu nombre?") || "";
      if (!name.trim()) return;
      localStorage.setItem("forum_username", name);
      setUsername(name);
    }
    try {
      const data = await toggleLike(id!, name);
      setLiked(data.liked);
      setLikeCount(data.count);
    } catch (e) {
      console.error("Error al dar like:", e);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !author.trim() || !id) return;
    setSending(true);
    await addComment(id, {
      content: commentText,
      author,
      authorId: storedUser?.id,
    });
    const updated = await getTopicById(id);
    setTopic(updated);
    setCommentText("");
    setSending(false);
  };

  if (loading) {
    return <LoadingScreen message="Cargando publicación..." />;
  }

  if (!topic) {
    return (
      <PageShell className="page-shell--center">
        <p className="text-sm text-slate-500">Tema no encontrado</p>
      </PageShell>
    );
  }

  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  return (
    <PageShell className="page-shell--composer">
      <PageHeader>
        <div className="page-header-row">
          <BackButton onClick={() => navigate("/forum")} />
          <div className="page-title-copy min-w-0">
            <p className="page-eyebrow">Comunidad</p>
            <h1 className="page-title truncate text-xl">Publicación</h1>
          </div>
        </div>
      </PageHeader>

      <PageContent>
        <article className="surface-card overflow-hidden">
          {topic.imageUrl && (
            <div className="content-card-media h-64">
              <img
                src={`${apiUrl}${topic.imageUrl}`}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <Avatar name={topic.author?.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {topic.author?.name ?? "Anónimo"}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(topic.createdAt).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <h2 className="mb-3 text-xl font-semibold leading-tight text-slate-950">
              {topic.title}
            </h2>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
              {topic.content}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleLike}
                className={`btn btn-sm ${liked ? "btn-danger" : "btn-secondary"}`}
              >
                {likeCount} Me gusta
              </button>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                {topic.comments?.length ?? 0} comentarios
              </span>
            </div>
          </div>
        </article>

        <section className="form-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">
              Comentarios
            </h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              {topic.comments?.length ?? 0}
            </span>
          </div>

          {!topic.comments?.length ? (
            <div className="upload-zone min-h-28">
              <p className="upload-zone-title">Sé el primero en comentar</p>
              <p className="upload-zone-hint">
                Tu respuesta puede arrancar la conversación.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {topic.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar name={comment.author?.name} size="sm" />
                  <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <p className="mb-1 text-xs font-semibold text-slate-900">
                      {comment.author?.name ?? "Anónimo"}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </PageContent>

      <div className="sticky-composer">
        <Input
          placeholder="Tu nombre"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <div className="composer-row">
          <Textarea
            placeholder="Escribe un comentario..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
          />
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleComment}
            disabled={sending}
          >
            {sending ? "..." : "Enviar"}
          </Button>
        </div>
      </div>

      <BottomNav />
    </PageShell>
  );
}
