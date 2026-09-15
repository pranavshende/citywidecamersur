# Design System

The Police Dashboard is designed as a **Command Center**. It features a modern, dark aesthetic with glassmorphism, glowing accents, and micro-animations to ensure high visibility and a premium feel.

## Color Palette

### Backgrounds
- `Base Background`: `#050a18` (Deep navy blue)
- `Secondary Background`: `#0a1128`
- `Card Background`: `#0f1a36`

### Accents
- `Primary (Indigo/Blue)`: `#6366f1` to `#3b82f6` (used for primary actions and highlights)
- `Success (Green)`: `#10b981` (used for online status, successful detections, and trajectory lines)
- `Warning (Amber)`: `#f59e0b` (used for processing/searching states)
- `Danger (Red)`: `#ef4444` (used for offline status and errors)
- `Highlight (Cyan)`: `#06b6d4` (used for secondary data points like camera IDs)

### Text
- `Primary Text`: `#f1f5f9` (White-ish)
- `Secondary Text`: `#94a3b8` (Light grey)
- `Muted Text`: `#64748b` (Darker grey)

## Typography
- **Primary Font**: `Inter` (used for general UI elements, ensuring clean legibility).
- **Monospace Font**: `JetBrains Mono` (used for number plates, technical IDs, and stats for a data-centric look).

## Animations
- **Pulse**: Status dots use subtle breathing animations.
- **Slide In**: New detection cards in the Event Feed slide in from the right.
- **Fade In Up**: Used for coordinator logs and trajectory info to gently introduce new information.
- **Progress Bars**: Smooth width transitions on confidence and bandwidth bars.

## Layout
The dashboard uses a flexible 3-column CSS Grid:
1. **Left Panel (280px)**: Demo Controls, Vehicle Search, Edge Node Status.
2. **Center Panel (Flexible)**: Leaflet Map (top), Coordinator Log & Bandwidth Compare / Trajectory Info (bottom).
3. **Right Panel (320px)**: Live Event Feed.
