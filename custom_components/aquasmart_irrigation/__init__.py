"""The AquaSmart Irrigation Controller integration."""
from __future__ import annotations

import logging
from datetime import timedelta

import voluptuous as vol

from homeassistant.config_entries import SOURCE_REAUTH, ConfigEntry
from homeassistant.const import CONF_HOST, CONF_PORT, Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import ConfigEntryAuthFailed, ConfigEntryNotReady
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import AquaSmartApiClient, AquaSmartAuthError, AquaSmartConnectionError, AquaSmartWebSocketListener
from .config_flow import UnsupportedSchemaVersion
from .const import (
    CONF_API_TOKEN,
    CONF_USE_HTTPS,
    DOMAIN,
    OPT_FALLBACK_POLL_INTERVAL,
    SUPPORTED_SCHEMA_VERSION,
)
from .coordinator import AquaSmartDataUpdateCoordinator
from .models import AquaSmartRuntimeData

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SWITCH, Platform.SENSOR, Platform.BINARY_SENSOR, Platform.BUTTON]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    session = async_get_clientsession(hass)
    client = AquaSmartApiClient(
        session,
        entry.data[CONF_HOST],
        entry.data[CONF_PORT],
        entry.data[CONF_API_TOKEN],
        entry.data.get(CONF_USE_HTTPS, False),
    )

    try:
        discovery = await client.discovery()
    except AquaSmartAuthError as err:
        raise ConfigEntryAuthFailed("AquaSmart API token was rejected by the controller") from err
    except AquaSmartConnectionError as err:
        raise ConfigEntryNotReady(str(err)) from err

    if discovery.get("schema_version") != SUPPORTED_SCHEMA_VERSION:
        raise ConfigEntryNotReady(
            f"Controller reports API schema_version={discovery.get('schema_version')}, "
            f"this integration supports {SUPPORTED_SCHEMA_VERSION}. Update the integration or the controller."
        )

    poll_seconds = entry.options.get(OPT_FALLBACK_POLL_INTERVAL)
    coordinator = AquaSmartDataUpdateCoordinator(
        hass, entry, client, timedelta(seconds=poll_seconds) if poll_seconds else None
    )
    coordinator.discovery = discovery
    await coordinator.async_config_entry_first_refresh()

    def _handle_ws_message(data: dict) -> None:
        coordinator.async_set_updated_data(data)

    def _handle_ws_auth_failure() -> None:
        # Explicit flow.async_init rather than the entry.async_start_reauth()
        # convenience helper - that helper only exists on newer HA core
        # releases. This manual form has worked the same way across many HA
        # versions and triggers the same async_step_reauth in config_flow.py.
        hass.async_create_task(
            hass.config_entries.flow.async_init(
                DOMAIN,
                context={"source": SOURCE_REAUTH, "entry_id": entry.entry_id},
                data=entry.data,
            )
        )

    ws_listener = AquaSmartWebSocketListener(session, client, _handle_ws_message, _handle_ws_auth_failure)
    ws_listener.start()

    # Stored in hass.data (not entry.runtime_data) for compatibility with
    # older HA core releases - see the same note in coordinator.py.
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = AquaSmartRuntimeData(
        client=client, coordinator=coordinator, ws_listener=ws_listener
    )

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))

    _async_register_services(hass)
    return True


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the entry whenever its Options Flow is saved (poll interval / default duration changed)."""
    await hass.config_entries.async_reload(entry.entry_id)


def _async_register_services(hass: HomeAssistant) -> None:
    """
    Registers the two services as plain hass-level services (not entity services)
    so a single call can be explicitly targeted at any AquaSmart config entry via
    a `config_entry_id` field, regardless of how many controllers are configured.
    """
    if hass.services.has_service(DOMAIN, "start_zone"):
        return  # Already registered by an earlier config entry setup.

    async def _get_runtime(call: ServiceCall) -> AquaSmartRuntimeData:
        entry_id = call.data["config_entry_id"]
        entry = hass.config_entries.async_get_entry(entry_id)
        if entry is None or entry.domain != DOMAIN or entry_id not in hass.data.get(DOMAIN, {}):
            raise vol.Invalid(f"Unknown AquaSmart config_entry_id: {entry_id}")
        return hass.data[DOMAIN][entry_id]

    async def _async_start_zone(call: ServiceCall) -> None:
        runtime = await _get_runtime(call)
        await runtime.client.start_zone(call.data["zone_id"], call.data["duration"])
        await runtime.coordinator.async_request_refresh()

    async def _async_suspend(call: ServiceCall) -> None:
        runtime = await _get_runtime(call)
        await runtime.client.suspend(hours=call.data.get("hours"), vacation=call.data.get("vacation", False))
        await runtime.coordinator.async_request_refresh()

    hass.services.async_register(
        DOMAIN,
        "start_zone",
        _async_start_zone,
        schema=vol.Schema(
            {
                vol.Required("config_entry_id"): cv.string,
                vol.Required("zone_id"): cv.string,
                vol.Required("duration"): vol.All(vol.Coerce(int), vol.Range(min=1, max=86400)),
            }
        ),
    )
    hass.services.async_register(
        DOMAIN,
        "suspend",
        _async_suspend,
        schema=vol.Schema(
            {
                vol.Required("config_entry_id"): cv.string,
                vol.Optional("hours"): vol.All(vol.Coerce(int), vol.Range(min=1)),
                vol.Optional("vacation", default=False): cv.boolean,
            }
        ),
    )


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        runtime: AquaSmartRuntimeData = hass.data[DOMAIN].pop(entry.entry_id)
        await runtime.ws_listener.stop()
    return unload_ok
