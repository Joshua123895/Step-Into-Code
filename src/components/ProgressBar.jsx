export default function ProgressBar({ value, color = "#6AAE6F", height = 10, showLabel = true }) {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            Progress
          </span>
          <span className="text-xs font-bold" style={{ color }}>
            {value}%
          </span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, background: "var(--bar-track)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}
