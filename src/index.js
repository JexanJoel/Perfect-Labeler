require("dotenv").config();
const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");

const onConnect = require("./handlers/onConnect");
const onMessage = require("./handlers/onMessage");
const onDisconnect = require("./handlers/onDisconnect");
const startHeartbeatMonitor = require("./heartbeatMonitor");
const setupPushJobRoute = require("./pushJob");

const app = express();
app.use(express.json());

// Setup HTTP routes (push-job + health)
setupPushJobRoute(app);

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server on same HTTP server
const wss = new WebSocketServer({ server, path: "/connectors/ws" });

wss.on("connection", async (ws, req) => {
  // Handle new connector connection
  await onConnect(ws, req);

  ws.on("message", async (rawMessage) => {
    // Only handle messages from authenticated connectors
    if (!ws.connectorId) return;
    await onMessage(ws, rawMessage);
  });

  ws.on("close", async () => {
    await onDisconnect(ws);
  });

  ws.on("error", async (err) => {
    console.error(`WebSocket error for connector ${ws.connectorId}:`, err.message);
    await onDisconnect(ws);
  });
});

// Start heartbeat monitor
startHeartbeatMonitor();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 WS Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/connectors/ws`);
  console.log(`🔌 Push job endpoint: http://localhost:${PORT}/push-job`);
});