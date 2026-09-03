import { listRegisteredAssets } from '../knowledge/registry.js';

export function discoverAssets(query = {}) {
  const assets = listRegisteredAssets();
  
  return assets.map(asset => {
    // Filter out facts, raw payloads, or private data classes
    return {
      asset_id: asset.asset_id,
      title: asset.title,
      asset_type: asset.asset_type || "knowledge_asset_governed",
      owner: asset.owner,
      version: asset.version || "1.0.0",
      classification: asset.classification || "PUBLIC",
      provenance_status: asset.verification_state || "VERIFIED",
      permitted_actions: asset.licensing?.permitted_actions || ["READ"],
      pricing_model: asset.licensing?.pricing?.model || "USAGE_BASED",
      price: asset.licensing?.pricing?.price || 0.05,
      currency: asset.licensing?.pricing?.currency || "USD",
      license_summary: asset.licensing?.license_id || "STANDARD_COMMERCIAL",
      availability: asset.lifecycle_state || "ACTIVE"
    };
  });
}
