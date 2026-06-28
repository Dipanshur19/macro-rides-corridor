import { PRESET_ROUTES } from '../data/routes.js';
import { H3_RES_INFO } from '../config/constants.js';

function Toggle({ label, swatch, checked, onChange }) {
  return (
    <label className="toggle">
      <span>
        {swatch && <span className="swatch" style={{ background: swatch }} />}
        {label}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export default function ControlPanel({
  routeId,
  onRouteChange,
  resolution,
  onResolutionChange,
  bufferMeters,
  onBufferChange,
  corridorMode,
  onCorridorModeChange,
  lookAheadMeters,
  onLookAheadChange,
  sim,
  totalMeters,
  layers,
  onLayerChange,
  draw,
}) {
  const atEnd = sim.progressMeters >= totalMeters - 0.5;
  return (
    <>
      {/* ---- Route & simulation ---- */}
      <div className="section">
        <h2>Driver Route</h2>
        <div className="field">
          <select
            value={draw.isCustom ? 'custom' : routeId}
            onChange={(e) => onRouteChange(e.target.value)}
            disabled={draw.drawing}
          >
            {PRESET_ROUTES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
            {draw.isCustom && <option value="custom">Custom (drawn)</option>}
          </select>
        </div>

        {!draw.drawing ? (
          <div className="btn-row">
            <button onClick={draw.start}>✏️ Draw route</button>
          </div>
        ) : (
          <div className="btn-row">
            <button className="primary" onClick={draw.finish} disabled={!draw.canFinish}>
              ✓ Finish ({draw.count})
            </button>
            <button onClick={draw.cancel}>Cancel</button>
          </div>
        )}
        {draw.drawing && (
          <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '8px 0 0' }}>
            Click on the map to add waypoints. Need at least 2.
          </p>
        )}
      </div>

      {/* ---- Playback ---- */}
      <div className="section">
        <h2>Live Simulation</h2>
        <div className="btn-row" style={{ marginBottom: 14 }}>
          <button className="primary" onClick={sim.toggle} disabled={totalMeters < 1}>
            {sim.isPlaying ? '⏸ Pause' : atEnd ? '↻ Replay' : '▶ Play'}
          </button>
          <button onClick={sim.reset} disabled={totalMeters < 1}>
            ⏹ Reset
          </button>
        </div>
        <div className="field">
          <label>
            Position along route{' '}
            <b>
              {(sim.progressMeters / 1000).toFixed(2)} /{' '}
              {(totalMeters / 1000).toFixed(2)} km
            </b>
          </label>
          <input
            type="range"
            min={0}
            max={Math.max(1, totalMeters)}
            value={sim.progressMeters}
            onChange={(e) => sim.seek(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label>
            Driver speed <b>{sim.speedKmh} km/h</b>
          </label>
          <input
            type="range"
            min={10}
            max={80}
            step={5}
            value={sim.speedKmh}
            onChange={(e) => sim.setSpeedKmh(Number(e.target.value))}
          />
        </div>
      </div>

      {/* ---- Corridor params ---- */}
      <div className="section">
        <h2>Corridor Parameters</h2>
        <div className="field">
          <label>
            Buffer (corridor half-width) <b>{bufferMeters} m</b>
          </label>
          <input
            type="range"
            min={100}
            max={750}
            step={25}
            value={bufferMeters}
            onChange={(e) => onBufferChange(Number(e.target.value))}
          />
        </div>

        <div className="field">
          <label>H3 resolution <b>{H3_RES_INFO[resolution].label}</b></label>
          <input
            type="range"
            min={8}
            max={11}
            step={1}
            value={resolution}
            onChange={(e) => onResolutionChange(Number(e.target.value))}
          />
        </div>

        <div className="field">
          <label>Corridor mode</label>
          <div className="btn-row">
            <button
              className={corridorMode === 'ahead' ? 'active' : ''}
              onClick={() => onCorridorModeChange('ahead')}
            >
              Dynamic (look-ahead)
            </button>
            <button
              className={corridorMode === 'full' ? 'active' : ''}
              onClick={() => onCorridorModeChange('full')}
            >
              Whole route
            </button>
          </div>
        </div>

        {corridorMode === 'ahead' && (
          <div className="field">
            <label>
              Look-ahead window <b>{(lookAheadMeters / 1000).toFixed(1)} km</b>
            </label>
            <input
              type="range"
              min={300}
              max={3000}
              step={100}
              value={lookAheadMeters}
              onChange={(e) => onLookAheadChange(Number(e.target.value))}
            />
          </div>
        )}
      </div>

      {/* ---- Layers ---- */}
      <div className="section">
        <h2>Layers</h2>
        <Toggle label="350 m corridor buffer" swatch="#2dd4bf" checked={layers.corridor} onChange={(v) => onLayerChange('corridor', v)} />
        <Toggle label="H3 corridor cells" swatch="#2dd4bf" checked={layers.h3} onChange={(v) => onLayerChange('h3', v)} />
        <Toggle label="Service zones" swatch="#7c8cff" checked={layers.zones} onChange={(v) => onLayerChange('zones', v)} />
        <Toggle label="Show ineligible points" swatch="#6b7793" checked={layers.ineligible} onChange={(v) => onLayerChange('ineligible', v)} />
      </div>
    </>
  );
}
