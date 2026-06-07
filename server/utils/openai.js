import 'dotenv/config';

const apiKey = process.env.GROQ_API_KEY;
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const BASE_URL = (process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
const GROQ_URL = `${BASE_URL}/chat/completions`;

if (!apiKey || apiKey === 'Place_holder') {
  console.warn('⚠️  [AI] GROQ_API_KEY is missing in .env — AI features will use fallback responses.');
} else {
  const masked = apiKey.length > 8 ? `${apiKey.slice(0, 4)}…${apiKey.slice(-4)}` : '****';
  console.log(`🤖 [AI] Groq key loaded: ${masked}  (model: ${MODEL})`);
}

const extractJSON = (text) => {
  if (!text || typeof text !== 'string') return null;
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();

  const firstBracket = t.indexOf('[');
  const firstBrace = t.indexOf('{');
  const lastBracket = t.lastIndexOf(']');
  const lastBrace = t.lastIndexOf('}');

  const isArray =
    firstBracket !== -1 &&
    (firstBrace === -1 || firstBracket < firstBrace) &&
    lastBracket !== -1 &&
    lastBracket > firstBracket;
  const isObject =
    firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace;

  if (isArray && (!isObject || firstBracket <= firstBrace)) {
    return t.slice(firstBracket, lastBracket + 1);
  }
  if (isObject) {
    return t.slice(firstBrace, lastBrace + 1);
  }
  return null;
};

const safeParse = (text, { expect = 'any' } = {}) => {
  const cleaned = extractJSON(text);
  if (!cleaned) return null;
  const tryParse = (s) => {
    try {
      return JSON.parse(s);
    } catch {
      try {
        return JSON.parse(s.replace(/,\s*([}\]])/g, '$1'));
      } catch {
        return null;
      }
    }
  };
  const parsed = tryParse(cleaned);
  if (parsed == null || typeof parsed !== 'object') return null;
  if (expect === 'array') return Array.isArray(parsed) ? parsed : null;
  if (expect === 'object') return Array.isArray(parsed) ? null : parsed;
  return parsed;
};

const LETTER_PREFIX_RE = /^[A-D][\)\.\:\s]\s*/i;
const stripLetterPrefix = (s) => String(s ?? '').replace(LETTER_PREFIX_RE, '').trim();

const normalizeQuestions = (arr) => {
  if (!Array.isArray(arr)) return null;
  const cleaned = arr
    .map((q) => {
      if (!q || typeof q !== 'object') return null;
      const question = String(q.question || '').trim();
      const rawOptions = Array.isArray(q.options)
        ? q.options.slice(0, 4).map((o) => String(o ?? '').trim()).filter(Boolean)
        : [];
      const options = rawOptions.map(stripLetterPrefix).filter(Boolean);
      const rawCorrect = String(q.correctAnswer || '').trim();
      const explanation = String(q.explanation || '').trim();
      if (!question || options.length !== 4 || !rawCorrect) return null;

      let correctAnswer = rawCorrect;
      const letter = rawCorrect.toUpperCase().charAt(0);
      if (letter && 'ABCD'.includes(letter)) {
        const idx = 'ABCD'.indexOf(letter);
        if (idx >= 0 && idx < options.length) {
          correctAnswer = options[idx];
        }
      }
      const matched = options.find(
        (o) => o.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
      );
      return {
        question,
        options,
        correctAnswer: matched || correctAnswer,
        explanation,
      };
    })
    .filter(Boolean);

  const seen = new Set();
  const deduped = [];
  for (const q of cleaned) {
    const key = q.question.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(q);
    }
  }
  return deduped.length ? deduped : null;
};

const callModel = async (messages, { maxTokens = 8000, temperature = 1 } = {}) => {
  if (!apiKey || apiKey === 'Place_holder') {
    const err = new Error(
      'AI service is not configured. Set GROQ_API_KEY in server .env and restart the server.'
    );
    err.statusCode = 500;
    throw err;
  }
  console.log(`Calling Groq (${MODEL})...`);

  try {
    const resp = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: maxTokens,
        temperature,
        stream: false,
      }),
    });

    if (!resp.ok) {
      const errorBody = await resp.text().catch(() => '');
      const err = new Error(
        `Groq request failed (HTTP ${resp.status}): ${errorBody.slice(0, 240)}`
      );
      err.statusCode = resp.status;
      throw err;
    }

    const data = await resp.json();
    const choice = data?.choices?.[0];
    const content = String(choice?.message?.content ?? '').trim();

    if (!content) {
      const reason = choice?.finish_reason || 'unknown';
      const err = new Error(`Groq returned an empty response (finish_reason: ${reason})`);
      err.statusCode = 502;
      throw err;
    }

    return content;
  } catch (err) {
    if (err.statusCode) throw err;
    const wrapped = new Error(`Groq request failed: ${err?.message || 'Unknown error'}`);
    wrapped.statusCode = 502;
    wrapped.cause = err;
    throw wrapped;
  }
};

const isConfigured = () =>
  Boolean(apiKey) && apiKey !== 'Place_holder';

