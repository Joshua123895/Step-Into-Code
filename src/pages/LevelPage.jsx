import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TRACKS } from "../data/tracks";
import { useProgress } from "../hooks/useProgress";
import CompletionModal from "../components/CompletionModal";
import CodeEditorContainer from "../components/CodeEditorContainer";
import ProgressBar from "../components/ProgressBar";
import PixelButton from "../components/PixelButton";
import Badge from "../components/Badge";
import Icon from "../components/Icon";

export default function LevelPage() {
  const { trackName, chapterId, levelId } = useParams();
  const navigate = useNavigate();
  const { getLevelStatus, isBadgeEarned, completeLevel } = useProgress();

  const track = TRACKS.find((t) => t.slug === trackName);
  const chapter = track?.chapters.find((c) => c.id === Number(chapterId));
  const level = chapter?.levels.find((l) => l.id === Number(levelId));
  const status = level ? getLevelStatus(trackName, level.id) : null;

  const [code, setCode] = useState(level?.startingCode ?? "x = ");
  const [showModal, setShowModal] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleRun = () => {
    if (level && code.trim() === level.solution) {
      completeLevel(trackName, level.id);
      setShowModal(true);
    }
  };

  if (!track || !chapter || !level) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto relative z-10">
        <h1 className="text-2xl font-bold" style={{ color: "#2F2F2F" }}>
          Level not found
        </h1>
        <button onClick={() => navigate("/tracks")} style={{ color: "#6AAE6F" }}>
          ← Back to tracks
        </button>
      </div>
    );
  }

  if (status === "locked") {
    navigate(`/tracks/${trackName}/chapters/${chapterId}`);
    return null;
  }

  const completedCount = chapter.levels.filter(
    (l) => getLevelStatus(track.slug, l.id) === "completed"
  ).length;
  const progress = Math.round((completedCount / chapter.levels.length) * 100);
  const isCompleted = status === "completed";
  const badgesWithStatus = chapter.levels
    .filter((l) => l.badge)
    .map((l) => ({
      ...l.badge,
      earned: isBadgeEarned(track.slug, l.badge.name),
    }))
    .filter((b, i, arr) => arr.findIndex((x) => x.name === b.name) === i);

  return (
    <>
      {showModal && (
        <CompletionModal
          level={level}
          onContinue={() => {
            setShowModal(false);
            navigate(`/tracks/${trackName}/chapters/${chapterId}`);
          }}
        />
      )}

      <div key={levelId} className="h-screen pt-24 pb-8 px-4 relative z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(`/tracks/${trackName}/chapters/${chapterId}`)}
            className="text-sm mb-6 flex items-center gap-1 hover:gap-2 transition-all"
            style={{ color: "#9CA3AF" }}
          >
            ← {chapter.name}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
              <div
                className="rounded-2xl p-5 overflow-y-auto"
                style={{ background: "#fff", border: "2px solid #E5E7EB", maxHeight: "calc(100vh - 10rem)" }}
              >
                <div
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: "#9CA3AF" }}
                >
                  Level {level.id}
                </div>
                <h2
                  className="text-xl font-black mb-3"
                  style={{ color: "#2F2F2F", fontFamily: "'Courier New', monospace" }}
                >
                  {level.name}
                </h2>

                <div
                  className="rounded-xl p-4 mb-4"
                  style={{ background: "#6AAE6F10", border: "1.5px solid #6AAE6F30" }}
                >
                  <div
                    className="text-xs font-bold mb-2 uppercase tracking-wider"
                    style={{ color: "#6AAE6F" }}
                  >
                    🎯 Objective
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
                    {level.objective.map((seg, i) =>
                      seg.type === "code" ? (
                        <code
                          key={i}
                          className="px-1.5 py-0.5 rounded font-bold text-xs"
                          style={{ background: "#E5E7EB", color: "#7AA2F7" }}
                        >
                          {seg.value}
                        </code>
                      ) : (
                        <span key={i}>{seg.value}</span>
                      )
                    )}
                  </p>
                </div>

                {showHint ? (
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{ background: "#E9B44C10", border: "1.5px solid #E9B44C40" }}
                  >
                    <div
                      className="text-xs font-bold mb-2"
                      style={{ color: "#E9B44C" }}
                    >
                      💡 Hint
                    </div>
                    <p className="text-sm" style={{ color: "#374151" }}>
                      {level.hint.map((seg, i) =>
                        seg.type === "code" ? (
                          <code
                            key={i}
                            className="px-1 rounded"
                            style={{ background: "#E5E7EB", color: "#2F2F2F" }}
                          >
                            {seg.value}
                          </code>
                        ) : (
                          <span key={i}>{seg.value}</span>
                        )
                      )}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-col gap-2">
                  <PixelButton onClick={handleRun} size="md" variant="primary">
                    ▶ Run Code
                  </PixelButton>
                  <PixelButton
                    onClick={() => setShowHint(!showHint)}
                    size="md"
                    variant="accent"
                  >
                    {showHint ? "Hide Hint" : "💡 Hint"}
                  </PixelButton>
                  <PixelButton
                    onClick={() => navigate(`/tracks/${trackName}/chapters/${chapterId}`)}
                    size="md"
                    variant="ghost"
                    disabled={!isCompleted}
                  >
                    Next Level →
                  </PixelButton>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <CodeEditorContainer code={code} setCode={setCode} language={track.name.split(" ")[0]} />

              <p className="text-xs mt-2 text-center" style={{ color: "#D1D5DB" }}>
                Write your code above, then click Run Code to check your answer.
              </p>
            </div>

            <div className="lg:col-span-3">
              <div
                className="overflow-y-auto space-y-4"
                style={{ maxHeight: "calc(100vh - 10rem)" }}
              >
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "#fff", border: "2px solid #E5E7EB" }}
                >
                  <div
                    className="text-xs font-bold uppercase tracking-wider mb-3"
                    style={{ color: "#9CA3AF" }}
                  >
                    Chapter Progress
                  </div>
                  <ProgressBar value={progress} showLabel={false} />
                  <p className="text-xs mt-2" style={{ color: "#9CA3AF" }}>
                    {completedCount} of {chapter.levels.length} levels complete
                  </p>

                  <div
                    className="mt-4 pt-4"
                    style={{ borderTop: "1px solid #F3F4F6" }}
                  >
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-1"
                      style={{ color: "#9CA3AF" }}
                    >
                      Current Chapter
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon src={chapter.icon} alt={chapter.name} size={28} />
                      <span
                        className="text-sm font-bold"
                        style={{ color: "#2F2F2F", fontFamily: "'Courier New', monospace" }}
                      >
                        {chapter.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-5"
                  style={{ background: "#fff", border: "2px solid #E5E7EB" }}
                >
                  <div
                    className="text-xs font-bold uppercase tracking-wider mb-3"
                    style={{ color: "#9CA3AF" }}
                  >
                    Badges Earned
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {badgesWithStatus.map((b, i) => (
                      <Badge key={i} badge={b} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
