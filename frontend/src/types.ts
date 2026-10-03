import type { LovelaceCardConfig } from "custom-card-helpers";

export interface AquaSmartFlowCardConfig extends LovelaceCardConfig {
  type: string;
  device_id: string;
  title?: string;
}

/** One entry in DiagramEntities.zones - see websocket_api.py's ws_diagram_entities. */
export interface DiagramZone {
  zone_id: string;
  switch_entity_id: string;
  deficit_entity_id: string | null;
  session_volume_entity_id: string | null;
  next_action_entity_id: string | null;
}

/**
 * Result shape of the `aquasmart_irrigation/diagram_entities` WebSocket command
 * (custom_components/aquasmart_irrigation/websocket_api.py). Any field is null
 * when the controller has no matching entity (e.g. no flow sensor configured).
 */
export interface DiagramEntities {
  tank_level_entity_id: string | null;
  pressure_entity_id: string | null;
  target_pressure_entity_id: string | null;
  pump_running_entity_id: string | null;
  pump_fault_entity_id: string | null;
  flow_rate_entity_id: string | null;
  flow_total_entity_id: string | null;
  main_water_entity_id: string | null;
  zones: DiagramZone[];
}
