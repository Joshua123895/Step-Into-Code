import { useNavigate } from "react-router-dom";
import { TRACKS } from "../data/tracks";
import { useProgress } from "../hooks/useProgress";
import PixelButton from "../components/PixelButton";

export default function HomePage() {
  const navigate = useNavigate();
  const { getTrackProgress } = useProgress();

  const track = TRACKS[0];
  const totalLevels = track ? track.chapters.reduce((s, ch) => s + ch.levels.length, 0) : 0;
  const progress = track ? getTrackProgress(track.slug, totalLevels) : 0;
  const totalChapters = track ? track.chapters.length : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10">
      <div className="text-center mb-10">
        <div
          className="inline-flex items-center gap-3 mb-4 px-5 py-2 rounded-full"
          style={{ background: "#6AAE6F20", border: "2px solid #6AAE6F40" }}
        >
          <span>🗺️</span>
          <span className="text-sm font-medium" style={{ color: "#6AAE6F" }}>
            v1.0 — Python Fundamentals
          </span>
        </div>

        <h1
          className="text-6xl font-black mb-3 leading-tight"
          style={{
            color: "#2F2F2F",
            fontFamily: "'Courier New', monospace",
            textShadow: "3px 3px 0 #6AAE6F40",
          }}
        >
          Step Into<br />
          <span style={{ color: "#6AAE6F" }}>Code</span>
        </h1>

        <p
          className="text-lg max-w-sm mx-auto"
          style={{ color: "#6B7280", lineHeight: 1.6 }}
        >
          Learn programming one step at a time.
        </p>
      </div>

      <div className="mb-12">
        <PixelButton onClick={() => navigate("/tracks")} size="lg" variant="primary">
          ▶  Begin Adventure
        </PixelButton>
      </div>

      <div
        className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden"
        style={{
          background: "#E5E7EB",
          border: "2px solid #E5E7EB",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          maxWidth: 420,
          width: "100%",
        }}
      >
        {[
          { label: "Track Progress", value: `${progress}%`, icon: "📈", color: "#6AAE6F" },
          { label: "Tracks", value: `${TRACKS.length}`, icon: "🗺️", color: "#7AA2F7" },
          { label: "Chapters", value: `${totalChapters}`, icon: "📖", color: "#E9B44C" },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center py-5 px-4"
            style={{ background: "#fff" }}
          >
            <span className="text-2xl mb-1">{s.icon}</span>
            <span
              className="text-2xl font-black mb-0.5"
              style={{ color: s.color, fontFamily: "'Courier New', monospace" }}
            >
              {s.value}
            </span>
            <span className="text-xs text-center" style={{ color: "#9CA3AF" }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs" style={{ color: "#C0BAB0" }}>
        No account needed · Free to play
      </p>
    </div>
  );
}
