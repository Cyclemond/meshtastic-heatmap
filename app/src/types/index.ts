// ─── Meshtastic Node ──────────────────────────────────────────────────────────

export interface MeshNode {
  nodeId: string;       // Meshtastic node ID (hex string, e.g. "!abc12345")
  longName: string;
  shortName: string;
  hardwareModel?: number;
  lastHeard?: number;   // Unix timestamp
}

// ─── Signal Reading ───────────────────────────────────────────────────────────
// One reading = "at this GPS location, I received a packet from fromNodeId
// with this signal quality."

export interface SignalReading {
  id: string;           // UUID generated locally
  timestamp: number;    // Unix timestamp (ms)
  latitude: number;
  longitude: number;
  fromNodeId: string;   // Which node transmitted the packet
  rssi: number;         // Received Signal Strength Indicator (dBm). Higher = better. Typical range: -140 to 0
  snr: number;          // Signal-to-Noise Ratio (dB). Higher = better
  channel?: string;     // Meshtastic channel name
  synced: boolean;      // Has this reading been uploaded to the backend?
}

// ─── Heatmap Point ────────────────────────────────────────────────────────────
// Derived from SignalReadings for rendering on the map

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;       // Normalised 0–1 (derived from RSSI)
}

// ─── BLE Connection State ─────────────────────────────────────────────────────

export type BleConnectionState =
  | 'idle'          // Not scanning, not connected
  | 'scanning'      // Scanning for devices
  | 'connecting'    // Attempting to connect
  | 'connected'     // Connected to a Meshtastic node
  | 'disconnected'  // Was connected, now disconnected
  | 'error';        // Error state

export interface ConnectedDevice {
  id: string;       // BLE device ID
  name: string | null;
  nodeId?: string;  // Meshtastic node ID once we read it
}
