"""Tests for AquaSmart switch entities, exercised through a full config entry setup."""
from __future__ import annotations

from aioresponses import CallbackResult, aioresponses
from homeassistant.helpers import entity_registry as er

from custom_components.aquasmart_irrigation.const import DOMAIN

from .conftest import BASE_URL, MOCK_DISCOVERY, MOCK_STATUS


async def _entity_id(hass, config_entry, unique_suffix: str) -> str:
    registry = er.async_get(hass)
    entity_id = registry.async_get_entity_id("switch", DOMAIN, f"{config_entry.unique_id}_{unique_suffix}")
    assert entity_id is not None, f"No switch entity registered for unique_id suffix '{unique_suffix}'"
    return entity_id


async def test_main_water_switch_reflects_status_and_toggles(hass, mock_config_entry) -> None:
    with aioresponses() as m:
        m.get(f"{BASE_URL}/api/ha/v1/discovery", payload=MOCK_DISCOVERY)
        m.get(f"{BASE_URL}/api/ha/v1/status", payload=MOCK_STATUS)
        assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
        await hass.async_block_till_done()

    entity_id = await _entity_id(hass, mock_config_entry, "main_water")
    assert hass.states.get(entity_id).state == "on"

    with aioresponses() as m:
        m.post(f"{BASE_URL}/api/system/main_water", payload={"status": "success"})
        m.get(f"{BASE_URL}/api/ha/v1/status", payload={**MOCK_STATUS, "main_water_enabled": False})
        await hass.services.async_call("switch", "turn_off", {"entity_id": entity_id}, blocking=True)
        await hass.async_block_till_done()

    assert hass.states.get(entity_id).state == "off"


async def test_zone_switch_turn_on_calls_start_with_default_duration(hass, mock_config_entry) -> None:
    with aioresponses() as m:
        m.get(f"{BASE_URL}/api/ha/v1/discovery", payload=MOCK_DISCOVERY)
        m.get(f"{BASE_URL}/api/ha/v1/status", payload=MOCK_STATUS)
        assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
        await hass.async_block_till_done()

    entity_id = await _entity_id(hass, mock_config_entry, "zone_zone_1")

    captured_json: dict = {}

    def _capture_start_request(url, **kwargs) -> CallbackResult:
        captured_json.update(kwargs.get("json") or {})
        return CallbackResult(payload={"status": "success"})

    with aioresponses() as m:
        m.post(f"{BASE_URL}/api/zones/zone_1/start", callback=_capture_start_request)
        m.get(
            f"{BASE_URL}/api/ha/v1/status",
            payload={
                **MOCK_STATUS,
                "zones": {"zone_1": {**MOCK_STATUS["zones"]["zone_1"], "is_running": True}},
            },
        )
        await hass.services.async_call("switch", "turn_on", {"entity_id": entity_id}, blocking=True)
        await hass.async_block_till_done()

    assert captured_json == {"duration": 600}  # DEFAULT_ZONE_DURATION_SECONDS
    assert hass.states.get(entity_id).state == "on"
