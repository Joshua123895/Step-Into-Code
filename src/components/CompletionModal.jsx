import PixelButton from "./PixelButton";
import Icon from "./Icon";

export default function CompletionModal({ level, onContinue }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onContinue}
      />
      <div
        className="relative rounded-2xl p-8 text-center max-w-sm w-full"
        style={{
          background: "#F7F3E9",
          border: "3px solid #6AAE6F",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div className="flex justify-center gap-2 mb-4">
          {["⭐", "⭐", "⭐"].map((s, i) => (
            <span key={i} className="text-3xl star-pop" style={{ animationDelay: `${i * 0.1}s` }}>
              {s}
            </span>
          ))}
        </div>

        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: "#2F2F2F", fontFamily: "'Courier New', monospace" }}
        >
          Quest Complete!
        </h2>
        <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
          {level.name} completed!
        </p>

        <div
          className="rounded-xl p-4 mb-4"
          style={{ background: "#6AAE6F15", border: "2px solid #6AAE6F30" }}
        >
          <div
            className="text-3xl font-bold mb-1"
            style={{ color: "#6AAE6F", fontFamily: "'Courier New', monospace" }}
          >
            +{level.xp} XP
          </div>
          <div className="text-xs" style={{ color: "#6B7280" }}>
            Experience Earned
          </div>
        </div>

        {level.badge && (
          <div
            className="rounded-xl p-4 mb-6"
            style={{ background: "#E9B44C15", border: "2px solid #E9B44C40" }}
          >
            <Icon src={level.badge.icon} alt={level.badge.name} size={40} />
            <div
              className="font-bold text-sm mt-2 mb-0.5"
              style={{ color: "#2F2F2F", fontFamily: "'Courier New', monospace" }}
            >
              Badge Unlocked
            </div>
            <div className="text-xs font-medium" style={{ color: "#E9B44C" }}>
              {level.badge.name}
            </div>
          </div>
        )}

        <PixelButton onClick={onContinue} size="lg">
          Continue →
        </PixelButton>
      </div>
    </div>
  );
}
