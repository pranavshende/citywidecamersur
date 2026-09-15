# Product Requirements Document (PRD)

## Objective
Build a realistic, localized simulation of an Edge-Computing-based City-Wide Multi-Camera ANPR and Vehicle Tracking System to serve as a presentation demo for judges.

## Core Innovation
**"Process video at the edge. Send intelligence, not video."**
The system must clearly demonstrate that raw video is processed on the Edge Nodes, and only relevant, lightweight metadata is sent to the central Coordinator.

## Target Audience
Hackathon/Project Judges assessing the architecture, efficiency, and viability of the edge-computing approach.

## Key Requirements

### 1. Reliability & Portability
- **Must work entirely locally/offline.**
- No complex infrastructure (Docker, Redis, external APIs).
- Single command startup (`npm run dev`).
- Use Leaflet (cached/open tiles) instead of Google Maps to avoid API key/internet issues during the demo.

### 2. Edge Node Simulation
- Simulate at least 3 distinct Edge Nodes managing 5 cameras across a city (Nagpur used as default).
- Nodes must independently process "frames" (simulated via `scenarios.json`).
- Nodes must track and display simulated CPU, GPU, and FPS metrics.

### 3. Coordinator Dashboard
- Dark-themed, high-tech command center UI.
- Must display real-time event feeds.
- Must provide a clear step-by-step visualization of the correlation pipeline (so judges understand what the backend is doing).
- Must include a "Bandwidth Comparison" visual highlighting the "0 KB Raw Video Sent" metric.

### 4. Interactive Elements
- Provide a "Simulate Failure" mechanism to prove system resilience.
- Provide a fully automated "Demo Mode" that walks through a perfect search-and-track scenario in under 3 minutes.
