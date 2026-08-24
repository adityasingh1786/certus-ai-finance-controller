CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.batches (
    id VARCHAR(36) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    source VARCHAR(50) DEFAULT 'manual_upload',
    status VARCHAR(30) DEFAULT 'processing',
    total_records INTEGER DEFAULT 0,
    passed_records INTEGER DEFAULT 0,
    quarantined_records INTEGER DEFAULT 0,
    avg_confidence NUMERIC(4, 3) DEFAULT 1.000,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.settlement_records (
    transaction_id VARCHAR(100) PRIMARY KEY,
    batch_id VARCHAR(36) REFERENCES public.batches(id) ON DELETE CASCADE,
    merchant_id VARCHAR(100),
    merchant_name VARCHAR(255),
    order_id VARCHAR(100),
    invoice_number VARCHAR(100),
    utr_number VARCHAR(100),
    settlement_date VARCHAR(20) NOT NULL,
    gross_amount NUMERIC(14, 2) NOT NULL,
    fee NUMERIC(14, 2) DEFAULT 0.00,
    tax NUMERIC(14, 2) DEFAULT 0.00,
    tds_194o NUMERIC(14, 2) DEFAULT 0.00,
    net_amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50) DEFAULT 'UPI',
    status VARCHAR(30) DEFAULT 'settled',
    narration TEXT,
    confidence_score NUMERIC(4, 3) DEFAULT 1.000,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.quarantine_records (
    record_id VARCHAR(36) PRIMARY KEY,
    batch_id VARCHAR(36) REFERENCES public.batches(id) ON DELETE CASCADE,
    transaction_id VARCHAR(100),
    reason_code VARCHAR(50) NOT NULL,
    reason_detail TEXT NOT NULL,
    flagged_by VARCHAR(50) DEFAULT 'layer_1_rules',
    model_output TEXT,
    raw_record_json TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolution_note TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.reconciliation_runs (
    reconciliation_id VARCHAR(36) PRIMARY KEY,
    batch_id VARCHAR(36) REFERENCES public.batches(id) ON DELETE SET NULL,
    total_gateway_records INTEGER DEFAULT 0,
    matched_3_way INTEGER DEFAULT 0,
    unmatched_bank INTEGER DEFAULT 0,
    unmatched_erp INTEGER DEFAULT 0,
    match_rate_percentage NUMERIC(5, 2) DEFAULT 0.00,
    executed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.reconciliation_matrix (
    id BIGSERIAL PRIMARY KEY,
    reconciliation_id VARCHAR(36) REFERENCES public.reconciliation_runs(reconciliation_id) ON DELETE CASCADE,
    payment_id VARCHAR(100) NOT NULL,
    utr VARCHAR(100),
    invoice_id VARCHAR(100),
    gateway_amount NUMERIC(14, 2) NOT NULL,
    bank_amount NUMERIC(14, 2) DEFAULT 0.00,
    erp_amount NUMERIC(14, 2) DEFAULT 0.00,
    status VARCHAR(50) NOT NULL,
    discrepancy NUMERIC(14, 2) DEFAULT 0.00,
    fuzzy_score NUMERIC(4, 3) DEFAULT 1.000,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.audit_log (
    id BIGSERIAL PRIMARY KEY,
    record_id VARCHAR(100),
    batch_id VARCHAR(36),
    action VARCHAR(50) NOT NULL,
    layer VARCHAR(50) DEFAULT 'rules_engine',
    detail TEXT NOT NULL,
    rule_id VARCHAR(50),
    confidence_score NUMERIC(4, 3),
    metadata_json TEXT,
    timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.cash_position_snapshots (
    id BIGSERIAL PRIMARY KEY,
    current_balance NUMERIC(16, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    pending_settlements_total NUMERIC(16, 2) DEFAULT 0.00,
    quarantined_amount_total NUMERIC(16, 2) DEFAULT 0.00,
    expected_t1_inflow NUMERIC(16, 2) DEFAULT 0.00,
    recorded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_settlement_batch_id ON public.settlement_records(batch_id);
CREATE INDEX IF NOT EXISTS idx_settlement_utr ON public.settlement_records(utr_number);
CREATE INDEX IF NOT EXISTS idx_settlement_invoice ON public.settlement_records(invoice_number);
CREATE INDEX IF NOT EXISTS idx_settlement_date ON public.settlement_records(settlement_date);
CREATE INDEX IF NOT EXISTS idx_quarantine_resolved ON public.quarantine_records(is_resolved);
CREATE INDEX IF NOT EXISTS idx_quarantine_reason ON public.quarantine_records(reason_code);
CREATE INDEX IF NOT EXISTS idx_audit_record_id ON public.audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_log(timestamp);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarantine_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_position_snapshots ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to batches') THEN
        CREATE POLICY "Allow all access to batches" ON public.batches FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to settlement_records') THEN
        CREATE POLICY "Allow all access to settlement_records" ON public.settlement_records FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to quarantine_records') THEN
        CREATE POLICY "Allow all access to quarantine_records" ON public.quarantine_records FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to reconciliation_runs') THEN
        CREATE POLICY "Allow all access to reconciliation_runs" ON public.reconciliation_runs FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to reconciliation_matrix') THEN
        CREATE POLICY "Allow all access to reconciliation_matrix" ON public.reconciliation_matrix FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to audit_log') THEN
        CREATE POLICY "Allow all access to audit_log" ON public.audit_log FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to cash_position_snapshots') THEN
        CREATE POLICY "Allow all access to cash_position_snapshots" ON public.cash_position_snapshots FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.batches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quarantine_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reconciliation_runs;
