-- =============================================================================
-- POSTGRESQL GOVERNED TRIGGER SCHEMA: THE NON-DIAGNOSTIC FIREWALL
-- Document ID: BAIT-DB-TRIG-001 · Revision: v1.0
-- Jurisdiction: Sion, Canton of Valais, Switzerland
-- =============================================================================

CREATE TABLE IF NOT EXISTS bait_telemetry_ingestion_log (
    log_id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(64) NOT NULL,
    operator_gpg_key VARCHAR(16) NOT NULL,
    slope_angle_deg NUMERIC(5,2) NOT NULL,
    wind_velocity_mps NUMERIC(5,2) NOT NULL,
    distance_to_target_meters NUMERIC(6,2) NOT NULL,
    biomechanical_fault_flag BOOLEAN DEFAULT FALSE,
    execution_state VARCHAR(16) NOT NULL DEFAULT 'HELD',
    validation_hash CHAR(64) UNIQUE
);

-- THE CHOKEPOINT: DETECT AND REJECT SWING-FAULT TELEMETRY
CREATE OR REPLACE FUNCTION verify_non_diagnostic_compliance_gate()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for unauthorized biomechanical inputs (GAMP-5 Category 4 boundary)
    IF NEW.biomechanical_fault_flag = TRUE OR NEW.slope_angle_deg > 45.00 THEN
        NEW.execution_state := 'BLOCK';
        RAISE WARNING 'SECURITY BREACH: Diagnostic/Biomechanical data detected on non-sensor longitudinal performance track. Execution blocked.';
        RETURN NEW;
    END IF;

    -- If the data is purely environmental, authorize execution
    NEW.execution_state := 'CONTINUE';
    
    -- Generate SHA-256 signature proof of compliance
    NEW.validation_hash := encode(sha256(concat(
        NEW.session_id, 
        NEW.operator_gpg_key, 
        NEW.execution_state, 
        NEW.timestamp::text
    )::bytea), 'hex');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_gamp5_non_diagnostic_boundary ON bait_telemetry_ingestion_log;

CREATE TRIGGER enforce_gamp5_non_diagnostic_boundary
BEFORE INSERT ON bait_telemetry_ingestion_log
FOR EACH ROW
EXECUTE FUNCTION verify_non_diagnostic_compliance_gate();
