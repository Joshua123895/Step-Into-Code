import { useState, useRef, useCallback, useEffect } from "react";
import { playTick, playFail, playComplete } from "./vizSound";
import { classifyStepSounds } from "./vizStepSound";

export default function usePlayback() {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [total, setTotal] = useState(0);
  const totalRef = useRef(0);
  const soundKindsRef = useRef([]);
  const lastSoundedStepRef = useRef(-1);

  // A step change (forward, backward, or from the play interval) plays the
  // sound classified for that step: a soft tick for ordinary moves, "fail" for
  // deletions and negative outcomes, "complete" for finds and the final frame.
  // Resetting to -1 (idle/replay) re-arms the ref so the next run sounds again.
  useEffect(() => {
    if (step < 0) {
      lastSoundedStepRef.current = -1;
      return;
    }
    if (lastSoundedStepRef.current === step) return;
    lastSoundedStepRef.current = step;
    const kind = soundKindsRef.current[step] || "tick";
    if (kind === "fail") playFail();
    else if (kind === "complete") playComplete();
    else playTick();
  }, [step]);

  // Accepts the states array (preferred — lets each step get its own sound) or
  // a bare step count, in which case every step ticks and only the last one
  // resolves as "complete".
  const configure = useCallback((statesOrCount) => {
    const states = Array.isArray(statesOrCount) ? statesOrCount : null;
    const n = states ? states.length : statesOrCount;
    totalRef.current = n;
    soundKindsRef.current = states
      ? classifyStepSounds(states)
      : Array.from({ length: Math.max(n, 0) }, (_, i) => (i === n - 1 ? "complete" : "tick"));
    setTotal(n);
    setStep(-1);
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (totalRef.current <= 0) return;
    setStep((s) => (s >= totalRef.current - 1 ? -1 : s));
    setTimeout(() => setPlaying(true), 30);
  }, []);

  const pause = useCallback(() => setPlaying(false), []);

  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  const stepForward = useCallback(() => {
    setPlaying(false);
    setStep((s) => Math.min(s + 1, totalRef.current - 1));
  }, []);

  const stepBackward = useCallback(() => {
    setPlaying(false);
    setStep((s) => Math.max(s - 1, -1));
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    setStep(-1);
  }, []);

  useEffect(() => {
    if (!playing || totalRef.current <= 0) return;

    const id = setInterval(() => {
      setStep((prev) => {
        if (prev >= totalRef.current - 1) {
          setTimeout(() => setPlaying(false), 0);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(id);
  }, [playing]);

  return {
    step,
    playing,
    total,
    isFirst: step <= 0,
    isLast: step >= total - 1 || total === 0,
    hasSteps: total > 0,
    configure,
    play,
    pause,
    togglePlay,
    stepForward,
    stepBackward,
    reset,
  };
}
