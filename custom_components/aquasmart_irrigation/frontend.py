"""
Registers the bundled aquasmart-flow-card.js as an automatic Lovelace resource,
so installing via HACS is enough - no manual "Resources" step. See
docs/implementation_plans/hydraulic_flow_diagram_card.md.
"""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

CARD_FILENAME = "aquasmart-flow-card.js"
CARD_URL_PATH = f"/aquasmart_irrigation_files/{CARD_FILENAME}"


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Idempotent: safe to call once per config entry setup on a shared hass instance."""
    flag = f"{DOMAIN}_frontend_registered"
    if hass.data.get(flag):
        return
    hass.data[flag] = True

    # hass.http is None in minimal/headless setups (e.g. the lightweight test
    # harness, or an exotic HA deployment without the http component). Entities
    # and control still work without the dashboard card, so this degrades
    # gracefully instead of failing the whole config entry setup.
    if hass.http is None:
        _LOGGER.debug("HTTP component not available - skipping aquasmart-flow-card registration")
        return

    www_dir = Path(__file__).parent / "www"
    file_path = str(www_dir / CARD_FILENAME)

    try:
        if hasattr(hass.http, "async_register_static_paths"):
            # Current HA core (confirmed on a live 2026 install): the old sync
            # register_static_path() was fully REMOVED, not just deprecated -
            # calling it raises AttributeError and aborts config entry setup.
            from homeassistant.components.http import StaticPathConfig

            await hass.http.async_register_static_paths(
                [StaticPathConfig(CARD_URL_PATH, file_path, cache_headers=False)]
            )
        else:
            # Older HA core releases (pre ~2024.7, e.g. this project's own
            # pytest-homeassistant-custom-component test pin) only have the
            # sync form - async_register_static_paths doesn't exist there yet.
            hass.http.register_static_path(CARD_URL_PATH, file_path, cache_headers=False)
    except Exception:
        _LOGGER.exception(
            "Failed to register aquasmart-flow-card static path - entities/control still "
            "work, but the dashboard card will not be available until this is fixed"
        )
        return

    add_extra_js_url(hass, CARD_URL_PATH)
