import { useState, useRef, useCallback, useEffect } from "react";
import { playTick, playFail, playComplete } from "./vizSound";

export default function usePlayback() {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [total, setTotal] = useState(0);
  const totalRef = useRef(0);
  const failedRef = useRef(false);
  const lastSoundedStepRef = useRef(-1);

  // A step change (forward, backward, or from the play interval) plays a soft
  // tick; landing on the final frame plays "fail" or "complete" depending on
  // what configure() was told about this run's outcome (e.g. a search that
  // never found its target). Resetting to -1 (idle/replay) re-arms the ref so
  // the next run sounds again.
  useEffect(() => {
    if (step < 0) {
      lastSoundedStepRef.current = -1;
      return;
    }
    if (lastSoundedStepRef.current === step) return;
    lastSoundedStepRef.current = step;
    if (totalRef.current > 0 && step === totalRef.current - 1) {
      if (failedRef.current) playFail();
      else playComplete();
    } else {
      playTick();
    }
  }, [step]);

  // `options.failed`: pass true when this run's last state represents a
  // negative outcome (e.g. "Not found") so the finish sound reflects that
  // instead of always sounding like success. Defaults to false.
  const configure = useCallback((n, options = {}) => {
    totalRef.current = n;
    failedRef.current = !!options.failed;
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
