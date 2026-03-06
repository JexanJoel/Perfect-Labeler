const supabase = require("../db");
const connectionMap = require("../connectionMap");

async function onDisconnect(ws) {
  try {
    const connectorId = ws.connectorId;
    if (!connectorId) return;

    // 1. Remove from memory map
    connectionMap.delete(connectorId);

    // 2. Mark connector offline in DB
    await supabase
      .from("connectors")
      .update({
        connection_status: "offline",
        socket_session_id: null,
      })
      .eq("id", connectorId);

    // 3. Mark all its printers offline
    await supabase
      .from("printers")
      .update({
        status: "offline",
        is_available: false,
        last_status_update_at: new Date().toISOString(),
      })
      .eq("connector_id", connectorId);

    console.log(`❌ Connector disconnected: ${connectorId}`);

  } catch (err) {
    console.error("onDisconnect error:", err);
  }
}

module.exports = onDisconnect;