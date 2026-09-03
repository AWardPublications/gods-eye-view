-- =====================================================================
-- SYSTEM ARCHITECTURE SPECIFICATION: TENANT-AWARE PRINCIPAL REGISTRY & LEDGER
-- Platform: PostgreSQL 15+ (Production-Grade Target Engine)
-- Authority Layer: ARIOS Layer 1 Compliance & Truth Stack Controls
-- Core Principle: "Nothing is trusted because it happened. Everything is trusted
--                  because it can be reconstructed."
-- =====================================================================

-- 1. EXTENSIONS & SCHEMA CONFIGURATION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TENANTS (Sovereign Entities)
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DECOMMISSIONED'))
);

-- Seed Initial Sovereign Tenant Registry
INSERT INTO tenants (name, domain) VALUES 
('Brehon AI Solutions', 'brehonaisolutions.com'),
('Haag-Streit', 'haag-streit.com'),
('Glofy', 'glofy.com'),
('A.Ward Publications', 'awardpublications.com')
ON CONFLICT (name) DO NOTHING;

-- 3. PRINCIPALS (Sovereign Mobile/Edge Human Identities & Tool Agents)
CREATE TABLE IF NOT EXISTS principals (
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
    principal_id UUID DEFAULT uuid_generate_v4(),
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL CHECK (role IN ('PUBLIC', 'CLIENT', 'CONTRACTOR', 'INVESTOR', 'BOARD_MEMBER', 'FOUNDER')),
    authorized_scopes JSONB NOT NULL DEFAULT '[]'::jsonb, -- Granular spatial permissions
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'PENDING')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (tenant_id, principal_id)
);

-- 4. THE TRUTH STACK COMPOSITE LEDGER (Append-Only Audit Log)
CREATE TABLE IF NOT EXISTS audit_log (
    tenant_id UUID NOT NULL,
    entry_id BIGSERIAL,
    principal_id UUID NOT NULL,
    
    room_code VARCHAR(10) NOT NULL CHECK (room_code IN ('RM-01', 'RM-02', 'RM-03', 'RM-04', 'RM-05', 'RM-06', 'RM-07', 'RM-08', 'RM-09', 'RM-10', 'RM-11', 'RM-12', 'RM-13', 'RM-14', 'RM-15', 'RM-16', 'RM-17', 'RM-18', 'RM-19', 'RM-20')),
    action_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    
    prev_hash CHAR(64) NOT NULL,
    entry_hash CHAR(64) UNIQUE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (tenant_id, entry_id),
    
    CONSTRAINT fk_tenant_principal FOREIGN KEY (tenant_id, principal_id) 
        REFERENCES principals (tenant_id, principal_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_audit_log_chronological ON audit_log (tenant_id, timestamp ASC, entry_id ASC);

-- 5. IMMUTABILITY ENFORCEMENT (Active Triggers)
CREATE OR REPLACE FUNCTION prevent_ledger_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'MEMBER TRANSACTION MUTATION BLOCKED: The ARIOS Truth Layer is append-only. UPDATE and DELETE actions are physically disallowed on the audit_log table.'
        USING ERRCODE = 'check_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_ledger_append_only ON audit_log;

CREATE TRIGGER enforce_ledger_append_only
BEFORE UPDATE OR DELETE ON audit_log
FOR EACH ROW
EXECUTE FUNCTION prevent_ledger_mutation();

-- 6. CRYPTOGRAPHIC INTEGRITY VERIFICATION (Pre-Commit Check)
CREATE OR REPLACE FUNCTION verify_spanning_chain()
RETURNS TRIGGER AS $$
DECLARE
    last_hash CHAR(64);
    calculated_hash CHAR(64);
BEGIN
    SELECT entry_hash INTO last_hash
    FROM audit_log
    WHERE tenant_id = NEW.tenant_id
    ORDER BY entry_id DESC
    LIMIT 1;

    IF last_hash IS NULL THEN
        IF NEW.prev_hash <> '0000000000000000000000000000000000000000000000000000000000000000' THEN
            RAISE EXCEPTION 'GENESIS BLOCK MISMATCH: Initial system state for tenant % must reference the null genesis hash.', NEW.tenant_id;
        END IF;
    ELSE
        IF NEW.prev_hash <> last_hash THEN
            RAISE EXCEPTION 'CRYPTOGRAPHIC SPANNING CHAIN SPLIT DETECTED: The provided prev_hash (%) does not match the actual last hash on record (%) for tenant %.', 
                NEW.prev_hash, last_hash, NEW.tenant_id;
        END IF;
    END IF;

    calculated_hash := encode(sha256(concat(
        NEW.tenant_id::text,
        NEW.principal_id::text,
        NEW.room_code,
        NEW.action_type,
        NEW.payload::text,
        NEW.prev_hash,
        NEW.timestamp::text
    )::bytea), 'hex');

    IF NEW.entry_hash IS NULL THEN
        NEW.entry_hash := calculated_hash;
    ELSIF NEW.entry_hash <> calculated_hash THEN
        RAISE EXCEPTION 'INTEGRITY ERROR: User-submitted entry_hash (%) does not match the system-recalculated checksum (%).', 
            NEW.entry_hash, calculated_hash;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_spanning_chain_integrity ON audit_log;

CREATE TRIGGER enforce_spanning_chain_integrity
BEFORE INSERT ON audit_log
FOR EACH ROW
EXECUTE FUNCTION verify_spanning_chain();

REVOKE UPDATE, DELETE ON TABLE audit_log FROM PUBLIC;
