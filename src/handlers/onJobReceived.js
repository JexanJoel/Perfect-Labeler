const supabase = require("../db");

async function onJobReceived(ws, data) {
  try {
    await supabase
      .from("print_jobs")
      .update({ status: "processing" })
      .eq("id", data.job_id)
      .eq("connector_id", ws.connectorId);

    console.log(`📥 Job received: ${data.job_id}`);
  } catch (err) {
    console.error("onJobReceived error:", err);
  }
}

module.exports = onJobReceived;