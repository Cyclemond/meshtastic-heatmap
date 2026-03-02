# CLAUDE.md — Meshtastic Heatmap

## Project Overview
Cross-platform app (iOS, Android, Web) that maps LoRa signal coverage from Meshtastic nodes as a heatmap. The user carries a Meshtastic node, the app connects via Bluetooth, and as they travel it records signal strength + GPS coordinates to build a visual coverage map.

**GitHub:** https://github.com/Cyclemond/meshtastic-heatmap
**Owner:** Cyclemond (Ian Barton) — non-technical user, prefers clear explanations

---

## Project Structure

```
/Users/ianbarton/Documents/Meshtastic Heatmap/
├── CLAUDE.md
├── README.md
├── .gitignore
└── app/                          # Expo app (iOS + Android + Web)
    ├── app.config.js             # Expo config — reads from .env (NOT committed)
    ├── eas.json                  # EAS Build profiles (development / preview / production)
    ├── .env                      # Secret keys — NEVER commit this file
    ├── .env.example              # Template showing required env vars
    ├── App.tsx                   # Root — NavigationContainer + bottom tab navigator
    ├── index.ts                  # Expo entry point
    ├── package.json
    └── src/
        ├── types/index.ts        # Shared TypeScript types
        ├── components/
        │   ├── LogoHeader.tsx    # NodeGlow SVG logo shown in nav header
        │   └── ProfileModal.tsx  # Bottom sheet modal — avatar + settings rows
        ├── stores/
        │   ├── bleStore.ts       # BLE connection state (Zustand)
        │   ├── locationStore.ts  # GPS location state (Zustand)
        │   └── readingsStore.ts  # Signal readings + heatmap points (Zustand)
        ├── services/meshtastic/
        │   └── ble.ts            # BLE scan/connect/listen + protobuf parsing
        └── screens/
            ├── MapScreen.tsx     # Google Maps with heatmap overlay
            ├── ScanScreen.tsx    # Scan for and connect to Meshtastic nodes
            └── SettingsScreen.tsx
```

**Backend (Phase 2 — not yet created):** `backend/` — FastAPI + PostgreSQL + PostGIS + Supabase

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 55, React Native 0.83 |
| Language | TypeScript |
| State | Zustand |
| Navigation | React Navigation (bottom tabs) |
| Maps | react-native-maps (Google Maps provider) |
| BLE | react-native-ble-plx |
| Location | expo-location |
| Build/Distribution | EAS Build (Expo Application Services) |
| Backend (Phase 2) | FastAPI (Python), Supabase (PostgreSQL + PostGIS) |

---

## Environment Setup

### Prerequisites (all installed)
- Node.js v25.6.1
- Android Studio + Android SDK (`~/Library/Android/sdk`)
- Java 21 (bundled with Android Studio)
- EAS CLI (`npm install -g eas-cli`) — logged in as `cycelmond`

### Shell env vars (in `~/.zshrc`)
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH=$PATH:$JAVA_HOME/bin
```
After any change: `source ~/.zshrc`

### Running on emulator
```bash
# Claude Code's bash tool needs explicit paths:
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
ANDROID_HOME="/Users/ianbarton/Library/Android/sdk" \
PATH="/opt/homebrew/bin:/bin:/usr/bin:/Users/ianbarton/Library/Android/sdk/platform-tools:/Users/ianbarton/Library/Android/sdk/emulator:$PATH" \
/bin/zsh -c 'cd "/Users/ianbarton/Documents/Meshtastic Heatmap/app" && npx expo run:android'
```

> **First build takes ~8 minutes.** Subsequent builds are under 60 seconds.

### Android emulator
Two AVDs available: `Pixel_8` (preferred) and `Medium_Phone_API_36.1`
```bash
# Start emulator manually if needed
~/Library/Android/sdk/emulator/emulator -avd Pixel_8 -no-snapshot-load &disown
```

**Emulator gestures (Mac):**
- Pinch to zoom: hold **Cmd** and drag (not Ctrl)
- The +/− zoom buttons on the map are easier for zooming in the emulator

### Building for real device (EAS Build)
```bash
cd "/Users/ianbarton/Documents/Meshtastic Heatmap/app"
eas build --platform android --profile preview --non-interactive
```
- Produces a standalone APK (no Mac needed to run it)
- Download link + QR code printed at end of build (~10–15 min)
- User installs via Google Drive or direct download on phone
- EAS account: `cycelmond` at expo.dev
- EAS project ID: `5cef8864-6c74-444a-a179-fce40638ff74`

---

## Environment Variables

### Local (in `app/.env`, git-ignored — never commit)
| Variable | Purpose |
|---|---|
| `GOOGLE_MAPS_API_KEY` | Google Maps SDK (iOS, Android, Web) |

### EAS secrets (stored on Expo's servers for cloud builds)
| Variable | Environment | Purpose |
|---|---|---|
| `GOOGLE_MAPS_API_KEY` | preview | Same key — required for EAS builds or the app crashes on launch |

To add/update an EAS secret:
```bash
eas env:create --scope project --name GOOGLE_MAPS_API_KEY --value "KEY" \
  --type string --visibility secret --environment preview --non-interactive
