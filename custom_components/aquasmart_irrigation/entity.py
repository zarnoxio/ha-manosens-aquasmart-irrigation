"""Common base entity for AquaSmart Irrigation Controller — one HA device per controller."""
from __future__ import annotations

from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import AquaSmartDataUpdateCoordinator


class AquaSmartEntity(CoordinatorEntity[AquaSmartDataUpdateCoordinator]):
    """
    Base for every AquaSmart entity. All entities (zones, sensors, the inverter)
    belong to a single HA device representing the whole physical controller box
    - see docs/implementation_plans/home_assistant_custom_integration planning
    notes: one controller, one device, many entities.
    """

    _attr_has_entity_name = True

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator, unique_id_suffix: str) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{coordinator.config_entry.unique_id}_{unique_id_suffix}"

    @property
    def device_info(self) -> DeviceInfo:
        system = (self.coordinator.discovery or {}).get("system", {})
        return DeviceInfo(
            identifiers={(DOMAIN, self.coordinator.config_entry.unique_id)},
            name=system.get("location_name") or "AquaSmart Irrigation Controller",
            manufacturer="AquaSmart",
            model="Irrigation Controller",
        )
