"""
Registers the bundled aquasmart-flow-card.js as an automatic Lovelace resource,
so installing via HACS is enough - no manual "Resources" step. See
docs/implementation_plans/hydraulic_flow_diagram_card.md.

Registration prefers Lovelace's own resource-loading pipeline (the same
mechanism HACS itself uses for the cards it installs) over add_extra_js_url().
Reason: https://github.com/home-assistant/frontend/issues/53890 documents a
real, confirmed race where a custom element registered via
extra_module_url/add_extra_js_url() is silently dropped if its module
executes before the frontend's scoped-custom-element-registry polyfill
replaces window.customElements - customElements.get() then returns undefined
even though the file demonstrably loaded, surfacing as an intermittent
"Custom element doesn't exist: aquasmart-flow-card" dashboard error. The
reporter measured 10-20%+ failure rates on cold loads - and the HA Companion
App tears down and recreates its WebView on every app backgrounding
(home-assistant/android#7421), making nearly every app resume a cold load.
Lovelace resources aren't affected, because they're dynamically imported from
within app.js, after the polyfill has already run - which is why other
HACS-installed cards don't show this symptom. add_extra_js_url() is kept only
as a fallback for YAML-mode dashboards, where the resource collection is
read-only.
"""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

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
                [StaticPathConfig(CARD_URL_PATH, file_path, cache_headers=True)]
            )
        else:
            # Older HA core releases (pre ~2024.7, e.g. this project's own
            # pytest-homeassistant-custom-component test pin) only have the
            # sync form - async_register_static_paths doesn't exist there yet.
            hass.http.register_static_path(CARD_URL_PATH, file_path, cache_headers=True)
    except Exception:
        _LOGGER.exception(
            "Failed to register aquasmart-flow-card static path - entities/control still "
            "work, but the dashboard card will not be available until this is fixed"
        )
        return

    # Cache-bust on the integration version rather than leaving the file
    # uncacheable: a version query string still lets browsers serve a warm,
    # already-loaded copy on repeat visits, while guaranteeing a fresh fetch
    # whenever the integration (and therefore the bundle) is updated.
    integration = await async_get_integration(hass, DOMAIN)
    card_url = f"{CARD_URL_PATH}?v={integration.version}"

    if await _async_register_as_lovelace_resource(hass, card_url):
        return

    # Fallback for YAML-mode dashboards (lovelace: resources: [...] in
    # configuration.yaml), where the resource collection below is read-only -
    # see the module docstring for why this path can intermittently fail to
    # register the custom element.
    add_extra_js_url(hass, card_url)


async def _async_register_as_lovelace_resource(hass: HomeAssistant, card_url: str) -> bool:
    """Create or update our card's entry in Lovelace's own resource collection.

    Returns True once handled this way, False if the caller should fall back
    to add_extra_js_url() - either because Lovelace is in YAML mode (the
    collection is a read-only ResourceYAMLCollection there) or because the
    lovelace integration isn't loaded at all (e.g. a minimal test/headless
    setup). Broadly caught on purpose: this reaches into lovelace's internal,
    unstable-by-design storage API (the same thing HACS itself does to
    auto-register the cards it installs) rather than a public helper, so any
    shape change there should degrade to the fallback, not crash config entry
    setup.
    """
    try:
        from homeassistant.components.lovelace.resources import ResourceStorageCollection

        resources = hass.data.get("lovelace", {}).get("resources")
        if not isinstance(resources, ResourceStorageCollection):
            return False

        if not resources.loaded:
            await resources.async_load()
            resources.loaded = True

        existing = next(
            (item for item in resources.async_items() if item["url"].split("?", 1)[0] == CARD_URL_PATH),
            None,
        )
        if existing is None:
            await resources.async_create_item({"res_type": "module", "url": card_url})
        elif existing["url"] != card_url:
            await resources.async_update_item(existing["id"], {"url": card_url})
    except Exception:
        _LOGGER.exception(
            "Failed to register aquasmart-flow-card as a Lovelace resource - falling back to "
            "add_extra_js_url(), which is more prone to intermittently losing the custom "
            "element registration (see module docstring)"
        )
        return False

    return True
