// Live metrics derived from the H3 spatial query.
export default function StatsPanel({ stats }) {
  const pct =
    stats.total > 0 ? Math.round((stats.eligible / stats.total) * 100) : 0;
  return (
    <div className="section">
      <h2>Live Eligibility</h2>
      <div className="stats">
        <div className="stat good">
          <div className="num">{stats.eligible}</div>
          <div className="lbl">Eligible pickups ({pct}%)</div>
        </div>
        <div className="stat">
          <div className="num">{stats.total}</div>
          <div className="lbl">Total pickups</div>
        </div>
        <div className="stat">
          <div className="num">{stats.cellCount}</div>
          <div className="lbl">H3 corridor cells</div>
        </div>
        <div className="stat">
          <div className="num">{stats.areaKm2.toFixed(2)}</div>
          <div className="lbl">Corridor area (km²)</div>
        </div>
      </div>
    </div>
  );
}
