import { MapContainer, TileLayer, CircleMarker, Polyline } from 'react-leaflet';
import { useStore } from '@/store/useStore';
import { MAP_CENTER, MAP_ZOOM, TILES } from '@/constants/config';
import { MAP_COLORS } from '@/constants/palette';
import { toLatLngs } from '@/utils/geometry';
import type { SpatialPipeline } from '@/hooks/useSpatialPipeline';

import MapController from './MapController';
import ZonesLayer from './layers/ZonesLayer';
import RouteLayer from './layers/RouteLayer';
import CorridorLayer from './layers/CorridorLayer';
import H3GridLayer from './layers/H3GridLayer';
import PickupLayer from './layers/PickupLayer';
import DriverMarker from './layers/DriverMarker';
import HeatmapLayer from './layers/HeatmapLayer';

export default function MapView({ pipeline }: { pipeline: SpatialPipeline }) {
  const theme = useStore((s) => s.theme);
  const drawing = useStore((s) => s.drawing);
  const draftPoints = useStore((s) => s.draftPoints);
  const tile = theme === 'dark' ? TILES.dark : TILES.light;

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      zoomControl
      preferCanvas
      className="h-full w-full"
    >
      <TileLayer key={theme} url={tile.url} attribution={TILES.attribution} />

      <MapController coords={pipeline.coords} />

      <HeatmapLayer />
      <ZonesLayer />
      <H3GridLayer hexes={pipeline.hexes} />
      <CorridorLayer bufferFeature={pipeline.bufferFeature} />
      <RouteLayer coords={pipeline.coords} />
      <PickupLayer pickups={pipeline.pickups} />
      <DriverMarker coords={pipeline.coords} />

      {drawing && draftPoints.length > 0 && (
        <>
          {draftPoints.length > 1 && (
            <Polyline
              positions={toLatLngs(draftPoints)}
              pathOptions={{ color: MAP_COLORS.route, weight: 3, dashArray: '6 6' }}
            />
          )}
          {draftPoints.map((c, i) => (
            <CircleMarker
              key={i}
              center={[c[1], c[0]]}
              radius={5}
              pathOptions={{ color: '#fff', weight: 2, fillColor: MAP_COLORS.route, fillOpacity: 1 }}
            />
          ))}
        </>
      )}
    </MapContainer>
  );
}
