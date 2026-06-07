import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import api from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatTime } from '../utils/helpers.js';

export default function ExamRoom() {
  const navigate = useNavigate();
  const toast = useToast();

  const [exam, setExam] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    const raw = sessionStorage.getItem('aptifyai_exam');
    if (!raw) {
      navigate('/exam/start');
      return;
    }
    const data = JSON.parse(raw);
    setExam(data);
    setSecondsLeft(data.duration * 60);
    startedAt.current = Date.now();
  }, [navigate]);

  useEffect(() => {
    if (!exam) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [exam, secondsLeft]);

  if (!exam) return null;

  const questions = exam.questions || [];
  const current = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;
  const progress = ((index + 1) / total) * 100;

  const selectOption = (i, opt) => {
    setAnswers((a) => ({ ...a, [i]: opt }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startedAt.current) / 1000);
    const payloadAnswers = questions.map((_, i) => ({
      questionIndex: i,
      selected: answers[i] || null,
    }));
    try {
      const { data } = await api.post('/exam/submit', {
        examType: exam.examType,
        topic: exam.topic,
        difficulty: exam.difficulty,
        duration: exam.duration,
        questions,
        answers: payloadAnswers,
        timeTaken,
      });
      sessionStorage.setItem(
        'aptifyai_result',
        JSON.stringify({ ...data, exam, answers: payloadAnswers, questions })
      );
      navigate('/exam/results');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="exam-room">
      <Sidebar />
      <div className="exam-room-main">
        <div className="exam-room-top">
          <div className="exam-room-meta">
            <span className="pill pill-muted">{exam.examType}</span>
            <span className="pill">{exam.topic}</span>
            <span className="pill pill-dark">{exam.difficulty}</span>
          </div>
          <div className="exam-room-counter mono">
            Q {index + 1} / {total}
          </div>
          <div
            className={`exam-room-timer mono ${
              secondsLeft < 120 ? 'exam-room-timer-warn exam-room-timer-pulse' : ''
            }`}
          >
            ⏱ {formatTime(secondsLeft)}
          </div>
        </div>

        <div className="exam-room-progress">
          <div
            className="exam-room-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="exam-room-card">
          <div className="exam-room-q-num mono">Question {index + 1}</div>
          <h2 className="exam-room-q-text">{current.question}</h2>
          <div className="exam-room-options">
            {current.options.map((opt, oi) => {
              const selected = answers[index] === opt;
              return (
                <button
                  key={oi}
                  className={`exam-room-option ${
                    selected ? 'exam-room-option-active' : ''
                  }`}
                  onClick={() => selectOption(index, opt)}
                >
                  <span className="exam-room-option-letter">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="exam-room-nav">
          <div className="exam-room-progress-text mono">
            {Object.keys(answers).length} of {total} answered
          </div>
          <div style={{ flex: 1 }} />
          {index < total - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => setIndex((i) => i + 1)}
              disabled={!answers[index]}
              title={!answers[index] ? 'Please select an option to continue' : ''}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <span className="spinner-sm" /> : 'Submit Exam →'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .exam-room {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
        }
        .exam-room-main {
          flex: 1;
          min-width: 0;
          max-width: 900px;
          margin: 0 auto;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .exam-room-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 16px 20px;
        }
        .exam-room-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .exam-room-counter {
          font-weight: 700;
          color: var(--secondary);
        }
        .exam-room-timer {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text);
          background: var(--bg);
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid var(--border);
        }
        .exam-room-timer-warn {
          color: var(--error);
          border-color: var(--error);
          background: var(--error-soft);
        }
        .exam-room-timer-pulse {
          animation: exam-room-timer-pulse 1s ease-in-out infinite;
        }
        @keyframes exam-room-timer-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 var(--error-soft); }
          50% { transform: scale(1.04); box-shadow: 0 0 0 6px transparent; }
        }
        .exam-room-progress {
          height: 6px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 999px;
          overflow: hidden;
        }
        .exam-room-progress-bar {
          height: 100%;
          background: var(--lime);
          border-radius: 999px;
          transition: width 300ms ease;
        }
        .exam-room-card {
          flex: 1;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .exam-room-q-num {
          color: var(--secondary);
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .exam-room-q-text {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.4;
          color: var(--text);
        }
        .exam-room-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .exam-room-option {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          background: var(--card);
          text-align: left;
          font-size: 0.98rem;
          cursor: pointer;
          transition: all 150ms;
          font-family: var(--font-body);
        }
        .exam-room-option:hover {
          border-color: var(--lime);
        }
        .exam-room-option-active {
          background: var(--lime-soft);
          border-color: var(--lime);
          font-weight: 600;
        }
        .exam-room-option-letter {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--bg);
          color: var(--text);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
        }
        .exam-room-option-active .exam-room-option-letter {
          background: var(--lime);
        }
        .exam-room-nav {
          display: flex;
          align-items: center;
          gap: 16px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 14px 22px;
        }
        .exam-room-progress-text {
          color: var(--secondary);
          font-size: 0.85rem;
        }
        @media (max-width: 700px) {
          .exam-room-main { padding: 16px 14px 100px; }
          .exam-room-card { padding: 22px 18px; }
          .exam-room-q-text { font-size: 1.2rem; }
          .exam-room-top { padding: 12px 14px; }
        }
      `}</style>
    </div>
  );
}
