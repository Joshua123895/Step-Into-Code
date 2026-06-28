import Icon from "./Icon";

export default function Badge({ badge }) {
  return (
    <div
      className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all"
      style={{
        background: badge.earned ? "#fff" : "#F5F5F5",
        border: badge.earned ? "2px solid #E9B44C" : "2px solid #E0E0E0",
        opacity: badge.earned ? 1 : 0.5,
        boxShadow: badge.earned ? "0 2px 12px #E9B44C20" : "none",
        minWidth: 72,
      }}
    >
      {badge.earned ? (
        <Icon src={badge.icon} alt={badge.name} size={32} />
      ) : (
        <span className="text-2xl">🔒</span>
      )}
      <span
        className="text-xs text-center font-medium leading-tight"
        style={{ color: badge.earned ? "#2F2F2F" : "#B5B5B5" }}
      >
        {badge.name}
      </span>
    </div>
  );
}
