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
