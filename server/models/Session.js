import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      validate: (v) => Array.isArray(v) && v.length === 4,
      required: true,
    },
    correctAnswer: { type: String, required: true },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    selected: { type: String, default: null },
    correct: { type: Boolean, default: false },
  },
  { _id: false }
);

const explanationSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    examType: { type: String, enum: ['NTS', 'GAT', 'MDCAT', 'CSS/PMS'], required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    duration: { type: Number, required: true },
    questions: { type: [questionSchema], required: true },
    answers: { type: [answerSchema], default: [] },
    aiExplanations: { type: [explanationSchema], default: [] },
    score: { type: Number, default: 0 },
    accuracyScore: { type: Number, default: 0 },
    speedScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 },
    weakTopics: { type: [String], default: [] },
    date: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export default mongoose.model('Session', sessionSchema);
