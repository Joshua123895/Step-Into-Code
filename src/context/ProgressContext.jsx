import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "step-into-code_progress";

// ---- localStorage (the offline / logged-out source of truth) ----------------

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const migrated = {};
    for (const slug of Object.keys(raw)) {
      if (Array.isArray(raw[slug])) {
        // Legacy shape: an array of completed ids, all treated as 3 stars.
        const map = {};
        for (const id of raw[slug]) map[id] = 3;
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

// ---- merge: keep the BEST result per level so nothing is ever downgraded -----
// Used both when reconciling cloud vs local on login and when a second device
// has independently made progress. Highest star count always wins.
function mergeProgress(a = {}, b = {}) {
  const out = {};
  for (const src of [a, b]) {
    for (const slug of Object.keys(src)) {
      out[slug] = out[slug] || {};
      for (const levelId of Object.keys(src[slug])) {
        const prev = out[slug][levelId] || 0;
        out[slug][levelId] = Math.max(prev, src[slug][levelId] || 0);
      }
    }
  }
  return out;
}

// ---- cloud (Supabase) -------------------------------------------------------

async function fetchCloud(userId) {
  const { data, error } = await supabase
    .from("progress")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.data ?? {};
}

async function pushCloud(userId, data) {
  const { error } = await supabase
    .from("progress")
    .upsert({ user_id: userId, data, updated_at: new Date().toISOString() });
  if (error) throw error;
}

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(load);

  const userId = user?.id ?? null;

  // On login: pull the cloud copy, merge it with whatever this device has
  // (promoting any local anonymous progress into the account), then push the
  // merged result back up so both sides converge.
  useEffect(() => {
    if (!userId || !supabase) return;
    let cancelled = false;
    (async () => {
      try {
        const cloud = await fetchCloud(userId);
        // localStorage is the authoritative local copy at login time.
        const merged = mergeProgress(cloud, load());
        if (cancelled) return;
        setProgress(merged);
        save(merged);
        await pushCloud(userId, merged);
      } catch {
        // Offline or misconfigured: stay on local progress, no crash.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const completeLevel = useCallback(
    (trackSlug, levelId, stars) => {
      setProgress((prev) => {
        const track = { ...(prev[trackSlug] || {}) };
        // Never downgrade a level the student already did better on.
        track[levelId] = Math.max(track[levelId] || 0, stars);
        const next = { ...prev, [trackSlug]: track };
        save(next);
        if (userId && supabase) pushCloud(userId, next).catch(() => {});
        return next;
      });
    },
    [userId],
  );

  const getStars = useCallback(
    (trackSlug, levelId) => (progress[trackSlug] || {})[levelId] || 0,
    [progress],
  );

  const getLevelStatus = useCallback(
    (trackSlug, levelId) => ((progress[trackSlug] || {})[levelId] ? "completed" : "unlocked"),
    [progress],
  );

  const getCompletedCount = useCallback(
    (trackSlug) => Object.keys(progress[trackSlug] || {}).length,
    [progress],
  );

  const getTotalStars = useCallback(
    (trackSlug) =>
      Object.values(progress[trackSlug] || {}).reduce((sum, s) => sum + s, 0),
    [progress],
  );

  const getTrackProgress = useCallback(
    (trackSlug, totalLevels) => {
      const done = Object.keys(progress[trackSlug] || {}).length;
      if (!totalLevels) return 0;
      return Math.round((done / totalLevels) * 100);
    },
    [progress],
  );

  const value = {
    progress,
    completeLevel,
    getStars,
    getLevelStatus,
    getCompletedCount,
    getTotalStars,
    getTrackProgress,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within a ProgressProvider");
  return ctx;
}
