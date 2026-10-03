"""Button platform for AquaSmart Irrigation Controller: force-close-all, reset inverter fault."""
from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .coordinator import AquaSmartDataUpdateCoordinator
from .entity import AquaSmartEntity


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    async_add_entities(
        [
            AquaSmartForceCloseAllButton(coordinator),
            AquaSmartResetFaultButton(coordinator),
        ]
    )


class AquaSmartForceCloseAllButton(AquaSmartEntity, ButtonEntity):
    _attr_translation_key = "force_close_all"
    _attr_icon = "mdi:valve-closed"

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator) -> None:
        super().__init__(coordinator, "force_close_all")

    async def async_press(self) -> None:
        await self.coordinator.client.force_close_all()
        await self.coordinator.async_request_refresh()


class AquaSmartResetFaultButton(AquaSmartEntity, ButtonEntity):
    _attr_translation_key = "reset_inverter_fault"
    _attr_icon = "mdi:restart-alert"

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator) -> None:
        super().__init__(coordinator, "reset_inverter_fault")

    async def async_press(self) -> None:
        await self.coordinator.client.reset_fault()
        await self.coordinator.async_request_refresh()
