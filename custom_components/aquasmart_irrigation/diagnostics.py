"""Diagnostics support for AquaSmart Irrigation Controller - the API token is always redacted."""
from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import CONF_API_TOKEN, DOMAIN

TO_REDACT = {CONF_API_TOKEN}


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    runtime = hass.data[DOMAIN][entry.entry_id]
    return {
        "entry_data": {k: ("**REDACTED**" if k in TO_REDACT else v) for k, v in entry.data.items()},
        "entry_options": dict(entry.options),
        "discovery": runtime.coordinator.discovery,
        "last_status": runtime.coordinator.data,
    }
