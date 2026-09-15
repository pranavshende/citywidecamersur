# Developer Context (Memory)

## Project Context
This is a simulation/demo of an Edge-Computing-based City-Wide Multi-Camera ANPR and Vehicle Tracking System. It was built specifically to be demonstrated to judges, highlighting the architectural benefits of edge computing over centralized video streaming.

## Core Architecture
- **Frontend:** React 19 + Vite 8 (`client/` dir). Runs on port 5173.
- **Backend:** Express 5 + WebSocket (`ws`) + Supabase PostgreSQL (`server/` dir). Runs on port 5000.
- **Database:** Supabase is the primary target, but an in-memory fallback is implemented in `server/src/config/db.js` so the demo runs flawlessly even if `SUPABASE_URL` is missing.

## Key Simulation Modules (The "Fakes")
Because this is a demo, several complex AI pipelines are simulated in code:
- `edge/Camera.js`: Simulates a camera feed, ticking frames based on FPS.
- `edge/DetectionEngine.js`: Simulates YOLO/RT-DETR. Introduces 50-150ms delays.
- `edge/ANPREngine.js`: Simulates PaddleOCR. Introduces 30-100ms delays.
- `edge/scenarios.json`: The "script" that dictates when and where the target vehicle appears during the automated demo.

## Important Notes for Future Development
- **Do NOT attempt to stream actual video files** through the WebSocket. This defeats the entire architectural premise of the project (which is that raw video stays at the edge).
- If swapping the simulated AI for real Python microservices, the integration point is `EdgeNode.processQuery()`. The architecture supports replacing the JS simulation with REST/gRPC calls to local Python scripts.
