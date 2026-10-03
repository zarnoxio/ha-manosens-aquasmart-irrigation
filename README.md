# AquaSmart Irrigation Controller — Home Assistant integration

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

Home Assistant custom integration for the [AquaSmart irrigation controller](https://github.com/YOUR_GITHUB_USERNAME/aqua-smart) (STM32MP157-based irrigation system). Connects over the controller's REST + WebSocket API — **no MQTT required**.

## Features

- Real-time state via WebSocket push (`local_push`): zones, valves, the frequency inverter (pump), suspension/vacation mode, winter mode.
- Switches: main water supply, winter mode, vacation mode, and one per irrigation zone.
- Sensors: inverter pressure/frequency/current, per-zone water deficit and next scheduled action, tank level, flow rate and totalizer.
- Binary sensors: inverter fault, inverter running, suspended.
- Buttons: force-close all valves, reset inverter fault.
- Services: `aquasmart_irrigation.start_zone` (custom duration), `aquasmart_irrigation.suspend` (hours or vacation mode).
- Config Flow setup (no YAML), with automatic re-authentication if the API token is revoked.

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

```bash
pip install -r requirements_test.txt
pytest
```

## License

MIT — see [LICENSE](LICENSE).
