import { useState, useRef, useCallback, useEffect } from "react";

export default function usePlayback() {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [total, setTotal] = useState(0);
  const totalRef = useRef(0);

  const configure = useCallback((n) => {
    totalRef.current = n;
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
