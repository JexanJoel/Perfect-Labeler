const connectionMap = require("./connectionMap");
require("dotenv").config();

// This is called by create-job edge function via HTTP POST
function setupPushJobRoute(app) {
  app.post("/push-job", (req, res) => {

    // 1. Verify secret header
    const secret = req.headers["x-push-secret"];
    if (secret !== process.env.PUSH_JOB_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { connector_id, job } = req.body;

    if (!connector_id || !job) {
      return res.status(400).json({ error: "connector_id and job are required" });
    }

    // 2. Look up connector in memory map
    const conn = connectionMap.get(connector_id);

    if (!conn) {
      // Connector offline — job stays pending, polling will pick it up
      return res.status(200).json({
        success: false,
        message: "Connector offline — job queued for polling fallback",
      });
    }

    // 3. Push job to connector via WebSocket
    try {
      conn.socket.send(JSON.stringify({
        type: "job_push",
        job,
      }));

      return res.status(200).json({
        success: true,
        message: "Job pushed to connector",
      });

    } catch (err) {
      return res.status(500).json({
        error: "Failed to push job",
        details: err.message,
      });
    }
  });

  // Health check endpoint for Render
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      connections: connectionMap.size(),
    });
  });
}

module.exports = setupPushJobRoute;