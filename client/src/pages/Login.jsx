import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import Logo from '../components/Logo.jsx';
import GoogleSignInButton from '../components/GoogleSignInButton.jsx';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const er = {};
    if (!form.email) er.email = 'Email is required';
    if (!form.password) er.password = 'Password is required';
    setErrors(er);
    if (Object.keys(er).length) return;

    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Continue your improvement arc with AptifyAI."
      footer={
        <span>
          New to AptifyAI? <Link to="/register">Create an account</Link>
        </span>
      }
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Link to="/" style={{ display: 'inline-block' }}>
          <Logo size="lg" />
        </Link>
      </div>
      <form
        onSubmit={onSubmit}
        noValidate
        autoComplete="off"
        data-lpignore="true"
        data-1p-ignore="true"
        data-form-type="other"
      >
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
          />
          {errors.email && <div className="field-error">{errors.email}</div>}
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Your password"
            value={form.password}
            onChange={onChange}
            autoComplete="current-password"
          />
          {errors.password && (
            <div className="field-error">{errors.password}</div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={submitting}
          style={{ marginTop: 6 }}
        >
          {submitting ? <span className="spinner-sm" /> : 'Login →'}
        </button>
      </form>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <GoogleSignInButton label="Sign in with Google" />
    </AuthShell>
  );
}
