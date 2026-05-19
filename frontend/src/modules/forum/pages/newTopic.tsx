import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTopic } from "../api/forum.api";
import BottomNav from "../../plans/components/BottomNav";
import {
  Avatar,
  BackButton,
  Button,
  Input,
  PageContent,
  PageHeader,
  PageShell,
  Textarea,
} from "../../../shared/ui";

function getStoredUser(): { id?: string; name?: string | null } | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function NewTopic() {
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState(storedUser?.name ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !author.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    setSending(true);
    setError("");
    try {
      await createTopic(
        { title, content, author, authorId: storedUser?.id },
        image || undefined,
      );
      navigate("/forum");
    } catch {
      setError("Error al crear el tema, intenta de nuevo");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell>
      <PageHeader>
        <div className="page-header-row">
          <BackButton onClick={() => navigate("/forum")} />
          <div className="page-title-copy">
            <p className="page-eyebrow">Comunidad</p>
            <h1 className="page-title">Nueva publicación</h1>
          </div>
        </div>
      </PageHeader>

      <PageContent className="compose-page">
        <section className="compose-intro">
          <p className="compose-intro-eyebrow">Comparte algo bueno</p>
          <h2 className="compose-intro-title">
            Armaaa una publicación para la comunidad
          </h2>
          <p className="compose-intro-desc">
            Cuenta una recomendación, una pregunta o una idea de plan. Que se
            sienta claro y fácil de responder.
          </p>
        </section>

        <section className="surface-card compose-form">
          <div className="compose-field">
            <label htmlFor="author">Tu nombre</label>
            <div className="compose-name-row">
              <Avatar name={author} size="md" />
              <Input
                id="author"
                placeholder="¿Cómo te llamas?"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>

          <div className="compose-field">
            <label htmlFor="title">Título del tema</label>
            <Input
              id="title"
              placeholder="Ej: ¿Qué bares recomiendan en Medellín?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="compose-field">
            <label htmlFor="content">¿Qué quieres compartir?</label>
            <Textarea
              id="content"
              placeholder="Cuéntale a la comunidad..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
          </div>

          <div className="compose-field">
            <label htmlFor="image">Añadir imagen (opcional)</label>
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Vista previa"
                  className="w-full rounded-lg object-cover max-h-52"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setPreview(null);
                  }}
                  className="icon-btn absolute right-2 top-2 bg-slate-900/70 text-white"
                  aria-label="Quitar imagen"
                >
                  ×
                </button>
              </div>
            ) : (
              <label htmlFor="image" className="compose-upload">
                <p>Toca para seleccionar una imagen</p>
                <span>Opcional — ayuda a que el tema destaque</span>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </section>

        {error && <p className="auth-error">{error}</p>}

        <div className="compose-actions">
          <Button variant="secondary" onClick={() => navigate("/forum")}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={sending}>
            {sending ? "Publicando..." : "Publicar"}
          </Button>
        </div>
      </PageContent>

      <BottomNav />
    </PageShell>
  );
}
