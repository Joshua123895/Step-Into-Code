export default function ChallengeCard({ challenge, onClick }) {
  return (
    <button
      onClick={() => onClick(challenge)}
      className="relative w-full text-left p-5 rounded-xl transition-all duration-150 hover:-translate-y-1 cursor-pointer"
      style={{
        background: "linear-gradient(135deg, #fffbeb 0%, #fff8e0 100%)",
        border: "2px solid #F2C14E",
        boxShadow: "0 4px 20px #F2C14E30, 0 2px 0 #c99430",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: "#F2C14E20", border: "1.5px solid #F2C14E" }}
        >
          ⭐
        </div>
        <div className="flex-1">
          <div
            className="text-xs font-bold mb-0.5 uppercase tracking-wider"
            style={{ color: "#c99430" }}
          >
            Challenge
          </div>
          <div
            className="font-bold"
            style={{ color: "#2F2F2F", fontFamily: "'Courier New', monospace" }}
          >
            {challenge.name}
          </div>
          <div className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
            Optional
          </div>
        </div>
        <div
          className="text-xs font-bold px-3 py-1.5 rounded-lg"
          style={{ background: "#F2C14E", color: "#2F2F2F" }}
        >
          Try →
        </div>
      </div>
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, transparent 60%, #F2C14E08 100%)",
        }}
      />
    </button>
  );
}
