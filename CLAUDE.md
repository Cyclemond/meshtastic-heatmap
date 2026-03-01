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
    ├── .env                      # Secret keys — NEVER commit this file
    ├── .env.example              # Template showing required env vars
    ├── App.tsx                   # Root — NavigationContainer + bottom tab navigator
    ├── index.ts                  # Expo entry point
    ├── package.json
    └── src/
        ├── types/index.ts        # Shared TypeScript types
        ├── stores/
        │   ├── bleStore.ts       # BLE connection state (Zustand)
        │   ├── locationStore.ts  # GPS location state (Zustand)
        │   └── readingsStore.ts  # Signal readings + heatmap points (Zustand)
        ├── services/meshtastic/
        │   └── ble.ts            # BLE scan/connect/listen logic
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
| Backend (Phase 2) | FastAPI (Python), Supabase (PostgreSQL + PostGIS) |

---

## Environment Setup

### Prerequisites (all installed)
- Node.js v25.6.1
- Android Studio + Android SDK (`~/Library/Android/sdk`)
- Java 21 (bundled with Android Studio)

### Shell env vars (in `~/.zshrc`)
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH=$PATH:$JAVA_HOME/bin
```
After any change: `source ~/.zshrc`

### Running the app
```bash
cd app
npx expo run:android   # Build + install on emulator or connected device
npx expo run:ios       # (requires Xcode — not yet set up)
```

> **First build takes ~8 minutes.** Subsequent builds are under 60 seconds.

### Android emulator
Two AVDs available: `Pixel_8` (preferred) and `Medium_Phone_API_36.1`
```bash
# Start emulator manually if needed
~/Library/Android/sdk/emulator/emulator -avd Pixel_8 -no-snapshot-load &
```

---

## Environment Variables

Stored in `app/.env` (git-ignored). Never commit this file.

| Variable | Purpose |
|---|---|
| `GOOGLE_MAPS_API_KEY` | Google Maps SDK (iOS, Android, Web) |

See `app/.env.example` for the template.

---

## Key Technical Decisions

### BLE approach
- App connects **directly** to the Meshtastic node via BLE — does not go through the Meshtastic app
- Uses the documented Meshtastic BLE GATT interface (FROMRADIO / FROMNUM / TORADIO characteristics)
- **Requires a custom dev build** — does NOT work in Expo Go

### Signal data model
- Each reading = `{ timestamp, lat, lng, fromNodeId, rssi, snr }`
- RSSI range: -140 dBm (weakest) → -20 dBm (strongest)
- Normalised to 0–1 weight for Google Maps Heatmap layer

### Protobuf parsing
- `ble.ts` currently uses **placeholder RSSI values** (-80 / 5)
- Full Meshtastic protobuf decoding is Phase 2 work
- Will use the `meshtastic` npm package (includes compiled proto definitions)

### Gradle version
- Generated Android folder uses Gradle 8.13 (downgraded from 9.0.0 — incompatible with React Native 0.83)
- Set in `app/android/gradle/wrapper/gradle-wrapper.properties`
- Do not upgrade to Gradle 9.x until React Native supports it

---

## Phase Roadmap

| Phase | Status | What it delivers |
|---|---|---|
| 1 | ✅ In progress | BLE connection · GPS tracking · local heatmap · Android emulator working |
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
- Currently testing on Android emulator (Pixel 8, API 36.1)
- GitHub account: Cyclemond
