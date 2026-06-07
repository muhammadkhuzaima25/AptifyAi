# AptifyAI

> **AI-Powered Aptitude Training. Track Every Improvement.**

A production-grade MERN stack web app for Pakistani students preparing for NTS, GAT, MDCAT and CSS/PMS. AI generates fresh MCQs on demand, evaluates answers with detailed explanations, detects weak topics and visualizes the user's improvement arc over time.

Brand: **AptifyAI** — "Aptify" in primary text color, "AI" in lime accent (#84CC16). Syne 800 weight, letter-spacing -0.03em, used everywhere the brand appears.

---

## Tech Stack

- **Frontend:** React 18 + Vite, React Router v6, Axios, custom CSS (no Tailwind, no Bootstrap, no system-ui)
- **Backend:** Node.js + Express, MongoDB + Mongoose, JWT, bcrypt
- **Design system:** Syne (headings, 700/800 weight), DM Sans (body, 300/400/500), Space Mono (scores, labels, badges, counters, monospace)
- **Palette:** `#F8FAFC` background · `#0F172A` dark · `#84CC16` lime accent · `#64748B` secondary
- **Themes:** Full light + dark mode via `data-theme` attribute, persisted in localStorage

---

## Folder Structure

```
AptifyAI/
├── client/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/    (Navbar, Footer, Sidebar, Logo, Modal, Reveal, CountUp, BarChart, Spinner, AuthShell, ProtectedRoute, ThemeToggle, DashboardLayout, ProgressBar)
│   │   ├── context/       (AuthContext, ToastContext, ThemeContext)
│   │   ├── hooks/         (useAnimations — scroll reveal + count up)
│   │   ├── pages/         (Landing, Register, Login, Dashboard, StartExam, ExamRoom, Results, Progress, History, Profile, NotFound)
│   │   ├── utils/         (api.js axios instance, helpers.js)
│   │   ├── index.css      (global design system + theme variables)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── server/
    ├── models/            (User, Session, Progress)
    ├── routes/            (authRoutes, examRoutes, progressRoutes)
    ├── controllers/       (authController, examController, progressController)
    ├── middleware/        (authMiddleware, errorMiddleware)
├── utils/             (questionEngine.js, examHelpers.js, generateToken.js)
│   ├── server.js
│   └── package.json
```

---

## Setup

### 1. Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)
- Google AI Studio (Gemini) API key (optional — server falls back to a curated question bank)

### 2. Backend

```bash
cd server
npm install
```

Create your `.env` file (a starter is provided):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/aptifyai
JWT_SECRET=replace_with_a_long_random_string
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-2.0-flash
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

The API runs on `http://localhost:5000`. Health check: `GET /api/health`.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

The app runs on `http://localhost:5173`. Vite proxies `/api/*` to the backend automatically.

---

## API Endpoints

### Auth — `/api/auth`
| Method | Path           | Description                          |
| ------ | -------------- | ------------------------------------ |
| POST   | /register      | Create new account                   |
| POST   | /login         | Login, returns JWT                   |
| GET    | /me            | Get current user (protected)         |
| PUT    | /profile       | Update name / target exam            |
| PUT    | /password      | Change password                      |
| DELETE | /profile       | Delete account + all sessions        |

### Exam — `/api/exam`
| Method | Path           | Description                                                  |
| ------ | -------------- | ------------------------------------------------------------ |
| POST   | /generate      | Generate fresh MCQs for a topic/difficulty/duration       |
| POST   | /submit        | Submit answers, get scores + AI explanations + weak topics   |
| GET    | /history       | List all sessions for the current user                       |
| GET    | /history/:id   | Get a single session's full breakdown                        |

### Progress — `/api/progress`
| Method | Path           | Description                                          |
| ------ | -------------- | ---------------------------------------------------- |
| GET    | /dashboard     | Stats, score chart, weak topics, recent sessions     |
| GET    | /streak        | Current streak                                       |
| GET    | /full          | Full analytics — calendar, AI insight, topic perf    |

---

## Frontend Pages

| Route          | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| `/`            | Landing — hero, stats, how-it-works, features, duration preview, analytics, testimonials, FAQ, CTA |
| `/register`    | Sign-up with name, email, password, target exam                             |
| `/login`       | Login form                                                                  |
| `/dashboard`   | Welcome, 4 stat tiles, score chart, weak topics, recent sessions, CTA      |
| `/exam/start`  | 4-step wizard: exam → topic → difficulty → duration                        |
| `/exam/room`   | Focused exam UI with countdown timer and live progress                     |
| `/exam/results`| Big overall score + accuracy/speed, question-by-question review, AI tips    |
| `/progress`    | Full analytics: line/bar chart, per-topic, 90-day streak calendar, AI insight |
| `/history`     | All sessions table with exam/date filters and detailed modal                |
| `/profile`     | Edit name/exam, change password, account stats, delete account              |

---

## Design Notes

- **Brand:** "AptifyAI" — Aptify in `var(--text)`, AI in `var(--lime)`, Syne 800 weight, letter-spacing -0.03em, applied in navbar, footer, login, register, dashboard sidebar and browser title.
- **Fonts:** Syne 700/800 for h1–h4, DM Sans 300/400/500 for body, Space Mono for all scores, stat numbers, badge labels and counters. Imported from Google Fonts via the exact spec URL. No system-ui, no Inter, no Roboto, no Arial anywhere.
- **Light + Dark mode:** `ThemeContext` manages state, persists to `localStorage`, applies `data-theme` to `documentElement`. `ThemeToggle` shows 🌙 in light mode and ☀️ in dark mode. Every background, text and border color uses CSS variables — zero hardcoded colors. Smooth 0.3s ease transition on background, color and border.
- **Text layout:** All section headings capped at 700px, all body paragraphs capped at 600px. Headings have letter-spacing -0.02em and line-height 1.1; paragraphs have line-height 1.6. `text-size-adjust: 100%` set globally. No `transform: scaleX` or text-stretching anywhere.
- **Free for everyone:** No pricing, no paywalls, no tier restrictions. All features are fully unlocked for every account.
- **Smooth scroll reveal** via `IntersectionObserver` (custom hook `useScrollReveal`).
- **Count-up animation** for landing stats (`useCountUp`).
- **Responsive everywhere:** mobile hamburger menu, dashboard bottom nav on mobile, breakpoints throughout.
- **Accessibility:** keyboard-focusable buttons, `aria-label`s on icon buttons, real form labels.

---

## Production Build

```bash
# Frontend
cd client && npm run build
# Outputs to client/dist — serve behind any static host (Vercel, Netlify, Nginx).

# Backend
cd server && npm start
```

For deployment, point `CLIENT_URL` in `.env` to your frontend's domain and update Vite's proxy or your reverse proxy accordingly.

---

## License

All Rights Reserved — see [LICENSE](./LICENSE) for details.
