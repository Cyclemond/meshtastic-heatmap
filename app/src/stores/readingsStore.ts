import { create } from 'zustand';
import { SignalReading, HeatmapPoint } from '../types';

// Normalise RSSI to a 0-1 weight for heatmap rendering.
// Meshtastic RSSI typically ranges from -140 dBm (very weak) to -20 dBm (very strong).
const RSSI_MIN = -140;
const RSSI_MAX = -20;
const rssiToWeight = (rssi: number): number => {
  const clamped = Math.max(RSSI_MIN, Math.min(RSSI_MAX, rssi));
  return (clamped - RSSI_MIN) / (RSSI_MAX - RSSI_MIN);
};

interface ReadingsStore {
  readings: SignalReading[];
  heatmapPoints: HeatmapPoint[];

  addReading: (reading: SignalReading) => void;
  markSynced: (id: string) => void;
  clearReadings: () => void;
  getUnsyncedReadings: () => SignalReading[];
}

export const useReadingsStore = create<ReadingsStore>((set, get) => ({
  readings: [],
  heatmapPoints: [],

  addReading: (reading) =>
    set((s) => {
      const readings = [...s.readings, reading];
      const heatmapPoints: HeatmapPoint[] = readings.map((r) => ({
        latitude: r.latitude,
        longitude: r.longitude,
        weight: rssiToWeight(r.rssi),
      }));
      return { readings, heatmapPoints };
    }),

  markSynced: (id) =>
    set((s) => ({
      readings: s.readings.map((r) =>
        r.id === id ? { ...r, synced: true } : r
      ),
    })),

  clearReadings: () => set({ readings: [], heatmapPoints: [] }),

  getUnsyncedReadings: () => get().readings.filter((r) => !r.synced),
}));
