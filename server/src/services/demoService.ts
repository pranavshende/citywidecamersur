import { WebSocket } from 'ws';
import { getEdgeNodeManager } from '../edge/EdgeNodeManager';
import { getCoordinatorService } from './coordinatorService';
import scenarios from '../edge/scenarios.json';

export class DemoService {
  private _wsClients: Set<WebSocket>;
  private _isRunning: boolean;
  private _currentStep: number;
  private _totalSteps: number;

  constructor() {
    this._wsClients = new Set();
    this._isRunning = false;
    this._currentStep = 0;
    this._totalSteps = 14;
  }

  addClient(ws: WebSocket) { this._wsClients.add(ws); }
  removeClient(ws: WebSocket) { this._wsClients.delete(ws); }

  isRunning() { return this._isRunning; }

  /**
   * Run the complete demo sequence.
   */
  async startDemo() {
    if (this._isRunning) {
      throw new Error('Demo is already running');
    }

    this._isRunning = true;
    this._currentStep = 0;
    const edgeManager = getEdgeNodeManager();
    const coordinator = getCoordinatorService();

    try {
      // Step 1: Initialize cameras
      await this._step(1, 'Initializing cameras', async () => {
        edgeManager.reset();
      }, 1500);

      // Step 2: Initialize edge nodes
      await this._step(2, 'Initializing Edge Nodes', async () => {
        // Already initialized — just broadcast status
        this._broadcast('system:status', edgeManager.getSystemStatus());
      }, 1500);

      // Step 3: Connect edge nodes to coordinator
      await this._step(3, 'Connecting Edge Nodes to Coordinator', async () => {
        // Simulated connection
      }, 1200);

      // Step 4: Start simulated camera feeds
      await this._step(4, 'Starting simulated camera feeds', async () => {
        // Cameras are already running
      }, 1200);

      // Step 5: Show background vehicle detections
      await this._step(5, 'Detecting vehicles across cameras', async () => {
        // Generate a few background detections for realism
        for (let i = 0; i < 3; i++) {
          await new Promise(r => setTimeout(r, 600));
          const bgVehicle = scenarios.background_vehicles[i];
          const cameras = Object.keys(scenarios.cameras);
          const cam = cameras[Math.floor(Math.random() * cameras.length)];
          const camInfo = (scenarios.cameras as any)[cam];

          this._broadcast('detection:found', {
            edge_node_id: cam.startsWith('CAM-01') || cam.startsWith('CAM-02') ? 'EDGE-01' :
                          cam.startsWith('CAM-03') || cam.startsWith('CAM-04') ? 'EDGE-02' : 'EDGE-03',
            camera_id: cam,
            timestamp: new Date().toISOString(),
            number_plate: bgVehicle.plate,
            vehicle_type: bgVehicle.type,
            vehicle_color: bgVehicle.color,
            confidence: 0.75 + Math.random() * 0.2,
            latitude: camInfo.lat,
            longitude: camInfo.lng,
            metadata_size_bytes: 150 + Math.floor(Math.random() * 80),
            raw_video_bytes: 0,
            is_background: true
          });
        }
      }, 2500);

      // Step 6: Police enters search query
      await this._step(6, `Searching for: ${scenarios.target_vehicle.color.toUpperCase()} ${scenarios.target_vehicle.type} — ${scenarios.target_vehicle.plate}`, async () => {
        // Just announce
      }, 2000);

      // Step 7-12: Coordinator processes query (this triggers steps 7-12 internally)
      await this._step(7, 'Coordinator distributing query to Edge Nodes', async () => {
        // The coordinator service handles steps 7-12
      }, 500);

      // The big one — process the full query
      const result = await coordinator.processQuery({
        plate: scenarios.target_vehicle.plate,
        vehicle_color: scenarios.target_vehicle.color,
        vehicle_type: scenarios.target_vehicle.type
      });

      // Step 13: Trajectory animated on map
      await this._step(13, 'Animating trajectory on map', async () => {
        // Trajectory was already broadcast by coordinator
      }, 2000);

      // Step 14: Final result
      await this._step(14, 'Demo complete', async () => {
        this._broadcast('demo:complete', {
          vehicle: scenarios.target_vehicle,
          detections: result.detections.length,
          trajectory_points: result.trajectory.points.length,
          total_metadata_bytes: result.stats.total_metadata_bytes,
          total_raw_video_bytes: 0
        });
      }, 1000);

    } catch (err: any) {
      console.error('[Demo] Error:', err);
      this._broadcast('demo:error', { message: err.message });
    } finally {
      this._isRunning = false;
    }

    return { success: true };
  }

  /**
   * Reset demo state.
   */
  reset() {
    this._isRunning = false;
    this._currentStep = 0;
    const edgeManager = getEdgeNodeManager();
    edgeManager.reset();
    this._broadcast('demo:reset', {});
    this._broadcast('system:status', edgeManager.getSystemStatus());
  }

  private async _step(number: number, description: string, action: () => Promise<void>, delayAfter: number = 1000) {
    this._currentStep = number;
    this._broadcast('demo:step', {
      step: number,
      total_steps: this._totalSteps,
      description,
      status: 'in_progress'
    });

    await action();

    this._broadcast('demo:step', {
      step: number,
      total_steps: this._totalSteps,
      description,
      status: 'complete'
    });

    await new Promise(r => setTimeout(r, delayAfter));
  }

  private _broadcast(event: string, data: any) {
    const message = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
    for (const client of this._wsClients) {
      if (client.readyState === 1) { // OPEN
        try { client.send(message); } catch (e) { /* ignore */ }
      }
    }
  }
}

let instance: DemoService | null = null;
export function getDemoService(): DemoService {
  if (!instance) instance = new DemoService();
  return instance;
}
