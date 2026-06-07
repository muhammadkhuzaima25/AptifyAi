import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import Logo from '../components/Logo.jsx';
import GoogleSignInButton from '../components/GoogleSignInButton.jsx';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      login(data);
      toast.success('Welcome to AptifyAI!');
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot reach server. Is the backend running on port 5000?'
          : 'Registration failed');
      toast.error(data?.hint ? `${msg} — ${data.hint}` : msg, 8000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking your improvement arc — free forever."
      footer={
        <span>
          Already have an account? <Link to="/login">Log in</Link>
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
        spellCheck={false}
      >
        <div className="field">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={onChange}
            autoComplete="off"
            data-lpignore="true"
            spellCheck={false}
          />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>

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
            placeholder="At least 6 characters"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
            data-lpignore="true"
          />
          {errors.password && (
            <div className="field-error">{errors.password}</div>
          )}
        </div>

        <div className="field">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirm"
            placeholder="Re-enter password"
            value={form.confirm}
            onChange={onChange}
            autoComplete="new-password"
            data-lpignore="true"
          />
          {errors.confirm && (
            <div className="field-error">{errors.confirm}</div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={submitting}
          style={{ marginTop: 6 }}
        >
          {submitting ? (
            <span className="spinner-sm" />
          ) : (
            'Create Account →'
          )}
        </button>
      </form>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <GoogleSignInButton label="Sign up with Google" />
    </AuthShell>
  );
}
