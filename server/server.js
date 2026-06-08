import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'node:dns';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import examRoutes from './routes/examRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

try { dns.setServers(['1.1.1.1', '8.8.8.8']); } catch {}
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aptifyai';

app.use(cors({
  origin: [
    'https://aptifyai.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '2mb' }));

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ Database connection failed during request:", err.message);
    next(err);
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AptifyAI API', time: new Date().toISOString() });
});

app.get('/api/health/db', async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    if (state !== 1) {
      return res.status(503).json({
        ok: false,
        state: states[state],
        message: 'MongoDB is not connected. Check MONGO_URI, IP whitelist, and Atlas user permissions.',
      });
    }
    const admin = mongoose.connection.db.admin();
    const result = await admin.ping();
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({
      ok: true,
      state: states[state],
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      ping: result,
      collections: collections.map((c) => c.name),
      user: (() => {
        try {
          const u = new URL(MONGO_URI);
          return u.username || 'unknown';
        } catch {
          return 'unknown';
        }
      })(),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.name,
      message: err.message,
      hint:
        err.message?.includes('bad auth') || err.message?.includes('authentication failed')
          ? 'Username or password is wrong, OR the Atlas user does not have permission on this database. Go to Atlas ➔ Database Access ➔ edit user ➔ grant "readWrite" on "aptifyai" database.'
          : 'Unknown DB error — check the full message above',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/progress', progressRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const maskUri = (uri) => uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, '$1****$3');

if (process.env.NODE_ENV !== 'production') {
  console.log('\n========================================');
  console.log('🚀 Starting AptifyAI server locally...');
  console.log('========================================');
  console.log(`🔌 Port       : ${PORT}`);
  console.log(`🌐 Client URL : ${CLIENT_URL}`);
  console.log(`🗄️  Mongo URI  : ${maskUri(MONGO_URI)}`);

  connectDB()
    .then(() => {
      console.log('✅ MongoDB: CONNECTED');
      app.listen(PORT, () => {
        console.log(`✅ Server running → http://localhost:${PORT}\n========================================\n`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB Connection Error:', err.message);
    });
}

export default app;
