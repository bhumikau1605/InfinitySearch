import dataset from '../data/knowledge.json';

const CACHE_KEY = 'infinitysearch-peer-cache-v1';
const USER_KNOWLEDGE_KEY = 'infinitysearch-user-knowledge-v1';

export function normalizeQuery(query = '') {
  return query.trim().toLowerCase();
}

export function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCache(entries) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
}

export function addToCache(result) {
  const current = loadCache();
  const exists = current.some((item) => item.id === result.id);
  if (exists) return current;
  const updated = [result, ...current].slice(0, 100);
  saveCache(updated);
  return updated;
}

export function loadUserKnowledge() {
  try {
    const raw = localStorage.getItem(USER_KNOWLEDGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserKnowledge(entries) {
  localStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(entries));
}

export function addUserKnowledgeEntry({ question, answer }) {
  const trimmedQuestion = question?.trim();
  const trimmedAnswer = answer?.trim();

  if (!trimmedQuestion || !trimmedAnswer) {
    throw new Error('Question and answer are required.');
  }

  const current = loadUserKnowledge();
  const normalizedQuestion = normalizeQuery(trimmedQuestion);

  const exists = current.some((item) => normalizeQuery(item.question) === normalizedQuestion);
  if (exists) {
    throw new Error('A user knowledge entry with this question already exists.');
  }

  const nextEntry = {
    id: `user-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    question: trimmedQuestion,
    answer: trimmedAnswer,
    createdAt: new Date().toISOString()
  };

  const updated = [nextEntry, ...current].slice(0, 300);
  saveUserKnowledge(updated);
  return nextEntry;
}

export function searchKnowledge(query, includeCache = true) {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];

  const userMatches = loadUserKnowledge()
    .filter((entry) => {
      const question = entry.question?.toLowerCase?.() ?? '';
      const answer = entry.answer?.toLowerCase?.() ?? '';
      return question.includes(normalized) || answer.includes(normalized);
    })
    .map((entry) => ({
      ...entry,
      source: 'user',
      label: 'User Result'
    }));

  const localMatches = dataset
    .filter((entry) => {
      const question = entry.question.toLowerCase();
      const answer = entry.answer.toLowerCase();
      return question.includes(normalized) || answer.includes(normalized);
    })
    .map((entry) => ({
      ...entry,
      source: 'local',
      label: 'Local Result'
    }));

  if (!includeCache) return [...userMatches, ...localMatches];

  const cachedMatches = loadCache()
    .filter((entry) => {
      const question = entry.question?.toLowerCase?.() ?? '';
      const answer = entry.answer?.toLowerCase?.() ?? '';
      return question.includes(normalized) || answer.includes(normalized);
    })
    .map((entry) => ({
      ...entry,
      source: 'cache',
      label: `From Peer${entry.sourcePeerId ? ` (${entry.sourcePeerId})` : ''}`
    }));

  const deduped = new Map();
  [...userMatches, ...localMatches, ...cachedMatches].forEach((entry) => {
    deduped.set(entry.id, entry);
  });

  return [...deduped.values()];
}

export function findAnswerForPeer(query) {
  return searchKnowledge(query).map((entry) => ({
    id: entry.id,
    question: entry.question,
    answer: entry.answer
  }));
}

export function createPeerCacheResult({ question, answer, sourcePeerId }) {
  return {
    id: `peer-${sourcePeerId ?? 'unknown'}-${question.toLowerCase().replace(/\s+/g, '-')}`,
    question,
    answer,
    sourcePeerId,
    createdAt: new Date().toISOString()
  };
}
