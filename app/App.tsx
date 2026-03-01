import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SplashScreen from 'expo-splash-screen';

import MapScreen from './src/screens/MapScreen';
import ScanScreen from './src/screens/ScanScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LogoHeader from './src/components/LogoHeader';
import ProfileModal from './src/components/ProfileModal';
import { useBleStore } from './src/stores/bleStore';

// Keep the splash screen visible until we explicitly hide it
SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();

const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0f1117',
    card: '#13151f',
    text: '#ffffff',
    border: '#1e2535',
    primary: '#2563eb',
  },
};

export default function App() {
  const connectionState = useBleStore((s) => s.connectionState);
  const isConnected = connectionState === 'connected';
  const [profileVisible, setProfileVisible] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const AvatarButton = () => (
    <TouchableOpacity
      style={styles.avatarBtn}
      onPress={() => setProfileVisible(true)}
    >
      <Ionicons name="person" size={17} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <>
    <NavigationContainer theme={darkTheme}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#13151f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          headerRight: () => <AvatarButton />,
          tabBarStyle: { backgroundColor: '#13151f', borderTopColor: '#1e2535' },
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#6b7280',
        }}
      >
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
            headerTitle: () => <LogoHeader />,
            tabBarLabel: 'Heatmap',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{
            headerTitle: () => <LogoHeader />,
            tabBarLabel: 'Node',
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name={isConnected ? 'radio' : 'radio-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerTitle: () => <LogoHeader />,
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
    <ProfileModal visible={profileVisible} onClose={() => setProfileVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  avatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e2535',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});
