-- =============================================================================
-- POSTGRESQL GOVERNED MIGRATION: HITL DOCUMENT PROMOTION FSM TRIGGERS
-- Document ID: DVA-DOC-FSM-2026 · Revision: v1.0
-- Jurisdiction: Sion, Canton of Valais, Switzerland
-- =============================================================================

-- 1. DOCUMENT PROMOTION FSM STATE REGISTRY TABLE
CREATE TABLE IF NOT EXISTS document_fsm_state (
    doc_id VARCHAR(64) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    current_gate VARCHAR(32) NOT NULL CHECK (current_gate IN ('GATE_1_DRAFT', 'GATE_2_EDITORIAL', 'GATE_3_GOVERNANCE', 'GATE_4_PRESS')),
    fsm_state VARCHAR(32) NOT NULL CHECK (fsm_state IN ('DRAFTING', 'EDITORIAL_LINTED', 'GOVERNANCE_SEALED', 'PUBLISHED', 'REFUSED_RM10')),
    open_critical_placeholders INT NOT NULL DEFAULT 0,
    open_optional_placeholders INT NOT NULL DEFAULT 0,
    human_release_signature VARCHAR(255) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. THE CHOKEPOINT: ENFORCE STATE MACHINE PROMOTION RULES BEFORE INSERT/UPDATE
CREATE OR REPLACE FUNCTION verify_document_fsm_promotion_gate()
RETURNS TRIGGER AS $$
BEGIN
    -- Gate 2 Check: Reject if critical or important placeholders are open
    IF NEW.current_gate = 'GATE_2_EDITORIAL' AND NEW.open_critical_placeholders > 0 THEN
        NEW.fsm_state := 'REFUSED_RM10';
        RAISE WARNING 'FSM REFUSAL GATE 2: Document % has % open critical placeholders. Execution blocked & routed to RM-10.', NEW.doc_id, NEW.open_critical_placeholders;
        RETURN NEW;
    END IF;

    -- Gate 3 Check: Reject if ANY open placeholders remain
    IF NEW.current_gate = 'GATE_3_GOVERNANCE' AND (NEW.open_critical_placeholders > 0 OR NEW.open_optional_placeholders > 0) THEN
        NEW.fsm_state := 'REFUSED_RM10';
        RAISE WARNING 'FSM REFUSAL GATE 3: Document % has unresolved placeholders. Execution blocked & routed to RM-10.', NEW.doc_id;
        RETURN NEW;
    END IF;

    -- Gate 4 Check: Reject if missing human release authority signature
    IF NEW.current_gate = 'GATE_4_PRESS' THEN
        IF NEW.human_release_signature IS NULL OR POSITION('APPROVED' IN NEW.human_release_signature) = 0 THEN
            NEW.fsm_state := 'REFUSED_RM10';
            RAISE WARNING 'FSM REFUSAL GATE 4: Document % lacks valid Human Release Authority signature. Execution blocked & routed to RM-10.', NEW.doc_id;
            RETURN NEW;
        END IF;
        NEW.fsm_state := 'PUBLISHED';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_fsm_document_promotion_boundary ON document_fsm_state;

CREATE TRIGGER enforce_fsm_document_promotion_boundary
BEFORE INSERT OR UPDATE ON document_fsm_state
FOR EACH ROW
EXECUTE FUNCTION verify_document_fsm_promotion_gate();
