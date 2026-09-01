/**
 * Sovereign AI Embassy 3D Trade Corridors & Phygital Settlement Nodes Layer
 * Renders glowing great-circle trade arcs and diplomatic nodes on the Cesium 3D Globe.
 */

import * as Cesium from 'cesium';

export const EMBASSY_NODES = [
  {
    id: "node-sion",
    name: "Sion / Valais Innovation Hub",
    country: "Switzerland",
    role: "Alpine Speedgolf & WIPO Patent Origin",
    longitude: 7.36,
    latitude: 46.23,
    heightM: 500,
    color: "#ff5252",
    badge: "PATENT ANCHOR"
  },
  {
    id: "node-cork",
    name: "Cork Sovereign Mint",
    country: "Ireland",
    role: "Brehon AI Legal & Phygital Publishing Mint",
    longitude: -8.47,
    latitude: 51.90,
    heightM: 50,
    color: "#00e676",
    badge: "PHYGITAL MINT"
  },
  {
    id: "node-sf",
    name: "San Francisco Intelligence Hub",
    country: "United States",
    role: "God's Eye View Geospatial Core",
    longitude: -122.42,
    latitude: 37.77,
    heightM: 100,
    color: "#40c4ff",
    badge: "GEOSPATIAL CORE"
  },
  {
    id: "node-geneva",
    name: "Geneva Diplomatic Embassy",
    country: "Switzerland",
    role: "International Standards & GAMP 5 Registry",
    longitude: 6.14,
    latitude: 46.20,
    heightM: 400,
    color: "#ffd740",
    badge: "STANDARDS REGISTRY"
  },
  {
    id: "node-tokyo",
    name: "Tokyo Phygital Embassy",
    country: "Japan",
    role: "TCG Collector & Asian Distribution Outpost",
    longitude: 139.69,
    latitude: 35.68,
    heightM: 50,
    color: "#e040fb",
    badge: "TCG DISTRIBUTION"
  }
];

export const TRADE_CORRIDORS = [
  { from: "node-cork", to: "node-sion", title: "Celtic-Alpine Phygital Corridor", volume_eur: "€2.4M/mo" },
  { from: "node-sion", to: "node-geneva", title: "Swiss High-Precision Standards Link", volume_eur: "€5.1M/mo" },
  { from: "node-cork", to: "node-sf", title: "Transatlantic Geospatial & IP Channel", volume_eur: "€8.7M/mo" },
  { from: "node-sion", to: "node-tokyo", title: "Alpine-Pacific TCG Collector Express", volume_eur: "€3.9M/mo" }
];

export class EmbassyTradeCorridorsLayer {
  constructor(viewer) {
    this.viewer = viewer;
    this.entities = [];
    this.enabled = false;
  }

  enable() {
    if (this.enabled || !this.viewer) return;
    this.enabled = true;

    // 1. Render Embassy Nodes
    for (const node of EMBASSY_NODES) {
      const position = Cesium.Cartesian3.fromDegrees(node.longitude, node.latitude, node.heightM);
      const entity = this.viewer.entities.add({
        id: `embassy-${node.id}`,
        name: node.name,
        position,
        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString(node.color),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.NONE
        },
        label: {
          text: `${node.name}\n[${node.badge}]`,
          font: "11px monospace",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -14),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000000)
        }
      });
      this.entities.push(entity);
    }

    // 2. Render Great-Circle Trade Arcs
    for (const corridor of TRADE_CORRIDORS) {
      const nodeA = EMBASSY_NODES.find(n => n.id === corridor.from);
      const nodeB = EMBASSY_NODES.find(n => n.id === corridor.to);
      if (!nodeA || !nodeB) continue;

      const posA = Cesium.Cartesian3.fromDegrees(nodeA.longitude, nodeA.latitude, nodeA.heightM);
      const posB = Cesium.Cartesian3.fromDegrees(nodeB.longitude, nodeB.latitude, nodeB.heightM);

      const arcEntity = this.viewer.entities.add({
        id: `corridor-${corridor.from}-${corridor.to}`,
        name: corridor.title,
        polyline: {
          positions: [posA, posB],
          width: 3,
          arcType: Cesium.ArcType.GEODESIC,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            taperPower: 0.5,
            color: Cesium.Color.CYAN.withAlpha(0.85)
          })
        }
      });
      this.entities.push(arcEntity);
    }
  }

  disable() {
    if (!this.enabled || !this.viewer) return;
    for (const ent of this.entities) {
      this.viewer.entities.remove(ent);
    }
    this.entities = [];
    this.enabled = false;
  }
}
