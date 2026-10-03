"""Config flow for the AquaSmart Irrigation Controller integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import CONF_HOST, CONF_PORT
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import AquaSmartApiClient, AquaSmartAuthError, AquaSmartConnectionError
from .const import (
    CONF_API_TOKEN,
    CONF_USE_HTTPS,
    DEFAULT_PORT,
    DEFAULT_USE_HTTPS,
    DEFAULT_ZONE_DURATION_SECONDS,
    DOMAIN,
    OPT_DEFAULT_ZONE_DURATION,
    OPT_FALLBACK_POLL_INTERVAL,
    SUPPORTED_SCHEMA_VERSION,
)

_LOGGER = logging.getLogger(__name__)

STEP_USER_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_HOST): str,
        vol.Required(CONF_PORT, default=DEFAULT_PORT): int,
        vol.Required(CONF_API_TOKEN): str,
        vol.Optional(CONF_USE_HTTPS, default=DEFAULT_USE_HTTPS): bool,
    }
)


class UnsupportedSchemaVersion(Exception):
    """Raised when the controller reports an /api/ha/v1 schema_version we don't support."""

    def __init__(self, version: Any) -> None:
        super().__init__(f"Unsupported schema_version: {version}")
        self.version = version


async def _validate_and_get_title(hass: HomeAssistant, data: dict[str, Any]) -> str:
    """Validates the connection by calling discovery(); returns a title, or raises."""
    session = async_get_clientsession(hass)
    client = AquaSmartApiClient(
        session,
        data[CONF_HOST],
        data[CONF_PORT],
        data[CONF_API_TOKEN],
        data.get(CONF_USE_HTTPS, DEFAULT_USE_HTTPS),
    )
    discovery = await client.discovery()
    if discovery.get("schema_version") != SUPPORTED_SCHEMA_VERSION:
        raise UnsupportedSchemaVersion(discovery.get("schema_version"))

    location_name = discovery.get("system", {}).get("location_name")
    return f"AquaSmart ({location_name})" if location_name else "AquaSmart Irrigation Controller"


class AquaSmartConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for AquaSmart Irrigation Controller."""

    VERSION = 1

    def __init__(self) -> None:
        self._reauth_entry: config_entries.ConfigEntry | None = None

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            await self.async_set_unique_id(f"{user_input[CONF_HOST]}:{user_input[CONF_PORT]}")
            self._abort_if_unique_id_configured()

            try:
                title = await _validate_and_get_title(self.hass, user_input)
            except AquaSmartAuthError:
                errors["base"] = "invalid_auth"
            except AquaSmartConnectionError:
                errors["base"] = "cannot_connect"
            except UnsupportedSchemaVersion:
                errors["base"] = "unsupported_schema_version"
            except Exception:  # noqa: BLE001 - last-resort guard; log for diagnosis, never crash the flow
                _LOGGER.exception("Unexpected error validating AquaSmart connection")
                errors["base"] = "unknown"
            else:
                return self.async_create_entry(title=title, data=user_input)

        return self.async_show_form(step_id="user", data_schema=STEP_USER_SCHEMA, errors=errors)

    async def async_step_reauth(self, entry_data: dict[str, Any]) -> FlowResult:
        """Entered automatically when the coordinator/WS listener raises ConfigEntryAuthFailed."""
        self._reauth_entry = self.hass.config_entries.async_get_entry(self.context["entry_id"])
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        errors: dict[str, str] = {}
        assert self._reauth_entry is not None

        if user_input is not None:
            new_data = {**self._reauth_entry.data, CONF_API_TOKEN: user_input[CONF_API_TOKEN]}
            try:
                await _validate_and_get_title(self.hass, new_data)
            except AquaSmartAuthError:
                errors["base"] = "invalid_auth"
            except AquaSmartConnectionError:
                errors["base"] = "cannot_connect"
            except UnsupportedSchemaVersion:
                errors["base"] = "unsupported_schema_version"
            else:
                self.hass.config_entries.async_update_entry(self._reauth_entry, data=new_data)
                await self.hass.config_entries.async_reload(self._reauth_entry.entry_id)
                return self.async_abort(reason="reauth_successful")

        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=vol.Schema({vol.Required(CONF_API_TOKEN): str}),
            errors=errors,
        )

    @staticmethod
    def async_get_options_flow(config_entry: config_entries.ConfigEntry) -> "AquaSmartOptionsFlow":
        return AquaSmartOptionsFlow(config_entry)


class AquaSmartOptionsFlow(config_entries.OptionsFlow):
    """Lets the user tune the REST fallback poll interval and the default zone run duration."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        self.config_entry = config_entry

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        current = self.config_entry.options
        schema = vol.Schema(
            {
                vol.Optional(
                    OPT_FALLBACK_POLL_INTERVAL,
                    default=current.get(OPT_FALLBACK_POLL_INTERVAL, 60),
                ): vol.All(vol.Coerce(int), vol.Range(min=15, max=3600)),
                vol.Optional(
                    OPT_DEFAULT_ZONE_DURATION,
                    default=current.get(OPT_DEFAULT_ZONE_DURATION, DEFAULT_ZONE_DURATION_SECONDS),
                ): vol.All(vol.Coerce(int), vol.Range(min=1, max=86400)),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
