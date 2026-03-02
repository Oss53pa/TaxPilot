-- ============================================================
-- Liass'Pilot — Phase B: API Keys + Rate Limiting
-- Run AFTER 001_multi_tenant_schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            text NOT NULL,
  key_hash        text NOT NULL UNIQUE,  -- SHA-256 of the raw key (never store raw)
  key_prefix      text NOT NULL,          -- First 8 chars for display (lp_xxxx...)
  role            text NOT NULL DEFAULT 'COMPTABLE' CHECK (role IN ('ADMIN', 'COMPTABLE', 'AUDITEUR', 'VIEWER')),
  is_active       boolean NOT NULL DEFAULT true,
  -- Rate limiting
  rate_limit      int NOT NULL DEFAULT 1000,     -- requests per day (0 = unlimited)
  requests_today  int NOT NULL DEFAULT 0,
  last_request_at timestamptz,
  -- Metadata
  created_by      uuid REFERENCES auth.users(id),
  expires_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY apikey_select ON api_keys FOR SELECT
  USING (tenant_id = get_my_tenant_id());
CREATE POLICY apikey_insert ON api_keys FOR INSERT
  WITH CHECK (tenant_id = get_my_tenant_id());
CREATE POLICY apikey_update ON api_keys FOR UPDATE
  USING (tenant_id = get_my_tenant_id());
CREATE POLICY apikey_delete ON api_keys FOR DELETE
  USING (tenant_id = get_my_tenant_id());

-- Auto-update timestamp
CREATE TRIGGER set_updated_at_api_keys
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for fast key lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash) WHERE is_active = true;

-- Daily reset function (call via cron or Edge Function)
CREATE OR REPLACE FUNCTION reset_daily_api_counters()
RETURNS void
LANGUAGE sql
AS $$
  UPDATE api_keys SET requests_today = 0
  WHERE requests_today > 0
    AND last_request_at < (now() - interval '1 day');
$$;
