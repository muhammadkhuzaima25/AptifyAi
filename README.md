<p align="center">
  <img alt="AptifyAI — AI-Powered Aptitude Test Trainer" src="./client/public/favicon.svg" width="120" style="border-radius: 20px;">
</p>

<h1 align="center">Aptify<span style="color:#84CC16">AI</span></h1>

<p align="center">
  <strong>AI-Powered Aptitude Training. Track Every Improvement.</strong>
</p>

<p align="center">
  <a href="https://aptifyai.vercel.app"><img src="https://img.shields.io/badge/🚀_Live_Demo-aptifyai.vercel.app-84CC16?style=for-the-badge&labelColor=0f172a" alt="Live Demo"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-84CC16?style=flat&logo=react&labelColor=0f172a">
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=nodedotjs&labelColor=0f172a">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&labelColor=0f172a">
  <img src="https://img.shields.io/badge/OpenRouter-AI-84CC16?style=flat&labelColor=0f172a">
  <img src="https://img.shields.io/badge/Express.js-5-000000?style=flat&logo=express&labelColor=0f172a">
  <img src="https://img.shields.io/badge/Deployed-Vercel-000000?style=flat&logo=vercel&labelColor=0f172a">
</p>

<br>

---

## 📌 Overview

**AptifyAI** is a production-grade, full-stack MERN web application built for Pakistani students preparing for **NTS, GAT, MDCAT, and CSS/PMS** exams.

Unlike static question banks that repeat the same MCQs, AptifyAI uses **OpenRouter AI** to generate completely fresh, unique aptitude questions every single session. After each exam, AI evaluates your answers, explains every mistake in detail, detects your weak topics, and visualizes your improvement arc over time — so you always know exactly where you stand and what to fix next.

---

## ❗ Problem Statement

Pakistani students preparing for NTS, GAT, MDCAT and CSS/PMS face three core problems:

- **Repeated question banks** — every platform recycles the same MCQs
- **No feedback** — you see your score but never understand *why* you got it wrong
- **No progress tracking** — no way to know if you're actually improving session by session

AptifyAI solves all three with AI-generated questions, detailed AI explanations, and a full analytics dashboard that tracks your growth arc.

---

## 🖥️ UI Preview

<p align="center">
  <img src="https://aptifyai.vercel.app/preview.png" alt="AptifyAI Dashboard" width="85%" style="border-radius:16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
</p>

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🧠 **AI Live Question Generation** | Fresh unique MCQs every session — never repeated, powered by OpenRouter |
| ⏱️ **Custom Duration Selection** | Pick 5, 10, 15, 20, or 30 minutes — question count adjusts automatically |
| 📊 **Progress Analytics Dashboard** | Visual improvement arc across all sessions with bar charts and trend graphs |
| ⚡ **Real-Time Answer Scoring** | Clarity, depth, confidence and accuracy scored after every session |
| 🎯 **Weak Topic Detection** | AI analyzes patterns across sessions and flags exactly what to study next |
| 🏆 **Streak & Session History** | Daily streak tracking + full breakdown of every past session |
| 🌙 **Dark & Light Mode** | Full theme support — persisted in localStorage, zero hardcoded colors |
| 🔐 **JWT Authentication** | Secure register and login with bcrypt password hashing |

---

## 🎯 Supported Exams

| Exam | Topics Covered |
|---|---|
| **NTS** | Maths, English, Analytical, GK, IQ |
| **GAT** | Verbal, Quantitative, Analytical |
| **MDCAT** | Biology, Chemistry, Physics, English |
| **CSS/PMS** | Current Affairs, English, General Knowledge, Pakistan Affairs |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- React Router v6
- Axios
- Custom CSS with CSS variables (no Tailwind, no Bootstrap)
- Fonts: Syne + DM Sans + Space Mono

**Backend**
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT Authentication
- bcrypt password hashing
- express-rate-limit

**AI**
- OpenRouter API — `meta-llama/llama-3.3-70b-instruct`
- Live question generation + answer evaluation + weak topic detection

---

## 🔒 Rate Limiting

All endpoints are rate-limited to prevent API abuse:

| Scope | Limit | Status |
|---|---|---|
| All `/api` routes | 100 requests per 15 min | 429 |
| `/api/auth` | 10 requests per 15 min | 429 |
| `/api/exam/generate` | 10 requests per hour | 429 |

