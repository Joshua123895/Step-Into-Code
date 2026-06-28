import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PixelParticles from "./components/PixelParticles";
import HomePage from "./pages/HomePage";
import TrackPage from "./pages/TrackPage";
import ChaptersPage from "./pages/ChaptersPage";
import ChapterPage from "./pages/ChapterPage";
import LevelPage from "./pages/LevelPage";

export default function App() {
  return (
    <>
      <style>{`
        @keyframes pixelFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(3deg); }
          66% { transform: translateY(-4px) rotate(-2deg); }
        }
        .pixel-float {
          animation: pixelFloat 3s ease-in-out infinite;
        }
        @keyframes starPop {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .star-pop {
          animation: starPop 0.4s ease-out both;
        }
        textarea { tab-size: 2; }
      `}</style>

      <div
        className="relative"
        style={{ background: "#F7F3E9", minHeight: "100vh" }}
      >
        <PixelParticles />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tracks" element={<TrackPage />} />
          <Route path="/tracks/:trackName" element={<ChaptersPage />} />
          <Route path="/tracks/:trackName/chapters/:chapterId" element={<ChapterPage />} />
          <Route path="/tracks/:trackName/chapters/:chapterId/levels/:levelId" element={<LevelPage />} />
        </Routes>
      </div>
    </>
  );
}
