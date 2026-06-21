export interface PracticeSession {
  date: string;
  wpm: number;
  accuracy: number;
  duration: number;
  mode: string;
}

const STATS_KEY = "typeflow_stats";
const COMPLETED_KEY = "typeflow_completed_lessons";
const WEAK_KEYS_KEY = "typeflow_weak_keys";

export function getStats(): PracticeSession[] {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addStat(session: PracticeSession): void {
  const stats = getStats();
  stats.push(session);
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function getCompletedLessons(): number[] {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markLessonComplete(id: number): void {
  const completed = getCompletedLessons();
  if (!completed.includes(id)) {
    completed.push(id);
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
  }
}

export function getWeakKeys(): Record<string, number> {
  try {
    const raw = localStorage.getItem(WEAK_KEYS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function recordMistake(key: string): void {
  const weakKeys = getWeakKeys();
  weakKeys[key] = (weakKeys[key] || 0) + 1;
  localStorage.setItem(WEAK_KEYS_KEY, JSON.stringify(weakKeys));
}

export function getSummary() {
  const stats = getStats();
  if (stats.length === 0) {
    return { currentWpm: 0, bestWpm: 0, avgWpm: 0, accuracy: 0, totalMinutes: 0 };
  }
  const recent = stats[stats.length - 1];
  const best = Math.max(...stats.map((s) => s.wpm));
  const avg = Math.round(stats.reduce((a, b) => a + b.wpm, 0) / stats.length);
  const avgAcc = Math.round(stats.reduce((a, b) => a + b.accuracy, 0) / stats.length);
  const totalMinutes = Math.round(stats.reduce((a, b) => a + b.duration, 0) / 60);
  return { currentWpm: recent.wpm, bestWpm: best, avgWpm: avg, accuracy: avgAcc, totalMinutes };
}
