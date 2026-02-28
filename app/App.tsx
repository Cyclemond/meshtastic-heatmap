import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import MapScreen from './src/screens/MapScreen';
import ScanScreen from './src/screens/ScanScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { useBleStore } from './src/stores/bleStore';

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

  return (
    <NavigationContainer theme={darkTheme}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#13151f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          tabBarStyle: { backgroundColor: '#13151f', borderTopColor: '#1e2535' },
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#6b7280',
        }}
      >
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
            title: 'Heatmap',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🗺️</Text>,
          }}
        />
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{
            title: 'Node',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 20 }}>
                {isConnected ? '📡' : '🔍'}
              </Text>
            ),
            tabBarBadge: isConnected ? undefined : undefined,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
