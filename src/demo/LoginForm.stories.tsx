import type { Meta, StoryObj } from '@storybook/react';
import { useState, useCallback } from 'react';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import styles from './LoginForm.module.css';

/* ── Types ────────────────────────────────────────── */

type FormStatus = 'idle' | 'submitting' | 'error' | 'success';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

type TouchFields = 'email' | 'password';

/* ── Icons ────────────────────────────────────────── */

const SpinnerIcon = () => (
  <svg className={styles.spinner} width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round"/>
  </svg>
);

const EyeOpenIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeClosedIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M17.94 17.94C15.93 19.24 13.97 20 12 20C5 20 1 12 1 12C2.77 8.55 5.1 6.56 7.33 5.28M9.88 4.29C10.57 4.1 11.29 4 12 4C19 4 23 12 23 12C22.3 13.5 21.33 14.9 20.14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 1L23 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
    <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.14 18.63 6.71 16.7 5.84 14.1H2.18V16.94C4.01 20.53 7.72 23 12 23Z" fill="#34A853"/>
    <path d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.07H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.93L5.84 14.09Z" fill="#FBBC05"/>
    <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.72 1 4.01 3.47 2.18 7.07L5.84 9.91C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12C0 17.31 3.435 21.795 8.205 23.385C8.805 23.49 9.03 23.13 9.03 22.815C9.03 22.53 9.015 21.585 9.015 20.58C6 21.135 5.22 19.845 4.98 19.17C4.845 18.825 4.26 17.76 3.75 17.475C3.33 17.25 2.73 16.695 3.735 16.68C4.68 16.665 5.355 17.55 5.58 17.91C6.66 19.725 8.385 19.215 9.075 18.9C9.18 18.12 9.495 17.595 9.84 17.295C7.17 16.995 4.38 15.96 4.38 11.37C4.38 10.065 4.845 8.985 5.61 8.145C5.49 7.845 5.07 6.615 5.73 4.965C5.73 4.965 6.735 4.65 9.03 6.195C9.99 5.925 11.01 5.79 12.03 5.79C13.05 5.79 14.07 5.925 15.03 6.195C17.325 4.635 18.33 4.965 18.33 4.965C18.99 6.615 18.57 7.845 18.45 8.145C19.215 8.985 19.68 10.05 19.68 11.37C19.68 15.975 16.875 16.995 14.205 17.295C14.64 17.67 15.015 18.39 15.015 19.515C15.015 21.12 15 22.41 15 22.815C15 23.13 15.225 23.505 15.825 23.385C20.565 21.795 24 17.31 24 12C24 5.37 18.63 0 12 0Z"/>
  </svg>
);

/* ── Validation ──────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(
  email: string,
  password: string,
  touched: Set<TouchFields>
): FormErrors {
  const errors: FormErrors = {};

  if (touched.has('email')) {
    if (!email.trim()) {
      errors.email = 'Введите email';
    } else if (!EMAIL_RE.test(email.trim())) {
      errors.email = 'Неверный формат email';
    }
  }

  if (touched.has('password')) {
    if (!password) {
      errors.password = 'Введите пароль';
    } else if (password.length < 6) {
      errors.password = 'Минимум 6 символов';
    }
  }

  return errors;
}

/* ── Theme toggle helper ─────────────────────────── */

function setDocumentTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
}

function getDocumentTheme(): 'light' | 'dark' {
  const current = document.documentElement.getAttribute('data-theme');
  return current === 'dark' ? 'dark' : 'light';
}

/* ── LoginForm Component ─────────────────────────── */

interface LoginFormProps {
  /** Simulated server delay in ms */
  submitDelay?: number;
  /** If true, submit will fail with a generic error */
  simulateError?: boolean;
}

