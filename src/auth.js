const supabase = require("./db");
const crypto = require("crypto");

async function hashApiKey(apiKey) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

async function validateApiKey(apiKey) {
  if (!apiKey) return null;

  const keyHash = await hashApiKey(apiKey);

  const { data: connector, error } = await supabase
    .from("connectors")
    .select("id, tenant_id, name, status, output_format")
    .eq("api_key_hash", keyHash)
    .is("deleted_at", null)
    .single();

  if (error || !connector) return null;
  if (connector.status === "revoked") return null;

  return connector;
}

module.exports = { validateApiKey };