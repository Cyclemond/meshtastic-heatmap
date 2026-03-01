import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import MapView, { Heatmap, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useReadingsStore } from '../stores/readingsStore';
import { useLocationStore } from '../stores/locationStore';
import { useBleStore } from '../stores/bleStore';

export default function MapScreen() {
  const { heatmapPoints, readings } = useReadingsStore();
  const { currentLocation, isTracking, setCurrentLocation, setTracking, setPermissionGranted } =
    useLocationStore();
  const { connectionState } = useBleStore();

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    requestLocationPermission();
    return () => {
      locationSubscription.current?.remove();
    };
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      setPermissionGranted(true);
      startTracking();
    } else {
      Alert.alert(
        'Location Permission Required',
        'Location access is needed to map signal coverage. Please enable it in Settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const startTracking = async () => {
    setTracking(true);
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5, // Update every 5 metres of movement
        timeInterval: 3000,  // Or every 3 seconds, whichever comes first
      },
      (location) => {
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
        });
      }
    );
  };

  const isConnected = connectionState === 'connected';
  const isCollecting = isConnected && isTracking;

  const initialRegion: Region = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        // Default to centre of US if no location yet
        latitude: 39.5,
        longitude: -98.35,
        latitudeDelta: 50,
        longitudeDelta: 50,
      };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
        mapType="standard"
        customMapStyle={darkMapStyle}
        zoomEnabled
        scrollEnabled
        pitchEnabled
        rotateEnabled
        zoomControlEnabled
        zoomTapEnabled={false}
      >
        {heatmapPoints.length > 0 && Platform.OS !== 'web' && (
          <Heatmap
            points={heatmapPoints}
            opacity={0.8}
            radius={40}
            gradient={{
              colors: ['#00bcd4', '#4caf50', '#ffeb3b', '#ff5722'],
              startPoints: [0.1, 0.4, 0.7, 1.0],
              colorMapSize: 256,
            }}
          />
        )}
      </MapView>

      {/* Status bar overlay */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, { backgroundColor: isCollecting ? '#4ade80' : '#6b7280' }]} />
        <Text style={styles.statusText}>
          {isCollecting
            ? `Collecting — ${readings.length} reading${readings.length !== 1 ? 's' : ''}`
            : isConnected
            ? 'Connected — waiting for GPS'
            : 'Not collecting — connect a node'}
        </Text>
      </View>

      {/* Reading count badge */}
      {readings.length > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeNumber}>{readings.length}</Text>
          <Text style={styles.badgeLabel}>readings</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  statusBar: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(15, 17, 23, 0.85)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { color: '#d1d5db', fontSize: 13 },

  badge: {
    position: 'absolute',
    bottom: 32,
    right: 16,
    backgroundColor: 'rgba(15, 17, 23, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  badgeNumber: { color: '#60a5fa', fontSize: 22, fontWeight: '700' },
  badgeLabel: { color: '#9ca3af', fontSize: 11 },
});

// Google Maps dark style — keeps the map readable over a dark UI
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];
