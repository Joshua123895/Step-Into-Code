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
        <img
          src="/favicon.svg"
          alt="Step Into Code"
          className="w-8 h-8"
          style={{ borderRadius: 6 }}
        />
        <span
          className="font-bold text-lg tracking-wide"
          style={{ color: "#F7F3E9", fontFamily: "'Courier New', monospace" }}
        >
          Step Into Code
        </span>
      </button>

      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate("/tracks")}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-100 hover:brightness-110"
          style={{
            background: isActive("/tracks") ? "#6AAE6F20" : "transparent",
            color: isActive("/tracks") ? "#6AAE6F" : "#9CA3AF",
            fontFamily: "'Courier New', monospace",
            letterSpacing: "0.03em",
          }}
        >
          Tracks
        </button>
        <button
          onClick={() => navigate("/tracks/python")}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-100 hover:brightness-110"
          style={{
            background: isActive("/tracks/python") ? "#6AAE6F20" : "transparent",
            color: isActive("/tracks/python") ? "#6AAE6F" : "#9CA3AF",
            fontFamily: "'Courier New', monospace",
            letterSpacing: "0.03em",
          }}
        >
          Chapters
        </button>
      </div>
    </nav>
  );
}
