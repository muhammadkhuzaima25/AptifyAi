import { useEffect, useRef, useState } from 'react';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const CLIENT_ID = '144130805343-bqtir4phm0jj1g5fvdtvfperk0lp3ng9.apps.googleusercontent.com';

export default function GoogleSignInButton({ label = 'Sign in with Google' }) {
  const { login } = useAuth();
  const toast = useToast();
  const buttonRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const initialized = useRef(false);

  const handleCredential = async (response) => {
    if (!response?.credential) return;
    setBusy(true);
    try {
      const { data } = await api.post('/auth/google', {
        credential: response.credential,
      });
      login(data);
      toast.success('Signed in with Google!');
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const init = () => {
      if (cancelled) return;
      if (!window.google?.accounts?.id) {
        setTimeout(init, 200);
        return;
      }
      if (initialized.current) return;
      initialized.current = true;

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true,
        use_fedcm_for_prompt: true,
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: label.toLowerCase().includes('sign up') ? 'signup_with' : 'signin_with',
          shape: 'pill',
          width: 380,
          logo_alignment: 'left',
        });
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [label]);

  return (
    <div className="google-btn-wrap">
      <div ref={buttonRef} className="google-btn-mount" />
      {busy && <div className="google-btn-overlay">Signing in…</div>}
      <style>{`
        .google-btn-wrap {
          position: relative;
          width: 100%;
          min-height: 48px;
          display: flex;
          justify-content: center;
        }
        .google-btn-mount {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .google-btn-mount > div,
        .google-btn-mount iframe {
          width: 100% !important;
          max-width: 420px;
        }
        .google-btn-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--card);
          color: var(--text);
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.9rem;
          border-radius: 999px;
          pointer-events: none;
        }
        @media (max-width: 480px) {
          .google-btn-mount > div,
          .google-btn-mount iframe {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
