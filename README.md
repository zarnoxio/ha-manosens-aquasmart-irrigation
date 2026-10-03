# AquaSmart Irrigation Controller — Home Assistant integration

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

Home Assistant custom integration for the [AquaSmart irrigation controller](https://github.com/YOUR_GITHUB_USERNAME/aqua-smart) (STM32MP157-based irrigation system). Connects over the controller's REST + WebSocket API — **no MQTT required**.

## Features

- Real-time state via WebSocket push (`local_push`): zones, valves, the frequency inverter (pump), suspension/vacation mode, winter mode.
- Switches: main water supply, winter mode, vacation mode, and one per irrigation zone. A zone switch **always** turns the zone on for a bounded duration, never indefinitely — the controller enforces the cutoff itself, independent of Home Assistant.
- Numbers: per-zone manual-start duration (`number.<zone>_duration`, default 600s/10min, 1–86400s) — adjust right from the dashboard how long `switch.<zone>` runs for; persists across HA restarts.
- Sensors: inverter pressure/frequency/current, per-zone water deficit, session volume and next scheduled action, tank level, flow rate and totalizer.
- Binary sensors: inverter fault, inverter running, suspended.
- Buttons: force-close all valves, reset inverter fault.
- Services: `aquasmart_irrigation.start_zone` (custom duration), `aquasmart_irrigation.suspend` (hours or vacation mode).
- Config Flow setup (no YAML), with automatic re-authentication if the API token is revoked.
- **AquaSmart Flow Card** — a Lovelace dashboard card showing a real-time hydraulic diagram (tank → pump/pressure → flow meter → zones), mirroring the controller's own web UI. Registered automatically after setup, no manual "Resources" step. Add it via **Edit Dashboard → Add Card → AquaSmart Flow Card** and pick your controller device.

## Requirements

- A running AquaSmart irrigation controller reachable from Home Assistant on your LAN.
- An **API token** generated from the controller's own web UI: open **Konfigurácia → API tokeny pre integrácie**, enter a name (e.g. `home-assistant`), click **Vygenerovať token**, and copy the value shown — it is only displayed once.

## Installation

### Via HACS (recommended)

1. HACS → ⋮ → **Custom repositories** → add this repository's URL, category **Integration**.
2. Install **AquaSmart Irrigation Controller** from HACS.
3. Restart Home Assistant.

### Manual

Copy `custom_components/aquasmart_irrigation/` into your Home Assistant `config/custom_components/` directory, then restart Home Assistant.

## Setup

**Settings → Devices & Services → Add Integration → AquaSmart Irrigation Controller**, then enter:

- **Host** — the controller's IP address or hostname.
- **Port** — default `8000`.
- **API token** — generated as described above.

## Services

| Service | Description |
|---|---|
| `aquasmart_irrigation.start_zone` | Start a specific zone for a custom duration (seconds), overriding its schedules. |
| `aquasmart_irrigation.suspend` | Pause all scheduled irrigation for a number of hours, or indefinitely (vacation mode). |

## Compatibility

This integration targets the controller's `/api/ha/v1/*` contract, `schema_version: 1`. If the controller reports a different schema version, setup will fail with a clear error rather than behaving unpredictably — update this integration (or the controller) to matching versions.

## Development

Python (integration):

```bash
pip install -r requirements_test.txt
pytest
```

Frontend (AquaSmart Flow Card — Lit + TypeScript, built with esbuild):

```bash
cd frontend
npm install
npm run typecheck
npm test              # runs in a real headless Chromium via @web/test-runner
npm run build         # regenerates ../custom_components/aquasmart_irrigation/www/aquasmart-flow-card.js
```

The built `www/aquasmart-flow-card.js` is committed to the repo (HACS installs only copy `custom_components/`, no Node/npm on the end user's Home Assistant). After changing anything under `frontend/src/`, always run `npm run build` and commit the regenerated file — CI fails the build if it's out of sync with the source.

## License

MIT — see [LICENSE](LICENSE).
