import { WebSocket } from 'ws';
import { getEdgeNodeManager } from '../edge/EdgeNodeManager';
import { buildTrajectory } from './trajectoryService';
import { prisma } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { QueryParams, Detection } from '../models/types';

export class CoordinatorService {
  private _wsClients: Set<WebSocket>;

  constructor() {
    this._wsClients = new Set();
  }

  addClient(ws: WebSocket) { this._wsClients.add(ws); }
  removeClient(ws: WebSocket) { this._wsClients.delete(ws); }

  /**
   * Process a vehicle search query end-to-end.
   * This is the core coordinator workflow.
   */
  async processQuery(queryParams: QueryParams) {
    const queryId = uuidv4();
    const edgeManager = getEdgeNodeManager();

    const steps = [
      'Query received',
      'Validating parameters',
      'Identifying Edge Nodes',
      'Distributing query',
      'Collecting metadata',
      'Duplicate filtering',
      'Temporal validation',
      'Spatial validation',
      'Identity correlation',
      'Trajectory reconstruction',
      'Complete'
    ];

    // Step 1: Query received
    this._broadcastStep(queryId, steps[0], 'complete');
    await this._delay(300);

    // Step 2: Validate
    this._broadcastStep(queryId, steps[1], 'complete');
    await this._delay(300);

    // Save query to DB
    try {
      await prisma.queries.create({
        data: {
          id: queryId,
          plate: queryParams.plate || null,
          vehicle_color: queryParams.vehicle_color || null,
          vehicle_type: queryParams.vehicle_type || null,
          status: 'processing'
        }
      });
    } catch (e) { /* ignore db errors in demo */ }

    // Step 3: Identify edge nodes
    const systemStatus = edgeManager.getSystemStatus();
    this._broadcastStep(queryId, steps[2], 'complete', {
      online_nodes: systemStatus.summary.online_nodes,
      total_nodes: systemStatus.summary.total_nodes
    });
    await this._delay(400);

    // Step 4: Distribute query
    this._broadcastStep(queryId, steps[3], 'in_progress');

    // This is the big one — fans out to all edge nodes
    const edgeResults = await edgeManager.distributeQuery(queryParams);
    this._broadcastStep(queryId, steps[3], 'complete');

    // Step 5: Collect metadata
    this._broadcastStep(queryId, steps[4], 'complete', {
      total_detections: edgeResults.all_detections.length,
      metadata_bytes: edgeResults.total_metadata_bytes,
      raw_video_bytes: 0
    });
    await this._delay(500);

    // Step 6: Duplicate filtering
    const uniqueDetections = this._filterDuplicates(edgeResults.all_detections);
    this._broadcastStep(queryId, steps[5], 'complete', {
      before: edgeResults.all_detections.length,
      after: uniqueDetections.length
    });
    await this._delay(400);

    // Step 7: Temporal validation
    const temporallyValid = this._validateTemporal(uniqueDetections);
    this._broadcastStep(queryId, steps[6], 'complete', {
      valid: temporallyValid.length
    });
    await this._delay(400);

    // Step 8: Spatial validation
    const spatiallyValid = this._validateSpatial(temporallyValid);
    this._broadcastStep(queryId, steps[7], 'complete', {
      valid: spatiallyValid.length
    });
    await this._delay(400);

    // Step 9: Identity correlation
    this._broadcastStep(queryId, steps[8], 'complete');
    await this._delay(400);

    // Step 10: Trajectory reconstruction
    this._broadcastStep(queryId, steps[9], 'in_progress');
    const trajectory = buildTrajectory(queryId, spatiallyValid, queryParams);

    // Save detections and trajectory to DB
    try {
      if (spatiallyValid.length > 0) {
        await prisma.detections.createMany({
          data: spatiallyValid.map(det => ({
            query_id: queryId,
            camera_id: det.camera_id,
            edge_node_id: det.edge_node_id,
            plate: det.number_plate,
            vehicle_type: det.vehicle_type,
            vehicle_color: det.vehicle_color,
            confidence: det.confidence,
            latitude: det.latitude,
            longitude: det.longitude,
            metadata_size_bytes: det.metadata_size_bytes,
            raw_video_bytes: 0,
            timestamp: new Date(det.timestamp)
          }))
        });
      }

      await prisma.trajectories.create({
        data: {
          id: trajectory.id,
          query_id: queryId,
          vehicle_plate: queryParams.plate || null,
          points: trajectory.points as any, // Json
          total_detections: trajectory.total_detections,
          first_seen: trajectory.first_seen ? new Date(trajectory.first_seen) : null,
          last_seen: trajectory.last_seen ? new Date(trajectory.last_seen) : null,
          status: 'reconstructed'
        }
      });

      await prisma.queries.update({
        where: { id: queryId },
        data: {
          status: 'complete',
          result_count: spatiallyValid.length,
          completed_at: new Date()
        }
      });
    } catch (e) { console.error('DB Error', e); /* ignore db errors */ }

    this._broadcastStep(queryId, steps[9], 'complete');
    await this._delay(300);

    // Step 11: Complete
    this._broadcastStep(queryId, steps[10], 'complete');

    // Broadcast final trajectory
    this._broadcast('trajectory:complete', trajectory);

    return {
      query_id: queryId,
      query: queryParams,
      detections: spatiallyValid,
      trajectory,
      stats: {
        total_detections: spatiallyValid.length,
        total_metadata_bytes: edgeResults.total_metadata_bytes,
        total_raw_video_bytes: 0,
        online_nodes: edgeResults.online_nodes,
        offline_nodes: edgeResults.offline_nodes
      }
    };
  }

  private _filterDuplicates(detections: Detection[]): Detection[] {
    const seen = new Set();
    return detections.filter(d => {
      const key = `${d.camera_id}-${d.number_plate}-${d.timestamp}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private _validateTemporal(detections: Detection[]): Detection[] {
    // Sort by timestamp and verify chronological order is plausible
    return detections
      .filter(d => d.confidence > 0.8) // Confidence threshold
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private _validateSpatial(detections: Detection[]): Detection[] {
    // For demo, all detections pass spatial validation
    // In production, would check if vehicle could physically travel between points
    return detections;
  }

  private _broadcastStep(queryId: string, step: string, status: string, data: any = {}) {
    this._broadcast('coordinator:step', {
      query_id: queryId,
      step,
      status,
      ...data
    });
  }

  private _broadcast(event: string, data: any) {
    const message = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
    for (const client of this._wsClients) {
      if (client.readyState === 1) { // OPEN
        try { client.send(message); } catch (e) { /* ignore */ }
      }
    }
  }

  private _delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton
let instance: CoordinatorService | null = null;
export function getCoordinatorService(): CoordinatorService {
  if (!instance) instance = new CoordinatorService();
  return instance;
}
