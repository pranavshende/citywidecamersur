import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './config/db';
import { SCHEMA_SQL, seedDatabase } from './models/schema';

// Routes
import authRoutes from './routes/authRoutes';
import queryRoutes from './routes/queryRoutes';
import systemRoutes from './routes/systemRoutes';
import demoRoutes from './routes/demoRoutes';

// Services
import { getEdgeNodeManager } from './edge/EdgeNodeManager';
import { getCoordinatorService } from './services/coordinatorService';
import { getDemoService } from './services/demoService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/demo', demoRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server attached to the HTTP server
const wss = new WebSocketServer({ server });

// Initialize singletons
const edgeManager = getEdgeNodeManager();
const coordinator = getCoordinatorService();
const demoService = getDemoService();

// Handle WebSocket connections
wss.on('connection', (ws: WebSocket) => {
  console.log('[WS] Client connected');
  
  // Register client with services that broadcast
  coordinator.addClient(ws);
  demoService.addClient(ws);
  
  // Send initial system state immediately on connect
  ws.send(JSON.stringify({
    event: 'system:status',
    data: edgeManager.getSystemStatus(),
    timestamp: new Date().toISOString()
  }));

  ws.on('close', () => {
    console.log('[WS] Client disconnected');
    coordinator.removeClient(ws);
    demoService.removeClient(ws);
  });
});

// Background heartbeat to send system stats every 2 seconds
setInterval(() => {
  const status = edgeManager.getSystemStatus();
  const message = JSON.stringify({
    event: 'stats:update',
    data: status,
    timestamp: new Date().toISOString()
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try { client.send(message); } catch (e) { /* ignore */ }
    }
  });
}, 2000);

// Initialize DB and start server
async function startServer() {
  try {
    // We can ping Prisma to ensure connection
    await prisma.$connect();
    console.log('[DB] Prisma connected to database successfully.');
  } catch (err: any) {
    console.warn('[DB] Warning during initialization:', err.message);
  }

  server.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   ANPR Edge Computing - Coordinator Server                ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║   HTTP API:    http://localhost:${PORT}                      ║`);
    console.log(`║   WebSocket:   ws://localhost:${PORT}                        ║`);
    console.log(`║   Health:      http://localhost:${PORT}/api/health              ║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║   Edge Nodes:  ${edgeManager.nodes.size} initialized                              ║`);
    console.log(`║   Cameras:     ${Array.from(edgeManager.nodes.values()).reduce((sum, n) => sum + n.cameras.length, 0)} active                                   ║`);
    console.log('║   Status:      OPERATIONAL                                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  });
}

startServer();
