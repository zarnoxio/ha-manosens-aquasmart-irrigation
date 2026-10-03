"""DataUpdateCoordinator for the AquaSmart Irrigation Controller integration."""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import AquaSmartApiClient, AquaSmartAuthError, AquaSmartConnectionError
from .const import DEFAULT_FALLBACK_POLL_INTERVAL, DOMAIN

_LOGGER = logging.getLogger(__name__)


class AquaSmartDataUpdateCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """
    Coordinates AquaSmart status data for every entity of a config entry.

    The REST poll driven by `update_interval` is a *fallback* safety net, not the
    primary update path: real-time changes normally arrive much faster via
    api.AquaSmartWebSocketListener, which calls `async_set_updated_data()` on
    every pushed message (see __init__.py). The poll exists for two reasons:
    it supplies the very first snapshot before any WS message has arrived, and
    it keeps entities from going stale forever if the WS connection is stuck
    reconnecting for an extended period.
    """

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        client: AquaSmartApiClient,
        update_interval: timedelta | None = None,
    ) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=update_interval or DEFAULT_FALLBACK_POLL_INTERVAL,
        )
        # Stored manually rather than passed as a `config_entry=` kwarg to
        # super().__init__() - that convenience kwarg only exists on newer
        # HA core releases. Setting the attribute by hand works identically
        # across old and new HA versions.
        self.config_entry = entry
        self.client = client
        # Populated once in __init__.async_setup_entry right after a successful
        # discovery() call, before the first refresh - static description of
        # zones/actuators/sensors, not runtime state. See api.AquaSmartApiClient.discovery.
        self.discovery: dict[str, Any] = {}

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            return await self.client.get_status()
        except AquaSmartAuthError as err:
            raise ConfigEntryAuthFailed("AquaSmart API token was rejected by the controller") from err
        except AquaSmartConnectionError as err:
            raise UpdateFailed(str(err)) from err
