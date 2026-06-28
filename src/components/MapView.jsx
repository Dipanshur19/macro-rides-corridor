import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
  CircleMarker,
} from 'react-leaflet';
import L from 'leaflet';
import {
  MAP_CENTER,
  MAP_ZOOM,
  TILE_URL,
  TILE_ATTRIBUTION,
} from '../config/constants.js';
import { toLatLngs } from '../lib/geo.js';

import ZonesLayer from './layers/ZonesLayer.jsx';
import RouteLayer from './layers/RouteLayer.jsx';
import CorridorLayer from './layers/CorridorLayer.jsx';
import H3CellsLayer from './layers/H3CellsLayer.jsx';
import PickupPointsLayer from './layers/PickupPointsLayer.jsx';
import DriverMarker from './layers/DriverMarker.jsx';

// Fit the map to the active route whenever it changes (but not while drawing).
function FitToRoute({ routeCoords, enabled }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || !routeCoords || routeCoords.length < 2) return;
    const bounds = L.latLngBounds(toLatLngs(routeCoords));
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [routeCoords, enabled, map]);
  return null;
}

// In draw mode, each click appends a waypoint to the custom route.
function DrawHandler({ drawing, onAddPoint }) {
  useMapEvents({
    click(e) {
      if (drawing) onAddPoint([e.latlng.lng, e.latlng.lat]);
    },
  });
  return null;
}

export default function MapView({
  routeCoords,
  traveledCoords,
  bufferFeature,
  hexes,
  pickups,
  zones,
  driverPosition,
  layerToggles,
  drawing,
  draftPoints,
  onAddPoint,
}) {
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      zoomControl={true}
      preferCanvas={true}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

      <FitToRoute routeCoords={routeCoords} enabled={!drawing} />
      <DrawHandler drawing={drawing} onAddPoint={onAddPoint} />

      <ZonesLayer zones={zones} visible={layerToggles.zones} />
      <H3CellsLayer hexes={hexes} visible={layerToggles.h3} />
      <CorridorLayer bufferFeature={bufferFeature} visible={layerToggles.corridor} />

      {routeCoords.length >= 2 && (
        <RouteLayer routeCoords={routeCoords} traveledCoords={traveledCoords} />
      )}

      <PickupPointsLayer
        points={pickups}
        showIneligible={layerToggles.ineligible}
      />
      <DriverMarker position={driverPosition} />

      {drawing &&
        draftPoints.map((c, i) => (
          <CircleMarker
            key={i}
            center={[c[1], c[0]]}
            radius={5}
            pathOptions={{ color: '#fff', weight: 2, fillColor: '#ff7a1a', fillOpacity: 1 }}
          />
        ))}
    </MapContainer>
  );
}
