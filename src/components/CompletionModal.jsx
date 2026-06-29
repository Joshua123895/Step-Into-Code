import PixelButton from "./PixelButton";
import StarIcon from "./StarIcon";

export default function CompletionModal({ level, stars, onContinue }) {
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
        <div className="flex justify-center gap-2 mb-4" style={{ minHeight: 48 }}>
          {[1, 2, 3].map((s) => (
            <span key={s} className="text-3xl" style={{ animationDelay: `${s * 0.1}s` }}>
              <StarIcon filled={s <= stars} className="text-3xl" />
            </span>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-1"
          style={{ color: "#2F2F2F", fontFamily: "'Courier New', monospace" }}>
          Quest Complete!
        </h2>
        <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
          {level.name} completed!
        </p>

        <div
          className="rounded-xl p-4 mb-4"
          style={{ background: "#E9B44C15", border: "2px solid #E9B44C40" }}
        >
          <div className="text-3xl font-bold mb-1"
            style={{ color: "#E9B44C", fontFamily: "'Courier New', monospace" }}>
            {stars} / 3
          </div>
          <div className="text-xs" style={{ color: "#6B7280" }}>
            Stars Earned
          </div>
        </div>

        <PixelButton onClick={onContinue} size="lg">
          Continue →
        </PixelButton>
      </div>
    </div>
  );
}
