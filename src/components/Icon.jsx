import { useState } from "react";

export default function Icon({ src, alt, size = 40, className = "" }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={`flex items-center justify-center font-bold shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          background: "#6AAE6F15",
          border: "2px solid #6AAE6F30",
          borderRadius: 12,
          color: "#6AAE6F",
          fontFamily: "'Courier New', monospace",
          fontSize: size * 0.35,
        }}
      >
        {alt ? alt.charAt(0).toUpperCase() : "?"}
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
        borderRadius: 12,
        objectFit: "cover",
      }}
    />
  );
}
