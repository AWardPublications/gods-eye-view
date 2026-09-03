-- =============================================================================
-- POSTGRESQL ARIOS SPANNING CHAIN & LINK-ROT DIAGNOSTIC QUERY SCRIPT
-- Document ID: DVA-ARIOS-LINKROT-2026 · Revision: v1.0
-- Jurisdiction: Place du Midi, 1950 Sion, Canton of Valais, Switzerland
-- Purpose: Audits audit_log table and flags broken parent hashes, missing code/policy
--          versions, and calculates the exact link-rot percentage down to table row.
-- =============================================================================

-- 1. VIEW TO DIAGNOSE EVERY TABLE ROW FOR GRAPH & CHAIN INTEGRITY
CREATE OR REPLACE VIEW v_arios_link_rot_diagnostics AS
WITH chained_audit AS (
    SELECT 
        entry_id,
        tenant_id,
        principal_id,
        room_code,
        action_type,
        timestamp,
        entry_hash,
        prev_hash,
        payload,
        LAG(entry_hash) OVER (PARTITION BY tenant_id ORDER BY entry_id ASC) AS expected_prev_hash
    FROM audit_log
)
SELECT 
    entry_id,
    tenant_id,
    principal_id,
    room_code,
    action_type,
    timestamp,
    entry_hash,
    prev_hash,
    expected_prev_hash,
    (payload->>'code_version') AS code_version,
    (payload->>'policy_version') AS policy_version,
    CASE
        -- Check Genesis condition
        WHEN prev_hash = '0000000000000000000000000000000000000000000000000000000000000000' AND expected_prev_hash IS NULL THEN 'VALID_GENESIS_ROW'
        -- Check Parent Hash Chain Continuity
        WHEN prev_hash <> COALESCE(expected_prev_hash, '') THEN 'LINK_ROT_BROKEN_PARENT_HASH'
        -- Check Replayability Metadata
        WHEN payload->>'code_version' IS NULL OR LENGTH(payload->>'code_version') = 0 THEN 'LINK_ROT_MISSING_CODE_VERSION'
        WHEN payload->>'policy_version' IS NULL OR LENGTH(payload->>'policy_version') = 0 THEN 'LINK_ROT_MISSING_POLICY_VERSION'
        ELSE 'CHAIN_INTACT_REPLAYABLE'
    END AS diagnostic_status
FROM chained_audit;

-- 2. DETAILED QUERY TO RETURN BROKEN ROWS (LINK ROT AUDIT)
SELECT 
    entry_id,
    tenant_id,
    principal_id,
    room_code,
    action_type,
    diagnostic_status,
    prev_hash,
    expected_prev_hash,
    timestamp
FROM v_arios_link_rot_diagnostics
WHERE diagnostic_status LIKE 'LINK_ROT_%'
ORDER BY entry_id ASC;

-- 3. LINK-ROT METRIC SUMMARY QUERY (PERCENTAGE CALCULATION)
SELECT 
    COUNT(*) AS total_rows_audited,
    COUNT(CASE WHEN diagnostic_status LIKE 'LINK_ROT_%' THEN 1 END) AS total_link_rot_rows,
    ROUND(
        (COUNT(CASE WHEN diagnostic_status LIKE 'LINK_ROT_%' THEN 1 END)::numeric / NULLIF(COUNT(*), 0)::numeric) * 100, 
        2
    ) AS link_rot_percentage
FROM v_arios_link_rot_diagnostics;
