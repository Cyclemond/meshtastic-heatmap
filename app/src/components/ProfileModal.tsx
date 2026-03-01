import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={styles.sheet}>
        <View style={styles.handle} />

        {/* Avatar */}
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={44} color="#9ca3af" />
        </View>
        <Text style={styles.userName}>Guest User</Text>
        <Text style={styles.userSub}>Sign-in coming in a future update</Text>

        {/* Settings rows */}
        <View style={styles.section}>
          <Row icon="person-outline" label="Account" value="Not signed in" />
          <Row icon="map-outline" label="Map Style" value="Dark" />
          <Row icon="pulse-outline" label="Data Collection" value="On" />
          <Row icon="information-circle-outline" label="Version" value="0.1.0" />
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon as any} size={19} color="#6b7280" style={styles.rowIcon} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#13151f',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#374151',
    marginTop: 12,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e2535',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 4,
  },
  userSub: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 28,
  },
  section: {
    width: '100%',
    backgroundColor: '#0f1117',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1e2535',
  },
  rowIcon: { marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 15, color: '#e5e7eb' },
  rowValue: { fontSize: 14, color: '#6b7280' },
  closeBtn: {
    width: '100%',
    backgroundColor: '#1e2535',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  closeBtnText: { color: '#f9fafb', fontSize: 16, fontWeight: '600' },
});
