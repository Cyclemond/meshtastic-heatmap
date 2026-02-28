import { create } from 'zustand';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

interface LocationStore {
  currentLocation: Location | null;
  isTracking: boolean;
  permissionGranted: boolean;

  setCurrentLocation: (location: Location) => void;
  setTracking: (tracking: boolean) => void;
  setPermissionGranted: (granted: boolean) => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  currentLocation: null,
  isTracking: false,
  permissionGranted: false,

  setCurrentLocation: (location) => set({ currentLocation: location }),
  setTracking: (tracking) => set({ isTracking: tracking }),
  setPermissionGranted: (granted) => set({ permissionGranted: granted }),
}));
