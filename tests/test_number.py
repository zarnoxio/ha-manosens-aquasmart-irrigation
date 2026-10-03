"""
Tests for the per-zone duration number entity and its effect on the zone
switch - see docs/implementation_plans/zone_manual_duration_number.md. The
whole point is that a zone switch never starts a zone indefinitely: it always
uses *some* bounded duration, and this entity is how the user dials that
duration in from the dashboard instead of only via the integration's
Options Flow default.
"""
from __future__ import annotations

from aioresponses import CallbackResult, aioresponses
from homeassistant.helpers import entity_registry as er

from custom_components.aquasmart_irrigation.const import DOMAIN

from .conftest import BASE_URL, MOCK_DISCOVERY, MOCK_STATUS


async def _entity_id(hass, config_entry, domain: str, unique_suffix: str) -> str:
    registry = er.async_get(hass)
    entity_id = registry.async_get_entity_id(domain, DOMAIN, f"{config_entry.unique_id}_{unique_suffix}")
    assert entity_id is not None, f"No {domain} entity registered for unique_id suffix '{unique_suffix}'"
    return entity_id


async def _setup(hass, mock_config_entry) -> None:
    with aioresponses() as m:
        m.get(f"{BASE_URL}/api/ha/v1/discovery", payload=MOCK_DISCOVERY)
        m.get(f"{BASE_URL}/api/ha/v1/status", payload=MOCK_STATUS)
        assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
        await hass.async_block_till_done()


async def test_duration_number_defaults_to_integration_default(hass, mock_config_entry) -> None:
    await _setup(hass, mock_config_entry)

    entity_id = await _entity_id(hass, mock_config_entry, "number", "zone_zone_1_duration")
    assert float(hass.states.get(entity_id).state) == 600


async def test_zone_switch_turn_on_uses_the_number_entitys_current_value(hass, mock_config_entry) -> None:
    await _setup(hass, mock_config_entry)

    number_entity_id = await _entity_id(hass, mock_config_entry, "number", "zone_zone_1_duration")
    switch_entity_id = await _entity_id(hass, mock_config_entry, "switch", "zone_zone_1")

    await hass.services.async_call(
        "number", "set_value", {"entity_id": number_entity_id, "value": 120}, blocking=True
    )
    assert float(hass.states.get(number_entity_id).state) == 120

    captured_json: dict = {}

    def _capture_start_request(url, **kwargs) -> CallbackResult:
        captured_json.update(kwargs.get("json") or {})
        return CallbackResult(payload={"status": "success"})

    with aioresponses() as m:
        m.post(f"{BASE_URL}/api/zones/zone_1/start", callback=_capture_start_request)
        m.get(
            f"{BASE_URL}/api/ha/v1/status",
            payload={**MOCK_STATUS, "zones": {"zone_1": {**MOCK_STATUS["zones"]["zone_1"], "is_running": True}}},
        )
        await hass.services.async_call("switch", "turn_on", {"entity_id": switch_entity_id}, blocking=True)
        await hass.async_block_till_done()

    assert captured_json == {"duration": 120}
