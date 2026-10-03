"""Tests for the aquasmart_irrigation/diagram_entities WebSocket command used by the Lovelace card."""
from __future__ import annotations

from aioresponses import aioresponses
from homeassistant.helpers import device_registry as dr

from custom_components.aquasmart_irrigation.const import DOMAIN

from .conftest import BASE_URL, MOCK_DISCOVERY, MOCK_STATUS


async def _setup_and_get_device_id(hass, mock_config_entry) -> str:
    with aioresponses() as m:
        m.get(f"{BASE_URL}/api/ha/v1/discovery", payload=MOCK_DISCOVERY)
        m.get(f"{BASE_URL}/api/ha/v1/status", payload=MOCK_STATUS)
        assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
        await hass.async_block_till_done()

    registry = dr.async_get(hass)
    device = registry.async_get_device(identifiers={(DOMAIN, mock_config_entry.unique_id)})
    assert device is not None
    return device.id


async def test_diagram_entities_resolves_all_roles(hass, mock_config_entry, hass_ws_client) -> None:
    device_id = await _setup_and_get_device_id(hass, mock_config_entry)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": "aquasmart_irrigation/diagram_entities", "device_id": device_id})
    response = await client.receive_json()

    assert response["success"] is True
    result = response["result"]

    assert result["tank_level_entity_id"] is not None
    assert result["pressure_entity_id"] is not None
    assert result["target_pressure_entity_id"] is not None
    assert result["pump_running_entity_id"] is not None
    assert result["pump_fault_entity_id"] is not None
    assert result["flow_rate_entity_id"] is None  # MOCK_DISCOVERY has no flow sensor
    assert result["flow_total_entity_id"] is None
    assert result["main_water_entity_id"] is not None

    assert len(result["zones"]) == 1
    zone = result["zones"][0]
    assert zone["zone_id"] == "zone_1"
    assert zone["switch_entity_id"] is not None
    assert zone["deficit_entity_id"] is not None
    assert zone["session_volume_entity_id"] is not None
    assert zone["next_action_entity_id"] is not None


async def test_diagram_entities_unknown_device_returns_empty_mapping(hass, mock_config_entry, hass_ws_client) -> None:
    await _setup_and_get_device_id(hass, mock_config_entry)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {"type": "aquasmart_irrigation/diagram_entities", "device_id": "does-not-exist"}
    )
    response = await client.receive_json()

    assert response["success"] is True
    assert response["result"]["tank_level_entity_id"] is None
    assert response["result"]["zones"] == []
