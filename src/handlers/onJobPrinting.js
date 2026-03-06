const supabase = require("../db");

async function onJobPrinting(ws, data) {
  try {
    await supabase
      .from("print_jobs")
      .update({ status: "processing" })
      .eq("id", data.job_id)
      .eq("connector_id", ws.connectorId);

    console.log(`🖨️  Job printing: ${data.job_id}`);
  } catch (err) {
    console.error("onJobPrinting error:", err);
  }
}

module.exports = onJobPrinting;