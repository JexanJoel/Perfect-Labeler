const onHeartbeat = require("./onHeartbeat");
const onPrinterSync = require("./onPrinterSync");
const onJobReceived = require("./onJobReceived");
const onJobPrinting = require("./onJobPrinting");
const onJobCompleted = require("./onJobCompleted");
const onJobFailed = require("./onJobFailed");

async function onMessage(ws, rawMessage) {
  try {
    const data = JSON.parse(rawMessage);

    switch (data.type) {
      case "heartbeat":
        await onHeartbeat(ws);
        break;
      case "printer_sync":
        await onPrinterSync(ws, data);
        break;
      case "job_received":
        await onJobReceived(ws, data);
        break;
      case "job_printing":
        await onJobPrinting(ws, data);
        break;
      case "job_completed":
        await onJobCompleted(ws, data);
        break;
      case "job_failed":
        await onJobFailed(ws, data);
        break;
      default:
        console.warn(`Unknown message type: ${data.type}`);
    }

  } catch (err) {
    console.error("onMessage parse error:", err);
  }
}

module.exports = onMessage;