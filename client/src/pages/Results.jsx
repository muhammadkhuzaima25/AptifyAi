import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Results() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('aptifyai_result');
    if (!raw) {
      navigate('/dashboard');
      return;
    }
    setData(JSON.parse(raw));
  }, [navigate]);

  if (!data) {
    return (
      <DashboardLayout>
        <Spinner />
      </DashboardLayout>
    );
  }

  const { exam, score, correctCount, accuracyScore, speedScore, overallScore, aiExplanations, weakTopics, questions } = data;
  const total = (questions || []).length;
  const wrong = total - correctCount;

  const getExplanation = (i) => {
    if (!aiExplanations) return '';
    const found = aiExplanations.find((e) => e.questionIndex === i);
    return found?.explanation || '';
  };

  const isCorrect = (i) => {
    const sel = data.answers?.[i]?.selected;
    if (!sel) return false;
    return sel.trim() === questions[i].correctAnswer.trim();
  };

  return (
    <DashboardLayout
      title="Session Results"
      subtitle={`${exam.examType} · ${exam.topic} · ${exam.difficulty}`}
      actions={
        <Link to="/dashboard" className="btn btn-ghost">
          ← Dashboard
        </Link>
      }
    >
      <div className="res-score-card">
        <div className="res-score-main">
          <div className="mono res-label">Overall Score</div>
          <div className="res-overall">{overallScore}</div>
          <div className="res-correct mono">
            {correctCount} / {total} correct
          </div>
        </div>
        <div className="res-stats">
          <div className="res-stat">
            <div className="mono res-stat-label">Accuracy</div>
            <div className="res-stat-val">{accuracyScore}%</div>
          </div>
          <div className="res-stat">
            <div className="mono res-stat-label">Speed</div>
            <div className="res-stat-val">{speedScore}%</div>
          </div>
          <div className="res-stat">
            <div className="mono res-stat-label">Total</div>
            <div className="res-stat-val">{correctCount}/{total}</div>
          </div>
        </div>
      </div>

      {weakTopics && weakTopics.length > 0 && (
        <div className="res-weak">
          <div className="res-weak-head">
            <span className="pill pill-danger">🎯 Weak Topics This Session</span>
          </div>
          <div className="res-weak-pills">
            {weakTopics.map((t) => (
              <span key={t} className="pill pill-danger">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="res-breakdown">
        <h3 className="res-section-title">Question-by-Question Breakdown</h3>
        <div className="res-list">
          {questions.map((q, i) => {
            const correct = isCorrect(i);
            const userSel = data.answers?.[i]?.selected || '— No answer —';
            return (
              <div
                key={i}
                className={`res-q ${correct ? 'res-q-correct' : 'res-q-wrong'}`}
              >
                <div className="res-q-head">
                  <span className="res-q-num mono">Q{i + 1}</span>
                  <span
                    className={`pill ${
                      correct ? 'pill-success' : 'pill-danger'
                    }`}
                  >
                    {correct ? '✓ Correct' : '✗ Wrong'}
                  </span>
                </div>
                <p className="res-q-text">{q.question}</p>
                <div className="res-q-rows">
                  <div className="res-q-row">
                    <span className="mono res-q-row-label">Your answer</span>
                    <span
                      className={`res-q-row-val ${
                        correct ? 'text-correct' : 'text-wrong'
                      }`}
                    >
                      {userSel}
                    </span>
                  </div>
                  <div className="res-q-row">
                    <span className="mono res-q-row-label">Correct</span>
                    <span className="res-q-row-val text-correct">
                      {q.correctAnswer}
                    </span>
                  </div>
                </div>
                {!correct && getExplanation(i) && (
                  <div className="res-q-explain">
                    <div className="mono res-q-explain-label">AI Explanation</div>
                    <p>{getExplanation(i)}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="res-actions">
        <Link to="/exam/start" className="btn btn-primary btn-lg">
          Practice Again →
        </Link>
        <Link to="/dashboard" className="btn btn-ghost btn-lg">
          View Dashboard
        </Link>
      </div>

      <style>{`
        .res-score-card {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 20px;
          background: var(--card);
          border: 1.5px solid var(--lime);
          border-radius: var(--radius-lg);
          padding: 32px;
          margin-bottom: 20px;
          box-shadow: var(--shadow-lime);
        }
        .res-score-main {
          text-align: center;
          padding-right: 20px;
          border-right: 1px solid var(--border);
        }
        .res-label {
          font-size: 0.75rem;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }
        .res-overall {
          font-family: var(--font-heading);
          font-size: clamp(2.6rem, 8vw, 4.5rem);
          font-weight: 800;
          color: var(--text);
          line-height: 1;
          margin-bottom: 6px;
          word-break: break-word;
          overflow-wrap: break-word;
          max-width: 100%;
        }
        .res-correct {
          color: var(--secondary);
          font-size: 0.95rem;
        }
        .res-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .res-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--bg);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }
        .res-stat-label {
          font-size: 0.78rem;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .res-stat-val {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 700;
        }
        .res-weak {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px 24px;
          margin-bottom: 20px;
        }
        .res-weak-head { margin-bottom: 12px; }
        .res-weak-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .res-breakdown {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 28px;
          margin-bottom: 20px;
        }
        .res-section-title {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 20px;
        }
        .res-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .res-q {
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
        }
        .res-q-correct { border-color: var(--success); }
        .res-q-wrong { border-color: var(--error); }
        .res-q-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .res-q-num {
          font-size: 0.78rem;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .res-q-text {
          font-weight: 500;
          font-size: 1rem;
          line-height: 1.5;
          margin-bottom: 14px;
        }
        .res-q-rows {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.92rem;
        }
        .res-q-row {
          display: flex;
          gap: 10px;
        }
        .res-q-row-label {
          color: var(--secondary);
          min-width: 110px;
          font-size: 0.78rem;
        }
        .res-q-row-val {
          font-weight: 500;
        }
        .text-correct { color: var(--success); }
        .text-wrong { color: var(--error); }
        .res-q-explain {
          margin-top: 14px;
          padding: 12px 14px;
          background: var(--bg);
          border-left: 3px solid var(--lime);
          border-radius: 8px;
        }
        .res-q-explain-label {
          font-size: 0.72rem;
          color: var(--lime);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }
        .res-q-explain p {
          font-size: 0.9rem;
          line-height: 1.55;
          color: var(--text);
        }
        .res-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        @media (max-width: 700px) {
          .res-score-card {
            grid-template-columns: 1fr;
          }
          .res-score-main {
            border-right: none;
            border-bottom: 1px solid var(--border);
            padding: 0 0 20px 0;
          }
          .res-overall { font-size: clamp(2.4rem, 9vw, 3.5rem); }
        }
      `}</style>
    </DashboardLayout>
  );
}
