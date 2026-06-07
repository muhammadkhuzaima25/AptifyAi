import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'node:dns';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import examRoutes from './routes/examRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

dns.setServers(['1.1.1.1', '8.8.8.8']);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aptifyai';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '2mb' }));

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
          ? 'Username or password is wrong, OR the Atlas user does not have permission on this database. Go to Atlas \u2192 Database Access \u2192 edit user \u2192 grant "readWrite" on "aptifyai" database.'
          : 'Unknown DB error \u2014 check the full message above',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/progress', progressRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const maskUri = (uri) => uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, '$1****$3');

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
}

if (process.argv[1]?.includes('server.js')) {
  console.log('\n========================================');
  console.log('🚀 Starting AptifyAI server...');
  console.log('========================================');
  console.log(`📦 Node       : ${process.version}`);
  console.log(`🔌 Port       : ${PORT}`);
  console.log(`🌐 Client URL : ${CLIENT_URL}`);

  if (!process.env.MONGO_URI) {
    console.warn('⚠️  MONGO_URI not set in .env — falling back to mongodb://localhost:27017/aptifyai');
  } else {
    console.log(`🗄️  Mongo URI  : ${maskUri(MONGO_URI)}`);
  }

  console.log('\n⏳ Connecting to MongoDB...\n');

  connectDB()
    .then(() => {
      console.log('✅ MongoDB: CONNECTED');
      console.log(`   Host    : ${mongoose.connection.host}`);
      console.log(`   Database: ${mongoose.connection.name}`);
      app.listen(PORT, () => {
        console.log('\n========================================');
        console.log(`✅ Server running → http://localhost:${PORT}`);
        console.log(`   Health   : http://localhost:${PORT}/api/health`);
        console.log(`   DB Check : http://localhost:${PORT}/api/health/db`);
        console.log('========================================\n');
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB: CONNECTION FAILED');
      console.error('========================================');
      console.error(`   Error name : ${err.name}`);
      console.error(`   Message    : ${err.message}`);

      if (err.name === 'MongooseServerSelectionError') {
        console.error(`   Reason     : ${err.reason?.message || 'unknown'}`);
        const addrs = err.reason?.servers?.map((s) => s.address).filter(Boolean);
        if (addrs?.length) console.error(`   Tried      : ${addrs.join(', ')}`);
        console.error('\n   💡 Common fixes:');
        console.error('      1. Atlas → Network Access → add your IP (or 0.0.0.0/0 for testing)');
        console.error('      2. Atlas → Database Access → username/password match MONGO_URI');
        console.error('      3. DNS issue? try:  nslookup cluster1.wm2qf5c.mongodb.net');
      } else if (/bad auth|authentication failed/i.test(err.message)) {
        console.error('\n   💡 Hint: Username or password is wrong.');
        console.error('      Atlas → Database Access → reset the user password, then update .env');
      } else if (/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(err.message)) {
        console.error('\n   💡 Hint: DNS cannot resolve the host. Check your internet / DNS / firewall.');
      } else if (/ECONNREFUSED|timeout/i.test(err.message)) {
        console.error('\n   💡 Hint: Server not reachable. Check Atlas cluster status (paused / IP blocked).');
      }
      console.error('========================================\n');
      process.exit(1);
    });
}

export { app, connectDB };
