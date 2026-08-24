-- 001_initial.sql — Initial schema for AI Finance Controller

CREATE TABLE IF NOT EXISTS batches (
    id VARCHAR(36) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    source VARCHAR(50) DEFAULT 'manual_upload',
    status VARCHAR(30) DEFAULT 'processing',
    total_records INTEGER DEFAULT 0,
    passed_records INTEGER DEFAULT 0,
    quarantined_records INTEGER DEFAULT 0,
    avg_confidence NUMERIC(4, 3),
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settlement_records (
    transaction_id VARCHAR(100) PRIMARY KEY,
    batch_id VARCHAR(36) REFERENCES batches(id) ON DELETE SET NULL,
    merchant_id VARCHAR(100),
    merchant_name VARCHAR(255),
    order_id VARCHAR(100),
    invoice_number VARCHAR(100),
    utr_number VARCHAR(100),
    settlement_date VARCHAR(20) NOT NULL,
    gross_amount NUMERIC(14, 2) NOT NULL,
    fee NUMERIC(14, 2) DEFAULT 0.00,
    tax NUMERIC(14, 2) DEFAULT 0.00,
    net_amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50) DEFAULT 'UPI',
    status VARCHAR(30) DEFAULT 'settled',
    narration TEXT,
    confidence_score NUMERIC(4, 3) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quarantine_records (
    record_id VARCHAR(36) PRIMARY KEY,
    batch_id VARCHAR(36) REFERENCES batches(id) ON DELETE SET NULL,
    transaction_id VARCHAR(100),
    reason_code VARCHAR(50) NOT NULL,
    reason_detail TEXT NOT NULL,
    flagged_by VARCHAR(50) DEFAULT 'layer_1_rules',
    model_output TEXT,
    raw_record_json TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolution_note TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    record_id VARCHAR(100),
    batch_id VARCHAR(36),
    action VARCHAR(50) NOT NULL,
    detail TEXT NOT NULL,
    metadata_json TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_settlement_date ON settlement_records(settlement_date);
CREATE INDEX IF NOT EXISTS idx_settlement_status ON settlement_records(status);
CREATE INDEX IF NOT EXISTS idx_quarantine_reason ON quarantine_records(reason_code);
CREATE INDEX IF NOT EXISTS idx_audit_record_id ON audit_log(record_id);
