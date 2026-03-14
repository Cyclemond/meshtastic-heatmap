import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignalReading, HeatmapPoint } from '../types';

// Normalise RSSI to a 0-1 weight for heatmap rendering.
// Meshtastic RSSI typically ranges from -140 dBm (very weak) to -20 dBm (very strong).
const RSSI_MIN = -140;
const RSSI_MAX = -20;
const rssiToWeight = (rssi: number): number => {
  const clamped = Math.max(RSSI_MIN, Math.min(RSSI_MAX, rssi));
  return (clamped - RSSI_MIN) / (RSSI_MAX - RSSI_MIN);
};

const toHeatmapPoints = (readings: SignalReading[]): HeatmapPoint[] =>
  readings.map((r) => ({
    latitude: r.latitude,
    longitude: r.longitude,
    weight: rssiToWeight(r.rssi),
  }));

interface ReadingsStore {
  readings: SignalReading[];
  heatmapPoints: HeatmapPoint[];

  addReading: (reading: SignalReading) => void;
  markSynced: (id: string) => void;
  clearReadings: () => void;
  getUnsyncedReadings: () => SignalReading[];
}

export const useReadingsStore = create<ReadingsStore>()(
  persist(
    (set, get) => ({
      readings: [],
      heatmapPoints: [],

      addReading: (reading) =>
        set((s) => {
          const readings = [...s.readings, reading];
          return { readings, heatmapPoints: toHeatmapPoints(readings) };
        }),

      markSynced: (id) =>
        set((s) => ({
          readings: s.readings.map((r) =>
            r.id === id ? { ...r, synced: true } : r
          ),
        })),

      clearReadings: () => set({ readings: [], heatmapPoints: [] }),

      getUnsyncedReadings: () => get().readings.filter((r) => !r.synced),
    }),
    {
      name: 'readings-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist readings — heatmapPoints are derived and rebuilt on load.
      partialize: (state) => ({ readings: state.readings }),
      // After readings are rehydrated from storage, rebuild the heatmap points.
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.heatmapPoints = toHeatmapPoints(state.readings);
        }
      },
    }
  )
);
