const supabase = require("../db");

async function onPrinterSync(ws, data) {
  try {
    const connectorId = ws.connectorId;
    const tenantId = ws.tenantId;
    if (!connectorId) return;

    const printers = data.printers;
    if (!printers || !Array.isArray(printers)) return;

    const now = new Date().toISOString();

    for (const printer of printers) {
      // Upsert each printer
      await supabase
        .from("printers")
        .upsert({
          connector_id: connectorId,
          tenant_id: tenantId,
          name: printer.name || `Printer ${printer.ip_address}`,
          ip_address: printer.ip_address,
          port: printer.port || 9100,
          output_format: printer.output_format || "pdf",
          status: printer.status || "online",
          is_available: printer.is_available ?? true,
          is_deleted: false,
          last_status_update_at: now,
        }, {
          onConflict: "connector_id, ip_address",
          ignoreDuplicates: false,
        });
    }

    console.log(`🖨️  Printer sync: ${printers.length} printers for connector ${connectorId}`);

  } catch (err) {
    console.error("onPrinterSync error:", err);
  }
}

module.exports = onPrinterSync;