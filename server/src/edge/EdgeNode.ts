import { Camera } from './Camera';
import { DetectionEngine } from './DetectionEngine';
import { ANPREngine } from './ANPREngine';
import { EdgeNodeConfig, CameraConfig, QueryParams } from '../models/types';
import scenarios from './scenarios.json';

export class EdgeNode {
  config: EdgeNodeConfig;
  cameras: Camera[];
  detectionEngine: DetectionEngine;
  anprEngine: ANPREngine;
  stats: {
    metadata_sent_bytes: number;
    raw_video_sent_bytes: number;
    cpu_usage: number;
    gpu_usage: number;
  };
  private _processingLoop: NodeJS.Timeout | null;

  constructor(config: EdgeNodeConfig) {
    this.config = config;
    this.cameras = [];
    this.detectionEngine = new DetectionEngine();
    this.anprEngine = new ANPREngine();
    this.stats = {
      metadata_sent_bytes: 0,
      raw_video_sent_bytes: 0,
      cpu_usage: config.cpu_usage || Math.floor(Math.random() * 40 + 20),
      gpu_usage: config.gpu_usage || Math.floor(Math.random() * 50 + 30)
    };
    this._processingLoop = null;
  }

  addCamera(camConfig: CameraConfig) {
    const cam = new Camera(
      camConfig.id,
      this.config.id,
      camConfig.name,
      camConfig.latitude,
      camConfig.longitude,
      camConfig.fps
    );
    this.cameras.push(cam);
  }

  start() {
    this.config.status = 'online';
    this._startProcessingLoop();
  }

  stop() {
    this.config.status = 'offline';
    if (this._processingLoop) {
      clearInterval(this._processingLoop);
      this._processingLoop = null;
    }
  }

  isOnline() {
    return this.config.status === 'online';
  }

  simulateFailure() {
    this.stop();
  }

  simulateCameraFailure(cameraId: string) {
    const cam = this.cameras.find(c => c.id === cameraId);
    if (cam) {
      cam.setStatus('offline');
      return true;
    }
    return false;
  }

  private _startProcessingLoop() {
    // Simulate continuous processing loop (e.g., pulling frames from cameras)
    this._processingLoop = setInterval(() => {
      // Fluctuate CPU/GPU slightly
      this.stats.cpu_usage = Math.max(10, Math.min(95, this.stats.cpu_usage + (Math.random() * 6 - 3)));
      this.stats.gpu_usage = Math.max(10, Math.min(95, this.stats.gpu_usage + (Math.random() * 8 - 4)));
    }, 2000);
  }

  /**
   * Process a query distributed by the Coordinator.
   * This is where the magic happens: instead of sending video, the Edge Node
   * looks for the target locally and only returns metadata.
   */
  async processQuery(query: QueryParams): Promise<{ detections: any[], metadata_bytes: number }> {
    if (!this.isOnline()) return { detections: [], metadata_bytes: 0 };

    const detections: any[] = [];
    let queryMetadataBytes = 0;

    // We check our cameras to see if any match the scenario script
    for (const camera of this.cameras) {
      if (!camera.isOnline()) continue;

      // Simulate frame grab
      const frame = camera.grabFrame();
      if (!frame) continue;

      // Simulate ML Inference
      await this.detectionEngine.processFrame(frame);
      await this.anprEngine.processCrop(frame);

      // Check scenario logic to see if target should be "detected" here
      // Target vehicle matches
      const target = scenarios.target_vehicle;
      const isPlateMatch = !query.plate || target.plate.includes(query.plate.toUpperCase());
      const isColorMatch = !query.vehicle_color || target.color === query.vehicle_color.toLowerCase();
      const isTypeMatch = !query.vehicle_type || target.type === query.vehicle_type.toLowerCase();

      if (isPlateMatch && isColorMatch && isTypeMatch) {
        // Did it pass by this camera?
        const trajectoryNodes = scenarios.trajectory;
        const index = trajectoryNodes.indexOf(camera.id);
        
        if (index !== -1) {
          // Calculate realistic timestamp offset based on trajectory index to simulate movement
          const timestamp = new Date(Date.now() - ((trajectoryNodes.length - index) * 4000));
          
          const detectionMetadata = {
            camera_id: camera.id,
            edge_node_id: this.config.id,
            number_plate: target.plate,
            vehicle_type: target.type,
            vehicle_color: target.color,
            confidence: 0.85 + Math.random() * 0.14,
            latitude: camera.lat,
            longitude: camera.lng,
            timestamp: timestamp.toISOString()
          };

          detections.push(detectionMetadata);
          
          // Estimate JSON byte size of metadata
          const bytes = Buffer.byteLength(JSON.stringify(detectionMetadata));
          queryMetadataBytes += bytes;
          this.stats.metadata_sent_bytes += bytes;
        }
      }
    }

    return {
      detections,
      metadata_bytes: queryMetadataBytes
    };
  }

  getStatus() {
    return {
      id: this.config.id,
      name: this.config.name,
      status: this.config.status,
      location_name: this.config.location_name,
      cpu_usage: this.stats.cpu_usage,
      gpu_usage: this.stats.gpu_usage,
      fps: this.cameras.filter(c => c.isOnline()).reduce((acc, c) => acc + c.fps, 0),
      metadata_sent_bytes: this.stats.metadata_sent_bytes,
      raw_video_sent_bytes: this.stats.raw_video_sent_bytes, // Always 0!
      cameras: this.cameras.map(c => c.getStatus())
    };
  }
}
