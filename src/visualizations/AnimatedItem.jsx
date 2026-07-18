import { useRef, useEffect } from "react";

export default function AnimatedItem({ children, className, style, animateIn = true, leaving = false }) {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
  }, []);

  const anim = leaving
    ? "viz-out 0.2s ease-in both"
    : animateIn
    ? "viz-in 0.25s ease-out both"
    : "none";

  return (
    <div
      className={className}
      style={{
        ...style,
        animation: anim,
      }}
    >
      {children}
    </div>
  );
}
