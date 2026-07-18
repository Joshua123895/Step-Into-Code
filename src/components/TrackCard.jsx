import { useNavigate } from "react-router-dom";
import { useProgress } from "../hooks/useProgress";
import { DIFFICULTY } from "../data/tracks";
import { BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import ProgressBar from "./ProgressBar";
import PixelButton from "./PixelButton";
import Icon from "./Icon";

export default function TrackCard({ track }) {
  const navigate = useNavigate();
  const { getCompletedCount, getTrackProgress } = useProgress();

  const diff = DIFFICULTY[track.difficulty] || DIFFICULTY[1];
  const totalLevels = track.chapters.reduce((s, ch) => s + ch.levels.length, 0);
  const completedCount = getCompletedCount(track.slug);

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
      {completedCount === 0 && (
        <div className="absolute top-0 right-0 overflow-hidden pointer-events-none" style={{ width: 90, height: 90, zIndex: 5 }}>
          <div
            className="absolute text-[11px] font-bold text-center whitespace-nowrap"
            style={{
              width: 130,
              padding: "4px 0",
              background: "#E9B44C",
              color: "#1e1e1e",
              transform: "rotate(45deg)",
              top: 16,
              right: -28,
              letterSpacing: "0.5px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            NEW
          </div>
        </div>
      )}
      <div className="relative">
        <div className="flex mb-4">
          <Icon src={track.trackIcon} alt={track.name} size={56} color={diff.color} className="shrink-0 mt-1 mr-6" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className="text-xl font-bold truncate"
                style={{ color: "var(--text)", fontFamily: "'Courier New', monospace" }}
              >
                {track.name}
              </h3>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full shrink-0"
                style={{ background: diff.bg, color: diff.color }}
              >
                {diff.label}
              </span>
            </div>
            <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
              {track.description}
            </p>
          </div>
        </div>
        <ProgressBar value={getTrackProgress(track.slug, totalLevels)} color={diff.color} />
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
            <div className="flex items-center gap-1.5">
              <BookOpen size={16} style={{ color: diff.color }} />
              <span
                className="font-bold"
                style={{ color: diff.color, fontFamily: "'Courier New', monospace" }}
              >
                {track.chapters.length}
              </span>
            </div>
            <span className="text-lg leading-none" style={{ color: "var(--text-muted)" }}>·</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={16} style={{ color: diff.color }} />
              <span
                className="font-bold"
                style={{ color: diff.color, fontFamily: "'Courier New', monospace" }}
              >
                {completedCount}/{totalLevels}
              </span>
            </div>
          </div>
          <PixelButton onClick={() => navigate(`/tracks/${track.slug}`)} size="md">
            Continue <ArrowRight size={16} className="inline ml-1" />
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
