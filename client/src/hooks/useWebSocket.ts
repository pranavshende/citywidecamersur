import { useState, useEffect, useRef } from 'react';
import { SystemStatus, DetectionEvent, CoordinatorStep, Trajectory, DemoStep } from '../types';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [detections, setDetections] = useState<DetectionEvent[]>([]);
  const [coordinatorSteps, setCoordinatorSteps] = useState<CoordinatorStep[]>([]);
  const [trajectory, setTrajectory] = useState<Trajectory | null>(null);
  const [demoStep, setDemoStep] = useState<DemoStep | null>(null);

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    function connect() {
      ws.current = new WebSocket('ws://localhost:5000');

      ws.current.onopen = () => {
        setConnected(true);
      };

      ws.current.onclose = () => {
        setConnected(false);
        setTimeout(connect, 3000);
      };

      ws.current.onerror = () => {
        ws.current?.close();
      };

      ws.current.onmessage = (msg) => {
        try {
          const { event, data } = JSON.parse(msg.data);

          switch (event) {
            case 'system:status':
            case 'stats:update':
              setSystemStatus(data);
              break;

            case 'detection:found':
              setDetections(prev => [data, ...prev].slice(0, 50));
              break;

            case 'coordinator:step':
              setCoordinatorSteps(prev => {
                const existing = prev.findIndex(s => s.step === data.step);
                if (existing >= 0) {
                  const updated = [...prev];
                  updated[existing] = data;
                  return updated;
                }
                return [...prev, data];
              });
              break;

            case 'trajectory:complete':
              setTrajectory(data);
              break;

            case 'demo:step':
              setDemoStep(data);
              break;

            case 'demo:complete':
              setTimeout(() => setDemoStep(null), 5000);
              break;

            case 'demo:reset':
              clearState();
              break;
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      };
    }

    connect();

    return () => {
      ws.current?.close();
    };
  }, []);

  function clearState() {
    setDetections([]);
    setCoordinatorSteps([]);
    setTrajectory(null);
    setDemoStep(null);
  }

  return {
    connected,
    systemStatus,
    detections,
    coordinatorSteps,
    trajectory,
    demoStep,
    clearState
  };
}
