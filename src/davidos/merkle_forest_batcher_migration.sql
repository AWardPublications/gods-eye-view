-- =============================================================================
-- POSTGRESQL GOVERNED MIGRATION: MERKLE FOREST EPOCH BATCHER SCHEMAS
-- Document ID: DVA-MERKLE-2026 · Revision: v1.0
-- Jurisdiction: Sion, Canton of Valais, Switzerland
-- =============================================================================

-- 1. MERKLE EPOCH REGISTRY TABLE
CREATE TABLE IF NOT EXISTS merkle_epochs (
    epoch_id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    epoch_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    batch_size INT NOT NULL,
    epoch_root_hash CHAR(64) UNIQUE NOT NULL,
    tree_height INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. STORED PROCEDURE TO COMMIT AN EPOCH BATCH IN 1 ATOMIC TRANSACTION
CREATE OR REPLACE FUNCTION commit_merkle_epoch_batch(
    p_tenant_id VARCHAR(64),
    p_batch_size INT,
    p_epoch_root_hash CHAR(64),
    p_tree_height INT
) RETURNS BIGINT AS $$
DECLARE
    v_epoch_id BIGINT;
BEGIN
    INSERT INTO merkle_epochs (tenant_id, batch_size, epoch_root_hash, tree_height)
    VALUES (p_tenant_id, p_batch_size, p_epoch_root_hash, p_tree_height)
    RETURNING epoch_id INTO v_epoch_id;

    RETURN v_epoch_id;
END;
$$ LANGUAGE plpgsql;
