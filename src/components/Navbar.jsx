import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav
      style={{ background: "#2F2F2F", borderBottom: "3px solid #6AAE6F" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-3 flex items-center justify-between"
    >
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 group"
      >
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold"
          style={{ background: "#6AAE6F", color: "#fff" }}
        >
          SC
        </div>
        <span
          className="font-bold text-lg tracking-wide"
          style={{ color: "#F7F3E9", fontFamily: "'Courier New', monospace" }}
        >
          Step Into Code
        </span>
      </button>

      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate("/tracks")}
          className="text-sm font-medium transition-colors"
          style={{
            color: isActive("/tracks") ? "#6AAE6F" : "#B5B5B5",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Tracks
        </button>
        <button
          onClick={() => navigate("/tracks/python")}
          className="text-sm font-medium transition-colors"
          style={{
            color: isActive("/tracks/python") ? "#6AAE6F" : "#B5B5B5",
          }}
        >
          Chapters
        </button>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2"
          style={{
            background: "#6AAE6F20",
            borderColor: "#6AAE6F",
            color: "#6AAE6F",
          }}
        >
          A
        </div>
      </div>
    </nav>
  );
}
