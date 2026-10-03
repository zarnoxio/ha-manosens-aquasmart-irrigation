"""
Tests for frontend.py's static-path registration across old and new HA core
HTTP APIs.

Real-world bug this guards against: a live 2026 Home Assistant install
crashed config entry setup with
`AttributeError: 'HomeAssistantHTTP' object has no attribute
'register_static_path'. Did you mean: 'async_register_static_paths'?` -
current HA core fully removed the old sync method rather than just
deprecating it. This project's own pytest-homeassistant-custom-component
test pin (an older HA release) only has the sync form, so the "new API"
branch can't be exercised against a real HTTP component here - it's verified
with a mock instead.
"""
from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

from custom_components.aquasmart_irrigation.frontend import CARD_URL_PATH, async_register_frontend

MANIFEST_VERSION = json.loads(
    (Path(__file__).parent.parent / "custom_components" / "aquasmart_irrigation" / "manifest.json").read_text()
)["version"]
VERSIONED_CARD_URL = f"{CARD_URL_PATH}?v={MANIFEST_VERSION}"


async def test_uses_async_register_static_paths_when_available(hass) -> None:
    fake_http = MagicMock(spec=["async_register_static_paths"])
    fake_http.async_register_static_paths = AsyncMock()
    hass.http = fake_http

    with (
        patch("homeassistant.components.http.StaticPathConfig", MagicMock(), create=True),
        patch("custom_components.aquasmart_irrigation.frontend.add_extra_js_url") as mock_add_js,
    ):
        await async_register_frontend(hass)

    fake_http.async_register_static_paths.assert_awaited_once()
    mock_add_js.assert_called_once_with(hass, VERSIONED_CARD_URL)


async def test_falls_back_to_sync_register_static_path_on_older_ha(hass) -> None:
    fake_http = MagicMock(spec=["register_static_path"])
    hass.http = fake_http

    with patch("custom_components.aquasmart_irrigation.frontend.add_extra_js_url") as mock_add_js:
        await async_register_frontend(hass)

    fake_http.register_static_path.assert_called_once()
    mock_add_js.assert_called_once_with(hass, VERSIONED_CARD_URL)


async def test_does_not_crash_when_http_component_unavailable(hass) -> None:
    hass.http = None

    with patch("custom_components.aquasmart_irrigation.frontend.add_extra_js_url") as mock_add_js:
        await async_register_frontend(hass)

    mock_add_js.assert_not_called()


async def test_is_idempotent_across_multiple_calls(hass) -> None:
    fake_http = MagicMock(spec=["register_static_path"])
    hass.http = fake_http

    with patch("custom_components.aquasmart_irrigation.frontend.add_extra_js_url") as mock_add_js:
        await async_register_frontend(hass)
        await async_register_frontend(hass)

    fake_http.register_static_path.assert_called_once()
    mock_add_js.assert_called_once()
