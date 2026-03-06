const supabase = require("./db");
const connectionMap = require("./connectionMap");
require("dotenv").config();

const TIMEOUT_MS = parseInt(process.env.HEARTBEAT_TIMEOUT_MS || "60000");

async function markConnectorOffline(connectorId) {
  await supabase
    .from("connectors")
    .update({
      connection_status: "offline",
      socket_session_id: null,
    })
    .eq("id", connectorId);

  await supabase
    .from("printers")
    .update({
      status: "offline",
      is_available: false,
      last_status_update_at: new Date().toISOString(),
    })
    .eq("connector_id", connectorId);

  connectionMap.delete(connectorId);
  console.log(`💔 Connector timed out, marked offline: ${connectorId}`);
}

function startHeartbeatMonitor() {
  setInterval(async () => {
    const now = Date.now();

    for (const [connectorId, conn] of connectionMap.all()) {
      const elapsed = now - conn.lastHeartbeat;

      if (elapsed > TIMEOUT_MS) {
        await markConnectorOffline(connectorId);

        // Close socket if still open
        try {
          conn.socket.terminate();
        } catch (_) {}
      }
    }
  }, 30000); // Check every 30 seconds

  console.log("💓 Heartbeat monitor started");
}

module.exports = startHeartbeatMonitor;