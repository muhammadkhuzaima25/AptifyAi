import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';
import './Sidebar.css';

const items = [
  { label: 'Dashboard', to: '/dashboard', icon: 'M3 12 L12 3 L21 12 M5 10 V21 H19 V10' },
  { label: 'Start Exam', to: '/exam/start', icon: 'M12 5 V19 M5 12 H19' },
  { label: 'History', to: '/history', icon: 'M3 3 H21 V21 H3 Z M3 9 H21 M9 21 V9' },
  { label: 'Progress', to: '/progress', icon: 'M3 17 L9 11 L13 15 L21 7 M21 7 V13 M21 7 H15' },
  { label: 'Profile', to: '/profile', icon: 'M12 12 a4 4 0 1 0 0 -8 a4 4 0 0 0 0 8 z M4 21 a8 8 0 0 1 16 0' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-top">
          <Link to="/dashboard" className="sidebar-logo">
            <Logo />
          </Link>

          <nav className="sidebar-nav">
            {items.map((item) => {
              const active =
                location.pathname === item.to ||
                (item.to === '/exam/start' && location.pathname.startsWith('/exam'));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d={item.icon}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          {user && (
            <div className="sidebar-user">
              <div className="sidebar-avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.name}</div>
                <div className="sidebar-user-meta mono">{user.targetExam}</div>
              </div>
            </div>
          )}
          <button className="sidebar-logout" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 21 H5 a2 2 0 0 1 -2 -2 V5 a2 2 0 0 1 2 -2 h4 M16 17 L21 12 L16 7 M21 12 H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <nav className="bottom-nav">
        {items.slice(0, 5).map((item) => {
          const active =
            location.pathname === item.to ||
            (item.to === '/exam/start' && location.pathname.startsWith('/exam'));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`bottom-nav-link ${active ? 'bottom-nav-link-active' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d={item.icon}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
