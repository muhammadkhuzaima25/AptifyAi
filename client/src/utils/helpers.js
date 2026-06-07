export const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const durationToCount = (duration) => {
  return duration;
};

export const EXAM_TOPICS = {
  NTS: ['Maths', 'English', 'Analytical', 'GK', 'IQ'],
  GAT: ['Verbal', 'Quantitative', 'Analytical'],
  MDCAT: ['Biology', 'Chemistry', 'Physics', 'English', 'Logical Reasoning'],
  'CSS/PMS': ['Current Affairs', 'English', 'General Knowledge', 'Pakistan Affairs'],
};
