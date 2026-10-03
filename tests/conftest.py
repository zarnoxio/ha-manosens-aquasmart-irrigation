"""Shared fixtures and mock contract data for AquaSmart Irrigation Controller tests.

MOCK_DISCOVERY / MOCK_STATUS deliberately mirror the exact shape documented in
docs/implementation_plans/home_assistant_integration_controller.md in the
aqua-smart repo - that document is the source of truth for this contract.
"""
from __future__ import annotations

import pytest

pytest_plugins = ["pytest_homeassistant_custom_component"]

from homeassistant.const import CONF_HOST, CONF_PORT
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.aquasmart_irrigation.const import CONF_API_TOKEN, CONF_USE_HTTPS, DOMAIN

MOCK_HOST = "192.168.1.50"
MOCK_PORT = 8000
MOCK_TOKEN = "ic_test_token"
BASE_URL = f"http://{MOCK_HOST}:{MOCK_PORT}"

MOCK_DISCOVERY = {
    "schema_version": 1,
    "zones": [
        {
            "id": "zone_1",
            "name": "Lawn",
            "actuator_id": "valve_zone_1",
            "area_m2": 120,
            "target_pressure_bar": 3.5,
        }
    ],
    "actuators": [
        {"id": "main_inverter", "type": "inverter", "name": "Inverter", "zone_id": None},
        {"id": "valve_zone_1", "type": "valve", "name": "Lawn valve", "zone_id": "zone_1"},
    ],
    "sensors": [{"id": "cistern_level", "type": "level", "name": "Cistern level", "unit": "m"}],
    "system": {"location_name": "Test Garden", "currency": "EUR"},
}

MOCK_STATUS = {
    "schema_version": 1,
    "time": "2026-10-03T12:00:00",
    "main_water_enabled": True,
    "winter_mode": False,
    "suspended": False,
    "suspend_reason": None,
    "zones": {
        "zone_1": {
            "is_running": False,
            "valve_open": False,
            "water_deficit_mm": 2.5,
            "next_action_iso": None,
        }
    },
    "inverter": {
        "is_running": False,
        "is_faulted": False,
        "actual_pressure_bar": 0.0,
        "target_pressure_bar": 3.0,
        "frequency_hz": 0.0,
        "current_a": 0.0,
        "fault_message": None,
    },
    "sensors": {"cistern_level": {"level_m": 3.2, "volume_liters": 3000.0}},
}


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Lets Home Assistant's test harness discover custom_components/aquasmart_irrigation."""
    yield


@pytest.fixture
def mock_config_entry_data() -> dict:
    return {CONF_HOST: MOCK_HOST, CONF_PORT: MOCK_PORT, CONF_API_TOKEN: MOCK_TOKEN, CONF_USE_HTTPS: False}


@pytest.fixture
def mock_config_entry(hass, mock_config_entry_data):
    entry = MockConfigEntry(
        domain=DOMAIN,
        data=mock_config_entry_data,
        unique_id=f"{MOCK_HOST}:{MOCK_PORT}",
    )
    entry.add_to_hass(hass)
    return entry
