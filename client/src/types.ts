export interface User {
  username: string;
  role: string;
  full_name: string;
  badge_number: string;
}

export interface CameraStatus {
  id: string;
  name: string;
  status: string;
  fps: number;
  lat: number;
  lng: number;
}

export interface EdgeNodeStatus {
  id: string;
  name: string;
  status: string;
  location_name: string;
  cpu_usage: number;
  gpu_usage: number;
  fps: number;
  metadata_sent_bytes: number;
  raw_video_sent_bytes: number;
  cameras: CameraStatus[];
  current_detection?: DetectionEvent;
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
  edge_nodes: EdgeNodeStatus[];
  summary: SystemStatusSummary;
}

export interface DetectionEvent {
  edge_node_id: string;
  camera_id: string;
  timestamp: string;
  number_plate: string;
  vehicle_type: string;
  vehicle_color: string;
  confidence: number;
  latitude: number;
  longitude: number;
  metadata_size_bytes: number;
  raw_video_bytes: number;
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

export interface CoordinatorStep {
  query_id?: string;
  step: string;
  status: 'complete' | 'in_progress' | 'pending';
  online_nodes?: number;
  total_nodes?: number;
  total_detections?: number;
  metadata_bytes?: number;
  raw_video_bytes?: number;
  valid?: number;
}

export interface DemoStep {
  step: number;
  total_steps: number;
  description: string;
  status: 'complete' | 'in_progress';
}
