import "./stats-card.css";

const COLOR_CLASS_MAP = {
  blue: "stats-card--blue",
  green: "stats-card--green",
  amber: "stats-card--amber",
  indigo: "stats-card--indigo",
};

export default function StatsCard({ title, value, icon, color }) {
  const colorClass = COLOR_CLASS_MAP[color] || COLOR_CLASS_MAP.blue;

  return (
    <div className={`stats-card ${colorClass}`}>
      <div className="stats-card__content">
        <div className="stats-card__title">{title}</div>
        <div className="stats-card__value">{value}</div>
      </div>

      <div className="stats-card__icon" aria-hidden="true">
        {icon}
      </div>
    </div>
  );
}