---

## ⚙️ How to Run Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- OpenRouter API key (free tier available)

### 1. Clone the repo
```bash
git clone https://github.com/muhammadkhuzaima25/aptifyai.git
cd aptifyai
```

### 2. Backend setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_long_random_secret
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
CLIENT_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
AptifyAI/
├── client/                  # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, Sidebar, ThemeToggle, etc.
│   │   ├── context/         # AuthContext, ThemeContext, ToastContext
│   │   ├── hooks/           # useAnimations, useScrollReveal
│   │   ├── pages/           # Landing, Dashboard, StartExam, ExamRoom, Results, Progress, History, Profile
│   │   ├── utils/           # api.js, helpers.js
│   │   ├── index.css        # Design system + CSS variables
│   │   └── App.jsx
│   └── vite.config.js
│
└── server/                  # Node + Express Backend
    ├── controllers/         # authController, examController, progressController
    ├── middleware/          # authMiddleware, errorMiddleware
    ├── models/              # User, Session, Progress
    ├── routes/              # authRoutes, examRoutes, progressRoutes
    ├── utils/               # openai.js, examHelpers.js, generateToken.js
    └── server.js
```

---

## 🌐 API Endpoints

### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| POST | /register | Create new account |
| POST | /login | Login, returns JWT |
| GET | /me | Get current user (protected) |
| PUT | /profile | Update name / target exam |
| PUT | /password | Change password |
| DELETE | /profile | Delete account + all sessions |

### Exam — `/api/exam`
| Method | Path | Description |
|---|---|---|
| POST | /generate | Generate fresh AI MCQs |
| POST | /submit | Submit answers, get scores + explanations |
| GET | /history | List all sessions |
| GET | /history/:id | Get single session breakdown |

### Progress — `/api/progress`
| Method | Path | Description |
|---|---|---|
| GET | /dashboard | Stats, chart, weak topics, recent sessions |
| GET | /streak | Current streak data |
| GET | /full | Full analytics — calendar, AI insight, topic performance |

---

## 🔮 Future Work

- [ ] Voice answer support — speak your answers instead of typing
- [ ] Resume upload → personalized exam questions based on your CV
- [ ] Leaderboard — compete with other students
- [ ] PDF result export — share your progress report
- [ ] Multi-language support — Urdu interface
- [ ] Mobile app — React Native version

---

## 🔍 SEO Keywords

`NTS preparation online` · `GAT practice test` · `MDCAT MCQs AI` · `CSS PMS preparation` · `aptitude test Pakistan` · `AI generated MCQs` · `NTS test preparation app` · `GAT test online practice` · `MDCAT biology questions` · `CSS general knowledge MCQs` · `Pakistani exam preparation` · `aptitude test trainer` · `AI quiz generator Pakistan` · `MERN stack AI project` · `progress tracking exam app` · `weak topic detection AI` · `OpenRouter AI app` · `React exam app` · `Node.js quiz API` · `MongoDB exam history` · `Pakistani student app` · `free aptitude test online` · `AI powered MCQ generator` · `NTS GAT MDCAT CSS practice` · `exam improvement tracker`

---

## 👤 Author

**Muhammad Khuzaima**  
Graphic Designer · Logo & Brand Identity Expert · UI/UX Designer · MERN Stack Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat&logo=linkedin&labelColor=0f172a)](https://www.linkedin.com/in/muhammad-khuzaima-991a08313)
[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-aptifyai.vercel.app-84CC16?style=flat&labelColor=0f172a)](https://aptifyai.vercel.app)

---

## 📄 License

**All Rights Reserved.** Copyright © 2026 Muhammad Khuzaima.  
This project is for **viewing and evaluation only.** See [LICENSE](./LICENSE) for full terms.

---

<p align="center">
  <strong>⭐ If AptifyAI helped your exam prep or impressed you — please leave a star!</strong><br>
  <sub>Built from scratch with real debugging, designing, and grinding.<br>
  A star costs nothing but means everything. 🙏</sub>
</p>

<p align="center">
  <a href="https://github.com/muhammadkhuzaima25/aptifyai">
    <img src="https://img.shields.io/badge/⭐_Star_this_repo-Show_some_love-84CC16?style=for-the-badge&labelColor=0f172a" alt="Star this repo">
  </a>
</p>
