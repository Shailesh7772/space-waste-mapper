// src/components/SatelliteMap.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icons not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const SatelliteMap = ({ satellites, liveData }) => {
  return (
    <div style={{ height: '500px', width: '100%', margin: '20px 0', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {satellites.map((sat) => {
          const live = liveData[sat._id];
          if (!live || !live.latitude || !live.longitude) return null;
          return (
            <Marker key={sat._id} position={[live.latitude, live.longitude]}>
              <Popup>
                <strong>{sat.name}</strong><br />
                Lat: {live.latitude.toFixed(2)}<br />
                Lon: {live.longitude.toFixed(2)}<br />
                Alt: {live.altitude_km?.toFixed(2)} km
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default SatelliteMap;
