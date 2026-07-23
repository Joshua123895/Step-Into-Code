// Progress state lives in ProgressContext (so it can sync to Supabase and stay
// consistent across the app); the per-level saved-code helpers live in
// lib/savedCode.js (now also cloud-synced). This module keeps the original
// public surface so existing imports don't change.
export { useProgress } from "../context/ProgressContext";
export { saveCode, getSavedCode, clearSavedCode } from "../lib/savedCode";
