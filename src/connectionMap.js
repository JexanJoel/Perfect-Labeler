// In-memory map: connector_id → { socket, connector, lastHeartbeat }
const connections = new Map();

module.exports = {
  set(connectorId, data) {
    connections.set(connectorId, data);
  },

  get(connectorId) {
    return connections.get(connectorId);
  },

  delete(connectorId) {
    connections.delete(connectorId);
  },

  has(connectorId) {
    return connections.has(connectorId);
  },

  all() {
    return connections;
  },

  size() {
    return connections.size;
  },
};