const LoginForm = ({ submitDelay = 1500, simulateError = false }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [serverError, setServerError] = useState('');
  const [touched, setTouched] = useState<Set<TouchFields>>(new Set());

  const touch = useCallback((field: TouchFields) => {
    setTouched((prev) => new Set(prev).add(field));
  }, []);

  const errors = validateField(email, password, touched);
  const hasErrors = Object.keys(errors).length > 0;

  /* ── Submit handler ──────────────────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Touch all fields
    setTouched(new Set(['email', 'password']));

    // Validate all fields
    const allErrors = validateField(email, password, new Set(['email', 'password']));
    if (Object.keys(allErrors).length > 0) {
      return;
    }

    setStatus('submitting');
    setServerError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, submitDelay));

      if (simulateError) {
        throw new Error('Неверный email или пароль');
      }

      setStatus('success');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ошибка соединения');
      setStatus('error');
    }
  };

  /* ── Theme toggle ─────────────────────────────── */

  const [theme, setTheme] = useState<'light' | 'dark'>(getDocumentTheme);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    setDocumentTheme(next);
  };

  /* ── Success state ───────────────────────────── */

  if (status === 'success') {
    return (
      <div className={styles.container}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className={styles.successTitle}>Успешный вход</h2>
          <p className={styles.successText}>
            Вы вошли в систему как <strong>{email}</strong>
          </p>
          <div style={{ marginTop: 12 }}>
            <Button
              variant="secondary"
              onClick={() => {
                setEmail('');
                setPassword('');
                setRemember(false);
                setStatus('idle');
                setTouched(new Set());
                setServerError('');
              }}
            >
              Назад к форме
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form state ──────────────────────────────── */

  return (
    <div className={styles.container}>
      <form className={styles.body} onSubmit={handleSubmit} noValidate>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>🔐 Войти в аккаунт</h2>
          <p className={styles.subtitle}>Введите свои учётные данные</p>
        </div>

        {/* Server error banner */}
        {serverError && (
          <div className={styles.errorBanner}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {serverError}
          </div>
        )}

        {/* Email */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="login-email">
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => touch('email')}
            placeholder="your@email.com"
            size="l"
            error={Boolean(errors.email)}
            autoComplete="email"
          />
          {errors.email && (
            <div className={styles.fieldError}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {errors.email}
            </div>
          )}
        </div>

        {/* Password */}
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="login-password">
            Пароль
          </label>
          <div className={styles.passwordWrapper}>
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => touch('password')}
              placeholder="············"
              size="l"
              error={Boolean(errors.password)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </button>
          </div>
          {errors.password && (
            <div className={styles.fieldError}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {errors.password}
            </div>
          )}
        </div>

        {/* Remember me row */}
        <div className={styles.checkboxRow}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Запомнить меня
          </label>
        </div>

        {/* Submit */}
        <div className={styles.submitBtn}>
          <Button
            type="submit"
            variant="filled"
            size="xl"
            fullWidth
            disabled={status === 'submitting'}
            icon={status === 'submitting' ? <SpinnerIcon /> : undefined}
          >
            {status === 'submitting' ? 'Вход…' : 'Войти'}
          </Button>
        </div>

        {/* Forgot password */}
        <div className={styles.forgotRow}>
          <Button type="button" variant="link" size="m">
            Забыли пароль?
          </Button>
        </div>

        {/* Divider */}
        <div className={styles.divider}>или войти через</div>

        {/* Social buttons */}
        <div className={styles.socialRow}>
          <div className={styles.socialBtn}>
            <Button
              type="button"
              variant="secondary"
              size="l"
              fullWidth
              icon={<GoogleIcon />}
              disabled={status === 'submitting'}
            >
              Google
            </Button>
          </div>
          <div className={styles.socialBtn}>
            <Button
              type="button"
              variant="secondary"
              size="l"
              fullWidth
              icon={<GitHubIcon />}
              disabled={status === 'submitting'}
            >
              GitHub
            </Button>
          </div>
        </div>

        {/* Register link */}
        <div className={styles.registerRow}>
          Нет аккаунта?{' '}
          <Button type="button" variant="link" size="m">
            Зарегистрироваться
          </Button>
        </div>
      </form>

      {/* Theme toggle footer */}
      <div className={styles.themeRow}>
        <span>☀️</span>
        <button
          type="button"
          className={styles.themeToggle}
          data-active={theme === 'dark'}
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
          <span className={styles.themeToggleThumb} />
        </button>
        <span>🌙</span>
      </div>
    </div>
  );
};

LoginForm.displayName = 'LoginForm';

/* ── Meta ─────────────────────────────────────────── */

const meta: Meta<typeof LoginForm> = {
  title: 'Demo/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    submitDelay: {
      control: { type: 'number', min: 0, max: 5000, step: 500 },
      description: 'Имитация задержки сервера (мс)',
    },
    simulateError: {
      control: 'boolean',
      description: 'Эмулировать ошибку сервера при отправке',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

/* ── Stories ──────────────────────────────────────── */

export const Default: Story = {
  args: {
    submitDelay: 1500,
    simulateError: false,
  },
};

export const Dark: Story = {
  args: {
    submitDelay: 1500,
    simulateError: false,
  },
  parameters: {
    backgrounds: { default: 'Dark' },
  },
};

export const WithServerError: Story = {
  args: {
    submitDelay: 800,
    simulateError: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Заполните поля и нажмите "Войти" — сервер вернёт ошибку.',
      },
    },
  },
};

export const FastSubmit: Story = {
  args: {
    submitDelay: 200,
    simulateError: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Минимальная задержка для быстрой проверки флоу успешного входа.',
      },
    },
  },
};
