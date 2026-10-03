import { LitElement, html, css, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import type { AquaSmartFlowCardConfig } from "./types";

const INTEGRATION_DOMAIN = "aquasmart_irrigation";

interface HaDeviceRegistryEntry {
  id: string;
  identifiers: [string, string][];
}

@customElement("aquasmart-flow-card-editor")
export class AquaSmartFlowCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: AquaSmartFlowCardConfig;

  public setConfig(config: AquaSmartFlowCardConfig): void {
    this._config = config;
  }

  private readonly _deviceFilter = (device: HaDeviceRegistryEntry): boolean =>
    device.identifiers?.some(([domain]) => domain === INTEGRATION_DOMAIN) ?? false;

  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``;
    }

    return html`
      <div class="form">
        <ha-device-picker
          .hass=${this.hass}
          .value=${this._config.device_id}
          .deviceFilter=${this._deviceFilter}
          label="AquaSmart zariadenie"
          @value-changed=${this._deviceChanged}
        ></ha-device-picker>
        <ha-textfield
          label="Názov karty (voliteľné)"
          .value=${this._config.title ?? ""}
          @input=${this._titleChanged}
        ></ha-textfield>
      </div>
    `;
  }

  private _deviceChanged(ev: CustomEvent<{ value: string }>): void {
    this._updateConfig({ device_id: ev.detail.value });
  }

  private _titleChanged(ev: Event): void {
    const value = (ev.target as HTMLInputElement).value;
    this._updateConfig({ title: value || undefined });
  }

  private _updateConfig(partial: Partial<AquaSmartFlowCardConfig>): void {
    if (!this._config) return;
    const newConfig = { ...this._config, ...partial } as AquaSmartFlowCardConfig;
    this._config = newConfig;
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true }),
    );
  }

  static styles = css`
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px 0;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "aquasmart-flow-card-editor": AquaSmartFlowCardEditor;
  }
}
