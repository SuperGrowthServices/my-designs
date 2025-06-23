import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix marker icon issues with Webpack/Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const vendorLocations = [
  {
    name: 'Al Ain Auto Parts',
    lat: 25.1268,
    lng: 55.2123,
    address: 'Shop 15, Al Ain Mall, Sheikh Khalifa Street, Al Ain',
    parts: ['Front Bumper', 'Headlight'],
  },
  {
    name: 'Dubai Spare Parts Center',
    lat: 25.0205,
    lng: 55.1822,
    address: 'Unit 8, DIP, Dubai',
    parts: ['Grille'],
  },
];

export default function PickupMap() {
  useEffect(() => {
    // Force map to load properly on mount
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, []);

  return (
    <div style={{ height: '90vh', width: '100%' }}>
      <MapContainer center={[25.1, 55.2]} zoom={10} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {vendorLocations.map((vendor, idx) => (
          <Marker key={idx} position={[vendor.lat, vendor.lng]}>
            <Popup>
              <strong>{vendor.name}</strong><br />
              {vendor.address}<br />
              <em>Parts: {vendor.parts.join(', ')}</em>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
} 