import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

// Camera icon
const cameraIcon = (status?: string) => L.divIcon({
  className: '',
  html: `<div style="
    width: 28px; height: 28px; border-radius: 50%;
    background: ${status === 'offline' ? '#ef4444' : '#0f1a36'};
    border: 2px solid ${status === 'offline' ? '#ef4444' : '#3b82f6'};
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: ${status === 'offline' ? '#fff' : '#3b82f6'};
    box-shadow: 0 0 12px ${status === 'offline' ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.3)'};
  ">📷</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Detection point icon
const detectionIcon = (index: number, isStart: boolean, isEnd: boolean) => {
  let bg = 'linear-gradient(135deg, #3b82f6, #2563eb)'; // Blue (Intermediate)
  let border = '#60a5fa';
  let shadow = 'rgba(59, 130, 246, 0.5)';
  
  if (isStart) {
    bg = 'linear-gradient(135deg, #ef4444, #dc2626)'; // Red (Start)
    border = '#f87171';
    shadow = 'rgba(239, 68, 68, 0.5)';
  } else if (isEnd) {
    bg = 'linear-gradient(135deg, #10b981, #059669)'; // Green (End)
    border = '#34d399';
    shadow = 'rgba(16, 185, 129, 0.5)';
  }

  return L.divIcon({
    className: '',
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: ${bg};
      border: 2px solid ${border};
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 800; color: white;
      box-shadow: 0 0 12px ${shadow};
    ">${index + 1}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

import { Trajectory, SystemStatus, TrajectoryPoint } from '../types';

// Animate trajectory rendering
function TrajectoryAnimator({ trajectory }: { trajectory: Trajectory | null }) {
  const map = useMap();
  const [visiblePoints, setVisiblePoints] = useState<TrajectoryPoint[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trajectory?.points?.length) {
      setVisiblePoints([]);
      return;
    }

    setVisiblePoints([]);
    let index = 0;

    timerRef.current = window.setInterval(() => {
      if (index < trajectory.points.length) {
        setVisiblePoints(prev => [...prev, trajectory.points[index]]);
        index++;
      } else {
        if (timerRef.current) window.clearInterval(timerRef.current);
      }
    }, 1200);

    // Fit bounds to show all camera positions
    if (trajectory.points.length > 0) {
      const bounds = trajectory.points.map(p => [p.latitude, p.longitude] as [number, number]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [trajectory, map]);

  if (visiblePoints.length === 0) return null;

  const pathCoords = visiblePoints.map(p => [p.latitude, p.longitude] as [number, number]);

  return (
    <>
      {/* Route line */}
      <Polyline
        positions={pathCoords}
        color="#10b981"
        weight={3}
        opacity={0.8}
        dashArray="8 4"
      />

      {/* Detection points */}
      {visiblePoints.map((point, index) => {
        const isStart = index === 0;
        const isEnd = index === visiblePoints.length - 1;
        
        return (
          <Marker
            key={`det-${index}`}
            position={[point.latitude, point.longitude]}
            icon={detectionIcon(index, isStart, isEnd)}
          >
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, minWidth: 180 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{point.camera_id}</div>
              <div style={{ color: '#666', fontSize: 12 }}>
                {new Date(point.timestamp).toLocaleTimeString()}
              </div>
              <div style={{ marginTop: 6, fontSize: 12 }}>
                <span style={{ fontWeight: 600 }}>{point.number_plate}</span><br/>
                {point.vehicle_color} {point.vehicle_type}<br/>
                Confidence: {(point.confidence * 100).toFixed(1)}%
              </div>
              {point.estimated_speed_kmh && (
                <div style={{ marginTop: 4, fontSize: 11, color: '#888' }}>
                  Est. speed: {point.estimated_speed_kmh} km/h
                </div>
              )}
            </div>
          </Popup>
        </Marker>
        );
      })}
    </>
  );
}

interface MapViewProps {
  trajectory: Trajectory | null;
  systemStatus: SystemStatus | null;
}

export default function MapView({ trajectory, systemStatus }: MapViewProps) {
  // Extract all cameras dynamically from the real system status
  const cameras = systemStatus?.edge_nodes?.flatMap(n => n.cameras) || [];

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
      <div className="card-header" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-card)' }}>
        <span className="card-title">🗺️ Live Map — Nagpur City</span>
        {trajectory && (
          <span className="badge badge-green">TRAJECTORY ACTIVE</span>
        )}
      </div>
      <div style={{ height: 'calc(100% - 44px)' }}>
        <MapContainer
          center={[21.1450, 79.0700]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            className="dark-map-tiles"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Camera markers dynamically rendered from backend state */}
          {cameras.map(cam => (
            <Marker
              key={cam.id}
              position={[cam.lat, cam.lng]}
              icon={cameraIcon(cam.status)}
            >
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                    <div style={{ fontWeight: 700 }}>{cam.id}</div>
                    <div style={{ color: '#666' }}>{cam.name}</div>
                    <div style={{
                      marginTop: 4,
                      color: cam.status === 'offline' ? '#ef4444' : '#10b981',
                      fontWeight: 600, fontSize: 12
                    }}>
                      ● {(cam.status || 'online').toUpperCase()}
                    </div>
                  </div>
                </Popup>
              </Marker>
          ))}

          {/* Animated trajectory */}
          <TrajectoryAnimator trajectory={trajectory} />
        </MapContainer>
      </div>
    </div>
  );
}
