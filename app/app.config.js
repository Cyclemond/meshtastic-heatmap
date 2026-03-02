import 'dotenv/config';

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!googleMapsApiKey) {
  console.warn(
    '\n⚠️  GOOGLE_MAPS_API_KEY is not set.\n' +
    '   Copy app/.env.example to app/.env and add your key.\n'
  );
}

export default {
  expo: {
    name: 'Meshtastic Heatmap',
    slug: 'meshtastic-heatmap',
    owner: 'cycelmond',
    version: '0.1.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0f1117',
    },

    // ── iOS ────────────────────────────────────────────────────────────────────
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.cyclemond.meshtastic-heatmap',
      config: {
        googleMapsApiKey,
      },
      infoPlist: {
        NSBluetoothAlwaysUsageDescription:
          'Bluetooth is used to connect to your Meshtastic node to collect signal data.',
        NSBluetoothPeripheralUsageDescription:
          'Bluetooth is used to connect to your Meshtastic node to collect signal data.',
        NSLocationWhenInUseUsageDescription:
          'Location is used to map signal coverage while you move.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'Location is used to map signal coverage while you move.',
        UIBackgroundModes: ['bluetooth-central', 'location'],
      },
    },

    // ── Android ────────────────────────────────────────────────────────────────
    android: {
      package: 'com.cyclemond.meshtasticheatmap',
      adaptiveIcon: {
        backgroundColor: '#0f1117',
        foregroundImage: './assets/android-icon-foreground.png',
      },
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
      permissions: [
        'BLUETOOTH',
        'BLUETOOTH_ADMIN',
        'BLUETOOTH_SCAN',
        'BLUETOOTH_CONNECT',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'FOREGROUND_SERVICE',
      ],
    },

    // ── Web ────────────────────────────────────────────────────────────────────
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },

    // ── Extra (accessible inside the app via Constants.expoConfig.extra) ───────
    extra: {
      googleMapsApiKey,
      eas: {
        projectId: '5cef8864-6c74-444a-a179-fce40638ff74',
      },
    },

    // ── Plugins ────────────────────────────────────────────────────────────────
    plugins: [
      'expo-dev-client',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#0f1117',
          image: './assets/splash-icon.png',
          imageWidth: 400,
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Location is used to map signal coverage while you move.',
        },
      ],
    ],
  },
};
