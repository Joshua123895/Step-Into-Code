import { useParams, useNavigate } from "react-router-dom";
import { TRACKS } from "../data/tracks";
import { useProgress } from "../hooks/useProgress";
import Icon from "../components/Icon";
import ProgressBar from "../components/ProgressBar";
import PixelButton from "../components/PixelButton";

export default function ChaptersPage() {
  const { trackName } = useParams();
  const navigate = useNavigate();
  const { getStars } = useProgress();

  const track = TRACKS.find((t) => t.slug === trackName);

  if (!track) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto relative z-10">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Track not found
        </h1>
        <button onClick={() => navigate("/tracks")} style={{ color: "#6AAE6F" }}>
          ← Back to tracks
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto relative z-10">
      <button
        onClick={() => navigate("/tracks")}
        className="text-sm mb-6 flex items-center gap-1 hover:gap-2 transition-all"
        style={{ color: "var(--text-muted)" }}
      >
        ← All Tracks
      </button>

      <div className="flex items-center gap-4 mb-8">
        <Icon src={track.icon} alt={track.name} size={56} />
        <div>
          <h1
            className="text-3xl font-black"
            style={{ color: "var(--text)", fontFamily: "'Courier New', monospace" }}
          >
            {track.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {track.description}
          </p>
        </div>
      </div>

      <h2
        className="text-sm font-bold mb-4 uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        Chapters
      </h2>

      <div className="flex flex-col gap-4">
        {track.chapters.map((chapter, i) => {
          const done = chapter.levels.filter((l) => getStars(track.slug, l.id) > 0).length;
          const progress = chapter.levels.length > 0 ? Math.round((done / chapter.levels.length) * 100) : 0;

          return (
            <div
              key={chapter.id}
              className="rounded-2xl p-6 relative overflow-hidden cursor-pointer hover:-translate-y-0.5 transition-all"
              style={{
                background: "var(--bg-card)",
                border: "2px solid #6AAE6F",
                boxShadow: "0 4px 24px #6AAE6F15",
              }}
              onClick={() => navigate(`/tracks/${track.slug}/chapters/${chapter.id}`)}
            >
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
                style={{ background: "#6AAE6F" }}
              />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Icon src={chapter.icon} alt={chapter.name} size={56} />
                    <div>
                      <div
                        className="text-xs font-bold uppercase tracking-wider mb-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Chapter {i + 1}
                      </div>
                      <h3
                        className="text-xl font-bold"
                        style={{ color: "var(--text)", fontFamily: "'Courier New', monospace" }}
                      >
                        {chapter.name}
                      </h3>
                    </div>
                  </div>
                  <PixelButton onClick={() => navigate(`/tracks/${track.slug}/chapters/${chapter.id}`)} size="sm">
                    Start →
                  </PixelButton>
                </div>
                <ProgressBar value={progress} />
                <div className="mt-3 flex gap-4">
                  <div className="text-center">
                    <div
                      className="text-lg font-bold"
                      style={{ color: "#6AAE6F", fontFamily: "'Courier New', monospace" }}
                    >
                      {done} / {chapter.levels.length}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Levels Done
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
