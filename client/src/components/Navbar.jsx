import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import './Navbar.css';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/#features' },
  { label: 'How It Works', to: '/#how' },
  { label: 'FAQ', to: '/#faq' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleLink = (to) => {
    if (to.startsWith('/#')) {
      const id = to.replace('/#', '');
      if (location.pathname === '/') {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 250);
      }
    } else {
      navigate(to);
    }
    setOpen(false);
  };

  return (
    <>
      <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="container nav-inner">
          <button
            className="nav-logo-btn"
            onClick={() => handleLink('/')}
            aria-label="AptifyAI home"
          >
            <Logo />
          </button>

          <nav className="nav-links hide-mobile">
            {links.map((l) => (
              <button
                key={l.label}
                className="nav-link"
                onClick={() => handleLink(l.to)}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="nav-cta hide-mobile">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Login
            </Link>
            <ThemeToggle />
            <Link to="/register" className="btn btn-primary btn-sm">
              Start Free →
            </Link>
          </div>

          <div className="show-mobile nav-mobile-actions">
            <ThemeToggle />
            <button
              className="hamburger"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${open ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-header">
          <Logo size="sm" />
          <button
            className="mobile-menu-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6 L18 18 M6 18 L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <nav className="mobile-menu-links">
          {links.map((l) => (
            <button
              key={l.label}
              className="mobile-menu-link"
              onClick={() => handleLink(l.to)}
            >
              {l.label}
            </button>
          ))}
        </nav>
        <div className="mobile-menu-cta">
          <Link to="/login" className="btn btn-ghost btn-block">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary btn-block">
            Start Free →
          </Link>
        </div>
      </div>

      {open && (
        <div
          className="mobile-menu-backdrop"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
