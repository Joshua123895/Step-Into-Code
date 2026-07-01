import { useMemo } from "react";

export default function PixelParticles() {
  const count = 36;

  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  const particleColors = [
    "#6AAE6F",
    "#82bb8a",
    "#9DBEF2",
    "#DDBA73",
    "#BEA3D8",
  ];

  const particles = Array.from({ length: count }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);

    const cellWidth = 100 / cols;
    const cellHeight = 100 / rows;

    return {
      id: i,
// (-0.1 + Math.random() * 1.2)
      x:
        col * cellWidth +
        cellWidth * (0.1 + Math.random() * 0.8),

      y:
        row * cellHeight +
        cellHeight * (0.1 + Math.random() * 0.8),

      size: 6 + Math.random() * 8,

      delay: Math.random() * 4,

      duration: 4 + Math.random() * 3,

      color:
        particleColors[
          Math.floor(Math.random() * particleColors.length)
        ],

      opacity: 0.08 + Math.random() * 0.12,
    };
  });

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm pixel-float"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.color,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
