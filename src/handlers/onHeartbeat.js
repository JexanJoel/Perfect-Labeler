const supabase = require("../db");
const connectionMap = require("../connectionMap");

async function onHeartbeat(ws) {
  try {
    const connectorId = ws.connectorId;
    if (!connectorId) return;

    const now = new Date().toISOString();

    // 1. Update last heartbeat in memory
    const conn = connectionMap.get(connectorId);
    if (conn) {
      conn.lastHeartbeat = Date.now();
      connectionMap.set(connectorId, conn);
    }

    // 2. Update last heartbeat in DB
    await supabase
      .from("connectors")
      .update({ last_heartbeat_at: now })
      .eq("id", connectorId);

    // 3. Send pong back
    ws.send(JSON.stringify({ type: "pong" }));

  } catch (err) {
    console.error("onHeartbeat error:", err);
  }
}

module.exports = onHeartbeat;