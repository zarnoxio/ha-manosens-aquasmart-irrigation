"""
Number platform for AquaSmart Irrigation Controller: per-zone configurable
manual-start duration, shown right on the dashboard next to each zone switch.

See docs/implementation_plans/zone_manual_duration_number.md. switch.py's
AquaSmartZoneSwitch.async_turn_on() reads the current value of the matching
entity here (via coordinator.zone_duration_numbers) instead of always using
the integration-wide default - a zone switch always starts the zone for a
bounded duration, never indefinitely, but the user can now dial that duration
in from the dashboard without touching Developer Tools or Options.
"""
from __future__ import annotations

from homeassistant.components.number import NumberEntity, NumberMode, RestoreNumber
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DEFAULT_ZONE_DURATION_SECONDS, DOMAIN, OPT_DEFAULT_ZONE_DURATION
from .coordinator import AquaSmartDataUpdateCoordinator
from .entity import AquaSmartEntity


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    default_duration = entry.options.get(OPT_DEFAULT_ZONE_DURATION, DEFAULT_ZONE_DURATION_SECONDS)

    entities = []
    for zone in coordinator.discovery.get("zones", []):
        number_entity = AquaSmartZoneDurationNumber(coordinator, zone, default_duration)
        coordinator.zone_duration_numbers[zone["id"]] = number_entity
        entities.append(number_entity)

    async_add_entities(entities)


class AquaSmartZoneDurationNumber(AquaSmartEntity, RestoreNumber):
    """
    How long `switch.<zone>` runs the zone for when turned on. Lives only in
    Home Assistant, never sent to the controller until the switch is actually
    turned on - defaults to the integration's configured default duration and
    is restored across HA restarts (RestoreNumber), independent of the
    controller, which has no notion of this per-zone override.
    """

    _attr_icon = "mdi:timer-outline"
    _attr_native_min_value = 1
    _attr_native_max_value = 86400
    _attr_native_step = 1
    _attr_native_unit_of_measurement = UnitOfTime.SECONDS
    _attr_mode = NumberMode.BOX

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator, zone: dict, default_duration: int) -> None:
        self._zone_id = zone["id"]
        self._value: float = float(default_duration)
        super().__init__(coordinator, f"zone_{self._zone_id}_duration")
        self._attr_name = f"{zone.get('name') or self._zone_id} duration"

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last_data = await self.async_get_last_number_data()
        if last_data is not None and last_data.native_value is not None:
            self._value = last_data.native_value

    @property
    def native_value(self) -> float:
        return self._value

    async def async_set_native_value(self, value: float) -> None:
        self._value = value
        self.async_write_ha_state()
