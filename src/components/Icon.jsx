import { useState } from "react";

export default function Icon({ src, alt, size = 40, className = "", color }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={`flex items-center justify-center font-bold shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          background: (color || "#6AAE6F") + "15",
          border: `2px solid ${color || "#6AAE6F"}30`,
          color: color || "#6AAE6F",
          fontFamily: "'Courier New', monospace",
          fontSize: size * 0.35,
        }}
      >
        {alt ? alt.charAt(0).toUpperCase() : "?"}
      </div>
    );
  }

  if (typeof src === "function") {
    const SvgComponent = src;
    return (
      <div className={`shrink-0 ${className}`} style={{ width: size, height: size, color }}>
        <SvgComponent width={size} height={size} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "cover",
      }}
    />
  );
}
