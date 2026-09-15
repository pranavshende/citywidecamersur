# System Functionality

## 1. Automated Demo Sequence
- A one-click "START DEMO" button that runs a 2-3 minute presentation sequence.
- Orchestrates background vehicle detections to establish realism.
- Initiates a simulated search for a specific target vehicle (MH12AB1234).
- Visually walks through the Coordinator's query distribution and correlation pipeline.
- Animates the resulting vehicle trajectory on the map.

## 2. Real-Time Vehicle Search
- Users can manually search by Number Plate, Vehicle Color, or Vehicle Type.
- The system distributes the query to all Edge Nodes.
- Matches are returned and correlated in real-time.

## 3. Edge Node Simulation
- Each Edge Node runs as an independent class instance simulating local AI processing.
- Handles multiple simulated camera feeds.
- Introduces realistic processing delays for YOLO/RT-DETR and PaddleOCR simulation.
- Generates JSON metadata packets instead of raw video frames.

## 4. Coordinator Logic (Correlation Engine)
- **Duplicate Filtering:** Removes identical detections from the same camera within a small time window.
- **Temporal Validation:** Ensures detections follow a plausible chronological sequence.
- **Trajectory Reconstruction:** Uses the Haversine formula to calculate distances between cameras and estimates vehicle speed.

## 5. Live Mapping
- Integrates Leaflet with OpenStreetMap (CARTO Dark theme).
- Plots fixed camera locations.
- Animates vehicle paths (polylines) and detection points sequentially.

## 6. System Resilience & Failure Simulation
- Users can manually simulate failures of specific Edge Nodes or individual Cameras.
- System dynamically updates its status (OPERATIONAL, DEGRADED, OFFLINE).
- Coordinator intelligently routes queries only to ONLINE nodes.

## 7. Bandwidth Analytics
- Visually contrasts the bandwidth requirements of a traditional centralized system (~12 GB/hr of raw video) versus the Edge Computing approach (few KB of metadata).
