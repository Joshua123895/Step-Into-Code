import { useNavigate } from "react-router-dom";
import { useProgress } from "../hooks/useProgress";
import { DIFFICULTY } from "../data/tracks";
import ProgressBar from "./ProgressBar";
import PixelButton from "./PixelButton";
import Icon from "./Icon";

export default function TrackCard({ track }) {
  const navigate = useNavigate();
  const { getTrackProgress } = useProgress();

  const diff = DIFFICULTY[track.difficulty] || DIFFICULTY[1];

  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: `2px solid ${diff.color}`,
        boxShadow: `0 4px 24px ${diff.color}15`,
      }}
    >
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
        style={{ background: diff.color }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <Icon src={track.trackIcon} alt={track.name} size={56} color={diff.color} />
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: diff.bg, color: diff.color }}
          >
            {diff.label}
          </span>
        </div>
        <h3
          className="text-xl font-bold mb-1"
          style={{ color: "var(--text)", fontFamily: "'Courier New', monospace" }}
        >
          {track.name}
        </h3>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          {track.description}
        </p>
        <ProgressBar value={getTrackProgress(track.slug, track.chapters.reduce((s, ch) => s + ch.levels.length, 0))} color={diff.color} />
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="text-center">
              <div
                className="text-lg font-bold"
                style={{ color: diff.color, fontFamily: "'Courier New', monospace" }}
              >
                {track.chapters.length}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                Chapter{track.chapters.length > 1 ? "s" : ""}
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-lg font-bold"
                style={{ color: diff.color, fontFamily: "'Courier New', monospace" }}
              >
                {track.chapters.reduce((sum, ch) => sum + ch.levels.length, 0)}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                Levels
              </div>
            </div>
          </div>
          <PixelButton onClick={() => navigate(`/tracks/${track.slug}`)} size="md">
            Continue →
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
