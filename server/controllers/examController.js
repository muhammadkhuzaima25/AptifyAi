import asyncHandler from 'express-async-handler';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  generateQuestions,
  evaluateAnswers,
  detectWeakTopics,
} from '../utils/openai.js';
import {
  computeScores,
  updateStreak,
} from '../utils/examHelpers.js';

export const generateExam = asyncHandler(async (req, res) => {
  const { examType, topic, difficulty, duration } = req.body;
  if (!examType || !topic || !difficulty || !duration) {
    res.status(400);
    throw new Error('examType, topic, difficulty and duration are required');
  }
  const count = duration;
  const questions = await generateQuestions(examType, topic, difficulty, count);
  if (!Array.isArray(questions) || questions.length !== count) {
    console.warn(
      `[exam] Requested ${count} questions for ${examType}/${topic} (${difficulty}), got ${questions?.length ?? 0}`
    );
  }
  res.json({ count, questions: questions || [] });
});

export const submitExam = asyncHandler(async (req, res) => {
  const { examType, topic, difficulty, duration, questions, answers, timeTaken } = req.body;
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    res.status(400);
    throw new Error('Questions are required');
  }
  const baseScores = computeScores(questions, answers || [], timeTaken || 0, duration);
  let aiExplanations = baseScores.aiExplanations;
  let weakTopics = [];

  try {
    const evalResult = await evaluateAnswers(questions, (answers || []).map((a) => a.selected));
    if (evalResult?.evaluations?.length) {
      aiExplanations = evalResult.evaluations.map((e) => ({
        questionIndex: e.questionIndex,
        explanation: e.explanation,
      }));
    }
    if (evalResult?.weakTopics?.length) {
      weakTopics = evalResult.weakTopics;
    }
  } catch (err) {
    console.warn('AI evaluation step failed:', err.message);
  }

  if (weakTopics.length === 0) {
    const wrongCount = (answers || []).filter((a, i) => {
      const q = questions[i];
      return !(a && a.selected && a.selected.trim() === q.correctAnswer.trim());
    }).length;
    if (wrongCount > 0 && baseScores.accuracyScore < 60) {
      weakTopics = [topic];
    }
  }

  const session = await Session.create({
    userId: req.user._id,
    examType,
    topic,
    difficulty,
    duration,
    questions,
    answers: answers || [],
    aiExplanations,
    score: baseScores.correctCount,
    correctCount: baseScores.correctCount,
    accuracyScore: baseScores.accuracyScore,
    speedScore: baseScores.speedScore,
    clarityScore: baseScores.clarityScore,
    overallScore: baseScores.overallScore,
    totalQuestions: questions.length,
    timeTaken: timeTaken || 0,
    weakTopics,
  });

  await updateStreak(req.user);

  res.status(201).json({
    sessionId: session._id,
    ...baseScores,
    weakTopics,
    aiExplanations,
  });
});

export const getHistory = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ userId: req.user._id })
    .sort({ date: -1 })
    .lean();
  res.json(sessions);
});

export const getSessionById = asyncHandler(async (req, res) => {
  const session = await Session.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }
  res.json(session);
});