```

---

## Key Technical Decisions

### BLE approach
- App connects **directly** to the Meshtastic node via BLE — does not go through the Meshtastic app
- Uses the documented Meshtastic BLE GATT interface (FROMRADIO / FROMNUM / TORADIO characteristics)
- **Requires a custom dev build** — does NOT work in Expo Go
- A Meshtastic node can only hold **one BLE connection at a time** — the Meshtastic app must be disconnected before our app can connect
- BLE does **not** require Android pairing — connection is direct GATT without a pairing dialog

### BLE permissions (Android 12+)
- Runtime permissions must be explicitly requested before scanning, not just declared in the manifest
- `ble.ts` calls `requestBluetoothPermissions()` at the start of every scan
- Requests: `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `ACCESS_FINE_LOCATION`
- Android < 12 only needs `ACCESS_FINE_LOCATION`

### Protobuf parsing
- `ble.ts` uses a hand-rolled binary protobuf decoder (no third-party library)
- **Do NOT use `protobufjs`** — it crashes on startup with the Hermes JS engine used in production/release builds
- The decoder handles: `FromRadio.packet` (field 2), `MeshPacket.from` (field 1, uint32), `MeshPacket.rx_snr` (field 9, float32), `MeshPacket.rx_rssi` (field 13, int32)
- Do NOT add `import { Buffer } from 'buffer'` — `Buffer` is a React Native global and the `buffer` package is not installed

### GPS strategy
- Phone GPS (`expo-location`) is the **primary** source for heatmap coordinates
- Node GPS (from Meshtastic position packets) is a future enhancement — not required
- Nodes without GPS work fine

### Signal data model
- Each reading = `{ timestamp, lat, lng, fromNodeId, rssi, snr }`
- RSSI range: -140 dBm (weakest) → -20 dBm (strongest)
- Normalised to 0–1 weight for Google Maps Heatmap layer

### Android icon / splash
- Android uses WebP files in `android/app/src/main/res/mipmap-*/` — changing PNGs in `assets/` alone does nothing
- Run `npx expo prebuild --platform android` to regenerate WebP files from updated PNGs
- Icon source: `assets/_icon_wrapper2.svg` → `assets/icon.png` (1024×1024)
- Foreground source: `assets/_foreground_wrapper.svg` → `assets/android-icon-foreground.png` (transparent bg, 55% safe zone)
- Splash source: `assets/splash-icon.png` (1080×1920)

### Gradle version
- Generated Android folder uses Gradle 8.13 (downgraded from 9.0.0 — incompatible with React Native 0.83)
- Set in `app/android/gradle/wrapper/gradle-wrapper.properties`
- Do not upgrade to Gradle 9.x until React Native supports it

### Meshtastic device name filter
Devices are identified during BLE scan by name fragments:
`Meshtastic`, `T-Beam`, `T-Lora`, `TTGO`, `Heltec`, `RAK`, `Wisblock`
User's node: **Heltec v3** — confirmed covered by filter.
If a node isn't found, check its BLE name with **nRF Connect** app (Play Store).

---

## Phase Roadmap

| Phase | Status | What it delivers |
|---|---|---|
| 1 | ✅ In progress | BLE connection · GPS tracking · local heatmap · real device testing working |
| 2 | Pending | Backend API · Supabase · user accounts · community map |
| 3 | Pending | App Store / Play Store · offline sync · background collection |

---

## Git Workflow

- Always commit after completing a meaningful piece of work
- Use descriptive commit messages (format: `feat:`, `fix:`, `chore:`)
- Never commit `.env` files or API keys
- Push to `main` on GitHub after each commit

```bash
cd "/Users/ianbarton/Documents/Meshtastic Heatmap"
git add <files>
git commit -m "feat: description of change"
git push
```

---

## Things to Know About the User

- Non-technical — always explain what a command does before running it
- Prefers step-by-step guidance for anything outside the IDE
- Has a Samsung Galaxy phone (work profile present — avoid requiring USB debugging on it)
- Testing on real Samsung device via EAS preview builds (and Pixel 8 emulator)
- GitHub account: Cyclemond
- Expo account: cycelmond (note spelling — not "cyclemond")
- Node hardware: Heltec v3
