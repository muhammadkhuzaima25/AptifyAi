import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import Spinner from '../components/Spinner.jsx';
import Modal from '../components/Modal.jsx';
import api from '../utils/api.js';
import { formatDate, formatTime } from '../utils/helpers.js';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterExam, setFilterExam] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/exam/history');
        setSessions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (filterExam !== 'all' && s.examType !== filterExam) return false;
      if (from) {
        const f = new Date(from);
        if (new Date(s.date) < f) return false;
      }
      if (to) {
        const t = new Date(to);
        t.setHours(23, 59, 59, 999);
        if (new Date(s.date) > t) return false;
      }
      return true;
    });
  }, [sessions, filterExam, from, to]);

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner label="Loading history..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Session History"
      subtitle="Every session you've ever taken — fully searchable."
    >
      <div className="hist-filters">
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Exam Type</label>
          <select value={filterExam} onChange={(e) => setFilterExam(e.target.value)}>
            <option value="all">All Exams</option>
            <option value="NTS">NTS</option>
            <option value="GAT">GAT</option>
            <option value="MDCAT">MDCAT</option>
            <option value="CSS/PMS">CSS/PMS</option>
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setFilterExam('all');
            setFrom('');
            setTo('');
          }}
        >
          Clear filters
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="hist-empty">
          <h3>No sessions match your filters</h3>
          <p className="text-secondary">Try clearing the filters or starting a new session.</p>
        </div>
      ) : (
        <div className="hist-card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Exam</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Score</th>
                <th>Duration</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s._id}>
                  <td className="mono">{formatDate(s.date)}</td>
                  <td>
                    <span className="pill pill-muted">{s.examType}</span>
                  </td>
                  <td>{s.topic}</td>
                  <td>
                    <span
                      className={`pill ${
                        s.difficulty === 'Hard'
                          ? 'pill-danger'
                          : s.difficulty === 'Medium'
                          ? 'pill'
                          : 'pill-success'
                      }`}
                    >
                      {s.difficulty}
                    </span>
                  </td>
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
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setOpen(s)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? `${open.examType} · ${open.topic}` : ''}
        footer={
          <button className="btn btn-ghost" onClick={() => setOpen(null)}>
            Close
          </button>
        }
      >
        {open && (
          <div>
            <div className="hist-modal-stats">
              <div>
                <div className="mono hist-stat-label">Score</div>
                <div className="hist-stat-val">{open.overallScore}%</div>
              </div>
              <div>
                <div className="mono hist-stat-label">Accuracy</div>
                <div className="hist-stat-val">{open.accuracyScore}%</div>
              </div>
              <div>
                <div className="mono hist-stat-label">Speed</div>
                <div className="hist-stat-val">{open.speedScore}%</div>
              </div>
              <div>
                <div className="mono hist-stat-label">Time</div>
                <div className="hist-stat-val mono">{formatTime(open.timeTaken || 0)}</div>
              </div>
            </div>
            <div className="hist-modal-qs">
              {(open.questions || []).map((q, i) => {
                const ans = (open.answers || []).find((a) => a.questionIndex === i);
                const expl = (open.aiExplanations || []).find(
                  (e) => e.questionIndex === i
                );
                const sel = ans?.selected;
                const correct = sel && sel.trim() === q.correctAnswer.trim();
                return (
                  <div
                    key={i}
                    className={`hist-q ${
                      correct ? 'hist-q-correct' : 'hist-q-wrong'
                    }`}
                  >
                    <div className="hist-q-head">
                      <span className="mono">Q{i + 1}</span>
                      <span
                        className={`pill ${
                          correct ? 'pill-success' : 'pill-danger'
                        }`}
                      >
                        {correct ? 'Correct' : 'Wrong'}
                      </span>
                    </div>
                    <p className="hist-q-text">{q.question}</p>
                    <div className="hist-q-rows">
                      <div>
                        <span className="mono hist-q-label">Your answer:</span>{' '}
                        <strong>{sel || '—'}</strong>
                      </div>
                      <div>
                        <span className="mono hist-q-label">Correct:</span>{' '}
                        <strong className="text-correct">{q.correctAnswer}</strong>
                      </div>
                    </div>
                    {expl?.explanation && (
                      <div className="hist-q-explain">
                        <div className="mono hist-q-explain-label">AI Explanation</div>
                        <p>{expl.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .hist-filters {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr auto;
          gap: 12px;
          align-items: end;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 18px;
          margin-bottom: 20px;
        }
        .hist-filters .field label {
          font-size: 0.7rem;
        }
        .hist-filters .field input,
        .hist-filters .field select {
          padding: 9px 12px;
          font-size: 0.9rem;
        }
        .hist-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 6px;
        }
        .hist-empty {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 40px 24px;
          text-align: center;
        }
        .hist-modal-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        .hist-modal-stats > div {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 12px;
          text-align: center;
        }
        .hist-stat-label {
          font-size: 0.7rem;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .hist-stat-val {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 700;
          margin-top: 4px;
        }
        .hist-modal-qs {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .hist-q {
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 16px;
        }
        .hist-q-correct { border-color: var(--success); }
        .hist-q-wrong { border-color: var(--error); }
        .hist-q-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .hist-q-text {
          font-weight: 500;
          font-size: 0.95rem;
          margin-bottom: 10px;
          line-height: 1.5;
        }
        .hist-q-rows {
          font-size: 0.88rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .hist-q-label {
          color: var(--secondary);
          font-size: 0.72rem;
        }
        .text-correct { color: var(--success); }
        .hist-q-explain {
          margin-top: 10px;
          padding: 10px 12px;
          background: var(--bg);
          border-left: 3px solid var(--lime);
          border-radius: 6px;
          font-size: 0.88rem;
        }
        .hist-q-explain-label {
          font-size: 0.7rem;
          color: var(--lime);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }
        @media (max-width: 700px) {
          .hist-filters {
            grid-template-columns: 1fr 1fr;
          }
          .hist-filters button {
            grid-column: span 2;
          }
          .hist-modal-stats { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </DashboardLayout>
  );
}
