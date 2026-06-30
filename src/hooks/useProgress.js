import { useState, useCallback } from "react";

const STORAGE_KEY = "step-into-code_progress";

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const migrated = {};
    for (const slug of Object.keys(raw)) {
      if (Array.isArray(raw[slug])) {
        const map = {};
        for (const id of raw[slug]) {
          map[id] = 3;
        }
        migrated[slug] = map;
      } else {
        migrated[slug] = raw[slug] || {};
      }
    }
    return migrated;
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useProgress() {
  const [progress, setProgress] = useState(load);

  const completeLevel = useCallback((trackSlug, levelId, stars) => {
    setProgress((prev) => {
      const track = { ...(prev[trackSlug] || {}) };
      track[levelId] = stars;
      const next = { ...prev, [trackSlug]: track };
      save(next);
      return next;
    });
  }, []);

  const getStars = useCallback(
    (trackSlug, levelId) => {
      const track = progress[trackSlug] || {};
      return track[levelId] || 0;
    },
    [progress],
  );

  const getLevelStatus = useCallback(
    (trackSlug, levelId) => {
      const track = progress[trackSlug] || {};
      if (track[levelId]) return "completed";
      return "unlocked";
    },
    [progress],
  );

  const getCompletedCount = useCallback(
    (trackSlug) => Object.keys(progress[trackSlug] || {}).length,
    [progress],
  );

  const getTotalStars = useCallback(
    (trackSlug) => {
      const track = progress[trackSlug] || {};
      return Object.values(track).reduce((sum, s) => sum + s, 0);
    },
    [progress],
  );

  const getTrackProgress = useCallback(
    (trackSlug, totalLevels) => {
      const done = getCompletedCount(trackSlug);
      if (!totalLevels || totalLevels === 0) return 0;
      return Math.round((done / totalLevels) * 100);
    },
    [getCompletedCount],
  );

  return {
    progress,
    completeLevel,
    getStars,
    getLevelStatus,
    getCompletedCount,
    getTotalStars,
    getTrackProgress,
  };
}
