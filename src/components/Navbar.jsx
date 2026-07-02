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
    `block w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-500 hover:brightness-110 ${
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
          onClick={() => setMenuOpen(true)}
          className="md:hidden flex flex-col gap-1 p-2"
          style={{ color: "var(--nav-text)" }}
          aria-label="Open menu"
        >
          <span className="block w-5 h-0.5 rounded-full" style={{ background: "var(--nav-text)" }} />
          <span className="block w-5 h-0.5 rounded-full" style={{ background: "var(--nav-text)" }} />
          <span className="block w-5 h-0.5 rounded-full" style={{ background: "var(--nav-text)" }} />
        </button>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "var(--overlay)" }}
          onClick={closeMenu}
        />
      )}

      {/* Mobile aside drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: "var(--nav-bg)",
          borderLeft: "3px solid #6AAE6F",
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <span
            className="font-bold text-sm tracking-wide"
            style={{
              color: "var(--nav-text)",
              fontFamily: "'Courier New', monospace",
            }}
          >
            Menu
          </span>
          <button
            onClick={closeMenu}
            className="p-1 rounded-lg transition-colors duration-500 hover:brightness-110"
            style={{ color: "var(--nav-text)" }}
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 p-4">
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
            className="block w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-500 hover:brightness-110"
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
