
import { randomUUID } from 'crypto';
import { EdgeNodeConfig, CameraConfig, User } from './types';

// SQL for creating tables in Supabase (run via SQL editor in Supabase dashboard)
export const SCHEMA_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (police officers)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'police_officer',
  full_name VARCHAR(255),
  badge_number VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Edge Nodes
CREATE TABLE IF NOT EXISTS edge_nodes (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'online',
  location_name VARCHAR(255),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  cpu_usage DECIMAL(5,2) DEFAULT 0,
  gpu_usage DECIMAL(5,2) DEFAULT 0,
  fps DECIMAL(5,2) DEFAULT 0,
  metadata_sent_bytes BIGINT DEFAULT 0,
  raw_video_sent_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cameras
CREATE TABLE IF NOT EXISTS cameras (
  id VARCHAR(20) PRIMARY KEY,
  edge_node_id VARCHAR(20) REFERENCES edge_nodes(id),
  name VARCHAR(100) NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  status VARCHAR(20) DEFAULT 'online',
  fps DECIMAL(5,2) DEFAULT 25,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search Queries
CREATE TABLE IF NOT EXISTS queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  plate VARCHAR(20),
  vehicle_color VARCHAR(50),
  vehicle_type VARCHAR(50),
  status VARCHAR(30) DEFAULT 'pending',
  result_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Detection Events
CREATE TABLE IF NOT EXISTS detections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_id UUID REFERENCES queries(id),
  camera_id VARCHAR(20) REFERENCES cameras(id),
  edge_node_id VARCHAR(20) REFERENCES edge_nodes(id),
  plate VARCHAR(20),
  vehicle_type VARCHAR(50),
  vehicle_color VARCHAR(50),
  confidence DECIMAL(5,3),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  metadata_size_bytes INT DEFAULT 0,
  raw_video_bytes INT DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trajectories
CREATE TABLE IF NOT EXISTS trajectories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_id UUID REFERENCES queries(id),
  vehicle_plate VARCHAR(20),
  points JSON NOT NULL,
  total_detections INT DEFAULT 0,
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  status VARCHAR(30) DEFAULT 'reconstructed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Logs
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level VARCHAR(20) NOT NULL,
  source VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  metadata JSON,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
`;

// Seed data — 3 Edge Nodes, 5 Cameras across Nagpur
export const SEED_EDGE_NODES: EdgeNodeConfig[] = [
  {
    id: 'EDGE-01',
    name: 'Edge Node 01',
    status: 'online',
    location_name: 'Sitabuldi Zone',
    latitude: 21.1470,
    longitude: 79.0850,
    cpu_usage: 42,
    gpu_usage: 51,
    fps: 28,
    metadata_sent_bytes: 0,
    raw_video_sent_bytes: 0
  },
  {
    id: 'EDGE-02',
    name: 'Edge Node 02',
    status: 'online',
    location_name: 'Dharampeth Zone',
    latitude: 21.1460,
    longitude: 79.0680,
    cpu_usage: 38,
    gpu_usage: 47,
    fps: 27,
    metadata_sent_bytes: 0,
    raw_video_sent_bytes: 0
  },
  {
    id: 'EDGE-03',
    name: 'Edge Node 03',
    status: 'online',
    location_name: 'Hingna Zone',
    latitude: 21.1300,
    longitude: 79.0500,
    cpu_usage: 35,
    gpu_usage: 44,
    fps: 29,
    metadata_sent_bytes: 0,
    raw_video_sent_bytes: 0
  },
  {
    id: 'EDGE-04',
    name: 'Edge Node 04',
    status: 'online',
    location_name: 'Sadar Zone',
    latitude: 21.1610,
    longitude: 79.0830,
    cpu_usage: 45,
    gpu_usage: 55,
    fps: 30,
    metadata_sent_bytes: 0,
    raw_video_sent_bytes: 0
  },
  {
    id: 'EDGE-05',
    name: 'Edge Node 05',
    status: 'online',
    location_name: 'Wardhaman Nagar Zone',
    latitude: 21.1450,
    longitude: 79.1150,
    cpu_usage: 30,
    gpu_usage: 40,
    fps: 25,
    metadata_sent_bytes: 0,
    raw_video_sent_bytes: 0
  },
  {
    id: 'EDGE-06',
    name: 'Edge Node 06',
    status: 'online',
    location_name: 'Manish Nagar Zone',
    latitude: 21.0950,
    longitude: 79.0600,
    cpu_usage: 50,
    gpu_usage: 60,
    fps: 28,
    metadata_sent_bytes: 0,
    raw_video_sent_bytes: 0
  },
  {
    id: 'EDGE-07',
    name: 'Edge Node 07',
    status: 'online',
    location_name: 'Mahal Zone',
    latitude: 21.1420,
    longitude: 79.1020,
    cpu_usage: 33,
    gpu_usage: 42,
    fps: 26,
    metadata_sent_bytes: 0,
    raw_video_sent_bytes: 0
  }
];

export const SEED_CAMERAS: CameraConfig[] = [
  {
    id: 'CAM-01',
    edge_node_id: 'EDGE-01',
    name: 'Camera 01',
    location_name: 'Sitabuldi Junction',
    latitude: 21.1458,
    longitude: 79.0882,
    status: 'online',
    fps: 25
  },
  {
    id: 'CAM-02',
    edge_node_id: 'EDGE-01',
    name: 'Camera 02',
    location_name: 'Variety Square',
    latitude: 21.1495,
    longitude: 79.0810,
    status: 'online',
    fps: 25
  },
  {
    id: 'CAM-03',
    edge_node_id: 'EDGE-02',
    name: 'Camera 03',
    location_name: 'Dharampeth Tower',
    latitude: 21.1520,
    longitude: 79.0720,
    status: 'online',
    fps: 25
  },
  {
    id: 'CAM-04',
    edge_node_id: 'EDGE-02',
    name: 'Camera 04',
    location_name: 'Law College Square',
    latitude: 21.1400,
    longitude: 79.0650,
    status: 'online',
    fps: 25
  },
  {
    id: 'CAM-05',
    edge_node_id: 'EDGE-03',
    name: 'Camera 05',
    location_name: 'Hingna T-Point',
    latitude: 21.1300,
    longitude: 79.0500,
    status: 'online',
    fps: 25
  },
  {
    id: 'CAM-06',
    edge_node_id: 'EDGE-04',
    name: 'Camera 06',
    location_name: 'Sadar Bazaar',
    latitude: 21.1610,
    longitude: 79.0830,
    status: 'online',
    fps: 25
  },
  {
    id: 'CAM-07',
    edge_node_id: 'EDGE-04',
    name: 'Camera 07',
    location_name: 'VCA Stadium',
    latitude: 21.1630,
    longitude: 79.0780,
    status: 'online',
    fps: 25
  },
  {
    id: 'CAM-08',
    edge_node_id: 'EDGE-05',
    name: 'Camera 08',
    location_name: 'Wardhaman Nagar Sq',
    latitude: 21.1450,
    longitude: 79.1150,
    status: 'online',
    fps: 25
  },
  {
    id: 'CAM-09',
    edge_node_id: 'EDGE-05',
    name: 'Camera 09',
    location_name: 'Garoba Maidan',
    latitude: 21.1480,
    longitude: 79.1100,
    status: 'online',
    fps: 25
  },
  {
    id: 'CAM-10',
    edge_node_id: 'EDGE-06',
    name: 'Camera 10',
    location_name: 'Manish Nagar T-Point',
    latitude: 21.0950,
    longitude: 79.0600,
    status: 'online',
    fps: 25
  },
  {
    id: 'CAM-11',
    edge_node_id: 'EDGE-06',
    name: 'Camera 11',
    location_name: 'Besa Square',
    latitude: 21.0900,
    longitude: 79.0700,
    status: 'online',
    fps: 25
  },
  {
    id: 'CAM-12',
    edge_node_id: 'EDGE-07',
    name: 'Camera 12',
    location_name: 'Gandhi Gate',
    latitude: 21.1420,
    longitude: 79.1020,
    status: 'online',
    fps: 25
  },
  {
    id: 'CAM-13',
    edge_node_id: 'EDGE-07',
    name: 'Camera 13',
    location_name: 'Kalyaneshwari Mandir',
    latitude: 21.1390,
    longitude: 79.1050,
    status: 'online',
    fps: 25
  },
  {
    id: 'CAM-14',
    edge_node_id: 'EDGE-05',
    name: 'Camera 14',
    location_name: 'Itwari Station',
    latitude: 21.1550,
    longitude: 79.1100,
    status: 'online',
    fps: 25
  },
  {
    id: 'CAM-15',
    edge_node_id: 'EDGE-04',
    name: 'Camera 15',
    location_name: 'Mankapur Stadium',
    latitude: 21.1750,
    longitude: 79.0750,
    status: 'online',
    fps: 25
  }
];

export const SEED_USERS: User[] = [
  {
    id: randomUUID(),
    username: 'officer1',
    password_hash: 'demo123', // Plain text for demo — NOT production
    role: 'police_officer',
    full_name: 'Inspector Sharma',
    badge_number: 'NP-4521'
  }
];

export async function seedDatabase(): Promise<void> {
  try {
    console.log('[Schema] Seeding database...');
    const { prisma } = await import('../config/db.js');

    // Seed edge nodes
    for (const node of SEED_EDGE_NODES) {
      await prisma.edge_nodes.upsert({
        where: { id: node.id },
        update: {},
        create: node as any
      });
    }

    // Seed cameras
    for (const cam of SEED_CAMERAS) {
      await prisma.cameras.upsert({
        where: { id: cam.id },
        update: {},
        create: cam as any
      });
    }

    // Seed users
    for (const user of SEED_USERS) {
      await prisma.users.upsert({
        where: { username: user.username },
        update: {},
        create: user as any
      });
    }

    console.log('[Schema] Database seeded successfully.');
    console.log(`[Schema]   ${SEED_EDGE_NODES.length} edge nodes`);
    console.log(`[Schema]   ${SEED_CAMERAS.length} cameras`);
    console.log(`[Schema]   ${SEED_USERS.length} users`);
  } catch (err: any) {
    console.error('[Schema] Seeding error:', err.message);
  }
}
