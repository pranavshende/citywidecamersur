# CityWide ANPR Architecture

## Overview
The system follows a distributed Edge Computing architecture. Instead of streaming heavy raw video to a central server, video processing (vehicle detection and ANPR) happens locally on the Edge Nodes. Only lightweight JSON metadata is sent to the central Coordinator.

## Components

### 1. Police Dashboard (React + Vite)
- Real-time WebSocket connection to Coordinator.
- Displays live map (Leaflet), event feed, edge node status, and bandwidth metrics.

### 2. Coordinator (Express + WebSocket)
- Acts as the central hub.
- Distributes search queries to Edge Nodes.
- Correlates incoming detections from multiple nodes.
- Reconstructs vehicle trajectories based on temporal and spatial logic.

### 3. Edge Node (Simulated)
- Manages multiple simulated camera feeds.
- Runs simulated YOLO/RT-DETR (DetectionEngine).
- Runs simulated PaddleOCR (ANPREngine).
- Sends ONLY metadata back to Coordinator.

## Communication
- REST API for static requests (login, query submission, status).
- WebSocket for real-time events (detections, trajectory updates, demo progress).
