# REST APIs & WebSockets

## REST APIs
**Base URL:** `http://localhost:5000/api`

### Auth
- `POST /auth/login`: Authenticate and receive JWT token.
- `GET /auth/me`: Get current authenticated user details.

### Query
- `POST /query`: Submit a vehicle search query (plate, color, type).
- `GET /query`: List recent queries.
- `GET /query/:id`: Get details of a specific query including detections and trajectory.

### System
- `GET /system/status`: Get overall system health and aggregated stats.
- `GET /system/edge-nodes`: Get status of all edge nodes.
- `GET /system/cameras`: Get status of all cameras.
- `POST /system/simulate-node-failure`: Manually set a node to OFFLINE.
- `POST /system/simulate-camera-failure`: Manually set a camera to OFFLINE.
- `POST /system/restore`: Bring all nodes and cameras back ONLINE.

### Demo
- `POST /demo/start`: Trigger the automated 14-step presentation sequence.
- `POST /demo/reset`: Reset the demo state.

## WebSockets
**Endpoint:** `ws://localhost:5000`

### Emitted Events
- `system:status` & `stats:update`: Periodic system health and stats updates.
- `detection:found`: Broadcast when a vehicle matches an active query.
- `coordinator:step`: Real-time updates during the 11-step query processing pipeline.
- `trajectory:complete`: Final reconstructed trajectory ready for map rendering.
- `query:distributed`: Fired when a query is fanned out to nodes.
- `edge:processing`: Edge node processing state change.
- `edge:status_change` & `camera:status_change`: Health status changes.
- `system:alert`: General system alerts (e.g., node failures).
- `demo:step` & `demo:complete`: Real-time progress updates for the automated demo.
