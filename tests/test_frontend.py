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

from homeassistant.components.lovelace.resources import ResourceStorageCollection

from custom_components.aquasmart_irrigation.frontend import CARD_URL_PATH, async_register_frontend

MANIFEST_VERSION = json.loads(
    (Path(__file__).parent.parent / "custom_components" / "aquasmart_irrigation" / "manifest.json").read_text()
)["version"]
VERSIONED_CARD_URL = f"{CARD_URL_PATH}?v={MANIFEST_VERSION}"


def _fake_resource_collection(existing_items: list[dict]) -> MagicMock:
    """A ResourceStorageCollection stand-in: isinstance-checkable via spec, pre-loaded."""
    resources = MagicMock(spec=ResourceStorageCollection)
    resources.loaded = True
    resources.async_items.return_value = existing_items
    resources.async_create_item = AsyncMock()
    resources.async_update_item = AsyncMock()
    return resources


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


async def test_registers_as_lovelace_resource_when_available(hass) -> None:
    """Preferred path (see frontend.py docstring): avoids the add_extra_js_url race from
    https://github.com/home-assistant/frontend/issues/53890 entirely, by using the same
    resource-collection mechanism HACS itself uses for the cards it installs."""
    hass.http = MagicMock(spec=["register_static_path"])
    resources = _fake_resource_collection(existing_items=[])
    hass.data["lovelace"] = {"resources": resources}

    with patch("custom_components.aquasmart_irrigation.frontend.add_extra_js_url") as mock_add_js:
        await async_register_frontend(hass)

    resources.async_create_item.assert_awaited_once_with({"res_type": "module", "url": VERSIONED_CARD_URL})
    resources.async_update_item.assert_not_awaited()
    mock_add_js.assert_not_called()


async def test_updates_stale_lovelace_resource_on_version_bump(hass) -> None:
    hass.http = MagicMock(spec=["register_static_path"])
    stale_url = f"{CARD_URL_PATH}?v=0.0.1"
    resources = _fake_resource_collection(existing_items=[{"id": "existing-id", "type": "module", "url": stale_url}])
    hass.data["lovelace"] = {"resources": resources}

    with patch("custom_components.aquasmart_irrigation.frontend.add_extra_js_url") as mock_add_js:
        await async_register_frontend(hass)

    resources.async_update_item.assert_awaited_once_with("existing-id", {"url": VERSIONED_CARD_URL})
    resources.async_create_item.assert_not_awaited()
    mock_add_js.assert_not_called()


async def test_lovelace_resource_already_current_is_a_noop(hass) -> None:
    hass.http = MagicMock(spec=["register_static_path"])
    resources = _fake_resource_collection(
        existing_items=[{"id": "existing-id", "type": "module", "url": VERSIONED_CARD_URL}]
    )
    hass.data["lovelace"] = {"resources": resources}

    with patch("custom_components.aquasmart_irrigation.frontend.add_extra_js_url") as mock_add_js:
        await async_register_frontend(hass)

    resources.async_create_item.assert_not_awaited()
    resources.async_update_item.assert_not_awaited()
    mock_add_js.assert_not_called()


async def test_falls_back_to_extra_js_url_in_yaml_mode(hass) -> None:
    """YAML-mode dashboards expose a read-only ResourceYAMLCollection (not a
    ResourceStorageCollection) - this project's only remaining add_extra_js_url() path."""
    hass.http = MagicMock(spec=["register_static_path"])
    hass.data["lovelace"] = {"resources": MagicMock(spec=["async_items"])}

    with patch("custom_components.aquasmart_irrigation.frontend.add_extra_js_url") as mock_add_js:
        await async_register_frontend(hass)

    mock_add_js.assert_called_once_with(hass, VERSIONED_CARD_URL)
