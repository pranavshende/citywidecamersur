export class Camera {
  id: string;
  edgeNodeId: string;
  name: string;
  lat: number;
  lng: number;
  fps: number;
  status: string;

  constructor(id: string, edgeNodeId: string, name: string, lat: number, lng: number, fps: number = 25) {
    this.id = id;
    this.edgeNodeId = edgeNodeId;
    this.name = name;
    this.lat = lat;
    this.lng = lng;
    this.fps = fps;
    this.status = 'online';
  }

  setStatus(status: string) {
    this.status = status;
  }

  isOnline() {
    return this.status === 'online';
  }

  // Simulate grabbing a frame. In real world, this would interface with OpenCV/GStreamer.
  // In demo, we just return a fake buffer size to represent video payload.
  grabFrame() {
    if (!this.isOnline()) return null;
    return {
      cameraId: this.id,
      timestamp: Date.now(),
      sizeBytes: 1080 * 1920 * 3 // Fake uncompressed 1080p frame size (~6.2 MB)
    };
  }

  getStatus() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      fps: this.isOnline() ? this.fps : 0,
      lat: this.lat,
      lng: this.lng
    };
  }
}
