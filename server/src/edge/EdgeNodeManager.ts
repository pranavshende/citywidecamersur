import { EdgeNode } from './EdgeNode';
import { SEED_EDGE_NODES, SEED_CAMERAS } from '../models/schema';
import { QueryParams } from '../models/types';

export class EdgeNodeManager {
  nodes: Map<string, EdgeNode>;

  constructor() {
    this.nodes = new Map();
  }

  initialize() {
    this.nodes.clear();
    
    // Create nodes
    for (const nodeConfig of SEED_EDGE_NODES) {
      const node = new EdgeNode(nodeConfig);
      this.nodes.set(node.config.id, node);
    }

    // Attach cameras
    for (const camConfig of SEED_CAMERAS) {
      const node = this.nodes.get(camConfig.edge_node_id);
      if (node) {
        node.addCamera(camConfig);
      }
    }

    // Start all nodes
    for (const node of this.nodes.values()) {
      node.start();
    }

    console.log(`[EdgeManager] Initialized ${this.nodes.size} edge nodes with ${SEED_CAMERAS.length} cameras.`);
  }

  getNode(id: string): EdgeNode | undefined {
    return this.nodes.get(id);
  }

  simulateNodeFailure(id: string): boolean {
    const node = this.getNode(id);
    if (node) {
      node.simulateFailure();
      return true;
    }
    return false;
  }

  simulateCameraFailure(cameraId: string): boolean {
    for (const node of this.nodes.values()) {
      if (node.simulateCameraFailure(cameraId)) {
        return true;
      }
    }
    return false;
  }

  restoreAll() {
    for (const node of this.nodes.values()) {
      node.start();
      for (const cam of node.cameras) {
        cam.setStatus('online');
      }
    }
  }

  reset() {
    this.initialize();
  }

  /**
   * Fan-out query to all online edge nodes
   */
  async distributeQuery(query: QueryParams) {
    const promises = [];
    const onlineNodes = [];
    let offlineNodes = 0;

    for (const node of this.nodes.values()) {
      if (node.isOnline()) {
        onlineNodes.push(node);
        // Process concurrently
        promises.push(node.processQuery(query));
      } else {
        offlineNodes++;
      }
    }

    // Wait for all edge nodes to finish processing
    const results = await Promise.all(promises);
    
    let allDetections: any[] = [];
    let totalMetadataBytes = 0;

    for (const res of results) {
      allDetections = allDetections.concat(res.detections);
      totalMetadataBytes += res.metadata_bytes;
    }

    return {
      all_detections: allDetections,
      total_metadata_bytes: totalMetadataBytes,
      online_nodes: onlineNodes.length,
      offline_nodes: offlineNodes
    };
  }

  getSystemStatus() {
    const edgeNodesStatus = Array.from(this.nodes.values()).map(n => n.getStatus());
    
    let totalNodes = edgeNodesStatus.length;
    let onlineNodes = edgeNodesStatus.filter(n => n.status === 'online').length;
    
    let totalCameras = 0;
    let onlineCameras = 0;
    let totalMetadataBytes = 0;

    for (const node of edgeNodesStatus) {
      totalCameras += node.cameras.length;
      onlineCameras += node.cameras.filter(c => c.status === 'online').length;
      totalMetadataBytes += node.metadata_sent_bytes;
    }

    let systemStatus = 'OPERATIONAL';
    if (onlineNodes === 0) systemStatus = 'OFFLINE';
    else if (onlineNodes < totalNodes || onlineCameras < totalCameras) systemStatus = 'DEGRADED';

    return {
      edge_nodes: edgeNodesStatus,
      summary: {
        total_nodes: totalNodes,
        online_nodes: onlineNodes,
        total_cameras: totalCameras,
        online_cameras: onlineCameras,
        total_metadata_bytes: totalMetadataBytes,
        total_raw_video_bytes: 0,
        system_status: systemStatus
      }
    };
  }

  // --- NEW: Continuous Background Traffic Generator ---
  private _trafficInterval: NodeJS.Timeout | null = null;

  startBackgroundTraffic(wss: any) {
    if (this._trafficInterval) return;
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const scenarios = require('./scenarios.json');

    console.log('[EdgeManager] Starting continuous background traffic generation...');
    
    this._trafficInterval = setInterval(async () => {
      // Pick a random online camera
      const onlineNodes = Array.from(this.nodes.values()).filter(n => n.isOnline());
      if (onlineNodes.length === 0) return;
      
      const node = onlineNodes[Math.floor(Math.random() * onlineNodes.length)];
      const onlineCams = node.cameras.filter(c => c.isOnline());
      if (onlineCams.length === 0) return;
      
      const cam = onlineCams[Math.floor(Math.random() * onlineCams.length)];
      const bgVehicle = scenarios.background_vehicles[Math.floor(Math.random() * scenarios.background_vehicles.length)];

      const metadataSize = 150 + Math.floor(Math.random() * 80);
      node.stats.metadata_sent_bytes += metadataSize;

      const detectionData = {
        camera_id: cam.id,
        edge_node_id: node.config.id,
        plate: bgVehicle.plate,
        vehicle_type: bgVehicle.type,
        vehicle_color: bgVehicle.color,
        confidence: 0.75 + Math.random() * 0.2,
        latitude: cam.lat,
        longitude: cam.lng,
        metadata_size_bytes: metadataSize,
        raw_video_bytes: 0,
        timestamp: new Date()
      };

      try {
        // Save to DB — use null for FK fields in case cameras aren't seeded yet
        // (seed happens on startup but may have a brief race window)
        const savedDetection = await prisma.detections.create({
          data: {
            ...detectionData,
            camera_id: null,
            edge_node_id: null
          }
        });
        
        // 10% chance to trigger an alert
        if (Math.random() > 0.9) {
          const alertTypes = [
            { type: 'Watchlist Vehicle Detected', severity: 'High' },
            { type: 'Stolen Vehicle Alert', severity: 'Critical' },
            { type: 'No Insurance', severity: 'Low' },
            { type: 'Suspicious Vehicle', severity: 'Medium' }
          ];
          const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
          
          const savedAlert = await prisma.alerts.create({
            data: {
              severity: alert.severity,
              alert_type: alert.type,
              plate: bgVehicle.plate,
              camera_id: null,
              edge_node_id: null,
              status: 'active'
            }
          });

          // Broadcast alert
          this.broadcast(wss, 'alert:new', {
            ...savedAlert,
            camera: { location_name: cam.name }
          });
        }

        // Broadcast detection
        this.broadcast(wss, 'detection:found', {
          ...detectionData,
          id: savedDetection.id,
          is_background: true
        });

      } catch (err: any) {
        // Silently skip transient DB errors (FK race, connection blip)
        // Don't spam logs — the seed handles this on next deploy
        if (err?.code !== 'P2003') {
          console.error('[Traffic] DB error:', err?.message || err);
        }
      }
    }, 2500); // Every 2.5 seconds
  }

  stopBackgroundTraffic() {
    if (this._trafficInterval) {
      clearInterval(this._trafficInterval);
      this._trafficInterval = null;
    }
  }

  broadcast(wss: any, event: string, data: any) {
    if (!wss || !wss.clients) return;
    const message = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
    wss.clients.forEach((client: any) => {
      if (client.readyState === 1) {
        try { client.send(message); } catch (e) {}
      }
    });
  }
}

// Singleton
let instance: EdgeNodeManager | null = null;
export function getEdgeNodeManager(): EdgeNodeManager {
  if (!instance) {
    instance = new EdgeNodeManager();
    instance.initialize();
  }
  return instance;
}
