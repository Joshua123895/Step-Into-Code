import { useNavigate } from "react-router-dom";
import { useProgress } from "../hooks/useProgress";
import ProgressBar from "./ProgressBar";
import PixelButton from "./PixelButton";
import Icon from "./Icon";

export default function TrackCard({ track }) {
  const navigate = useNavigate();
  const { getTrackProgress } = useProgress();

  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: "#fff",
        border: "2px solid #6AAE6F",
        boxShadow: "0 4px 24px #6AAE6F15",
      }}
    >
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
        style={{ background: "#6AAE6F" }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <Icon src={track.icon} alt={track.name} size={56} />
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: "#6AAE6F20", color: "#6AAE6F" }}
          >
            Track {track.id} of {track.id}
          </span>
        </div>
        <h3
          className="text-xl font-bold mb-1"
          style={{ color: "#2F2F2F", fontFamily: "'Courier New', monospace" }}
        >
          {track.name}
        </h3>
        <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
          {track.description}
        </p>
        <ProgressBar value={getTrackProgress(track.slug)} />
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="text-center">
              <div
                className="text-lg font-bold"
                style={{ color: "#6AAE6F", fontFamily: "'Courier New', monospace" }}
              >
                {track.chapters.length}
              </div>
              <div className="text-xs" style={{ color: "#9CA3AF" }}>
                Chapter{track.chapters.length > 1 ? "s" : ""}
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-lg font-bold"
                style={{ color: "#6AAE6F", fontFamily: "'Courier New', monospace" }}
              >
                {track.chapters.reduce((sum, ch) => sum + ch.levels.length, 0)}
              </div>
              <div className="text-xs" style={{ color: "#9CA3AF" }}>
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
