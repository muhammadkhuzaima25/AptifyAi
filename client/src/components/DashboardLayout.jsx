import Sidebar from './Sidebar.jsx';
import './DashboardLayout.css';

export default function DashboardLayout({ children, title, subtitle, actions }) {
  return (
    <div className="dash-layout">
      <Sidebar />
      <main className="dash-main">
        <div className="dash-page">
          {(title || actions) && (
            <div className="dash-page-head">
              <div>
                {title && <h1 className="page-title">{title}</h1>}
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
              </div>
              {actions && <div className="dash-page-actions">{actions}</div>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
