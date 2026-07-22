// Progress state now lives in ProgressContext (so it can sync to Supabase and
// stay consistent across the app). This module keeps the original public
// surface so existing imports don't change: `useProgress` is re-exported, and
// the per-level saved-code helpers stay here as plain localStorage functions
// (work-in-progress code is intentionally kept device-local for now).
export { useProgress } from "../context/ProgressContext";

const CODE_KEY = "step-into-code_savedCode";

function loadCodes() {
  try {
    return JSON.parse(localStorage.getItem(CODE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCodes(data) {
  localStorage.setItem(CODE_KEY, JSON.stringify(data));
}

export function saveCode(trackSlug, levelId, code) {
  const all = loadCodes();
  if (!all[trackSlug]) all[trackSlug] = {};
  all[trackSlug][levelId] = code;
  saveCodes(all);
}

export function getSavedCode(trackSlug, levelId) {
  const all = loadCodes();
  return all[trackSlug]?.[levelId] || null;
}

export function clearSavedCode(trackSlug, levelId) {
  const all = loadCodes();
  if (all[trackSlug]) delete all[trackSlug][levelId];
  saveCodes(all);
}
