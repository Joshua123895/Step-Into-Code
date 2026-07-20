export default function PixelButton({ children, onClick, variant = "primary", size = "md", disabled = false, className = "" }) {
  const variants = {
    primary: {
      bg: "#6AAE6F",
      shadow: "#4a8f4f",
      text: "#fff",
      hover: "#5a9e5f",
    },
    accent: {
      bg: "#E9B44C",
      shadow: "#c99430",
      text: "#2F2F2F",
      hover: "#d9a43c",
    },
    secondary: {
      bg: "#7AA2F7",
      shadow: "#5a82d7",
      text: "#fff",
      hover: "#6a92e7",
    },
    ghost: {
      bg: "transparent",
      shadow: "transparent",
      text: "#6AAE6F",
      border: "#6AAE6F",
    },
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const v = variants[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizes[size]} font-bold rounded-lg transition-all duration-100
        active:translate-y-0.5 select-none
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:brightness-110 active:shadow-none"}
        ${className}
      `}
      style={{
        background: disabled ? "var(--text-disabled)" : v.bg,
        color: v.text,
        boxShadow: disabled ? "none" : `0 3px 0 ${v.shadow || v.bg}`,
        border: v.border ? `2px solid ${v.border}` : "none",
        fontFamily: "'Courier New', monospace",
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </button>
  );
}
