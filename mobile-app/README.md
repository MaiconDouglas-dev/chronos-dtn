# Chronos DTN - Relativistic Sync Console 🚀🌙

Welcome to the **Chronos DTN Mobile Application**, the front-end control console for the Lunar-Earth Interplanetary Financial & Network Router. 

This React Native app is built using **Expo** and **Expo Router (File-based Routing)**. It provides deep-space operators with real-time interplanetary telemetry, relativistic time auditing (compensating for Lunar-Earth clock drift), node configurations, and DTN (Delay-Tolerant Networking) packet retention queue controls.

---

## 🛠️ Architecture & Folder Layout

The app's files are structured cleanly in the `src/` directory to isolate views, components, and services:

```text
mobile-app/
├── assets/                  # App icon, splash, and media assets
├── src/
│   ├── app/                 # Expo Router file-based screens layout
│   │   ├── (tabs)/          # Tab navigation page group
│   │   │   ├── _layout.tsx  # Space-styled bottom tab bar
│   │   │   ├── index.tsx    # Dashboard (interplanetary telemetry)
│   │   │   ├── auditor.tsx  # Time Auditor (LTC vs UTC relativistic drift log)
│   │   │   ├── nodes.tsx    # Satellite Connectivity Nodes CRUD manager
│   │   │   ├── buffer.tsx   # DTN Buffer Retention Queue & transmission triggers
│   │   │   └── profile.tsx  # Access Profile (API Server configuration & JWT authentication)
│   │   ├── _layout.tsx      # Main application provider and alert overlays
│   │   └── index.tsx        # Entry component redirecting to the tab system
│   ├── components/          # Premium UI components
│   │   ├── SpaceBackground.tsx # Ambient space gradient background
│   │   ├── SpaceCard.tsx       # Glowing cards for lists/details
│   │   ├── SpaceButton.tsx     # Stylized primary/secondary/danger action buttons
│   │   ├── SpaceInput.tsx      # High-fidelity form fields with focus glows
│   │   ├── SpaceLoader.tsx     # Orbital transmission screen-wide modal spinner
│   │   └── Header.tsx          # Operator badge, connection indicator, and console header
│   └── services/            # Axios API client, SecureStore persistence, and React Context
│       ├── api.ts           # Axios client with interceptors for JWT injection and loading tracking
│       ├── storage.ts       # SecureStore storage management with Web localStorage fallbacks
│       └── AppContext.tsx   # React context managing configurations and credentials
├── package.json             # NPM package dependencies
├── app.json                 # Expo project configuration
└── tsconfig.json            # TypeScript configuration
```

---

## 🚀 Key Features

1. **Dashboard (Interplanetary Telemetry):**
   * Real-time metrics showing connection signal strength (Excellent, Weak, Disconnected).
   * Visual indicators of Earth Link roundtrip latency (~2.56 seconds nominal) and Lunar Surface delay (~10ms nominal).
   * Direct tracking of Relativistic Time Drift (Moon local LTC clock runs fast by **~56 microseconds/day** compared to Earth UTC).
   * DTN buffer capacity gauge displaying retained packet volumes.

2. **Time Auditor (Relativistic Sync):**
   * Comprehensive historical timeline auditing lunar transactions.
   * Visual comparisons of Raw Lunar Time (LTC) vs Compensated Earth Time (UTC) down to microsecond fidelity.
   * Interactive **"Simulate"** button to mock drift transactions locally (adding custom ledger credit values and cryptographically hashed transaction receipts).

3. **Satellite Connectivity Nodes Manager (CRUD):**
   * Administrative view of orbital relays (LOP-G Gateway, Shackleton Base, etc.).
   * Inline deployments/edits for node names, nominal latencies, throughput speeds, and status values (ONLINE, DEGRADED, OFFLINE).
   * Confirmation dialogs for decommissioning/deleting nodes.

4. **DTN Retention Queue (Fault-Tolerant Router):**
   * Detailed listing of Bundle Protocol packets stored in the buffer during lunar link blackouts.
   * Inspects detailed bundle destinations (`dtn://earth.gateway`), priorities (HIGH, MEDIUM, LOW), size in KB, and retry failure thresholds.
   * "Force Transmission" overrides allowing operators to retry routing individual bundles or transmit the entire buffer synchronously.

5. **Access Profile & Configurations:**
   * Custom server URL input targeting gateway nodes (supports Android emulator network routes).
   * Operator Authentication with registration codes (e.g. `AETHER-LUN-01`, `SELENE-FIN-02`).
   * Ping diagnostic tool displaying active route response latency in milliseconds.
   * Automatic redirection to login settings upon encountering invalid credentials (401 Unauthorized interceptor).

---

## 💾 State Management & Axios Interceptors

* **Persistence:** Operator JWT tokens, credentials, and custom target URLs are persisted locally using `expo-secure-store`. The storage service automatically falls back to `localStorage` when running on a web browser, preventing platform crashes.
* **Axios Request Interceptor:** Injects the active operator `Bearer JWT` token from secure storage and changes the target `baseURL` dynamically based on the operator's config.
* **Axios Response Interceptor:** Hooks into the global `AppProvider` to toggle the full-screen `SpaceLoader` spinner during active transmissions. Any network failures are captured and displayed globally via a dismissible top alert banner. Encountering a `401 Unauthorized` triggers session revocations and redirects the screen to the profile authorization form.
* **Dual Operation Mode:** If the connection to the custom backend server fails, the services automatically fall back to simulated offline operations. This displays a warning badge but allows testing all CRUD operations, audits, and DTN transmissions seamlessly via local react state!

---

## ⚡ Execution Instructions

Follow these instructions to run the application on your system:

### 1. Prerequisite Installations
Ensure you have Node.js (v18+) and npm installed. Check versions using:
```bash
node -v
npm -v
```

### 2. Startup CLI
From the directory `C:/Users/maico/.gemini/antigravity/scratch/chronos-dtn/mobile-app`, start the Expo developer console:
```bash
npm start
```
*Alternatively, you can start the application directly in specific environments:*
* **Web Browser:** Press `w` in the terminal or run `npm run web`.
* **Android Emulator/Device:** Press `a` or run `npm run android`.
* **iOS Simulator:** Press `i` or run `npm run ios`.

### 3. Connection & Logins
Once the app is running:
1. Navigate to the **Acesso** (Profile) tab.
2. In the connection section, set your target server URL (e.g., `http://localhost:3000/api` or `http://10.0.2.2:3000/api` if testing in Android emulator).
3. Test connectivity using **Ping Diagnostic**.
4. In the Operator Login form, input code `AETHER-LUN-01` or `SELENE-FIN-02` and click **Authenticate** to authorize your interplanetary session.
