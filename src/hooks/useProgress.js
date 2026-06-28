import { useState, useCallback } from "react";
import { TRACKS } from "../data/tracks";

const STORAGE_KEY = "step-into-code_progress";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useProgress() {
  const [progress, setProgress] = useState(load);

  const completeLevel = useCallback((trackSlug, levelId) => {
    setProgress((prev) => {
      const next = { ...prev };
      const done = [...(next[trackSlug] || [])];
      if (!done.includes(levelId)) {
        done.push(levelId);
        next[trackSlug] = done;
        save(next);
      }
      return next;
    });
  }, []);

  const getLevelStatus = useCallback(
    (trackSlug, levelId) => {
      const done = progress[trackSlug] || [];
      if (done.includes(levelId)) return "completed";
      if (levelId === 1) return "unlocked";
      if (done.includes(levelId - 1)) return "unlocked";
      return "locked";
    },
    [progress],
  );

  const getCompletedCount = useCallback(
    (trackSlug) => (progress[trackSlug] || []).length,
    [progress],
  );

  const getTrackProgress = useCallback(
    (trackSlug) => {
      const track = TRACKS.find((t) => t.slug === trackSlug);
      if (!track) return 0;
      const total = track.chapters.reduce((s, ch) => s + ch.levels.length, 0);
      if (total === 0) return 0;
      return Math.round((getCompletedCount(trackSlug) / total) * 100);
    },
    [getCompletedCount],
  );

  const getTotalXp = useCallback(
    (trackSlug) => {
      const track = TRACKS.find((t) => t.slug === trackSlug);
      if (!track) return 0;
      const done = progress[trackSlug] || [];
      let xp = 0;
      for (const ch of track.chapters) {
        for (const lv of ch.levels) {
          if (done.includes(lv.id)) xp += lv.xp || 0;
        }
      }
      return xp;
    },
    [progress],
  );

  const isBadgeEarned = useCallback(
    (trackSlug, badgeName) => {
      const track = TRACKS.find((t) => t.slug === trackSlug);
      if (!track) return false;
      const done = progress[trackSlug] || [];
      for (const ch of track.chapters) {
        for (const lv of ch.levels) {
          if (done.includes(lv.id) && lv.badge?.name === badgeName) return true;
        }
      }
      return false;
    },
    [progress],
  );

  return {
    progress,
    completeLevel,
    getLevelStatus,
    getCompletedCount,
    getTrackProgress,
    getTotalXp,
    isBadgeEarned,
  };
}
