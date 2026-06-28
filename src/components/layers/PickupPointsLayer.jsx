import { CircleMarker, Tooltip } from 'react-leaflet';
import { COLORS } from '../../config/constants.js';

// Pickup points coloured by H3-derived eligibility.
// Ineligible points can be hidden to declutter the "matched" view.
export default function PickupPointsLayer({ points, showIneligible }) {
  return (
    <>
      {points.map((p) => {
        if (!p.eligible && !showIneligible) return null;
        const color = p.eligible ? COLORS.eligible : COLORS.ineligible;
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={p.eligible ? 6 : 4}
            pathOptions={{
              color: '#0b1020',
              weight: 1,
              fillColor: color,
              fillOpacity: p.eligible ? 0.95 : 0.55,
            }}
          >
            <Tooltip direction="top" offset={[0, -4]}>
              <div style={{ lineHeight: 1.5 }}>
                <b>{p.name}</b>
                <br />
                Status:{' '}
                <b style={{ color: p.eligible ? '#0c8a4d' : '#888' }}>
                  {p.eligible ? 'ELIGIBLE' : 'outside corridor'}
                </b>
                <br />
                Distance to route: <b>{p.distanceMeters} m</b>
                <br />
                Zone: {p.zone ?? '—'}
                <br />
                <span style={{ fontSize: 10, opacity: 0.7 }}>H3: {p.cell}</span>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
