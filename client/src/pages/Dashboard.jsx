import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout.jsx';
import BarChart from '../components/BarChart.jsx';
import Spinner from '../components/Spinner.jsx';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/helpers.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: dash } = await api.get('/progress/dashboard');
        setData(dash);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner label="Loading your dashboard..." />
      </DashboardLayout>
    );
  }

  const stats = data?.stats || {
    totalSessions: 0,
    avgScore: 0,
    bestScore: 0,
    streak: user?.streak || 0,
  };
  const chartData =
    data?.chartData?.map((c) => ({
      label: c.label,
      value: c.score,
      highlight: true,
    })) || [];
  const weakTopics = data?.weakTopics || [];
  const recent = data?.recentSessions || [];

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'Student'} 👋`}
      subtitle="Here's your improvement arc at a glance. All features are unlocked."
      actions={
        <Link to="/exam/start" className="btn btn-primary">
          Start New Exam →
        </Link>
      }
    >
      <div className="dash-stats">
        <div className="dash-stat">
          <div className="dash-stat-label mono">Total Sessions</div>
          <div className="dash-stat-num">{stats.totalSessions}</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-label mono">Average Score</div>
          <div className="dash-stat-num">{stats.avgScore}%</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-label mono">Best Score</div>
          <div className="dash-stat-num">{stats.bestScore}%</div>
        </div>
        <div className="dash-stat dash-stat-lime">
          <div className="dash-stat-label mono">Current Streak</div>
          <div className="dash-stat-num">🔥 {stats.streak}</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <div className="dash-card-head">
            <h3>Score Progress</h3>
            <span className="mono dash-card-sub">Last 7 sessions</span>
          </div>
          <BarChart data={chartData} max={100} height={220} />
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h3>Weak Topics</h3>
            <span className="pill">{weakTopics.length} flagged</span>
          </div>
          {weakTopics.length === 0 ? (
            <div className="dash-empty">
              🎉 No weak topics detected yet. Take a few sessions to unlock AI analysis.
            </div>
          ) : (
            <div className="dash-pills">
              {weakTopics.map((t) => (
                <span key={t} className="pill pill-danger">
                  {t}
                </span>
              ))}
            </div>
          )}
          <Link to="/progress" className="btn btn-ghost btn-sm" style={{ marginTop: 16 }}>
            View full analysis →
          </Link>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-head">
          <h3>Recent Sessions</h3>
          <Link to="/history" className="mono dash-card-link">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="dash-empty">
            <p>You haven't started a session yet.</p>
            <Link to="/exam/start" className="btn btn-primary" style={{ marginTop: 14 }}>
              Start your first session →
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Exam</th>
                  <th>Topic</th>
                  <th>Score</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s._id}>
                    <td className="mono">{formatDate(s.date)}</td>
                    <td>
                      <span className="pill pill-muted">{s.examType}</span>
                    </td>
                    <td>{s.topic}</td>
                    <td>
                      <span
                        className={`pill ${
                          s.overallScore >= 70
                            ? 'pill-success'
                            : s.overallScore >= 50
                            ? 'pill'
                            : 'pill-danger'
                        }`}
                      >
                        {s.overallScore}%
                      </span>
                    </td>
                    <td className="mono">{s.duration} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dash-cta">
        <div className="dash-cta-text">
          <h3 className="dash-cta-title">Ready to practice?</h3>
          <p className="text-secondary dash-cta-sub">
            AI will generate fresh questions tailored to your weak spots.
          </p>
        </div>
        <Link to="/exam/start" className="btn btn-primary btn-lg">
          Start Exam →
        </Link>
      </div>

      <style>{`
        .dash-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .dash-stat {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 22px;
          transition: all 200ms;
          color: var(--text);
        }
        .dash-stat:hover {
          border-color: var(--lime);
          transform: translateY(-2px);
        }
        .dash-stat-lime {
          background: var(--lime);
          color: var(--bg);
          border-color: var(--lime);
        }
        .dash-stat-lime .dash-stat-label {
          color: var(--bg);
        }
        .dash-stat-lime .dash-stat-num {
          color: var(--bg);
        }
        .dash-stat-label {
          font-size: 0.7rem;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
          font-family: var(--font-mono);
          font-weight: 700;
        }
        .dash-stat-num {
          font-family: var(--font-mono);
          font-size: 1.9rem;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: 0;
          color: var(--text);
          max-width: 100%;
        }
        .dash-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .dash-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          margin-bottom: 20px;
          color: var(--text);
        }
        .dash-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .dash-card-head h3 {
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          max-width: 100%;
        }
        .dash-card-sub {
          font-size: 0.7rem;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: var(--font-mono);
          font-weight: 700;
        }
        .dash-card-link {
          color: var(--lime);
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: none;
          font-family: var(--font-mono);
        }
        .dash-empty {
          padding: 32px 16px;
          text-align: center;
          color: var(--secondary);
          font-size: 0.95rem;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }
        .dash-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .dash-cta {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .dash-cta-text {
          max-width: 600px;
        }
        .dash-cta-title {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
          max-width: 100%;
        }
        .dash-cta-sub {
          font-size: 0.92rem;
          line-height: 1.6;
          max-width: 600px;
        }
        @media (max-width: 900px) {
          .dash-stats { grid-template-columns: repeat(2, 1fr); }
          .dash-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </DashboardLayout>
  );
}
