const _settlementDb = new Map();

export class MockPaymentProvider {
  constructor() {
    this.name = "MOCK_SANDBOX_PROVIDER";
  }

  async createSettlement(transactionId, amount, currency = "USD") {
    const settlementId = `urn:davincia:payment:settlement:${Math.random().toString(36).substring(2, 10)}`;
    const record = {
      settlement_id: settlementId,
      transaction_id: transactionId,
      amount,
      currency,
      status: "CREATED",
      payout_type: "SIMULATED_SETTLEMENT",
      created_at: new Date().toISOString()
    };
    _settlementDb.set(settlementId, record);
    return record;
  }

  async authorizeSettlement(settlementId) {
    const record = _settlementDb.get(settlementId);
    if (!record) throw new Error("Settlement not found");
    record.status = "AUTHORIZED";
    return record;
  }

  async captureSettlement(settlementId) {
    const record = _settlementDb.get(settlementId);
    if (!record) throw new Error("Settlement not found");
    if (record.status !== "AUTHORIZED" && record.status !== "CREATED") {
      throw new Error(`Invalid status transition: cannot capture from ${record.status}`);
    }
    record.status = "CAPTURED";
    record.captured_at = new Date().toISOString();
    return record;
  }

  async refundSettlement(settlementId) {
    const record = _settlementDb.get(settlementId);
    if (!record) throw new Error("Settlement not found");
    record.status = "REFUNDED";
    record.refunded_at = new Date().toISOString();
    return record;
  }

  async getSettlement(settlementId) {
    return _settlementDb.get(settlementId) || null;
  }

  clearDatabase() {
    _settlementDb.clear();
  }
}
export const defaultProvider = new MockPaymentProvider();
