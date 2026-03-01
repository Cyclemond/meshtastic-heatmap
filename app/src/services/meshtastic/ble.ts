/**
 * Meshtastic BLE Service
 *
 * Handles scanning for and connecting to a Meshtastic node via Bluetooth Low Energy.
 *
 * Meshtastic BLE interface:
 *   Service UUID:       6ba40001-1b01-3572-8d87-f8e38b0ffc14
 *   We scan by service UUID or by device name containing "Meshtastic" / "T-Beam" / "T-Lora" etc.
 *
 * NOTE: BLE requires a custom dev build (Expo Go does not support native BLE).
 * Run `npx expo run:ios` or `npx expo run:android` to test on device.
 */

import { BleManager, Device, State } from 'react-native-ble-plx';
import * as protobuf from 'protobufjs';
import { useBleStore } from '../../stores/bleStore';
import { useReadingsStore } from '../../stores/readingsStore';
import { useLocationStore } from '../../stores/locationStore';
import { SignalReading } from '../../types';

// ─── Meshtastic BLE UUIDs ─────────────────────────────────────────────────────
// These are the service and characteristic UUIDs for the Meshtastic BLE interface.
// See: https://github.com/meshtastic/firmware/blob/master/src/nimble/NimbleBluetooth.cpp
const MESHTASTIC_SERVICE_UUID = '6ba40001-1b01-3572-8d87-f8e38b0ffc14';
const FROMRADIO_CHAR_UUID = '2c55e69e-4993-11ed-b878-0242ac120002'; // Node → App (received packets)
const TORADIO_CHAR_UUID = 'f75c76d2-129e-4dad-a1dd-7866124401e7';   // App → Node (send packets)
const FROMNUM_CHAR_UUID = 'ed9da18c-a800-4f66-a670-aa7547b377f7';   // Notification: new packet waiting

// ─── Protobuf schema ──────────────────────────────────────────────────────────
// Minimal inline schema for the two Meshtastic message types we care about.
// Field numbers from https://github.com/meshtastic/protobufs/blob/master/meshtastic/mesh.proto
const protoRoot = protobuf.Root.fromJSON({
  nested: {
    meshtastic: {
      nested: {
        MeshPacket: {
          fields: {
            from:   { id: 1,  type: 'uint32', rule: 'optional' },
            rxSnr:  { id: 9,  type: 'float',  rule: 'optional' },
            rxRssi: { id: 13, type: 'int32',  rule: 'optional' },
          },
        },
        FromRadio: {
          fields: {
            packet: { id: 2, type: 'meshtastic.MeshPacket', rule: 'optional' },
          },
        },
      },
    },
  },
});
const FromRadioType = protoRoot.lookupType('meshtastic.FromRadio');

// Device name fragments used to identify Meshtastic nodes during scanning
const MESHTASTIC_DEVICE_NAMES = [
  'Meshtastic',
  'T-Beam',
  'T-Lora',
  'TTGO',
  'Heltec',
  'RAK',
  'Wisblock',
];

let bleManager: BleManager | null = null;

const getManager = (): BleManager => {
  if (!bleManager) {
    bleManager = new BleManager();
  }
  return bleManager;
};

const isMeshtasticDevice = (device: Device): boolean => {
  const name = device.name ?? '';
  return MESHTASTIC_DEVICE_NAMES.some((n) =>
    name.toLowerCase().includes(n.toLowerCase())
  );
};

// ─── Scan ─────────────────────────────────────────────────────────────────────

export const startScan = async (): Promise<void> => {
  const { setConnectionState, addDiscoveredDevice, clearDiscoveredDevices, setError } =
    useBleStore.getState();

  const manager = getManager();

  const bleState = await manager.state();
  if (bleState !== State.PoweredOn) {
    setError('Bluetooth is not enabled. Please enable Bluetooth and try again.');
    return;
  }

  clearDiscoveredDevices();
  setConnectionState('scanning');

  manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
    if (error) {
      setError(error.message);
      return;
    }
    if (device && isMeshtasticDevice(device)) {
      addDiscoveredDevice({ id: device.id, name: device.name });
    }
  });

  // Auto-stop scan after 15 seconds
  setTimeout(() => {
    stopScan();
  }, 15000);
};

