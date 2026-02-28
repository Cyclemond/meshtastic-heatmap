import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useReadingsStore } from '../stores/readingsStore';
import { useBleStore } from '../stores/bleStore';

export default function SettingsScreen() {
  const { readings, clearReadings } = useReadingsStore();
  const { connectedDevice, connectionState } = useBleStore();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Readings',
      `This will permanently delete all ${readings.length} local signal readings. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearReadings,
        },
      ]
    );
  };

  const unsynced = readings.filter((r) => !r.synced).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Stats section */}
      <Text style={styles.sectionLabel}>Local Data</Text>
      <View style={styles.card}>
        <Row label="Total readings" value={String(readings.length)} />
        <Row label="Pending sync" value={String(unsynced)} />
        <Row
          label="BLE status"
          value={connectionState}
          valueColor={connectionState === 'connected' ? '#4ade80' : '#9ca3af'}
        />
        {connectedDevice && (
          <Row label="Connected node" value={connectedDevice.name ?? connectedDevice.id} />
        )}
      </View>

      {/* Danger zone */}
      <Text style={styles.sectionLabel}>Data Management</Text>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.dangerRow}
          onPress={handleClearData}
          disabled={readings.length === 0}
        >
          <Text style={[styles.dangerText, readings.length === 0 && styles.dimText]}>
            Clear all local readings
          </Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <Text style={styles.sectionLabel}>About</Text>
      <View style={styles.card}>
        <Row label="Version" value="0.1.0 (Phase 1)" />
        <Row label="Project" value="Meshtastic Heatmap" />
      </View>
    </View>
  );
}

interface RowProps {
  label: string;
  value: string;
  valueColor?: string;
}

function Row({ label, value, valueColor = '#9ca3af' }: RowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 24 },

  sectionLabel: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },

  card: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2d3748',
  },
  rowLabel: { fontSize: 15, color: '#e5e7eb' },
  rowValue: { fontSize: 15 },

  dangerRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dangerText: { fontSize: 15, color: '#f87171' },
  dimText: { opacity: 0.4 },
});
