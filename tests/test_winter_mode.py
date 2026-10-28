"""Tests for how winter mode is represented: problem sensor, close-all availability, controller error messages."""
from __future__ import annotations

import pytest
from aioresponses import aioresponses
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er

from custom_components.aquasmart_irrigation.const import DOMAIN

from .conftest import BASE_URL, MOCK_DISCOVERY, MOCK_STATUS

WINTER_STATUS = {**MOCK_STATUS, "winter_mode": True, "winter_valves_open": True}


async def _setup(hass, config_entry, status: dict) -> None:
    with aioresponses() as m:
        m.get(f"{BASE_URL}/api/ha/v1/discovery", payload=MOCK_DISCOVERY)
        m.get(f"{BASE_URL}/api/ha/v1/status", payload=status)
        assert await hass.config_entries.async_setup(config_entry.entry_id)
        await hass.async_block_till_done()


def _entity_id(hass, config_entry, platform: str, unique_suffix: str) -> str:
    entity_id = er.async_get(hass).async_get_entity_id(platform, DOMAIN, f"{config_entry.unique_id}_{unique_suffix}")
    assert entity_id is not None, f"No {platform} entity for unique_id suffix '{unique_suffix}'"
    return entity_id


@pytest.mark.parametrize(
    ("status", "expected"),
    [
        (WINTER_STATUS, "off"),
        ({**WINTER_STATUS, "winter_valves_open": False}, "on"),
        ({**MOCK_STATUS, "winter_valves_open": False}, "off"),  # not in winter = no problem
        (MOCK_STATUS, "unknown"),  # older controller without the field
    ],
)
async def test_winter_valves_problem_sensor(hass, mock_config_entry, status, expected) -> None:
    await _setup(hass, mock_config_entry, status)

    assert hass.states.get(_entity_id(hass, mock_config_entry, "binary_sensor", "winter_valves_problem")).state == expected


async def test_winter_switch_exposes_valves_open(hass, mock_config_entry) -> None:
    await _setup(hass, mock_config_entry, {**WINTER_STATUS, "winter_valves_open": False})

    state = hass.states.get(_entity_id(hass, mock_config_entry, "switch", "winter_mode"))
    assert state.state == "on"
    assert state.attributes["valves_open"] is False


async def test_force_close_all_unavailable_in_winter(hass, mock_config_entry) -> None:
    await _setup(hass, mock_config_entry, WINTER_STATUS)

    assert hass.states.get(_entity_id(hass, mock_config_entry, "button", "force_close_all")).state == "unavailable"


async def test_force_close_all_available_outside_winter(hass, mock_config_entry) -> None:
    await _setup(hass, mock_config_entry, MOCK_STATUS)

    assert hass.states.get(_entity_id(hass, mock_config_entry, "button", "force_close_all")).state != "unavailable"


async def test_winter_activation_failure_shows_controller_message(hass, mock_config_entry) -> None:
    await _setup(hass, mock_config_entry, MOCK_STATUS)
    entity_id = _entity_id(hass, mock_config_entry, "switch", "winter_mode")
    detail = "Zastavenie frekvenčného meniča 'Menič' sa nepodarilo potvrdiť, ventily preto neboli otvorené."

    with aioresponses() as m:
        m.post(f"{BASE_URL}/api/system/winter_mode", status=502, payload={"detail": detail})
        with pytest.raises(HomeAssistantError, match="nepodarilo potvrdiť"):
            await hass.services.async_call("switch", "turn_on", {"entity_id": entity_id}, blocking=True)


async def test_zone_start_in_winter_shows_controller_message(hass, mock_config_entry) -> None:
    await _setup(hass, mock_config_entry, WINTER_STATUS)
    entity_id = _entity_id(hass, mock_config_entry, "switch", "zone_zone_1")

    with aioresponses() as m:
        m.post(
            f"{BASE_URL}/api/zones/zone_1/start",
            status=409,
            payload={"detail": "Počas zimného režimu nemožno spúšťať zóny."},
        )
        with pytest.raises(HomeAssistantError, match="zimného režimu"):
            await hass.services.async_call("switch", "turn_on", {"entity_id": entity_id}, blocking=True)


async def test_non_json_error_falls_back_to_http_status(hass, mock_config_entry) -> None:
    await _setup(hass, mock_config_entry, MOCK_STATUS)
    entity_id = _entity_id(hass, mock_config_entry, "switch", "main_water")

    with aioresponses() as m:
        m.post(f"{BASE_URL}/api/system/main_water", status=500, body="Internal Server Error")
        with pytest.raises(HomeAssistantError, match="HTTP 500"):
            await hass.services.async_call("switch", "turn_off", {"entity_id": entity_id}, blocking=True)
