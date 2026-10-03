"""Binary sensor platform for AquaSmart Irrigation Controller: inverter fault/running, suspended."""
from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
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
            AquaSmartInverterFaultSensor(coordinator),
            AquaSmartInverterRunningSensor(coordinator),
            AquaSmartSuspendedSensor(coordinator),
        ]
    )


class AquaSmartInverterFaultSensor(AquaSmartEntity, BinarySensorEntity):
    _attr_device_class = BinarySensorDeviceClass.PROBLEM
    _attr_translation_key = "inverter_fault"

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator) -> None:
        super().__init__(coordinator, "inverter_fault")

    @property
    def is_on(self) -> bool:
        return bool(self.coordinator.data.get("inverter", {}).get("is_faulted"))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"message": self.coordinator.data.get("inverter", {}).get("fault_message")}


class AquaSmartInverterRunningSensor(AquaSmartEntity, BinarySensorEntity):
    _attr_device_class = BinarySensorDeviceClass.RUNNING
    _attr_translation_key = "inverter_running"

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator) -> None:
        super().__init__(coordinator, "inverter_running")

    @property
    def is_on(self) -> bool:
        return bool(self.coordinator.data.get("inverter", {}).get("is_running"))


class AquaSmartSuspendedSensor(AquaSmartEntity, BinarySensorEntity):
    """
    Duplicates switch.vacation_mode's state but as a plain read-only indicator -
    useful for dashboards/automations that want to react to *any* suspension
    (timed delay or vacation), not just toggle vacation mode specifically.
    """

    _attr_translation_key = "suspended"
    _attr_icon = "mdi:pause-circle"

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator) -> None:
        super().__init__(coordinator, "suspended")

    @property
    def is_on(self) -> bool:
        return bool(self.coordinator.data.get("suspended"))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"reason": self.coordinator.data.get("suspend_reason")}
