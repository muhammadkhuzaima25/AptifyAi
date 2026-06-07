import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal from '../components/Reveal.jsx';
import CountUp from '../components/CountUp.jsx';
import BarChart from '../components/BarChart.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { useEffect, useState } from 'react';
import './Landing.css';

const stats = [
  { value: 50000, suffix: '+', label: 'Questions Generated' },
  { value: 94, suffix: '%', label: 'Users Improved' },
  { value: 4, suffix: '', label: 'Exam Types' },
  { value: 4.9, decimals: 1, suffix: '★', label: 'Avg Rating' },
];

const steps = [
  {
    n: '01',
    title: 'Select Exam, Topic & Duration',
    desc: 'Pick from NTS, GAT, MDCAT, CSS/PMS. Choose a topic and a duration from 5 to 30 minutes.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'AI Generates Fresh Questions',
    desc: 'AptifyAI instantly crafts unique MCQs tuned to your chosen difficulty — never repeated.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Track Your Growth Arc',
    desc: 'See score trends, weak topics and streaks climb. AI explains every wrong answer.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 17 L9 11 L13 15 L21 7 M21 7 V13 M21 7 H15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const features = [
  {
    icon: '🧠',
    title: 'AI Live Question Generation',
    desc: 'Fresh questions every single session. Never repeat, never memorize — truly adaptive practice.',
  },
  {
    icon: '⏱️',
    title: 'Custom Duration Selection',
    desc: '5, 10, 15, 20 or 30 minutes — questions and pacing auto-adjust to your chosen time.',
  },
  {
    icon: '📊',
    title: 'Progress Analytics Dashboard',
    desc: 'Visual improvement arc across sessions, accuracy, speed and clarity — all in one view.',
  },
  {
    icon: '⚡',
    title: 'Instant AI Explanations',
    desc: 'Wrong answers are explained in detail by AI, so you actually learn from every mistake.',
  },
  {
    icon: '🎯',
    title: 'Weak Topic Detection',
    desc: 'AI scans your history and surfaces the topics holding you back — focus where it matters.',
  },
  {
    icon: '🏆',
    title: 'Streak & Session History',
    desc: 'Daily streak tracking plus your full session history — every improvement is recorded.',
  },
];

const durationOptions = [
  { min: 5, questions: 5 },
  { min: 10, questions: 10 },
  { min: 15, questions: 15 },
  { min: 20, questions: 20 },
  { min: 30, questions: 30 },
];

const testimonials = [
  {
    name: 'Ayesha Khan',
    university: 'FAST-NUCES, Karachi',
    stars: 5,
    quote:
      'AptifyAI changed how I prep for NTS. The AI explanations actually teach you, not just tell you the answer. My score jumped 22% in 3 weeks.',
  },
  {
    name: 'Hamza Ali',
    university: 'LUMS, Lahore',
    stars: 5,
    quote:
      'I used to solve random past papers. AptifyAI tells me exactly which topic I am weak in. Got into MDCAT with a solid Biology score thanks to this.',
  },
  {
    name: 'Sara Iqbal',
    university: 'NUST, Islamabad',
    stars: 5,
    quote:
      'The streak system is genuinely addictive. I practice 10 minutes daily and watch my arc climb. CSS prep feels structured for the first time.',
  },
];

const faqs = [
  {
    q: 'How does AptifyAI generate questions?',
    a: 'When you start a session, our question engine takes your exam type, topic, difficulty and duration and returns a unique set of multiple-choice questions tuned to your level — never pulled from a static bank.',
  },
  {
    q: 'Which exams are supported?',
    a: 'Currently NTS, GAT, MDCAT and CSS/PMS with topic breakdowns for each. New exams and topic sets are added regularly.',
  },
  {
    q: 'Is my progress saved?',
    a: 'Yes. Every session is saved to your account. You get a full session history, streak tracking and a long-term growth chart across all your attempts.',
  },
  {
    q: 'How are weak topics detected?',
    a: 'After every session, AI reviews your performance and your past history. If a topic consistently scores below 60%, it gets flagged in your weak-topics panel.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. AptifyAI runs entirely in your browser. Sign up, pick a session and start practicing in under 30 seconds.',
  },
  {
    q: 'Is AptifyAI really free?',
    a: 'Yes. Every feature is fully unlocked for every account — unlimited sessions, all exam types, full analytics, streak tracking and AI explanations. No paywalls.',
  },
];

const fakeChartData = [
  { label: 'S1', value: 48 },
  { label: 'S2', value: 55 },
  { label: 'S3', value: 52 },
  { label: 'S4', value: 64 },
  { label: 'S5', value: 70 },
  { label: 'S6', value: 76 },
  { label: 'S7', value: 84, highlight: true },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);
  const [activeDuration, setActiveDuration] = useState(15);
  const [heroActiveIdx, setHeroActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroActiveIdx((i) => (i + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing">
      <Navbar />

      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-inner">
          <div className="hero-left">
            <Reveal>
              <span className="pill">
                <span style={{ fontSize: '0.9rem' }}>⚡</span> AI Aptitude Coach
              </span>
            </Reveal>
            <Reveal delay={1}>
              <h1 className="hero-title">
                Practice Smarter.
                <br />
                Track Every
                <br />
                <span className="hero-title-lime">Improvement.</span>
              </h1>
            </Reveal>
            <Reveal delay={2}>
              <p className="hero-sub">
                AI-generated aptitude questions for NTS, GAT, MDCAT & CSS — with
                detailed explanations, progress tracking and a streak system that
                keeps you showing up.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="hero-ctas">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Practicing →
                </Link>
                <a href="#how" className="btn btn-ghost btn-lg">
                  See How It Works
                </a>
              </div>
            </Reveal>
            <Reveal delay={4}>
              <div className="hero-trust">
                <div className="hero-trust-avatars">
                  <span className="hero-avatar hero-avatar-1">A</span>
                  <span className="hero-avatar hero-avatar-2">H</span>
                  <span className="hero-avatar hero-avatar-3">S</span>
                </div>
                <span className="mono hero-trust-text">
                  Joined by 2,400+ students this week
                </span>
              </div>
            </Reveal>
          </div>

          <div className="hero-right-wrap">
            <div className="hero-mock">
              <div className="hero-mock-top">
                <div className="hero-mock-chips">
                  {['NTS', 'GAT', 'MDCAT', 'CSS/PMS'].map((e) => (
                    <span
                      key={e}
                      className={`hero-mock-chip ${
                        e === 'NTS' ? 'hero-mock-chip-active' : ''
                      }`}
                    >
                      {e}
                    </span>
                  ))}
                </div>
                <div className="hero-mock-meta mono">
                  Topic: Analytical · Medium
                </div>
              </div>

              <div className="hero-mock-progress">
                <div className="hero-mock-progress-bar" style={{ width: '0%' }} />
                <span className="mono hero-mock-progress-text">3 / 5</span>
              </div>

              <div className="hero-mock-q">
                <span className="pill">Q3 of 5</span>
                <h3 className="hero-mock-q-text">
                  <span className="hero-mock-q-typed">
                    If the day after tomorrow is two days before Thursday, what day is it today?
                  </span>
                </h3>
                <div className="hero-mock-options">
                  {['Sunday', 'Monday', 'Tuesday', 'Friday'].map((o, i) => (
                    <div
                      key={o}
                      className={`hero-mock-option ${
                        i === heroActiveIdx ? 'hero-mock-option-active' : ''
                      }`}
                    >
                      <span className="hero-mock-option-letter">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {o}
                    </div>
                  ))}
                </div>
              </div>

              <div className="hero-mock-scores">
                <div className="hero-mock-score">
                  <div className="hero-mock-score-num mono">8.4</div>
                  <div className="hero-mock-score-label">Accuracy</div>
                </div>
                <div className="hero-mock-score">
                  <div className="hero-mock-score-num mono">7.9</div>
                  <div className="hero-mock-score-label">Speed</div>
                </div>
                <div className="hero-mock-score hero-mock-score-lime">
                  <div className="hero-mock-score-num mono">9.1</div>
                  <div className="hero-mock-score-label">Overall</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="container stats-grid">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i % 3}>
              <div className="stats-item">
                <div className="stats-num">
                  <CountUp
                    value={s.value}
                    suffix={s.suffix}
                    decimals={s.decimals || 0}
                  />
                </div>
                <div className="stats-label mono">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="how" className="section how-section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="pill pill-muted">How It Works</span>
              <h2 className="section-title">
                From topic to growth arc
                <br />
                in three simple steps.
              </h2>
            </div>
          </Reveal>
          <div className="how-grid">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i + 1}>
                <div className="how-card">
                  <div className="how-icon">{s.icon}</div>
                  <div className="how-step mono">Step {s.n}</div>
                  <h3 className="how-title">{s.title}</h3>
                  <p className="how-desc">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="section features-section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="pill">Features</span>
              <h2 className="section-title">
                Everything you need to climb
                <br />
                your <span className="text-lime">improvement arc.</span>
              </h2>
            </div>
          </Reveal>
          <div className="features-grid">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) + 1}>
                <div className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section duration-section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="pill pill-muted">Duration Picker</span>
              <h2 className="section-title">Pick a session that fits your day.</h2>
              <p className="section-sub">
                Short on time? 5 minutes. Want a real workout? 30 minutes.
                The number of questions adjusts automatically.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="duration-picker">
              {durationOptions.map((d) => (
                <button
                  key={d.min}
                  className={`duration-pill ${
                    activeDuration === d.min ? 'duration-pill-active' : ''
                  }`}
                  onClick={() => setActiveDuration(d.min)}
                >
                  {d.min} min
                </button>
              ))}
            </div>
            <p className="duration-note mono">
              {durationOptions.map((d) => (
                <span key={d.min}>
                  <strong>{d.min} min</strong> = {d.questions} questions
                  {d.min !== 30 ? '  |  ' : ''}
                </span>
              ))}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section analytics-section">
        <div className="container">
          <div className="analytics-grid">
            <Reveal>
              <div className="analytics-left">
                <span className="pill">Analytics</span>
                <h2 className="section-title analytics-title-left">Watch your arc climb.</h2>
                <p className="section-sub">
                  Every session pushes your average up. See the trend line before
                  your next attempt.
                </p>
                <div className="analytics-card">
                  <div className="analytics-card-head">
                    <div>
                      <div className="mono analytics-card-label">
                        Score · Last 7 Sessions
                      </div>
                      <div className="analytics-card-big mono">
                        <CountUp value={64} />%
                      </div>
                    </div>
                    <span className="pill pill-success">+36% ↑</span>
                  </div>
                  <BarChart data={fakeChartData} max={100} height={200} />
                </div>

                <div className="analytics-metrics">
                  <div className="analytics-metric">
                    <div className="mono analytics-metric-label">Best Score</div>
                    <div className="analytics-metric-num">84%</div>
                  </div>
                  <div className="analytics-metric">
                    <div className="mono analytics-metric-label">Avg Score</div>
                    <div className="analytics-metric-num">64%</div>
                  </div>
                  <div className="analytics-metric">
                    <div className="mono analytics-metric-label">Improvement</div>
                    <div className="analytics-metric-num text-lime">+36%</div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="analytics-right">
                <div className="session-card">
                  <h3 className="session-card-title">Session Breakdown</h3>
                  <div className="session-row">
                    <div className="session-row-head">
                      <span>Accuracy</span>
                      <span className="mono">84%</span>
                    </div>
                    <ProgressBar value={84} />
                  </div>
                  <div className="session-row">
                    <div className="session-row-head">
                      <span>Speed</span>
                      <span className="mono">79%</span>
                    </div>
                    <ProgressBar value={79} color="var(--text)" />
                  </div>
                  <div className="session-row">
                    <div className="session-row-head">
                      <span>Weak Topics</span>
                      <span className="mono">2 flagged</span>
                    </div>
                    <ProgressBar value={40} color="var(--warning)" />
                  </div>
                </div>

                <div className="ai-tips-card">
                  <div className="ai-tips-head">
                    <span className="pill">AI Tip</span>
                  </div>
                  <p className="ai-tips-text">
                    Based on your last 3 sessions, focus on <strong>Verbal Reasoning</strong> before
                    your next attempt. Your accuracy there is 48% — the lowest across topics.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section testimonials-section">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="pill pill-muted">Testimonials</span>
              <h2 className="section-title">Loved by students across Pakistan.</h2>
            </div>
          </Reveal>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i + 1}>
                <div className="testimonial-card">
                  <div className="testimonial-stars">
                    {Array.from({ length: t.stars }).map((_, k) => (
                      <span key={k}>★</span>
                    ))}
                  </div>
                  <p className="testimonial-quote">"{t.quote}"</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="testimonial-name">{t.name}</div>
                      <div className="testimonial-uni mono">{t.university}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section faq-section">
        <div className="container faq-container">
          <Reveal>
            <div className="section-head">
              <span className="pill pill-muted">FAQ</span>
              <h2 className="section-title">Common questions, answered.</h2>
            </div>
          </Reveal>
          <div className="faq-list">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <Reveal key={f.q} delay={(i % 3) + 1}>
                  <div className={`faq-item ${open ? 'faq-item-open' : ''}`}>
                    <button
                      className="faq-q"
                      onClick={() => setOpenFaq(open ? -1 : i)}
                    >
                      <span>{f.q}</span>
                      <span className="faq-toggle">{open ? '−' : '+'}</span>
                    </button>
                    <div className="faq-a-wrap">
                      <div className="faq-a">{f.a}</div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container">
          <Reveal>
            <div className="cta-banner">
              <h2 className="cta-title">
                Stop Guessing.
                <br />
                <span className="text-lime">Start Growing.</span>
              </h2>
              <p className="cta-sub">
                Build a daily practice habit, get AI insights after every session,
                and watch your score trend up — week after week.
              </p>
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Free →
                </Link>
                <Link to="/login" className="btn btn-ghost btn-lg">
                  I already have an account
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
