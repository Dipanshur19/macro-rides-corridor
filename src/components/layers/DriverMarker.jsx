import { Marker } from 'react-leaflet';
import L from 'leaflet';

// Custom DivIcon avoids the well-known broken default-marker-image issue with
// bundlers, and gives us a clean "live driver" pulse.
const driverIcon = L.divIcon({
  className: '',
  html: '<div class="driver-icon">\u{1F697}</div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

export default function DriverMarker({ position }) {
  if (!position) return null;
  // position is [lng, lat] -> Leaflet wants [lat, lng]
  return <Marker position={[position[1], position[0]]} icon={driverIcon} />;
}
