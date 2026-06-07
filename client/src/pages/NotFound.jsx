import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function NotFound() {
  return (
    <div className="notfound">
      <Navbar />
      <div className="notfound-content">
        <div className="notfound-404 mono">404</div>
        <h1 className="notfound-title">Page not found</h1>
        <p className="notfound-text text-secondary">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          Go home →
        </Link>
      </div>
      <style>{`
        .notfound {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
        }
        .notfound-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 80px);
          padding: 24px;
          text-align: center;
        }
        .notfound-404 {
          font-size: clamp(3rem, 12vw, 5rem);
          font-weight: 800;
          color: var(--lime);
          line-height: 1.1;
          letter-spacing: 0;
          word-break: break-word;
          overflow-wrap: break-word;
          max-width: 100%;
        }
        .notfound-title {
          font-family: var(--font-heading);
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 12px 0 8px;
          max-width: 700px;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .notfound-text {
          margin-bottom: 24px;
          max-width: 600px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
