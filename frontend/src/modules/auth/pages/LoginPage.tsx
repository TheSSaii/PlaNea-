import { type FormEvent, type KeyboardEvent, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/api';
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
    if (status === 401) return 'Correo o contraseña incorrectos';
  }
  return 'Ocurrió un error al iniciar sesión';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

    if (!normalizedEmail || !password) {
      setError('Completa todos los campos');
      return;
    }

    if (password.length < 4 || password.length > 12) {
      setError('La contraseña debe tener entre 4 y 12 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      const response = await loginUser({ email: normalizedEmail, password });

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
          <h1 className="auth-title">Iniciar sesión</h1>
          <p className="auth-subtitle">Bienvenido nuevamente</p>
        </div>

        <div className="auth-fields">
          <Input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={submitOnEnter}
          />

          <div className="input-password-wrap">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={submitOnEnter}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="input-password-toggle"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <AuthButton type="submit" text={submitting ? 'Ingresando...' : 'Iniciar sesión'} disabled={submitting} />

        <p className="auth-footer">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="auth-link">
            Crear cuenta
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
