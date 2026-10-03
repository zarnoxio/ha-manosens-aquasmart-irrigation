"""Tests for AquaSmartDataUpdateCoordinator: REST fallback poll and WS push."""
from __future__ import annotations

from aioresponses import aioresponses
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from custom_components.aquasmart_irrigation.api import AquaSmartApiClient
from custom_components.aquasmart_irrigation.coordinator import AquaSmartDataUpdateCoordinator

from .conftest import BASE_URL, MOCK_HOST, MOCK_PORT, MOCK_STATUS, MOCK_TOKEN


async def test_coordinator_fetches_status_via_rest(hass, mock_config_entry) -> None:
    client = AquaSmartApiClient(async_get_clientsession(hass), MOCK_HOST, MOCK_PORT, MOCK_TOKEN)
    coordinator = AquaSmartDataUpdateCoordinator(hass, mock_config_entry, client)

    with aioresponses() as m:
        m.get(f"{BASE_URL}/api/ha/v1/status", payload=MOCK_STATUS)
        data = await coordinator._async_update_data()

    assert data == MOCK_STATUS


async def test_ws_push_updates_coordinator_immediately(hass, mock_config_entry) -> None:
    """
    A WS message should update coordinator.data via async_set_updated_data
    without going through a REST poll - this is the real-time path used by
    api.AquaSmartWebSocketListener in __init__.py's _handle_ws_message.
    """
    client = AquaSmartApiClient(async_get_clientsession(hass), MOCK_HOST, MOCK_PORT, MOCK_TOKEN)
    coordinator = AquaSmartDataUpdateCoordinator(hass, mock_config_entry, client)

    coordinator.async_set_updated_data(MOCK_STATUS)

    assert coordinator.data == MOCK_STATUS
    assert coordinator.last_update_success is True
