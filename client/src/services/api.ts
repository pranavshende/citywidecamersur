const API_BASE = 'http://localhost:5000/api';

function getHeaders() {
  const token = sessionStorage.getItem('anpr_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

export async function submitQuery(params: { plate?: string; vehicle_color?: string; vehicle_type?: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function getSystemStatus(): Promise<any> {
  const res = await fetch(`${API_BASE}/system/status`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function simulateNodeFailure(nodeId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/system/simulate-node-failure`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ node_id: nodeId })
  });
  return res.json();
}

export async function simulateCameraFailure(cameraId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/system/simulate-camera-failure`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ camera_id: cameraId })
  });
  return res.json();
}

export async function restoreAll(): Promise<any> {
  const res = await fetch(`${API_BASE}/system/restore`, {
    method: 'POST',
    headers: getHeaders()
  });
  return res.json();
}

export async function startDemo(): Promise<any> {
  const res = await fetch(`${API_BASE}/demo/start`, {
    method: 'POST',
    headers: getHeaders()
  });
  return res.json();
}

export async function resetDemo(): Promise<any> {
  const res = await fetch(`${API_BASE}/demo/reset`, {
    method: 'POST',
    headers: getHeaders()
  });
  return res.json();
}
