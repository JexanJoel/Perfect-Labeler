const supabase = require("../db");

async function onJobCompleted(ws, data) {
  try {
    const now = new Date().toISOString();

    // 1. Mark job completed
    await supabase
      .from("print_jobs")
      .update({
        status: "completed",
        completed_at: now,
        error_message: null,
      })
      .eq("id", data.job_id)
      .eq("connector_id", ws.connectorId);

    // 2. Fetch job for audit log
    const { data: job } = await supabase
      .from("print_jobs")
      .select("*")
      .eq("id", data.job_id)
      .single();

    if (job) {
      // 3. Create audit log
      await supabase
        .from("print_audit_log")
        .insert({
          job_id: job.id,
          tenant_id: job.tenant_id,
          design_id: job.design_id,
          design_version: job.design_version,
          printed_at: now,
          connector_id: job.connector_id,
          raw_input_snapshot: job.input_data,
        });
    }

    console.log(`✅ Job completed: ${data.job_id}`);
  } catch (err) {
    console.error("onJobCompleted error:", err);
  }
}

module.exports = onJobCompleted;