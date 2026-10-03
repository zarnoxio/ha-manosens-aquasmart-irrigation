# Per-zone manual-start duration — dashboard-configurable, always bounded

## Context

A zone switch (`switch.<zone>`) turning on must never run the zone indefinitely — that is exactly how a valve gets left open by mistake. The controller already enforces a hard auto-stop via `manual_end_time` (see `IrrigationEngine._evaluate_schedules` in the `aqua-smart` repo) regardless of Home Assistant, so this was never actually unbounded — but the duration used was a single integration-wide default (`default_zone_duration`, Options Flow, 600s), only changeable through Options or the `aquasmart_irrigation.start_zone` service, not from the dashboard itself.

The user wanted to set that duration per zone, right on the dashboard, without opening Developer Tools or the Options Flow.

## Design

- New `number` platform entity per zone: `number.<zone>_duration` (`custom_components/aquasmart_irrigation/number.py`), `AquaSmartZoneDurationNumber`, min 1 / max 86400 seconds.
- Lives **only in Home Assistant** — the controller has no concept of a stored per-zone duration override. Value is restored across HA restarts via `RestoreNumber` (confirmed available even on the older HA release this project's test suite targets), defaulting to the integration's configured `default_zone_duration` the first time.
- `AquaSmartDataUpdateCoordinator.zone_duration_numbers: dict[str, AquaSmartZoneDurationNumber]` (populated by `number.py`'s `async_setup_entry`) lets `switch.py`'s `AquaSmartZoneSwitch.async_turn_on()` read the *current* value directly from the live entity object — no entity_id guessing, no extra WS/REST round trip. Falls back to the integration-wide default if the number entity somehow isn't registered yet.
- `Platform.NUMBER` added to `PLATFORMS` in `__init__.py`.

## Zámerne mimo rozsahu

- No raw "open valve indefinitely" control exists anywhere in this integration (verified while scoping this change) — only the bounded `switch.<zone>`/`aquasmart_irrigation.start_zone` path. A separate concern (the `aqua-smart` controller's own Diagnostics-screen "Otvoriť ventil" button lacking *any* duration) was raised in the same conversation but is out of scope here — it lives in the controller repo, not this integration.
- No service/UI to change the *integration-wide* default from this number entity — that stays in Options Flow, unchanged.

## Tests

`tests/test_number.py`:
- New number entity defaults to the integration's configured default duration.
- Setting the number entity's value and then turning the zone switch on sends that (not the old default) as `duration` to `POST /api/zones/{id}/start` — proving the switch actually reads the live value, not just that the entity exists.

Verified: 12/12 Python tests (WSL, `pytest-homeassistant-custom-component`).
