# CityWide ANPR - Edge Computing System

A realistic simulation of a distributed Edge-Computing-based City-Wide Multi-Camera ANPR and Vehicle Tracking System. Built to demonstrate why processing video at the edge is vastly superior to streaming raw video to a central server.

## 🚀 The Core Innovation

**"Process video at the edge. Send intelligence, not video."**

Traditional systems stream gigabytes of raw video from thousands of cameras to a central server, causing massive bandwidth costs and single points of failure. This system runs the AI (YOLO detection + ANPR) locally on Edge Nodes. The central Coordinator only receives lightweight JSON metadata (a few kilobytes).

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Leaflet (Offline Maps), plain CSS (Command Center UI).
- **Backend:** Node.js, Express, native WebSockets (`ws`).
- **Database:** Supabase PostgreSQL (with in-memory fallback for zero-config demos).

## 🏃‍♂️ How to Run

1. **Start the backend (Coordinator & Edge Simulation)**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   *(Server starts on http://localhost:5000)*

2. **Start the frontend (Police Dashboard)**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *(Client starts on http://localhost:5173)*

## 🎤 HOW TO DEMO THIS TO JUDGES

Follow this exact script for a perfect 3-minute presentation:

1. **Login:** Open `http://localhost:5173` and login with `officer1` / `demo123`.
2. **Explain the Architecture (30s):** Point to the 3 Edge Nodes and 5 Cameras on the left. Explain that they are running independently and are currently processing video *locally*.
3. **Highlight Bandwidth (20s):** Point to the bottom center "Bandwidth Comparison" panel. Emphasize the **"0 KB Raw Video Sent"**. This is the key selling point.
4. **Start the Demo (60s):** Click the **"▶ START DEMO"** button.
   - Tell the judges: *"We are searching for a white SUV, plate MH12AB1234."*
   - Direct their attention to the **Coordinator Log** (center) to watch the query get distributed.
   - Direct their attention to the **Event Feed** (right) to see background traffic, followed by the target matches appearing.
5. **Show the Result (30s):** Watch the map animate the vehicle's trajectory. Click the points to show estimated speed.
6. **Show Resilience (20s):** Click "Simulate Failure" on Edge Node 01. Show how the system status drops to DEGRADED, but the remaining nodes continue to function normally.
