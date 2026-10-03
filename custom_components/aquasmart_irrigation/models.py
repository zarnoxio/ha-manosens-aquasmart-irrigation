"""
Runtime (non-persisted) data for a config entry, stored in hass.data[DOMAIN][entry_id]
(see __init__.py) rather than entry.runtime_data, for compatibility with older HA
core releases that predate that attribute.
"""
from __future__ import annotations

from dataclasses import dataclass

from .api import AquaSmartApiClient, AquaSmartWebSocketListener
from .coordinator import AquaSmartDataUpdateCoordinator


@dataclass
class AquaSmartRuntimeData:
    client: AquaSmartApiClient
    coordinator: AquaSmartDataUpdateCoordinator
    ws_listener: AquaSmartWebSocketListener
