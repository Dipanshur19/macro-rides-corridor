import { Polyline } from 'react-leaflet';
import { toLatLngs } from '../../lib/geo.js';
import { COLORS } from '../../config/constants.js';

// The driver's full planned route. The traveled portion is drawn brighter on
// top of the dimmed full path so progress is visually obvious.
export default function RouteLayer({ routeCoords, traveledCoords }) {
  return (
    <>
      <Polyline
        positions={toLatLngs(routeCoords)}
        pathOptions={{ color: COLORS.route, weight: 4, opacity: 0.35 }}
      />
      {traveledCoords && traveledCoords.length > 1 && (
        <Polyline
          positions={toLatLngs(traveledCoords)}
          pathOptions={{ color: COLORS.route, weight: 5, opacity: 0.95 }}
        />
      )}
    </>
  );
}
