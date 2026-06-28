export default function PixelParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: [6, 8, 10, 12][i % 4],
    x: (i * 37 + 11) % 95,
    y: (i * 53 + 7) % 90,
    delay: (i * 0.4) % 4,
    duration: 3 + (i % 3),
    color: ["#6AAE6F", "#E9B44C", "#7AA2F7", "#67C587"][i % 4],
    opacity: 0.12 + (i % 3) * 0.06,
  }));

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
