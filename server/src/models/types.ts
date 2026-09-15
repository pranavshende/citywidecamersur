export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  full_name: string;
  badge_number: string;
}

export interface EdgeNodeConfig {
  id: string;
  name: string;
  status: string;
  location_name: string;
  latitude: number;
  longitude: number;
  cpu_usage: number;
  gpu_usage: number;
  fps: number;
  metadata_sent_bytes: number;
  raw_video_sent_bytes: number;
}

export interface CameraConfig {
  id: string;
  edge_node_id: string;
  name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  status: string;
  fps: number;
}

export interface QueryParams {
  plate?: string;
  vehicle_color?: string;
  vehicle_type?: string;
}

export interface Detection {
  camera_id: string;
  edge_node_id: string;
  plate?: string;
  number_plate?: string;
  vehicle_type: string;
  vehicle_color: string;
  confidence: number;
  latitude: number;
  longitude: number;
  metadata_size_bytes: number;
  raw_video_bytes?: number;
  timestamp: string;
  is_target?: boolean;
  is_background?: boolean;
}

export interface TrajectoryPoint {
  order: number;
  camera_id: string;
  edge_node_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  confidence: number;
  vehicle_type: string;
  vehicle_color: string;
  number_plate: string;
  distance_from_prev_km?: number;
  time_from_prev_sec?: number;
  estimated_speed_kmh?: number;
}

export interface Trajectory {
  id: string;
  query_id: string;
  vehicle_plate: string;
  vehicle_color?: string;
  vehicle_type?: string;
  points: TrajectoryPoint[];
  total_detections: number;
  first_seen: string | null;
  last_seen: string | null;
  total_distance_km: number;
  status: string;
}

export interface SystemStatusSummary {
  total_nodes: number;
  online_nodes: number;
  total_cameras: number;
  online_cameras: number;
  total_metadata_bytes: number;
  total_raw_video_bytes: number;
  system_status: string;
}

export interface SystemStatus {
  edge_nodes: any[];
  summary: SystemStatusSummary;
}
