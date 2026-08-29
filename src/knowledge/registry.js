import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOVERNED_DIR = path.join(__dirname, '../../data/GOVERNED');

export function listRegisteredAssets() {
  if (!fs.existsSync(GOVERNED_DIR)) return [];
  const files = fs.readdirSync(GOVERNED_DIR).filter(f => f.endsWith('.json'));
  return files.map(file => {
    const fullPath = path.join(GOVERNED_DIR, file);
    const asset = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    // Return discoverable catalog entry, omitting actual facts / payloads
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
  if (!fs.existsSync(GOVERNED_DIR)) return null;
  const files = fs.readdirSync(GOVERNED_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const fullPath = path.join(GOVERNED_DIR, file);
    const asset = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    if (asset.asset_id === assetId) {
      return asset;
    }
  }
  return null;
}
