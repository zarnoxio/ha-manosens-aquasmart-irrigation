"""Tests for the AquaSmart Irrigation Controller config flow."""
from __future__ import annotations

import aiohttp
from aioresponses import aioresponses
from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResultType

from custom_components.aquasmart_irrigation.const import DOMAIN

from .conftest import BASE_URL, MOCK_DISCOVERY, MOCK_HOST, MOCK_PORT, MOCK_TOKEN


async def test_user_flow_success(hass) -> None:
    with aioresponses() as m:
        m.get(f"{BASE_URL}/api/ha/v1/discovery", payload=MOCK_DISCOVERY)

        result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
        assert result["type"] == FlowResultType.FORM

        result2 = await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {"host": MOCK_HOST, "port": MOCK_PORT, "api_token": MOCK_TOKEN, "use_https": False},
        )

    assert result2["type"] == FlowResultType.CREATE_ENTRY
    assert result2["title"] == "AquaSmart (Test Garden)"
    assert result2["data"]["api_token"] == MOCK_TOKEN


async def test_user_flow_invalid_auth(hass) -> None:
    with aioresponses() as m:
        m.get(f"{BASE_URL}/api/ha/v1/discovery", status=401)

        result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
        result2 = await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {"host": MOCK_HOST, "port": MOCK_PORT, "api_token": "bad", "use_https": False},
        )

    assert result2["type"] == FlowResultType.FORM
    assert result2["errors"] == {"base": "invalid_auth"}


async def test_user_flow_cannot_connect(hass) -> None:
    with aioresponses() as m:
        m.get(f"{BASE_URL}/api/ha/v1/discovery", exception=aiohttp.ClientConnectionError())

        result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
        result2 = await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {"host": MOCK_HOST, "port": MOCK_PORT, "api_token": MOCK_TOKEN, "use_https": False},
        )

    assert result2["type"] == FlowResultType.FORM
    assert result2["errors"] == {"base": "cannot_connect"}


async def test_user_flow_unsupported_schema_version(hass) -> None:
    with aioresponses() as m:
        m.get(f"{BASE_URL}/api/ha/v1/discovery", payload={**MOCK_DISCOVERY, "schema_version": 2})

        result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
        result2 = await hass.config_entries.flow.async_configure(
            result["flow_id"],
            {"host": MOCK_HOST, "port": MOCK_PORT, "api_token": MOCK_TOKEN, "use_https": False},
        )

    assert result2["type"] == FlowResultType.FORM
    assert result2["errors"] == {"base": "unsupported_schema_version"}
