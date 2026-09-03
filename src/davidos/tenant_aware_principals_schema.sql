-- =============================================================================
-- POSTGRESQL GOVERNED SCHEMA: TENANT-AWARE COMPOSITE PRINCIPALS & AGR MODEL
-- Document ID: TENANT-AGR-DB-001 · Revision: v1.0
-- Jurisdiction: Sion, Canton of Valais, Switzerland
-- =============================================================================

-- 1. TENANTS REGISTRY
CREATE TABLE IF NOT EXISTS tenants_registry (
    tenant_id VARCHAR(64) PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(32) NOT NULL DEFAULT 'ENTERPRISE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TENANT-AWARE PRINCIPALS REGISTRY (COMPOSITE PRIMARY KEY)
CREATE TABLE IF NOT EXISTS tenant_principals (
    tenant_id VARCHAR(64) NOT NULL REFERENCES tenants_registry(tenant_id) ON DELETE CASCADE,
    principal_id VARCHAR(64) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    email_address VARCHAR(255) NOT NULL,
    authorized_scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_id, principal_id)
);

-- 3. AGENT-GROUP-ROLE (AGR) BINDINGS
CREATE TABLE IF NOT EXISTS tenant_agr_roles (
    role_id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    principal_id VARCHAR(64) NOT NULL,
    group_name VARCHAR(64) NOT NULL, -- e.g. 'LIBRARY', 'RM-10', 'FLOOR-1'
    role_name VARCHAR(64) NOT NULL,  -- e.g. 'PARENT', 'POLICE_OFFICER', 'PEDESTRIAN'
    panel_type VARCHAR(16) DEFAULT NULL, -- 'PANEL_A', 'PANEL_B', 'PANEL_C', 'PANEL_D'
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id, principal_id) REFERENCES tenant_principals(tenant_id, principal_id) ON DELETE CASCADE
);

-- 4. TENANT-ISOLATED AUDIT LOG (ENFORCED COMPOSITE FOREIGN KEY)
CREATE TABLE IF NOT EXISTS tenant_audit_log (
    log_id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    principal_id VARCHAR(64) NOT NULL,
    action_type VARCHAR(64) NOT NULL,
    spatial_zone VARCHAR(32) NOT NULL DEFAULT 'RM-05',
    execution_state VARCHAR(16) NOT NULL DEFAULT 'PERMITTED',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id, principal_id) REFERENCES tenant_principals(tenant_id, principal_id) ON DELETE RESTRICT
);
