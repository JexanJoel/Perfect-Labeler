const supabase = require("../db");

async function onJobFailed(ws, data) {
  try {
    // 1. Fetch current job
    const { data: job } = await supabase
      .from("print_jobs")
      .select("attempt_count, max_attempts")
      .eq("id", data.job_id)
      .single();

    if (!job) return;

    if (job.attempt_count >= job.max_attempts) {
      // Permanently failed
      await supabase
        .from("print_jobs")
        .update({
          status: "failed",
          error_message: data.error || "Max attempts reached",
        })
        .eq("id", data.job_id);

      console.log(`❌ Job permanently failed: ${data.job_id}`);
    } else {
      // Reset to pending for retry
      await supabase
        .from("print_jobs")
        .update({
          status: "pending",
          error_message: data.error || null,
        })
        .eq("id", data.job_id);

      console.log(`🔄 Job failed, reset to pending: ${data.job_id}`);
    }
  } catch (err) {
    console.error("onJobFailed error:", err);
  }
}

module.exports = onJobFailed;