export const stopScan = (): void => {
  getManager().stopDeviceScan();
  const { connectionState, setConnectionState } = useBleStore.getState();
  if (connectionState === 'scanning') {
    setConnectionState('idle');
  }
};

// ─── Connect ──────────────────────────────────────────────────────────────────

export const connectToDevice = async (deviceId: string): Promise<void> => {
  const { setConnectionState, setConnectedDevice, setError } = useBleStore.getState();
  const manager = getManager();

  stopScan();
  setConnectionState('connecting');

  try {
    const device = await manager.connectToDevice(deviceId);
    await device.discoverAllServicesAndCharacteristics();

    setConnectedDevice({ id: device.id, name: device.name });
    setConnectionState('connected');

    // Start listening for incoming packets
    startListening(device);

    // Handle unexpected disconnection
    device.onDisconnected(() => {
      setConnectionState('disconnected');
      setConnectedDevice(null);
    });
  } catch (err: any) {
    setError(err.message ?? 'Failed to connect to device');
  }
};

// ─── Listen for packets ───────────────────────────────────────────────────────

const startListening = (device: Device): void => {
  const { addReading } = useReadingsStore.getState();

  // Subscribe to the FROMNUM characteristic — Meshtastic notifies us when a
  // new packet is waiting in FROMRADIO. We then read FROMRADIO to get it.
  device.monitorCharacteristicForService(
    MESHTASTIC_SERVICE_UUID,
    FROMNUM_CHAR_UUID,
    async (_error, _characteristic) => {
      if (_error) return;

      try {
        // Read the actual packet from FROMRADIO
        const radioChar = await device.readCharacteristicForService(
          MESHTASTIC_SERVICE_UUID,
          FROMRADIO_CHAR_UUID
        );

        if (!radioChar.value) return;

        // The value is a base64-encoded protobuf (FromRadio message).
        // For Phase 1 we extract RSSI/SNR from the raw bytes.
        // Full protobuf parsing will be added in Phase 2.
        const packet = parseFromRadio(radioChar.value);
        if (!packet) return;

        const { currentLocation } = useLocationStore.getState();
        if (!currentLocation) return; // Can't record without GPS fix

        const reading: SignalReading = {
          id: generateId(),
          timestamp: Date.now(),
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          fromNodeId: packet.fromNodeId,
          rssi: packet.rssi,
          snr: packet.snr,
          synced: false,
        };

        addReading(reading);
      } catch (_) {
        // Packet read failed — skip silently
      }
    }
  );
};

// ─── Disconnect ───────────────────────────────────────────────────────────────

export const disconnect = async (): Promise<void> => {
  const { connectedDevice, setConnectionState, setConnectedDevice } = useBleStore.getState();
  if (!connectedDevice) return;

  try {
    await getManager().cancelDeviceConnection(connectedDevice.id);
  } catch (_) {
    // Ignore errors on disconnect
  } finally {
    setConnectionState('idle');
    setConnectedDevice(null);
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateId = (): string =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

/**
 * Decodes a base64-encoded Meshtastic FromRadio protobuf packet.
 * Extracts the sender node ID, RSSI, and SNR from the inner MeshPacket.
 */
const parseFromRadio = (
  base64Value: string
): { fromNodeId: string; rssi: number; snr: number } | null => {
  try {
    const bytes = Buffer.from(base64Value, 'base64');
    if (bytes.length < 2) return null;

    const message = FromRadioType.decode(bytes) as any;
    const pkt = message.packet;
    if (!pkt) return null;

    const rssi: number = pkt.rxRssi ?? -999;
    const snr: number = pkt.rxSnr ?? 0;
    // Meshtastic node IDs are 32-bit unsigned ints, conventionally displayed as !hex
    const fromNodeId: string = pkt.from
      ? `!${(pkt.from >>> 0).toString(16).padStart(8, '0')}`
      : '!unknown';

    return { fromNodeId, rssi, snr };
  } catch {
    return null;
  }
};

export const bleService = {
  startScan,
  stopScan,
  connectToDevice,
  disconnect,
};
