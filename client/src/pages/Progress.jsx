import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import Spinner from '../components/Spinner.jsx';
import BarChart from '../components/BarChart.jsx';
import api from '../utils/api.js';

const buildCalendar = (map) => {
  const cells = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    cells.push({ date: key, count: map?.[key] || 0 });
  }
  return cells;
};

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/progress/full');
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = useMemo(() => {
    if (!data?.scoreHistory?.length) return [];
    return data.scoreHistory.slice(-12).map((c) => ({
      label: `#${c.session}`,
      value: c.score,
      highlight: true,
    }));
  }, [data]);

  const calendar = useMemo(() => buildCalendar(data?.calendar), [data]);

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner label="Analyzing your sessions..." />
      </DashboardLayout>
    );
  }

  const stats = data?.stats || {};
  const topicPerformance = data?.topicPerformance || [];
  const weakTopics = data?.weakTopics || [];
  const insight = data?.insight || '';

  return (
    <DashboardLayout
      title="Your Progress"
      subtitle="A complete picture of your improvement arc."
    >
      <div className="prog-stats">
        <div className="prog-stat">
          <div className="mono prog-stat-label">Total Sessions</div>
          <div className="prog-stat-num">{stats.totalSessions || 0}</div>
        </div>
        <div className="prog-stat">
          <div className="mono prog-stat-label">Questions Attempted</div>
          <div className="prog-stat-num">{stats.totalQuestions || 0}</div>
        </div>
        <div className="prog-stat">
          <div className="mono prog-stat-label">Most Practiced</div>
          <div className="prog-stat-num prog-stat-num-sm">
            {stats.mostPracticedExam || '—'}
          </div>
        </div>
        <div className="prog-stat prog-stat-lime">
          <div className="mono prog-stat-label">Best Score Ever</div>
          <div className="prog-stat-num">{stats.bestScore || 0}%</div>
        </div>
      </div>

      {insight && (
        <div className="prog-insight">
          <span className="pill">AI Insight</span>
          <p>{insight}</p>
        </div>
      )}

      <div className="prog-grid">
        <div className="prog-card">
          <h3>Score Over Time</h3>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: 4 }}>
            Score across your last {chartData.length} sessions.
          </p>
          <div style={{ marginTop: 18 }}>
            <BarChart data={chartData} max={100} height={240} />
          </div>
        </div>

        <div className="prog-card">
          <h3>Per-Topic Performance</h3>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: 4 }}>
            Stronger topics appear first.
          </p>
          <div className="topic-list">
            {topicPerformance.length === 0 ? (
              <div className="prog-empty">No data yet — take a few sessions.</div>
            ) : (
              topicPerformance
                .sort((a, b) => b.avgScore - a.avgScore)
                .map((t) => (
                  <div key={t.topic} className="topic-item">
                    <div className="topic-item-head">
                      <span>{t.topic}</span>
                      <span className="mono">{Math.round(t.avgScore)}% · {t.attempts}×</span>
                    </div>
                    <div className="topic-item-bar">
                      <div
                        className="topic-item-bar-fill"
                        style={{
                          width: `${Math.min(100, t.avgScore)}%`,
                          background: t.avgScore >= 70 ? 'var(--lime)' : t.avgScore >= 50 ? 'var(--warning)' : 'var(--error)',
                        }}
                      />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      <div className="prog-card">
        <h3>Streak Calendar</h3>
        <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: 4 }}>
          Last 90 days. Lime tiles = days you practiced.
        </p>
        <div className="cal-grid">
          {calendar.map((c, i) => {
            const intensity = c.count === 0 ? 0 : c.count === 1 ? 1 : c.count === 2 ? 2 : 3;
            return (
              <div
                key={i}
                className={`cal-cell cal-${intensity}`}
                title={`${c.date} — ${c.count} session${c.count !== 1 ? 's' : ''}`}
              />
            );
          })}
        </div>
        <div className="cal-legend">
          <span className="mono">Less</span>
          <div className="cal-cell cal-0" />
          <div className="cal-cell cal-1" />
          <div className="cal-cell cal-2" />
          <div className="cal-cell cal-3" />
          <span className="mono">More</span>
        </div>
      </div>

      <div className="prog-card">
        <h3>Weak Topics</h3>
        {weakTopics.length === 0 ? (
          <div className="prog-empty">
            🎉 No weak topics flagged — your performance is balanced.
          </div>
        ) : (
          <div className="prog-pills">
            {weakTopics.map((t) => (
              <span key={t} className="pill pill-danger">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .prog-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .prog-stat {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 22px;
        }
        .prog-stat:hover { border-color: var(--lime); }
        .prog-stat-lime {
          background: var(--lime);
          border-color: var(--lime);
        }
        .prog-stat-lime .prog-stat-label {
          color: var(--text);
        }
        .prog-stat-lime .prog-stat-num {
          color: var(--text);
        }
        .prog-stat-label {
          font-size: 0.72rem;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 6px;
        }
        .prog-stat-num {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .prog-stat-num-sm { font-size: 1.2rem; }
        .prog-insight {
          background: var(--text);
          color: var(--card);
          border-radius: var(--radius);
          padding: 22px 26px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .prog-insight p {
          font-size: 1rem;
          line-height: 1.55;
          color: var(--bg);
        }
        .prog-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .prog-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          margin-bottom: 20px;
        }
        .prog-card h3 {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 700;
        }
        .topic-list {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .topic-item-head {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .topic-item-bar {
          width: 100%;
          height: 8px;
          background: var(--bg);
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .topic-item-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 500ms ease;
        }
        .prog-empty {
          padding: 20px;
          text-align: center;
          color: var(--secondary);
          font-size: 0.9rem;
        }
        .prog-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }
        .cal-grid {
          display: grid;
          grid-template-columns: repeat(15, 1fr);
          gap: 4px;
          margin-top: 18px;
        }
        .cal-cell {
          aspect-ratio: 1;
          border-radius: 4px;
          background: var(--bg);
          border: 1px solid var(--border);
        }
        .cal-0 { background: var(--bg); }
        .cal-1 { background: var(--lime-soft); border-color: var(--lime-soft-2); }
        .cal-2 { background: var(--lime-soft-2); border-color: var(--lime); }
        .cal-3 { background: var(--lime); border-color: var(--lime); }
        .cal-legend {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          font-size: 0.75rem;
          color: var(--secondary);
        }
        .cal-legend .cal-cell {
          width: 14px;
          height: 14px;
        }
        @media (max-width: 900px) {
          .prog-stats { grid-template-columns: repeat(2, 1fr); }
          .prog-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </DashboardLayout>
  );
}
