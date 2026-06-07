import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout.jsx';
import Spinner from '../components/Spinner.jsx';
import api from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { EXAM_TOPICS, durationToCount } from '../utils/helpers.js';

const EXAMS = [
  {
    key: 'NTS',
    label: 'NTS',
    desc: 'National Testing Service — Verbal, Quantitative, Analytical.',
  },
  {
    key: 'GAT',
    label: 'GAT',
    desc: 'Graduate Assessment Test — for Masters & scholarships.',
  },
  {
    key: 'MDCAT',
    label: 'MDCAT',
    desc: 'Medical & Dental College Admission Test.',
  },
  {
    key: 'CSS/PMS',
    label: 'CSS / PMS',
    desc: 'Central Superior Services & Provincial Management Service.',
  },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DURATIONS = [5, 10, 15, 20, 30];

export default function StartExam() {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [examType, setExamType] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState(15);
  const [generating, setGenerating] = useState(false);

  const topicsForExam = examType ? EXAM_TOPICS[examType] || [] : [];
  const questionCount = durationToCount(duration);

  useEffect(() => {
    setTopic('');
  }, [examType]);

  const canProceed = () => {
    if (step === 1) return !!examType;
    if (step === 2) return !!topic;
    if (step === 3) return !!difficulty;
    if (step === 4) return !!duration;
    return false;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/exam/generate', {
        examType,
        topic,
        difficulty,
        duration,
      });
      sessionStorage.setItem(
        'aptifyai_exam',
        JSON.stringify({
          examType,
          topic,
          difficulty,
          duration,
          questions: data.questions,
          startedAt: Date.now(),
        })
      );
      navigate('/exam/room');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout
      title="Start a New Exam"
      subtitle="Configure your session — AI will do the rest."
    >
      <div className="stepper">
        {[
          { n: 1, label: 'Exam' },
          { n: 2, label: 'Topic' },
          { n: 3, label: 'Difficulty' },
          { n: 4, label: 'Duration' },
        ].map((s) => (
          <div
            key={s.n}
            className={`stepper-item ${
              step === s.n
                ? 'stepper-item-active'
                : step > s.n
                ? 'stepper-item-done'
                : ''
            }`}
          >
            <div className="stepper-num">{step > s.n ? '✓' : s.n}</div>
            <div className="stepper-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="step-card">
        {step === 1 && (
          <>
            <h2 className="step-title">Select your exam</h2>
            <p className="step-desc text-secondary">
              Pick the exam you're preparing for. Each exam has its own topic set.
            </p>
            <div className="exam-grid">
              {EXAMS.map((e) => (
                <button
                  key={e.key}
                  className={`exam-card ${
                    examType === e.key ? 'exam-card-active' : ''
                  }`}
                  onClick={() => setExamType(e.key)}
                >
                  <div className="exam-card-label">{e.label}</div>
                  <div className="exam-card-desc">{e.desc}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="step-title">Select a topic</h2>
            <p className="step-desc text-secondary">
              Topics for <strong>{examType}</strong>. Choose one to focus on.
            </p>
            <div className="topic-grid">
              {topicsForExam.map((t) => (
                <button
                  key={t}
                  className={`topic-card ${
                    topic === t ? 'topic-card-active' : ''
                  }`}
                  onClick={() => setTopic(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="step-title">Select difficulty</h2>
            <p className="step-desc text-secondary">
              How challenging should the questions be?
            </p>
            <div className="pill-row">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  className={`pill-pick ${
                    difficulty === d ? 'pill-pick-active' : ''
                  }`}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="step-title">Select duration</h2>
            <p className="step-desc text-secondary">
              The number of questions will auto-adjust to your time.
            </p>
            <div className="pill-row">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  className={`pill-pick ${
                    duration === d ? 'pill-pick-active' : ''
                  }`}
                  onClick={() => setDuration(d)}
                >
                  {d} min
                </button>
              ))}
            </div>
          </>
        )}

        <div className="step-nav">
          {step > 1 && (
            <button
              className="btn btn-ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={generating}
            >
              ← Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 4 && (
            <button
              className="btn btn-primary"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
            >
              Next →
            </button>
          )}
          {step === 4 && (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleGenerate}
              disabled={generating || !canProceed()}
            >
              {generating ? (
                <span className="spinner-sm" />
              ) : (
                'Generate Questions →'
              )}
            </button>
          )}
        </div>
      </div>

      {generating && (
        <div className="gen-overlay">
          <Spinner label="AI is generating your questions..." />
        </div>
      )}

      <style>{`
        .stepper {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .stepper-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          background: var(--card);
          border: 1px solid var(--border);
          font-size: 0.85rem;
          color: var(--secondary);
          font-weight: 500;
        }
        .stepper-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--bg);
          color: var(--secondary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
        }
        .stepper-item-active {
          background: var(--text);
          color: var(--bg);
          border-color: var(--text);
        }
        .stepper-item-active .stepper-num {
          background: var(--lime);
          color: var(--bg);
        }
        .stepper-item-done {
          background: var(--lime-soft);
          color: var(--lime);
          border-color: var(--lime);
        }
        .stepper-item-done .stepper-num {
          background: var(--lime);
          color: var(--bg);
        }
        .step-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 36px;
          position: relative;
          color: var(--text);
        }
        .step-title {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
          max-width: 100%;
        }
        .step-desc {
          margin-bottom: 26px;
          font-size: 0.95rem;
          line-height: 1.6;
          max-width: 600px;
        }
        .step-note {
          margin-top: 18px;
          text-align: center;
          color: var(--secondary);
          font-size: 0.85rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          font-family: var(--font-mono);
          font-weight: 700;
        }
        .exam-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .exam-card {
          background: var(--card);
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          text-align: left;
          cursor: pointer;
          transition: all 200ms;
          font-family: var(--font-body);
          color: var(--text);
        }
        .exam-card:hover {
          border-color: var(--lime);
          transform: translateY(-2px);
          box-shadow: var(--shadow);
        }
        .exam-card-active {
          border-color: var(--lime);
          background: var(--lime-soft);
          box-shadow: var(--shadow-lime);
        }
        .exam-card-label {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
          color: var(--text);
        }
        .exam-card-desc {
          color: var(--secondary);
          font-size: 0.9rem;
          line-height: 1.6;
          max-width: 100%;
        }
        .topic-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }
        .topic-card {
          background: var(--card);
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          padding: 18px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 200ms;
          font-family: var(--font-body);
          color: var(--text);
        }
        .topic-card:hover {
          border-color: var(--lime);
        }
        .topic-card-active {
          border-color: var(--lime);
          background: var(--lime);
          color: var(--bg);
        }
        .pill-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .pill-pick {
          padding: 14px 26px;
          border-radius: 999px;
          background: var(--card);
          border: 1.5px solid var(--border);
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text);
          cursor: pointer;
          transition: all 200ms;
        }
        .pill-pick:hover {
          border-color: var(--lime);
          transform: translateY(-2px);
        }
        .pill-pick-active {
          background: var(--lime);
          border-color: var(--lime);
          color: var(--bg);
          box-shadow: var(--shadow-lime);
        }
        .step-nav {
          display: flex;
          gap: 10px;
          margin-top: 32px;
          padding-top: 22px;
          border-top: 1px solid var(--border);
          align-items: center;
        }
        .gen-overlay {
          position: fixed;
          inset: 0;
          background: var(--overlay);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }
        .gen-overlay > div {
          background: var(--card);
          border-radius: var(--radius-lg);
          padding: 50px 60px;
          color: var(--text);
        }
        @media (max-width: 700px) {
          .exam-grid { grid-template-columns: 1fr; }
          .step-card { padding: 24px 18px; }
        }
      `}</style>
    </DashboardLayout>
  );
}
