import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'aljebra-progress-v1';

export interface Progress {
  /** Set of zone ids the student has solved. */
  solved: string[];
  /** Map of zone id -> best mastery count (how many challenges solved). */
  stars: Record<string, number>;
  /** Whether the student has seen the welcome screen. */
  started: boolean;
}

const empty: Progress = { solved: [], stars: {}, started: false };

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Progress;
    return {
      solved: Array.isArray(parsed.solved) ? parsed.solved : [],
      stars: parsed.stars && typeof parsed.stars === 'object' ? parsed.stars : {},
      started: Boolean(parsed.started),
    };
  } catch {
    return empty;
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => load());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* ignore quota errors */
    }
  }, [progress]);

  const markSolved = useCallback((zoneId: string, starCount = 1) => {
    setProgress((prev) => {
      const solved = prev.solved.includes(zoneId) ? prev.solved : [...prev.solved, zoneId];
      const prevStars = prev.stars[zoneId] ?? 0;
      const stars = {
        ...prev.stars,
        [zoneId]: Math.max(prevStars, starCount),
      };
      return { ...prev, solved, stars };
    });
  }, []);

  const reset = useCallback(() => setProgress(empty), []);

  const markStarted = useCallback(() => {
    setProgress((prev) => (prev.started ? prev : { ...prev, started: true }));
  }, []);

  return { progress, markSolved, reset, markStarted };
}
