import asyncHandler from 'express-async-handler';
import Session from '../models/Session.js';
import Progress from '../models/Progress.js';
import { detectWeakTopics, generateAIInsight } from '../utils/openai.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const sessions = await Session.find({ userId }).sort({ date: -1 }).lean();
  const last7 = sessions.slice(0, 7).reverse();
  const total = sessions.length;
  const avgScore =
    total > 0
      ? Math.round(
          (sessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / total) * 10
        ) / 10
      : 0;
  const bestScore =
    total > 0
      ? Math.max(...sessions.map((s) => s.overallScore || 0))
      : 0;

  const allWeak = {};
  sessions.forEach((s) => {
    (s.weakTopics || []).forEach((t) => {
      allWeak[t] = (allWeak[t] || 0) + 1;
    });
  });
  const weakTopics = Object.entries(allWeak)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([t]) => t);

  const chartData = last7.map((s, i) => ({
    label: `S${total - last7.length + i + 1}`,
    score: s.overallScore || 0,
    accuracy: s.accuracyScore || 0,
    speed: s.speedScore || 0,
    date: s.date,
  }));

  res.json({
    stats: {
      totalSessions: total,
      avgScore,
      bestScore,
      streak: req.user.streak || 0,
    },
    chartData,
    weakTopics,
    recentSessions: sessions.slice(0, 5),
  });
});

export const getStreak = asyncHandler(async (req, res) => {
  res.json({ streak: req.user.streak || 0, lastActive: req.user.lastActive });
});

export const getFullProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const sessions = await Session.find({ userId }).sort({ date: 1 }).lean();
  const weakTopics = await detectWeakTopics(sessions);
  const insight = await generateAIInsight(sessions);

  const scoreHistory = sessions.map((s, i) => ({
    session: i + 1,
    score: s.overallScore || 0,
    accuracy: s.accuracyScore || 0,
    speed: s.speedScore || 0,
    date: s.date,
    examType: s.examType,
    topic: s.topic,
  }));

  const topicMap = {};
  sessions.forEach((s) => {
    if (!topicMap[s.topic]) {
      topicMap[s.topic] = { topic: s.topic, total: 0, count: 0 };
    }
    topicMap[s.topic].total += s.overallScore || 0;
    topicMap[s.topic].count += 1;
  });
  const topicPerformance = Object.values(topicMap).map((t) => ({
    topic: t.topic,
    avgScore: t.count > 0 ? Math.round((t.total / t.count) * 10) / 10 : 0,
    attempts: t.count,
  }));

  const examCount = {};
  sessions.forEach((s) => {
    examCount[s.examType] = (examCount[s.examType] || 0) + 1;
  });
  const mostPracticedExam =
    Object.entries(examCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const bestScore =
    sessions.length > 0
      ? Math.max(...sessions.map((s) => s.overallScore || 0))
      : 0;

  const totalQuestions = sessions.reduce(
    (acc, s) => acc + (s.totalQuestions || 0),
    0
  );

  const calendar = {};
  sessions.forEach((s) => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().split('T')[0];
    calendar[key] = (calendar[key] || 0) + 1;
  });

  res.json({
    stats: {
      totalSessions: sessions.length,
      totalQuestions,
      mostPracticedExam,
      bestScore,
    },
    scoreHistory,
    topicPerformance,
    weakTopics,
    insight,
    calendar,
  });
});
