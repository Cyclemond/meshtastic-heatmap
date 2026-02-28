# Meshtastic Heatmap

A cross-platform app (iOS, Android, Web) that maps LoRa signal coverage from Meshtastic nodes as you travel. Connect your Meshtastic device via Bluetooth, walk or drive around, and watch a heatmap build up showing where signals are strongest.

## Project Structure

```
meshtastic-heatmap/
├── app/          # Expo app (iOS + Android + Web)
└── backend/      # FastAPI backend — Phase 2
```

## Phase Roadmap

| Phase | What ships |
|---|---|
| 1 (current) | BLE connection to node · GPS tracking · local heatmap |
| 2 | Backend API · user accounts · community map |
| 3 | App Store / Play Store · offline sync · background collection |

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode + CocoaPods
- Android: Android Studio

### Run the app

```bash
cd app
npm install
npx expo run:ios      # or run:android
```

> **Note:** BLE requires a custom dev build — Expo Go does not support it.
> Use `npx expo run:ios` / `npx expo run:android` to build directly to a device.

## Tech Stack

- **Frontend:** Expo (React Native), TypeScript, Zustand, React Navigation
- **Maps:** Google Maps (react-native-maps)
- **BLE:** react-native-ble-plx
- **Backend (Phase 2):** FastAPI, PostgreSQL + PostGIS, Supabase
