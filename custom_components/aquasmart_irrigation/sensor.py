"""Sensor platform for AquaSmart Irrigation Controller: inverter telemetry, zone deficit, level/flow sensors."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfElectricCurrent, UnitOfFrequency, UnitOfPressure, UnitOfVolume
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .coordinator import AquaSmartDataUpdateCoordinator
from .entity import AquaSmartEntity


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    coordinator = hass.data[DOMAIN][entry.entry_id].coordinator
    discovery = coordinator.discovery

    entities: list[SensorEntity] = [
        AquaSmartInverterSensor(
            coordinator, "actual_pressure_bar", "inverter_pressure",
            UnitOfPressure.BAR, SensorDeviceClass.PRESSURE,
        ),
        AquaSmartInverterSensor(
            coordinator, "target_pressure_bar", "inverter_target_pressure",
            UnitOfPressure.BAR, SensorDeviceClass.PRESSURE,
        ),
        AquaSmartInverterSensor(
            coordinator, "frequency_hz", "inverter_frequency",
            UnitOfFrequency.HERTZ, SensorDeviceClass.FREQUENCY,
        ),
        AquaSmartInverterSensor(
            coordinator, "current_a", "inverter_current",
            UnitOfElectricCurrent.AMPERE, SensorDeviceClass.CURRENT,
        ),
    ]

    for zone in discovery.get("zones", []):
        entities.append(AquaSmartZoneDeficitSensor(coordinator, zone))
        entities.append(AquaSmartZoneNextActionSensor(coordinator, zone))

    for sensor_cfg in discovery.get("sensors", []):
        s_type = sensor_cfg.get("type")
        if s_type == "level":
            entities.append(AquaSmartLevelSensor(coordinator, sensor_cfg))
        elif s_type == "flow":
            entities.append(AquaSmartFlowRateSensor(coordinator, sensor_cfg))
            entities.append(AquaSmartFlowTotalSensor(coordinator, sensor_cfg))

    async_add_entities(entities)


class AquaSmartInverterSensor(AquaSmartEntity, SensorEntity):
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(
        self,
        coordinator: AquaSmartDataUpdateCoordinator,
        data_key: str,
        unique_suffix: str,
        unit: str,
        device_class: SensorDeviceClass,
    ) -> None:
        self._data_key = data_key
        super().__init__(coordinator, unique_suffix)
        self._attr_translation_key = unique_suffix
        self._attr_native_unit_of_measurement = unit
        self._attr_device_class = device_class

    @property
    def native_value(self) -> Any:
        return self.coordinator.data.get("inverter", {}).get(self._data_key)


class AquaSmartZoneDeficitSensor(AquaSmartEntity, SensorEntity):
    _attr_native_unit_of_measurement = "mm"
    _attr_icon = "mdi:water-minus"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator, zone: dict) -> None:
        self._zone_id = zone["id"]
        super().__init__(coordinator, f"zone_{self._zone_id}_water_deficit")
        self._attr_name = f"{zone.get('name') or self._zone_id} water deficit"

    @property
    def native_value(self) -> Any:
        return self.coordinator.data.get("zones", {}).get(self._zone_id, {}).get("water_deficit_mm")


class AquaSmartZoneNextActionSensor(AquaSmartEntity, SensorEntity):
    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_icon = "mdi:clock-outline"

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator, zone: dict) -> None:
        self._zone_id = zone["id"]
        super().__init__(coordinator, f"zone_{self._zone_id}_next_action")
        self._attr_name = f"{zone.get('name') or self._zone_id} next action"

    @property
    def native_value(self) -> datetime | None:
        iso = self.coordinator.data.get("zones", {}).get(self._zone_id, {}).get("next_action_iso")
        if not iso:
            return None
        try:
            return datetime.fromisoformat(iso)
        except ValueError:
            return None


class AquaSmartLevelSensor(AquaSmartEntity, SensorEntity):
    _attr_native_unit_of_measurement = "m"
    _attr_icon = "mdi:waves-arrow-up"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator, sensor_cfg: dict) -> None:
        self._sensor_id = sensor_cfg["id"]
        super().__init__(coordinator, f"{self._sensor_id}_level")
        self._attr_name = f"{sensor_cfg.get('name') or self._sensor_id} level"

    @property
    def native_value(self) -> Any:
        return self.coordinator.data.get("sensors", {}).get(self._sensor_id, {}).get("level_m")


class AquaSmartFlowRateSensor(AquaSmartEntity, SensorEntity):
    _attr_native_unit_of_measurement = "L/min"
    _attr_icon = "mdi:speedometer"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator, sensor_cfg: dict) -> None:
        self._sensor_id = sensor_cfg["id"]
        super().__init__(coordinator, f"{self._sensor_id}_flow_rate")
        self._attr_name = f"{sensor_cfg.get('name') or self._sensor_id} flow rate"

    @property
    def native_value(self) -> Any:
        return self.coordinator.data.get("sensors", {}).get(self._sensor_id, {}).get("flow_rate_lmin")


class AquaSmartFlowTotalSensor(AquaSmartEntity, SensorEntity):
    _attr_native_unit_of_measurement = UnitOfVolume.LITERS
    _attr_device_class = SensorDeviceClass.WATER
    _attr_state_class = SensorStateClass.TOTAL_INCREASING
    _attr_icon = "mdi:cup-water"

    def __init__(self, coordinator: AquaSmartDataUpdateCoordinator, sensor_cfg: dict) -> None:
        self._sensor_id = sensor_cfg["id"]
        super().__init__(coordinator, f"{self._sensor_id}_total")
        self._attr_name = f"{sensor_cfg.get('name') or self._sensor_id} total"

    @property
    def native_value(self) -> Any:
        return self.coordinator.data.get("sensors", {}).get(self._sensor_id, {}).get("total_liters")
