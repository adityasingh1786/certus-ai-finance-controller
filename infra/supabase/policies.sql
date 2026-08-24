-- Supabase Row Level Security (RLS) Policies for AI Finance Controller

-- Enable RLS
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarantine_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 1. Read-Only Policy for Agent / AI Query Role
CREATE ROLE IF NOT EXISTS agent_readonly_role;
GRANT SELECT ON batches TO agent_readonly_role;
GRANT SELECT ON settlement_records TO agent_readonly_role;
GRANT SELECT ON quarantine_records TO agent_readonly_role;
GRANT SELECT ON audit_log TO agent_readonly_role;

-- 2. Audit Log is INSERT-only (no updates, no deletes allowed)
CREATE POLICY audit_log_insert_only ON audit_log
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY audit_log_select ON audit_log
    FOR SELECT
    USING (true);

-- 3. Public / Authenticated read policies
CREATE POLICY batches_select_policy ON batches FOR SELECT USING (true);
CREATE POLICY batches_insert_policy ON batches FOR INSERT WITH CHECK (true);
CREATE POLICY batches_update_policy ON batches FOR UPDATE USING (true);

CREATE POLICY settlement_records_select ON settlement_records FOR SELECT USING (true);
CREATE POLICY settlement_records_insert ON settlement_records FOR INSERT WITH CHECK (true);

CREATE POLICY quarantine_records_all ON quarantine_records FOR ALL USING (true);
