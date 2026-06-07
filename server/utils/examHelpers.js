export const durationToCount = (duration) => {
  return duration;
};

export const computeScores = (questions, answers, timeTaken, duration) => {
  let correct = 0;
  const explanations = [];
  questions.forEach((q, i) => {
    const a = answers[i];
    if (a && a.selected && a.selected.trim() === q.correctAnswer.trim()) {
      correct += 1;
    }
    explanations.push({
      questionIndex: i,
      explanation: q.explanation || '',
    });
  });
  const total = questions.length;
  const accuracy = total > 0 ? (correct / total) * 100 : 0;
  const expectedTime = duration * 60;
  const timeRatio = expectedTime > 0 ? Math.min(1, timeTaken / expectedTime) : 1;
  let speed = 100 - timeRatio * 100;
  if (correct === 0) speed = 0;
  if (timeTaken < 30) speed = Math.min(speed, 60);
  const clarity = total > 0 ? (correct / total) * 100 : 0;
  const overall = accuracy * 0.5 + speed * 0.2 + clarity * 0.3;
  return {
    score: correct,
    correctCount: correct,
    accuracyScore: Math.round(accuracy * 10) / 10,
    speedScore: Math.round(speed * 10) / 10,
    clarityScore: Math.round(clarity * 10) / 10,
    overallScore: Math.round(overall * 10) / 10,
    aiExplanations: explanations,
  };
};

export const updateStreak = (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = user.lastActive ? new Date(user.lastActive) : null;
  if (last) last.setHours(0, 0, 0, 0);
  if (!last) {
    user.streak = 1;
  } else {
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      user.streak = Math.max(1, user.streak || 1);
    } else if (diffDays === 1) {
      user.streak = (user.streak || 0) + 1;
    } else {
      user.streak = 1;
    }
  }
  user.lastActive = new Date();
  return user.save();
};
