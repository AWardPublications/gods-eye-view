-- =============================================================================
-- POSTGRESQL GOVERNED SCHEMA: ZERO-KNOWLEDGE ROLE TOKEN MAPPING
-- Document ID: ZK-ROLE-MAP-001 · Revision: v1.0
-- Standards: EU AI Act Article 14 & GDPR Compliance
-- Jurisdiction: Sion, Canton of Valais, Switzerland
-- =============================================================================

-- 1. ISOLATED IDENTITY VAULT (Restricted Access, Level 0 Sovereign Only)
CREATE TABLE IF NOT EXISTS principals_identity_vault (
    principal_id SERIAL PRIMARY KEY,
    physical_name VARCHAR(255) NOT NULL,
    email_address VARCHAR(255) UNIQUE NOT NULL,
    secret_user_salt CHAR(64) NOT NULL,
    assigned_role VARCHAR(64) NOT NULL,
    clearance_level VARCHAR(32) NOT NULL DEFAULT 'LEVEL_3_PANEL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ANONYMIZED ZERO-KNOWLEDGE ROLE TOKEN REGISTRY (Public Ledger Surface)
CREATE TABLE IF NOT EXISTS zk_role_token_registry (
    token_id SERIAL PRIMARY KEY,
    nullifier_hash CHAR(64) UNIQUE NOT NULL,
    role_claimed VARCHAR(64) NOT NULL,
    spatial_room_id VARCHAR(32) NOT NULL DEFAULT 'RM-10',
    validity_window_minutes INT NOT NULL DEFAULT 1,
    proof_signature CHAR(64) NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ANONYMIZED ROOM OF REFUSAL (RM-10) AUDIT LOG
CREATE TABLE IF NOT EXISTS rm10_refusal_audit_log (
    log_id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    spatial_room_id VARCHAR(32) NOT NULL DEFAULT 'RM-10',
    nullifier_hash CHAR(64) NOT NULL REFERENCES zk_role_token_registry(nullifier_hash),
    role_verified VARCHAR(64) NOT NULL,
    action_executed VARCHAR(64) NOT NULL DEFAULT 'VETO_SYSTEM_HALT',
    gpg_signature CHAR(10) NOT NULL DEFAULT '0x80D0ADA1',
    execution_state VARCHAR(16) NOT NULL DEFAULT 'FAIL_CLOSED_EXECUTED'
);
