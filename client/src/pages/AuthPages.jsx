import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';
import { DeskIllustration } from '../components/Illustrations';
import { Logo } from '../components/Icons';

function AuthLayout({ title, intro, children, footer }) {
  return (
    <div className="auth">
      <main className="auth__form-side">
        <div className="brand">
          <Logo />
          <span>StudyPilot</span>
        </div>
        <div className="auth__card">
          <h1>{title}</h1>
          <p className="auth__intro">{intro}</p>
          {children}
          <p className="auth__switch">{footer}</p>
        </div>
      </main>
      <aside className="auth__art" aria-hidden="true">
        <DeskIllustration />
        <p>Courses, tasks and deadlines on one page, instead of across five apps.</p>
      </aside>
    </div>
  );
}

/** Shared submit logic: client checks first, then server errors mapped to fields. */
function useAuthForm(initial, validate, action) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const bind = (key) => ({
    value: values[key],
    error: errors[key],
    onChange: (e) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    },
  });

  async function onSubmit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      await action(values);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setErrors(err.details || {});
      setFormError(err.message);
      setBusy(false);
    }
  }

  return { bind, onSubmit, formError, busy };
}

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export function LoginPage() {
  const { login } = useAuth();
  const { bind, onSubmit, formError, busy } = useAuthForm(
    { email: '', password: '' },
    (v) => ({
      ...(!v.email.trim() && { email: 'Email is required.' }),
      ...(!v.password && { password: 'Password is required.' }),
    }),
    login
  );

  return (
    <AuthLayout
      title="Log in"
      intro="Pick up where you left off."
      footer={
        <>
          New to StudyPilot? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="form">
        {formError && (
          <p className="notice notice--error" role="alert">
            {formError}
          </p>
        )}
        <Field label="Email" type="email" autoComplete="email" {...bind('email')} />
        <Field label="Password" type="password" autoComplete="current-password" {...bind('password')} />
        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const { bind, onSubmit, formError, busy } = useAuthForm(
    { name: '', email: '', password: '' },
    (v) => ({
      ...(!v.name.trim() && { name: 'Name is required.' }),
      ...(!v.email.trim() ? { email: 'Email is required.' } : !emailOk(v.email) && { email: 'Enter a valid email address.' }),
      ...(v.password.length < 8 && { password: 'Password must be at least 8 characters.' }),
    }),
    register
  );

  return (
    <AuthLayout
      title="Create your account"
      intro="It takes a minute. Your courses and tasks stay private to you."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="form">
        {formError && (
          <p className="notice notice--error" role="alert">
            {formError}
          </p>
        )}
        <Field label="Name" autoComplete="name" maxLength={60} {...bind('name')} />
        <Field label="Email" type="email" autoComplete="email" {...bind('email')} />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          maxLength={72}
          {...bind('password')}
        />
        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
