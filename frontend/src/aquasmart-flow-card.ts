import { LitElement, html, css, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import "./aquasmart-flow-card-editor";
import type { AquaSmartFlowCardConfig, DiagramEntities, DiagramZone } from "./types";

// Same cosmetic approximation the controller's own web UI uses (app.js
// updateWaterFlowDiagram()): 1 mH2O ~= 0.0981 bar, and - absent a configured
// tank capacity - a 0-2m range as the fill-bar reference.
const HYDROSTATIC_BAR_PER_METER = 0.0981;
const TANK_FILL_REFERENCE_METERS = 2.0;

const UNAVAILABLE_STATES = new Set(["unknown", "unavailable", undefined]);

@customElement("aquasmart-flow-card")
export class AquaSmartFlowCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: AquaSmartFlowCardConfig;
  @state() private _entities?: DiagramEntities;
  @state() private _error?: string;

  private _entitiesRequested = false;

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement("aquasmart-flow-card-editor") as unknown as LovelaceCardEditor;
  }

  public static getStubConfig(hass: HomeAssistant): AquaSmartFlowCardConfig {
    const devices = (hass as unknown as { devices?: Record<string, { id: string; identifiers: [string, string][] }> })
      .devices;
    const match = devices
      ? Object.values(devices).find((d) => d.identifiers?.some(([domain]) => domain === "aquasmart_irrigation"))
      : undefined;
    return { type: "custom:aquasmart-flow-card", device_id: match?.id ?? "" };
  }

  public setConfig(config: AquaSmartFlowCardConfig): void {
    if (!config.device_id) {
      throw new Error("Vyber AquaSmart zariadenie v nastaveniach karty.");
    }
    this._config = config;
    this._entitiesRequested = false;
    this._entities = undefined;
    this._error = undefined;
  }

  public getCardSize(): number {
    return 6;
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (this.hass && this._config && !this._entitiesRequested) {
      this._entitiesRequested = true;
      void this._fetchDiagramEntities();
    }
  }

  private async _fetchDiagramEntities(): Promise<void> {
    try {
      this._entities = await this.hass.callWS<DiagramEntities>({
        type: "aquasmart_irrigation/diagram_entities",
        device_id: this._config!.device_id,
      });
    } catch (err) {
      this._error = `Nepodarilo sa načítať entity diagramu: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  private _state(entityId: string | null | undefined): string | undefined {
    if (!entityId) return undefined;
    return this.hass.states[entityId]?.state;
  }

  private _attr(entityId: string | null | undefined, attr: string): unknown {
    if (!entityId) return undefined;
    return this.hass.states[entityId]?.attributes?.[attr];
  }

  private _num(entityId: string | null | undefined): number | undefined {
    const s = this._state(entityId);
    if (UNAVAILABLE_STATES.has(s)) return undefined;
    const n = parseFloat(s as string);
    return Number.isNaN(n) ? undefined : n;
  }

  protected render(): TemplateResult {
    if (this._error) {
      return html`<ha-card><div class="message error">${this._error}</div></ha-card>`;
    }
    if (!this._entities) {
      return html`<ha-card><div class="message">Načítavam diagram...</div></ha-card>`;
    }

    const e = this._entities;
    const runningZones = e.zones.filter((z) => this._state(z.switch_entity_id) === "on");
    const pumpRunning = this._state(e.pump_running_entity_id) === "on";
    const flowing = runningZones.length > 0 || pumpRunning;

    const levelM = this._num(e.tank_level_entity_id);
    const volumeL = this._attr(e.tank_level_entity_id, "volume_liters") as number | undefined;
    const hydroBar = levelM !== undefined ? (levelM * HYDROSTATIC_BAR_PER_METER).toFixed(2) : "--";
    const fillPct =
      levelM !== undefined ? Math.min(100, Math.max(0, (levelM / TANK_FILL_REFERENCE_METERS) * 100)) : 0;

    const pressure = this._num(e.pressure_entity_id);
    const targetPressure = this._num(e.target_pressure_entity_id);
    const pumpFault = this._state(e.pump_fault_entity_id) === "on";

    const flowRate = this._num(e.flow_rate_entity_id);
    const flowTotal = this._num(e.flow_total_entity_id);

    return html`
      <ha-card .header=${this._config?.title || "Hydraulický diagram prúdenia vody"}>
        <div class="card-content">
          <div class="status-pill ${flowing ? "active" : ""}">
            <span class="pulse-dot"></span>
            <span
              >${runningZones.length > 0
                ? `Závlaha aktívna (${runningZones.length} ${runningZones.length === 1 ? "zóna" : "zóny"} otvorené)`
                : "Systém v pohotovosti"}</span
            >
          </div>

          <div class="nodes">
            <div class="node ${flowing ? "active" : ""}">
              <div class="node-header"><ha-icon icon="mdi:database"></ha-icon><span>Zdroj vody</span></div>
              <div class="tank-bar"><div class="tank-fill" style="width: ${fillPct}%"></div></div>
              <div class="metric-main">${levelM !== undefined ? `${levelM.toFixed(2)} m` : "--"}</div>
              <div class="metric-sub">${volumeL !== undefined ? `${Math.round(volumeL)} L` : "--"}</div>
              <div class="detail">Hydrostatický tlak: <strong>${hydroBar} bar</strong></div>
            </div>

            <div class="connector ${flowing ? "active" : ""}">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>

            <div class="node ${pumpRunning ? "active" : ""} ${pumpFault ? "fault" : ""}">
              <div class="node-header"><ha-icon icon="mdi:gauge"></ha-icon><span>Tlakový okruh</span></div>
              <div class="metric-main">${pressure !== undefined ? `${pressure.toFixed(2)} bar` : "--"}</div>
              <div class="metric-sub">
                Cieľ: ${targetPressure !== undefined ? `${targetPressure.toFixed(2)} bar` : "--"}
              </div>
              <div class="detail">Čerpadlo: <strong>${pumpRunning ? "ZAPNUTÉ" : "Vypnuté"}</strong></div>
              ${pumpFault ? html`<div class="detail fault-text">Porucha meniča</div>` : nothing}
            </div>

            <div class="connector ${flowing ? "active" : ""}">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>

            <div class="node ${flowRate ? "active" : ""}">
              <div class="node-header"><ha-icon icon="mdi:chart-line"></ha-icon><span>Prietokomer</span></div>
              <div class="metric-main">${flowRate !== undefined ? `${flowRate.toFixed(1)} L/min` : "--"}</div>
              <div class="metric-sub">Spolu: ${flowTotal !== undefined ? `${flowTotal.toFixed(0)} L` : "--"}</div>
            </div>

            <div class="connector ${flowing ? "active" : ""}">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>

            <div class="node manifold">
              <div class="node-header"><ha-icon icon="mdi:source-branch"></ha-icon><span>Rozdeľovač & zóny</span></div>
              <div class="branches">${e.zones.map((z) => this._renderBranch(z))}</div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderBranch(zone: DiagramZone): TemplateResult {
    const running = this._state(zone.switch_entity_id) === "on";
    const sessionVolume = this._num(zone.session_volume_entity_id);
    const name = (this._attr(zone.switch_entity_id, "friendly_name") as string | undefined) ?? zone.zone_id;
    const flowText = running && sessionVolume !== undefined ? `${sessionVolume.toFixed(1)} L` : running ? "beží" : "0 L";

    return html`
      <div class="branch ${running ? "active" : ""}">
        <div class="branch-info">
          <span class="branch-name">${name}</span>
          <span class="branch-flow">${flowText}</span>
        </div>
        <div class="branch-actions">
          <span class="branch-tag">${running ? "OTVORENÝ" : "ZATVORENÝ"}</span>
          ${running
            ? html`<mwc-button dense @click=${() => this._closeZone(zone.switch_entity_id)}>Zavrieť</mwc-button>`
            : nothing}
        </div>
      </div>
    `;
  }

  private _closeZone(entityId: string): void {
    void this.hass.callService("switch", "turn_off", { entity_id: entityId });
  }

  static styles = css`
    :host {
      display: block;
    }
    .card-content {
      padding: 0 16px 16px;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.85rem;
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      margin-bottom: 16px;
    }
    .status-pill.active {
      background: rgba(var(--rgb-success-color, 76, 175, 80), 0.18);
      color: var(--success-color);
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
    .status-pill.active .pulse-dot {
      animation: pulse 1.5s infinite;
    }

    .nodes {
      display: flex;
      align-items: stretch;
      gap: 4px;
      flex-wrap: wrap;
    }
    .node {
      flex: 1 1 160px;
      min-width: 150px;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 12px;
      transition:
        border-color 0.3s,
        box-shadow 0.3s;
    }
    .node.active {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 1px var(--primary-color);
    }
    .node.fault {
      border-color: var(--error-color);
      box-shadow: 0 0 0 1px var(--error-color);
    }
    .node-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--primary-text-color);
    }
    .node-header ha-icon {
      color: var(--primary-color);
      --mdc-icon-size: 18px;
    }
    .metric-main {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .metric-sub {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
      margin-bottom: 6px;
    }
    .detail {
      font-size: 0.78rem;
      color: var(--secondary-text-color);
    }
    .fault-text {
      color: var(--error-color);
      font-weight: 500;
    }

    .tank-bar {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: var(--divider-color);
      overflow: hidden;
      margin-bottom: 8px;
    }
    .tank-fill {
      height: 100%;
      background: var(--info-color, var(--primary-color));
      transition: width 0.5s;
    }

    .connector {
      flex: 0 0 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
    }
    .connector .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--divider-color);
    }
    .connector.active .dot {
      background: var(--primary-color);
      animation: flow 1.2s infinite;
    }
    .connector.active .dot:nth-child(2) {
      animation-delay: 0.2s;
    }
    .connector.active .dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    .manifold {
      flex-basis: 220px;
    }
    .branches {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .branch {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px;
      border-radius: 8px;
      background: var(--secondary-background-color);
    }
    .branch.active {
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
    }
    .branch-info {
      display: flex;
      flex-direction: column;
    }
    .branch-name {
      font-size: 0.85rem;
      color: var(--primary-text-color);
    }
    .branch-flow {
      font-size: 0.72rem;
      color: var(--secondary-text-color);
    }
    .branch-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .branch-tag {
      font-size: 0.65rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--divider-color);
      color: var(--secondary-text-color);
    }
    .branch.active .branch-tag {
      background: var(--success-color);
      color: var(--text-primary-color, #fff);
    }

    .message {
      padding: 24px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .message.error {
      color: var(--error-color);
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.3;
      }
    }
    @keyframes flow {
      0% {
        opacity: 0.2;
        transform: scale(0.8);
      }
      50% {
        opacity: 1;
        transform: scale(1.2);
      }
      100% {
        opacity: 0.2;
        transform: scale(0.8);
      }
    }

    @media (max-width: 600px) {
      .nodes {
        flex-direction: column;
      }
      .connector {
        flex-direction: row;
        width: 100%;
        height: 16px;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "aquasmart-flow-card": AquaSmartFlowCard;
  }
  interface Window {
    customCards?: { type: string; name: string; description: string }[];
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "aquasmart-flow-card",
  name: "AquaSmart Flow Card",
  description: "Real-time hydraulický diagram prúdenia vody pre AquaSmart Irrigation Controller.",
});
