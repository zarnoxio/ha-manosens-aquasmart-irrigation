import { fixture, html, expect } from "@open-wc/testing";
import "../src/aquasmart-flow-card";
import type { AquaSmartFlowCard } from "../src/aquasmart-flow-card";
import type { DiagramEntities } from "../src/types";

const DIAGRAM_ENTITIES: DiagramEntities = {
  tank_level_entity_id: "sensor.garden_cistern_level_level",
  pressure_entity_id: "sensor.garden_inverter_pressure",
  target_pressure_entity_id: "sensor.garden_inverter_target_pressure",
  pump_running_entity_id: "binary_sensor.garden_inverter_running",
  pump_fault_entity_id: "binary_sensor.garden_inverter_fault",
  flow_rate_entity_id: null,
  flow_total_entity_id: null,
  main_water_entity_id: "switch.garden_main_water",
  zones: [
    {
      zone_id: "zone_1",
      switch_entity_id: "switch.garden_lawn",
      deficit_entity_id: "sensor.garden_lawn_water_deficit",
      session_volume_entity_id: "sensor.garden_lawn_session_volume",
      next_action_entity_id: "sensor.garden_lawn_next_action",
    },
  ],
};

function makeHass(overrides: Record<string, { state: string; attributes?: Record<string, unknown> }> = {}) {
  const states: Record<string, { entity_id: string; state: string; attributes: Record<string, unknown> }> = {
    "sensor.garden_cistern_level_level": { entity_id: "sensor.garden_cistern_level_level", state: "1.75", attributes: { volume_liters: 1750 } },
    "sensor.garden_inverter_pressure": { entity_id: "sensor.garden_inverter_pressure", state: "3.1", attributes: {} },
    "sensor.garden_inverter_target_pressure": { entity_id: "sensor.garden_inverter_target_pressure", state: "3.0", attributes: {} },
    "binary_sensor.garden_inverter_running": { entity_id: "binary_sensor.garden_inverter_running", state: "on", attributes: {} },
    "binary_sensor.garden_inverter_fault": { entity_id: "binary_sensor.garden_inverter_fault", state: "off", attributes: {} },
    "switch.garden_lawn": { entity_id: "switch.garden_lawn", state: "on", attributes: { friendly_name: "Lawn" } },
    "sensor.garden_lawn_session_volume": { entity_id: "sensor.garden_lawn_session_volume", state: "42.5", attributes: {} },
    ...overrides,
  };

  const callServiceCalls: { domain: string; service: string; data: unknown }[] = [];

  return {
    states,
    callWS: async () => DIAGRAM_ENTITIES,
    callService: async (domain: string, service: string, data: unknown) => {
      callServiceCalls.push({ domain, service, data });
    },
    _callServiceCalls: callServiceCalls,
  } as unknown as import("custom-card-helpers").HomeAssistant & { _callServiceCalls: typeof callServiceCalls };
}

describe("aquasmart-flow-card", () => {
  it("renders pressure, flow status and zone branch after resolving diagram entities", async () => {
    const el = (await fixture(html`<aquasmart-flow-card></aquasmart-flow-card>`)) as AquaSmartFlowCard;
    el.setConfig({ type: "custom:aquasmart-flow-card", device_id: "device-1" });
    el.hass = makeHass();
    await el.updateComplete;
    // One more microtask turn for the awaited callWS() to resolve and trigger a re-render.
    await new Promise((resolve) => setTimeout(resolve, 0));
    await el.updateComplete;

    const text = el.shadowRoot!.textContent ?? "";
    expect(text).to.include("3.10 bar");
    expect(text).to.include("Závlaha aktívna");
    expect(text).to.include("OTVORENÝ");
    expect(text).to.include("42.5 L");
  });

  it("calls switch.turn_off with the zone's entity_id when 'Zavrieť' is clicked", async () => {
    const el = (await fixture(html`<aquasmart-flow-card></aquasmart-flow-card>`)) as AquaSmartFlowCard;
    el.setConfig({ type: "custom:aquasmart-flow-card", device_id: "device-1" });
    const hass = makeHass();
    el.hass = hass;
    await el.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 0));
    await el.updateComplete;

    const button = el.shadowRoot!.querySelector("mwc-button") as HTMLElement;
    expect(button).to.exist;
    button.click();

    expect(hass._callServiceCalls).to.deep.include({
      domain: "switch",
      service: "turn_off",
      data: { entity_id: "switch.garden_lawn" },
    });
  });

  it("throws from setConfig when device_id is missing", async () => {
    const el = (await fixture(html`<aquasmart-flow-card></aquasmart-flow-card>`)) as AquaSmartFlowCard;
    expect(() => el.setConfig({ type: "custom:aquasmart-flow-card", device_id: "" })).to.throw();
  });
});