export const generateQuestions = async (examType, topic, difficulty, count) => {
  const safeCount = Math.max(1, Math.min(60, Math.floor(Number(count) || 1)));
  const uniqueToken = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const prompt = `Generate EXACTLY ${safeCount} unique MCQ questions. No more, no less.
Session: ${uniqueToken}
Exam: ${examType}
Topic: ${topic}
Difficulty: ${difficulty}

Strict rules:
- The output JSON array MUST contain EXACTLY ${safeCount} question objects
- Each question MUST have exactly 4 options
- Each option text MUST be unique and distinct
- NEVER repeat a question (even with minor rewording)
- NEVER use common textbook clichés like "powerhouse of the cell"
- Questions must be tricky and non-obvious
- Return ONLY raw JSON array, no markdown, no commentary

Output format (exactly ${safeCount} entries, plain text inside options — no letter prefixes):
[
  {
    "question": "...",
    "options": ["first option text", "second option text", "third option text", "fourth option text"],
    "correctAnswer": "A",
    "explanation": "..."
  }
]`;

  const systemPrompt = `You are a strict MCQ generator. Session ID: ${uniqueToken}. Always return exactly the number of questions requested. Never repeat questions. Never use common examples like "powerhouse of the cell". Always output plain text inside option fields (no "A. " or "B) " prefixes).`;

  try {
    const content = await callModel([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ]);

    let raw = content.trim();
    raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = safeParse(raw, { expect: 'array' });
    const normalized = normalizeQuestions(parsed);

    if (!normalized || normalized.length === 0) {
      throw new Error('AI returned invalid questions');
    }
    if (normalized.length < safeCount) {
      console.warn(
        `[AI] Requested ${safeCount} questions, got ${normalized.length} after dedup/normalize.`
      );
    }

    return normalized.slice(0, safeCount);
  } catch (err) {
    console.error('generateQuestions failed:', err.message);
    throw err;
  }
};

export const evaluateAnswers = async (questions, userAnswers) => {
  if (!isConfigured()) {
    return { evaluations: [], weakTopics: [], _reason: 'ai-not-configured' };
  }
  const compact = (questions || []).map((q, i) => ({
    i,
    q: q.question,
    options: q.options,
    correct: q.correctAnswer,
    user: userAnswers?.[i] ?? null,
  }));

  const systemPrompt =
    'You are a strict but fair exam evaluator for Pakistani aptitude tests (NTS/GAT/MDCAT/CSS-PMS). ' +
    'You always return STRICT, valid JSON only — no markdown fences, no commentary.';
  const userPrompt = `Evaluate the student's answers below. For each question decide if the selected option matches the correct option (compare the full text, case-insensitive, ignoring leading "A) "/"B) " etc.).
Return JSON only:
{
  "evaluations": [
    { "questionIndex": 0, "isCorrect": true|false, "explanation": "1–2 sentences: why the correct option is right" }
  ],
  "weakTopics": ["topic tag the student should drill, e.g. 'Algebra', 'Synonyms', 'Genetics'", ...]
}
DATA:
${JSON.stringify(compact)}`;

  try {
    const content = await callModel([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
    const parsed = safeParse(content, { expect: 'object' });
    if (parsed) return parsed;
    throw new Error('Invalid evaluation payload');
  } catch (err) {
    console.warn('[AI] evaluateAnswers failed:', err.message);
    return { evaluations: [], weakTopics: [] };
  }
};

export const detectWeakTopics = async (sessions) => {
  if (!sessions || sessions.length === 0) return [];
  if (!isConfigured()) {
    const counts = {};
    sessions.forEach((s) => {
      if (s.overallScore < 60) counts[s.topic] = (counts[s.topic] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t)
      .slice(0, 5);
  }
  const summary = sessions.slice(-15).map((s) => ({
    examType: s.examType,
    topic: s.topic,
    score: s.overallScore,
    accuracy: s.accuracyScore,
    wrong: (s.questions || []).length - (s.correctCount || 0),
  }));

  const systemPrompt =
    'You analyze Pakistani aptitude training data. Output STRICT JSON only — no markdown, no commentary.';
  const userPrompt = `Identify the user's weak topics (score < 60% OR low accuracy OR repeated mistakes). Return JSON only:
{ "weakTopics": ["topic1", "topic2", ...] }
Max 6 topics, ordered by severity.
DATA:
${JSON.stringify(summary)}`;

  try {
    const content = await callModel([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
    const parsed = safeParse(content, { expect: 'object' });
    if (parsed && Array.isArray(parsed.weakTopics)) return parsed.weakTopics;
    throw new Error('Invalid weakTopics payload');
  } catch (err) {
    console.warn('[AI] detectWeakTopics failed:', err.message);
    const counts = {};
    sessions.forEach((s) => {
      if (s.overallScore < 60) counts[s.topic] = (counts[s.topic] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t)
      .slice(0, 5);
  }
};

export const generateAIInsight = async (sessions) => {
  if (!sessions || sessions.length === 0) {
    return 'Take your first session to unlock personalized AI insights based on your performance arc.';
  }
  if (!isConfigured()) {
    const last = sessions[sessions.length - 1];
    return `Based on your last ${last.examType} session, focus on "${last.topic}" — your accuracy was ${Math.round(last.accuracyScore)}%. Keep your arc going!`;
  }
  const summary = sessions.slice(-10).map((s) => ({
    examType: s.examType,
    topic: s.topic,
    score: s.overallScore,
    accuracy: s.accuracyScore,
  }));

  const systemPrompt =
    'You give short, motivating study insights for Pakistani students. Output STRICT JSON only.';
  const userPrompt = `Based on the user's recent sessions, give ONE short actionable insight (max 22 words) they can apply in their next session.
Return JSON only: { "insight": "..." }
DATA:
${JSON.stringify(summary)}`;

  try {
    const content = await callModel([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
    const parsed = safeParse(content, { expect: 'object' });
    if (parsed && typeof parsed.insight === 'string') return parsed.insight;
    throw new Error('Invalid insight payload');
  } catch (err) {
    console.warn('[AI] generateAIInsight failed:', err.message);
    const last = sessions[sessions.length - 1];
    return `Based on your last ${last.examType} session, focus on "${last.topic}" — your accuracy was ${Math.round(last.accuracyScore)}%. Keep your arc going!`;
  }
};

export const isAIConfigured = isConfigured;
