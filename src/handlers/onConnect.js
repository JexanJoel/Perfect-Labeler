const supabase = require("../db");
const connectionMap = require("../connectionMap");
const { validateApiKey } = require("../auth");
const crypto = require("crypto");

async function onConnect(ws, req) {
  try {
    // 1. Extract API key from handshake header
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      ws.send(JSON.stringify({ type: "auth_failed", error: "Missing x-api-key header" }));
      ws.close();
      return;
    }

    // 2. Validate API key
    const connector = await validateApiKey(apiKey);

    if (!connector) {
      ws.send(JSON.stringify({ type: "auth_failed", error: "Invalid API key" }));
      ws.close();
      return;
    }

    // 3. Generate session id
    const sessionId = crypto.randomUUID();

    // 4. Update connector in DB
    await supabase
      .from("connectors")
      .update({
        connection_status: "online",
        last_heartbeat_at: new Date().toISOString(),
        socket_session_id: sessionId,
      })
      .eq("id", connector.id);

    // 5. Store in memory map
    connectionMap.set(connector.id, {
      socket: ws,
      connector,
      sessionId,
      lastHeartbeat: Date.now(),
    });

    // 6. Attach connector info to socket for later use
    ws.connectorId = connector.id;
    ws.tenantId = connector.tenant_id;
    ws.sessionId = sessionId;

    // 7. Send auth success
    ws.send(JSON.stringify({
      type: "auth_success",
      connector_id: connector.id,
      session_id: sessionId,
    }));

    console.log(`✅ Connector connected: ${connector.name} (${connector.id})`);

  } catch (err) {
    console.error("onConnect error:", err);
    ws.send(JSON.stringify({ type: "auth_failed", error: "Internal error" }));
    ws.close();
  }
}

module.exports = onConnect;