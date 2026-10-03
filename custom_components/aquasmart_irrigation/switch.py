"""Switch platform for AquaSmart Irrigation Controller: main water, winter mode, vacation mode, per-zone."""
from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DEFAULT_ZONE_DURATION_SECONDS, DOMAIN, OPT_DEFAULT_ZONE_DURATION
from .coordinator import AquaSmartDataUpdateCoordinator
from .entity import AquaSmartEntity


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    default_duration = entry.options.get(OPT_DEFAULT_ZONE_DURATION, DEFAULT_ZONE_DURATION_SECONDS)

    entities: list[SwitchEntity] = [
        AquaSmartMainWaterSwitch(coordinator),
        AquaSmartWinterModeSwitch(coordinator),
        AquaSmartVacationModeSwitch(coordinator),
    ]
    for zone in coordinator.discovery.get("zones", []):
        entities.append(AquaSmartZoneSwitch(coordinator, zone, default_duration))

    async_add_entities(entities)


class AquaSmartMainWaterSwitch(AquaSmartEntity, SwitchEntity):
    _attr_translation_key = "main_water"
    _attr_icon = "mdi:water-pump"

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator) -> None:
        super().__init__(coordinator, "main_water")

    @property
    def is_on(self) -> bool:
        return bool(self.coordinator.data.get("main_water_enabled"))

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.coordinator.client.toggle_main_water(True)
        await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.client.toggle_main_water(False)
        await self.coordinator.async_request_refresh()


class AquaSmartWinterModeSwitch(AquaSmartEntity, SwitchEntity):
    _attr_translation_key = "winter_mode"
    _attr_icon = "mdi:snowflake"

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator) -> None:
        super().__init__(coordinator, "winter_mode")

    @property
    def is_on(self) -> bool:
        return bool(self.coordinator.data.get("winter_mode"))

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.coordinator.client.set_winter_mode(True)
        await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.client.set_winter_mode(False)
        await self.coordinator.async_request_refresh()


class AquaSmartVacationModeSwitch(AquaSmartEntity, SwitchEntity):
    """
    Mirrors `status.suspended`. Turning on suspends indefinitely (vacation mode);
    turning off always resumes - matching the controller's own resume() (see
    suspend_system/resume_system in aqua-smart's src/scheduler/engine.py), which
    clears a suspension regardless of whether it was a timed delay or vacation
    mode. Use the `aquasmart_irrigation.suspend` service for a timed (+Nh) delay
    instead of vacation mode.
    """

    _attr_translation_key = "vacation_mode"
    _attr_icon = "mdi:palm-tree"

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator) -> None:
        super().__init__(coordinator, "vacation_mode")

    @property
    def is_on(self) -> bool:
        return bool(self.coordinator.data.get("suspended"))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"reason": self.coordinator.data.get("suspend_reason")}

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.coordinator.client.suspend(vacation=True)
        await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.client.resume()
        await self.coordinator.async_request_refresh()


class AquaSmartZoneSwitch(AquaSmartEntity, SwitchEntity):
    """
    turn_on starts the zone for `default_duration` seconds (configurable via the
    integration's Options Flow); use the `aquasmart_irrigation.start_zone`
    service instead when a one-off custom duration is needed.
    """

    # No _attr_translation_key here - the zone's display name comes directly
    # from the controller's config (zone.name), not a static translatable string.
    _attr_icon = "mdi:sprinkler"

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator, zone: dict, default_duration: int) -> None:
        self._zone_id = zone["id"]
        self._default_duration = default_duration
        super().__init__(coordinator, f"zone_{self._zone_id}")
        self._attr_name = zone.get("name") or self._zone_id

    @property
    def is_on(self) -> bool:
        return bool(self.coordinator.data.get("zones", {}).get(self._zone_id, {}).get("is_running"))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        zone_data = self.coordinator.data.get("zones", {}).get(self._zone_id, {})
        return {
            "zone_id": self._zone_id,
            "water_deficit_mm": zone_data.get("water_deficit_mm"),
            "next_action": zone_data.get("next_action_iso"),
        }

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.coordinator.client.start_zone(self._zone_id, self._default_duration)
        await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.client.stop_zone(self._zone_id)
        await self.coordinator.async_request_refresh()
