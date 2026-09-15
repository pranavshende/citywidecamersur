import { v4 as uuidv4 } from 'uuid';
import { QueryParams, Detection, Trajectory, TrajectoryPoint } from '../models/types';

/**
 * Trajectory Service
 * Reconstructs vehicle movement path from multiple detection points.
 */

/**
 * Build a trajectory from a set of detections.
 * Sorts by timestamp, calculates distances and speeds.
 */
export function buildTrajectory(queryId: string, detections: Detection[], query: QueryParams): Trajectory {
  // Sort by timestamp
  const sorted = [...detections].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const points: TrajectoryPoint[] = sorted.map((det, index) => {
    const point: TrajectoryPoint = {
      order: index + 1,
      camera_id: det.camera_id,
      edge_node_id: det.edge_node_id,
      latitude: det.latitude,
      longitude: det.longitude,
      timestamp: det.timestamp,
      confidence: det.confidence,
      vehicle_type: det.vehicle_type,
      vehicle_color: det.vehicle_color,
      number_plate: det.number_plate || ''
    };

    // Calculate distance and speed from previous point
    if (index > 0) {
      const prevPoint = sorted[index - 1];
      const distance = haversineDistance(
        prevPoint.latitude, prevPoint.longitude,
        det.latitude, det.longitude
      );
      const timeDiff = (new Date(det.timestamp).getTime() - new Date(prevPoint.timestamp).getTime()) / 1000; // seconds
      const speedKmh = timeDiff > 0 ? (distance / timeDiff) * 3600 : 0;

      point.distance_from_prev_km = Math.round(distance * 1000) / 1000;
      point.time_from_prev_sec = Math.round(timeDiff);
      point.estimated_speed_kmh = Math.round(speedKmh * 10) / 10;
    }

    return point;
  });

  return {
    id: uuidv4(),
    query_id: queryId,
    vehicle_plate: query.plate || sorted[0]?.number_plate || 'UNKNOWN',
    vehicle_color: query.vehicle_color || sorted[0]?.vehicle_color,
    vehicle_type: query.vehicle_type || sorted[0]?.vehicle_type,
    points,
    total_detections: points.length,
    first_seen: sorted[0]?.timestamp || null,
    last_seen: sorted[sorted.length - 1]?.timestamp || null,
    total_distance_km: points.reduce((sum, p) => sum + (p.distance_from_prev_km || 0), 0),
    status: 'reconstructed'
  };
}

/**
 * Haversine formula to calculate distance between two lat/lng points.
 * Returns distance in kilometers.
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
