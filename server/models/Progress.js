import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, default: Date.now, index: true },
    overallScore: { type: Number, default: 0 },
    clarityScore: { type: Number, default: 0 },
    accuracyScore: { type: Number, default: 0 },
    speedScore: { type: Number, default: 0 },
    topicsAttempted: { type: [String], default: [] },
    topicsWeak: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Progress', progressSchema);
