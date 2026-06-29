export default function StarIcon({ filled = false, className = "" }) {
  return (
    <span
      className={`star-container inline-flex items-center justify-center relative ${className}`}
      aria-hidden
    >
      <span className={`star-base ${filled ? "star-filled" : ""}`}>
        ★
      </span>
    </span>
  );
}
