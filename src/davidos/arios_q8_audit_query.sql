-- =============================================================================
-- POSTGRESQL ARIOS 8-QUESTION AUDIT QUERY SCRIPT (Q8 REPLAYABILITY AUDIT)
-- Document ID: DVA-ARIOS-Q8-2026 · Revision: v1.0
-- Jurisdiction: Place du Midi, 1950 Sion, Canton of Valais, Switzerland
-- Purpose: Audits audit_log table and flags any entry violating Q8 replayability rules
-- =============================================================================

-- 1. VIEW TO AUDIT ALL AUDIT_LOG ENTRIES FOR Q8 REPLAYABILITY COMPLIANCE
CREATE OR REPLACE VIEW v_arios_q8_replayability_audit AS
SELECT 
    entry_id,
    tenant_id,
    principal_id,
    action_type,
    timestamp,
    -- Evaluate Q8 Replayability Compliance Flags
    (payload->>'input_hash') AS input_hash,
    (payload->>'output_hash') AS output_hash,
    (payload->>'code_version') AS code_version,
    (payload->>'policy_version') AS policy_version,
    CASE 
        WHEN (payload->>'input_hash') IS NULL OR LENGTH(payload->>'input_hash') = 0 THEN 'NON_COMPLIANT_MISSING_INPUT_HASH'
        WHEN (payload->>'output_hash') IS NULL OR LENGTH(payload->>'output_hash') = 0 THEN 'NON_COMPLIANT_MISSING_OUTPUT_HASH'
        WHEN (payload->>'code_version') IS NULL OR LENGTH(payload->>'code_version') = 0 THEN 'NON_COMPLIANT_MISSING_CODE_VERSION'
        WHEN (payload->>'policy_version') IS NULL OR LENGTH(payload->>'policy_version') = 0 THEN 'NON_COMPLIANT_MISSING_POLICY_VERSION'
        ELSE 'Q8_REPLAYABLE_COMPLIANT'
    END AS q8_compliance_status
FROM audit_log;

-- 2. QUERY TO INSTANTLY FLAG ANY HISTORICAL ENTRIES VIOLATING Q8 REPLAYABILITY
SELECT 
    entry_id,
    tenant_id,
    principal_id,
    action_type,
    q8_compliance_status,
    timestamp
FROM v_arios_q8_replayability_audit
WHERE q8_compliance_status <> 'Q8_REPLAYABLE_COMPLIANT'
ORDER BY timestamp DESC;
