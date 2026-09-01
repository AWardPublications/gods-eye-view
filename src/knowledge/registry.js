/**
 * Governed Knowledge Registry
 * Resolves discoverable assets and verified schemas from data/GOVERNED.
 * Isomorphic: uses process.getBuiltinModule in Node.js runtime.
 */

function getNodeBuiltins() {
  if (typeof process !== 'undefined' && typeof process.getBuiltinModule === 'function') {
    try {
      const fs = process.getBuiltinModule('node:fs');
      const path = process.getBuiltinModule('node:path');
      return { fs, path };
    } catch (e) {}
  }
  return { fs: null, path: null };
}

export function listRegisteredAssets() {
  const { fs, path } = getNodeBuiltins();
  if (!fs || !path) return [];
  const governedDir = path.resolve(process.cwd(), 'data', 'GOVERNED');
  if (!fs.existsSync(governedDir)) return [];
  const files = fs.readdirSync(governedDir).filter(f => f.endsWith('.json'));
  return files.map(file => {
    const fullPath = path.join(governedDir, file);
    const asset = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    return {
      asset_id: asset.asset_id,
      title: asset.title,
      domain: asset.domain,
      owner: asset.owner,
      issuer: asset.issuer,
      verification_state: asset.verification?.state || "UNVERIFIED",
      licensing: asset.licensing,
      lifecycle_state: asset.lifecycle_state,
      discoverable: true
    };
  });
}

export function lookupAssetById(assetId) {
  const { fs, path } = getNodeBuiltins();
  if (!fs || !path) return null;
  const governedDir = path.resolve(process.cwd(), 'data', 'GOVERNED');
  if (!fs.existsSync(governedDir)) return null;
  const files = fs.readdirSync(governedDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const fullPath = path.join(governedDir, file);
    const asset = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    if (asset.asset_id === assetId) {
      return asset;
    }
  }
  return null;
}
