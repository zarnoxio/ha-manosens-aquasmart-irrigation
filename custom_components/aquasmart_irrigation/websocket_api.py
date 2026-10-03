"""
WebSocket API for the bundled Lovelace card (see frontend.py) - resolves a
device_id to the entity_ids the card needs per diagram role. Implemented
server-side in Python against the entity registry (not guessed client-side
from uncertain frontend-exposed registry fields) since we control the
unique_id naming scheme end-to-end - see
docs/implementation_plans/hydraulic_flow_diagram_card.md.
"""
from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er

from .const import DOMAIN


def _find(entries: list[er.RegistryEntry], suffix: str) -> str | None:
    return next((e.entity_id for e in entries if e.unique_id.endswith(suffix)), None)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "aquasmart_irrigation/diagram_entities",
        vol.Required("device_id"): str,
    }
)
@callback
def ws_diagram_entities(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    registry = er.async_get(hass)
    entries = er.async_entries_for_device(registry, msg["device_id"])

    # Every AquaSmart entity's unique_id is "<config_entry.unique_id>_<suffix>"
    # (see entity.py). zone_id itself is typically already "zone_10"-style (it
    # comes straight from the controller's own config.yaml zone key), so the
    # zone switch's suffix "zone_<zone_id>" can read as e.g. "zone_zone_10" -
    # ambiguous to split back apart by searching for "_zone_" as a substring.
    # Stripping the KNOWN config-entry-unique-id prefix instead is exact, no
    # matter what the zone_id itself looks like.
    config_entry_id = entries[0].config_entry_id if entries else None
    config_entry = hass.config_entries.async_get_entry(config_entry_id) if config_entry_id else None
    zone_prefix = f"{config_entry.unique_id}_zone_" if config_entry else None

    zones = []
    if zone_prefix:
        for entry in entries:
            if entry.domain == "switch" and entry.unique_id.startswith(zone_prefix):
                zone_id = entry.unique_id[len(zone_prefix):]
                zones.append(
                    {
                        "zone_id": zone_id,
                        "switch_entity_id": entry.entity_id,
                        "deficit_entity_id": _find(entries, f"zone_{zone_id}_water_deficit"),
                        "session_volume_entity_id": _find(entries, f"zone_{zone_id}_session_volume"),
                        "next_action_entity_id": _find(entries, f"zone_{zone_id}_next_action"),
                    }
                )

    connection.send_result(
        msg["id"],
        {
            "tank_level_entity_id": _find(entries, "_level"),
            "pressure_entity_id": _find(entries, "inverter_pressure"),
            "target_pressure_entity_id": _find(entries, "inverter_target_pressure"),
            "pump_running_entity_id": _find(entries, "inverter_running"),
            "pump_fault_entity_id": _find(entries, "inverter_fault"),
            "flow_rate_entity_id": _find(entries, "_flow_rate"),
            "flow_total_entity_id": _find(entries, "_total"),
            "main_water_entity_id": _find(entries, "main_water"),
            "zones": zones,
        },
    )


def async_register_websocket_api(hass: HomeAssistant) -> None:
    """Idempotent: safe to call once per config entry setup on a shared hass instance."""
    flag = f"{DOMAIN}_ws_registered"
    if hass.data.get(flag):
        return
    hass.data[flag] = True
    websocket_api.async_register_command(hass, ws_diagram_entities)
