import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const navLinks = [
    { path: "/tracks", label: "Tracks" },
    { path: "/tracks/python", label: "Chapters" },
  ];

  const linkClass = (path) =>
    `block w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-500 hover:brightness-110 ${
      isActive(path) ? "bg-[#6AAE6F20] text-[#6AAE6F]" : ""
    }`;

  const linkStyle = (path) => ({
    color: isActive(path) ? "#6AAE6F" : "var(--text-muted)",
    border: "1.5px solid var(--border)",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.03em",
  });

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav
        style={{
          background: "var(--nav-bg)",
          borderBottom: "3px solid #6AAE6F",
        }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between md:px-6 md:py-3 px-3 py-2"
      >
        <button
          onClick={() => {
            navigate("/");
            closeMenu();
          }}
          className="flex items-center gap-2 group"
        >
          <img
            src="/favicon.svg"
            alt="Step Into Code"
            className="w-7 h-7 md:w-8 md:h-8"
            style={{ borderRadius: 6 }}
          />
          <span
            className="font-bold text-sm md:text-lg tracking-wide"
            style={{
              color: "var(--nav-text)",
              fontFamily: "'Courier New', monospace",
            }}
          >
            Step Into Code
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ path, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-500 hover:brightness-110"
              style={{
                background: isActive(path) ? "#6AAE6F20" : "transparent",
                color: isActive(path) ? "#6AAE6F" : "var(--text-muted)",
                fontFamily: "'Courier New', monospace",
                letterSpacing: "0.03em",
                border: "1.5px solid var(--border)",
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={toggle}
            className="ml-2 px-3 py-2 text-sm rounded-lg transition-colors duration-500 hover:brightness-110"
            style={{
              background: "transparent",
              color: "var(--nav-text)",
              border: "1.5px solid var(--border)",
            }}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden relative w-11 h-11 flex items-center justify-center"
            style={{ color: "var(--nav-text)" }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
          <span
            className="absolute block w-5 h-0.5 rounded-full transition-all duration-300 ease-in-out"
            style={{
              background: "var(--nav-text)",
              transform: menuOpen ? "rotate(45deg)" : "translateY(-4px)",
            }}
          />
          <span
            className="absolute block w-5 h-0.5 rounded-full transition-all duration-300 ease-in-out"
            style={{
              background: "var(--nav-text)",
              opacity: menuOpen ? 0 : 1,
              transform: menuOpen ? "translateX(-10px)" : "translateY(0)",
            }}
          />
          <span
            className="absolute block w-5 h-0.5 rounded-full transition-all duration-300 ease-in-out"
            style={{
              background: "var(--nav-text)",
              transform: menuOpen ? "rotate(-45deg)" : "translateY(4px)",
            }}
          />
        </button>
      </nav>

      {/* Backdrop scrim — dims the page and closes the menu on outside tap */}
      <div
        className="md:hidden fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: "var(--overlay)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile aside — hidden off-screen right, slides left when open */}
      <aside
        className="fixed top-0 right-0 z-40 h-full w-64"
        style={{
          background: "var(--nav-bg)",
          borderLeft: "3px solid #6AAE6F",
          paddingTop: "3.5rem",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.5s ease-in-out",
        }}
      >
        <div className="flex flex-col gap-4 p-4">
          {navLinks.map(({ path, label }) => (
            <button
              key={path}
              onClick={() => {
                navigate(path);
                closeMenu();
              }}
              className={linkClass(path)}
              style={linkStyle(path)}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => {
              toggle();
              closeMenu();
            }}
            className="block w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-500 hover:brightness-110"
            style={{
              color: "var(--nav-text)",
              border: "1.5px solid var(--border)",
              fontFamily: "'Courier New', monospace",
              letterSpacing: "0.03em",
            }}
          >
            {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </aside>
    </>
  );
}
