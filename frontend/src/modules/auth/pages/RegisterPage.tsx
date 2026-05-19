import { type FormEvent, type KeyboardEvent, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/api';
import AuthButton from '../components/AuthButton';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { Input } from '../../../shared/ui';

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { status?: number } }).response?.status === 'number'
  ) {
    const status = (error as { response: { status: number } }).response.status;
    if (status === 409) return 'Este correo ya está registrado';
  }
  return 'Error al registrar usuario';
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);

  const submitOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || submitting) return;
    event.preventDefault();
    formRef.current?.requestSubmit();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName || !normalizedEmail || !password || !confirmPassword) {
      setError('Completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 4 || password.length > 12) {
      setError('La contraseña debe tener entre 4 y 12 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      const response = await registerUser({
        name: trimmedName,
        email: normalizedEmail,
        password,
      });

      if (!response?.accessToken) {
        setError('El servidor no devolvió un token válido');
        return;
      }

      flushSync(() => login(response));
      navigate('/mapa', { replace: true });
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <form ref={formRef} onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="auth-logo">Q</div>

        <div>
          <h1 className="auth-title">Crear cuenta</h1>
          <p className="auth-subtitle">Regístrate para continuar</p>
        </div>

        <div className="auth-fields">
          <Input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={submitOnEnter}
          />
          <Input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={submitOnEnter}
          />
          <Input
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={submitOnEnter}
          />
          <Input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={submitOnEnter}
          />
        </div>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <AuthButton type="submit" text={submitting ? 'Registrando...' : 'Registrarse'} disabled={submitting} />

        <p className="auth-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="auth-link">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
