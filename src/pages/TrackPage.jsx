import { useNavigate } from "react-router-dom";
import TrackCard from "../components/TrackCard";
import { TRACKS } from "../data/tracks";

export default function TrackPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto relative z-10">
      <div className="mb-8">
        <button
          onClick={() => navigate("/")}
          className="text-sm mb-4 flex items-center gap-1 hover:gap-2 transition-all"
          style={{ color: "var(--text-muted)" }}
        >
          ← Back to Home
        </button>
        <h1
          className="text-3xl font-black mb-1"
          style={{ color: "var(--text)", fontFamily: "'Courier New', monospace" }}
        >
          Your Tracks
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Choose a learning path to continue.
        </p>
      </div>

      {TRACKS.map((track) => (
        <div key={track.id} className="mb-6">
          <TrackCard track={track} />
        </div>
      ))}

    </div>
  );
}
