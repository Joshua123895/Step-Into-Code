import { useParams, useNavigate } from "react-router-dom";
import { TRACKS } from "../data/tracks";
import { useProgress } from "../hooks/useProgress";
import Icon from "../components/Icon";
import ProgressBar from "../components/ProgressBar";
import LevelCard from "../components/LevelCard";

export default function ChapterPage() {
  const { trackName, chapterId } = useParams();
  const navigate = useNavigate();
  const { getLevelStatus, getStars, getTotalStars } = useProgress();

  const track = TRACKS.find((t) => t.slug === trackName);
  const chapter = track?.chapters.find((c) => c.id === Number(chapterId));

  if (!track || !chapter) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto relative z-10">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Chapter not found
        </h1>
        <button onClick={() => navigate(`/tracks/${trackName}`)} style={{ color: "#6AAE6F" }}>
          ← Back to chapters
        </button>
      </div>
    );
  }

  const completedCount = chapter.levels.filter(
    (l) => getLevelStatus(track.slug, l.id) === "completed"
  ).length;
  const progress = Math.round((completedCount / chapter.levels.length) * 100);
  const totalStars = getTotalStars(track.slug);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto relative z-10">
      <div className="mb-8">
        <button onClick={() => navigate(`/tracks/${trackName}`)}
          className="text-sm mb-4 flex items-center gap-1 hover:gap-2 transition-all"
          style={{ color: "var(--text-muted)" }}>
          ← {track.name}
        </button>

        <div className="flex items-center gap-4 mb-4">
          <Icon src={chapter.icon} alt={chapter.name} size={64} />
          <div>
            <div className="text-xs font-bold mb-0.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Chapter {chapter.id}
            </div>
            <h1 className="text-2xl font-black" style={{ color: "var(--text)", fontFamily: "'Courier New', monospace" }}>
              {chapter.name}
            </h1>
          </div>
        </div>

        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          Learn how programs store and remember information through small, satisfying coding puzzles.
        </p>

        <ProgressBar value={progress} />

        <div className="flex gap-4 mt-3">
          {[
            { label: "Completed", value: `${completedCount} / ${chapter.levels.length}`, color: "#67C587" },
            { label: "Stars", value: `${totalStars}`, color: "#E9B44C" },
          ].map((s) => (
            <div key={s.label}>
              <span className="text-sm font-black" style={{ color: s.color, fontFamily: "'Courier New', monospace" }}>
                {s.value}
              </span>
              <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Levels
        </h2>
        <div className="flex flex-col gap-2">
          {chapter.levels.map((level) => (
            <LevelCard
              key={level.id}
              level={{ ...level, status: getLevelStatus(track.slug, level.id) }}
              stars={getStars(track.slug, level.id)}
              onClick={() => navigate(`/tracks/${track.slug}/chapters/${chapter.id}/levels/${level.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
