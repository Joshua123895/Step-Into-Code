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
      <div className="mb-10 mt-10">
        <div className="flex items-center gap-12">
          <img
            src="/icons.svg"
            alt=""
            className="w-40 h-auto shrink-0"
            style={{ filter: "drop-shadow(2px 2px 0 #6AAE6F40)" }}
          />
          <div>
            <h1
              className="text-5xl font-black mb-3 leading-tight"
              style={{
                color: "var(--text)",
                fontFamily: "'Courier New', monospace",
                textShadow: "3px 3px 0 #6AAE6F40",
              }}
            >
              Step Into<br />
              <span style={{ color: "#6AAE6F" }}>Code</span>
            </h1>

            <p
              className="text-lg max-w-sm"
              style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}
            >
              Learn programming one step at a time.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <PixelButton onClick={() => navigate("/tracks")} size="lg" variant="primary">
          ▶  Begin Adventure
        </PixelButton>
      </div>

      <div
        className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden"
        style={{
          background: "var(--border)",
          border: "2px solid var(--border)",
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
            style={{ background: "var(--bg-card)" }}
          >
            <span className="text-2xl mb-1">{s.icon}</span>
            <span
              className="text-2xl font-black mb-0.5"
              style={{ color: s.color, fontFamily: "'Courier New', monospace" }}
            >
              {s.value}
            </span>
            <span className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs" style={{ color: "var(--text-muted)" }}>
        No account needed · Free to play
      </p>
    </div>
  );
}
