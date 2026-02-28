import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useBleStore } from '../stores/bleStore';
import { bleService } from '../services/meshtastic/ble';
import { ConnectedDevice } from '../types';

export default function ScanScreen() {
  const { connectionState, discoveredDevices, connectedDevice, error } = useBleStore();

  useEffect(() => {
    return () => {
      bleService.stopScan();
    };
  }, []);

  const handleScan = () => {
    bleService.startScan();
  };

  const handleConnect = (device: ConnectedDevice) => {
    Alert.alert(
      'Connect to Node',
      `Connect to "${device.name ?? device.id}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Connect', onPress: () => bleService.connectToDevice(device.id) },
      ]
    );
  };

  const handleDisconnect = () => {
    Alert.alert('Disconnect', 'Disconnect from the current node?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Disconnect', style: 'destructive', onPress: bleService.disconnect },
    ]);
  };

  const isScanning = connectionState === 'scanning';
  const isConnected = connectionState === 'connected';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Node Connection</Text>

      {/* Connected device banner */}
      {isConnected && connectedDevice && (
        <View style={styles.connectedBanner}>
          <View>
            <Text style={styles.connectedLabel}>Connected</Text>
            <Text style={styles.connectedName}>{connectedDevice.name ?? connectedDevice.id}</Text>
          </View>
          <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
            <Text style={styles.disconnectBtnText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Scan button */}
      {!isConnected && (
        <TouchableOpacity
          style={[styles.scanBtn, isScanning && styles.scanBtnActive]}
          onPress={isScanning ? bleService.stopScan : handleScan}
        >
          {isScanning ? (
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          ) : null}
          <Text style={styles.scanBtnText}>
            {isScanning ? 'Scanning...' : 'Scan for Nodes'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Device list */}
      {discoveredDevices.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Nearby Meshtastic Nodes</Text>
          <FlatList
            data={discoveredDevices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.deviceRow} onPress={() => handleConnect(item)}>
                <View style={styles.deviceIcon}>
                  <Text style={styles.deviceIconText}>📡</Text>
                </View>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{item.name ?? 'Unknown Device'}</Text>
                  <Text style={styles.deviceId}>{item.id}</Text>
                </View>
                <Text style={styles.deviceArrow}>›</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {!isScanning && discoveredDevices.length === 0 && !isConnected && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No nodes found yet</Text>
          <Text style={styles.emptySubtitle}>
            Make sure your Meshtastic device is powered on and within Bluetooth range,
            then tap Scan.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 20 },

  connectedBanner: {
    backgroundColor: '#1a2e1a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2d5a2d',
  },
  connectedLabel: { fontSize: 11, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 1 },
  connectedName: { fontSize: 16, color: '#fff', fontWeight: '600', marginTop: 2 },
  disconnectBtn: {
    backgroundColor: '#2d1515',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#5a2d2d',
  },
  disconnectBtnText: { color: '#f87171', fontSize: 13, fontWeight: '600' },

  errorBanner: {
    backgroundColor: '#2d1515',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#5a2d2d',
  },
  errorText: { color: '#f87171', fontSize: 13 },

  scanBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  scanBtnActive: { backgroundColor: '#1e40af' },
  scanBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  sectionLabel: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  deviceRow: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceIconText: { fontSize: 20 },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 15, color: '#fff', fontWeight: '600' },
  deviceId: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  deviceArrow: { fontSize: 20, color: '#4b5563' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, color: '#fff', fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
});
