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


def async_register_frontend(hass: HomeAssistant) -> None:
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
    # register_static_path (sync) rather than the newer async_register_static_paths:
    # the latter only exists on recent HA core releases - see the same
    # broad-compatibility reasoning in coordinator.py/__init__.py, verified
    # against an older HA install in this project's test suite.
    hass.http.register_static_path(CARD_URL_PATH, str(www_dir / CARD_FILENAME), cache_headers=False)
    add_extra_js_url(hass, CARD_URL_PATH)
