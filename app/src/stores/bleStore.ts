import { create } from 'zustand';
import { BleConnectionState, ConnectedDevice } from '../types';

interface BleStore {
  connectionState: BleConnectionState;
  connectedDevice: ConnectedDevice | null;
  discoveredDevices: ConnectedDevice[];
  error: string | null;

  setConnectionState: (state: BleConnectionState) => void;
  setConnectedDevice: (device: ConnectedDevice | null) => void;
  addDiscoveredDevice: (device: ConnectedDevice) => void;
  clearDiscoveredDevices: () => void;
  setError: (error: string | null) => void;
}

export const useBleStore = create<BleStore>((set) => ({
  connectionState: 'idle',
  connectedDevice: null,
  discoveredDevices: [],
  error: null,

  setConnectionState: (state) => set({ connectionState: state, error: null }),
  setConnectedDevice: (device) => set({ connectedDevice: device }),
  addDiscoveredDevice: (device) =>
    set((s) => {
      const exists = s.discoveredDevices.some((d) => d.id === device.id);
      if (exists) return s;
      return { discoveredDevices: [...s.discoveredDevices, device] };
    }),
  clearDiscoveredDevices: () => set({ discoveredDevices: [] }),
  setError: (error) => set({ error, connectionState: 'error' }),
}));
