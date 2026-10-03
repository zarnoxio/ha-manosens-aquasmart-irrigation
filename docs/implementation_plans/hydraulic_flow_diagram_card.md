# Hydraulický diagram prúdenia vody — ako Home Assistant Lovelace karta

## Kontext

Controller web UI (`irrigation-controller` repo, `src/web/static/index.html:232-404` + `app.js:1423-1713`) má kartu "Hydraulický diagram prúdenia vody" — 4 uzly (Zdroj vody/Nádrž → Tlakový okruh/Menič → Prietokomer → Rozdeľovač & Ventily/zóny) prepojené animovanými "tečúcimi bodkami" (čisto CSS `@keyframes`, žiadne reálne SVG krivky — tie v HTML sú nepoužité pozostatky). Používateľ chce rovnakú vizualizáciu v Home Assistant, nad už hotovou integráciou `aquasmart-irrigation-ha`.

Rozhodnutia z rozhovoru:
1. **Registrácia**: integrácia pri štarte sama zaregistruje kartu ako Lovelace extra JS modul (`add_extra_js_url`) — žiadne ručné pridávanie Resources.
2. **Technológia**: Lit + TypeScript, s build krokom (esbuild).
3. **Mapovanie entít**: automaticky podľa `device_id` — ale namiesto krehkého hádania na strane frontendu (neisté, ktoré polia `unique_id`/`translation_key` HA frontend naozaj exponuje naprieč verziami) to rieši **nová WebSocket API príkaz na strane integrácie** (`aquasmart_irrigation/diagram_entities`), kde mapovanie robíme v Pythone cez `entity_registry` — presne tak spoľahlivo a testovateľne, ako sme si overili na zvyšku tejto integrácie.

Pri príprave som zistil dve drobné medzery v už existujúcom kontrakte, ktoré treba doplniť (obe spätne kompatibilné, žiadny bump `schema_version`):
- `get_ha_status()` v `aqua-smart`'s `src/web/app.py` nehlási `session_volume` za bežiace zóny (controller to interne má, len to nejde do `/api/ha/v1/status`) — originálny diagram to sčíta ako "Suma relácie".
- `AquaSmartLevelSensor` v `aquasmart-irrigation-ha`'s `sensor.py` nevystavuje `volume_liters` ako atribút (len `level_m` ako stav) — potrebné pre výplň nádrže v diagrame.

## 1. `aqua-smart` repo — malé doplnenie kontraktu

V `get_ha_status()` (`src/web/app.py`) pridať do `zones[z_id]` dict jedno pole:
```python
"session_volume_liters": state.get("session_volume", 0.0) if state.get("is_running") else 0.0,
```
Aditívne pole, `schema_version` ostáva `1`. Doplniť do `docs/implementation_plans/home_assistant_integration_controller.md` (kontrakt) a do existujúceho testu pre `/api/ha/v1/status` tvar.

## 2. `aquasmart-irrigation-ha` repo — zmeny v Python časti integrácie

- **`sensor.py`** — nová entita `AquaSmartZoneSessionVolumeSensor` (state_class `MEASUREMENT`, unit `L`) čítajúca nové `session_volume_liters`. `AquaSmartLevelSensor.extra_state_attributes` doplniť o `volume_liters`.
- **Nový `websocket_api.py`**:
  ```python
  @websocket_api.websocket_command({
      vol.Required("type"): "aquasmart_irrigation/diagram_entities",
      vol.Required("device_id"): str,
  })
  @callback
  def ws_diagram_entities(hass, connection, msg):
      registry = er.async_get(hass)
      entries = er.async_entries_for_device(registry, msg["device_id"])

      def _find(suffix):
          return next((e.entity_id for e in entries if e.unique_id.endswith(suffix)), None)

      zones = []
      for e in entries:
          if e.domain == "switch" and "_zone_" in e.unique_id:
              zid = e.unique_id.rsplit("_zone_", 1)[1]
              zones.append({
                  "zone_id": zid,
                  "switch_entity_id": e.entity_id,
                  "deficit_entity_id": _find(f"zone_{zid}_water_deficit"),
                  "session_volume_entity_id": _find(f"zone_{zid}_session_volume"),
                  "next_action_entity_id": _find(f"zone_{zid}_next_action"),
              })

      connection.send_result(msg["id"], {
          "tank_level_entity_id": _find("_level"),
          "pressure_entity_id": _find("inverter_pressure"),
          "target_pressure_entity_id": _find("inverter_target_pressure"),
          "pump_running_entity_id": _find("inverter_running"),
          "pump_fault_entity_id": _find("inverter_fault"),
          "flow_rate_entity_id": _find("_flow_rate"),
          "flow_total_entity_id": _find("_total"),
          "main_water_entity_id": _find("main_water"),
          "zones": zones,
      })

  def async_register_websocket_api(hass):
      if hass.data.get(f"{DOMAIN}_ws_registered"):
          return
      hass.data[f"{DOMAIN}_ws_registered"] = True
      websocket_api.async_register_command(hass, ws_diagram_entities)
  ```
  Volá sa raz z `async_setup_entry` v `__init__.py` (idempotentný guard vyššie rieši viacero config entries na jeden `hass`).
- **Nový `frontend.py`** — registruje statickú cestu pre skompilovaný JS bundle a pridá ho ako extra Lovelace modul:
  ```python
  CARD_URL_PATH = "/aquasmart_irrigation_files/aquasmart-flow-card.js"

  def async_register_frontend(hass):
      if hass.data.get(f"{DOMAIN}_frontend_registered"):
          return
      hass.data[f"{DOMAIN}_frontend_registered"] = True
      www_dir = Path(__file__).parent / "www"
      # register_static_path (sync, dlhodobo stabilné API) namiesto novšieho
      # async_register_static_paths - rovnaký dôvod ako pri coordinator.py:
      # širšia kompatibilita naprieč HA verziami, overené v tejto session.
      hass.http.register_static_path(CARD_URL_PATH, str(www_dir / "aquasmart-flow-card.js"), cache_headers=False)
      add_extra_js_url(hass, CARD_URL_PATH)
  ```
  Oba `async_register_websocket_api(hass)` a `async_register_frontend(hass)` zavolané z `async_setup_entry` pred `async_forward_entry_setups`.

## 3. Nový `frontend/` zdrojový strom (Lit + TypeScript, esbuild)

```
aquasmart-irrigation-ha/
├── frontend/
│   ├── package.json              # lit, typescript, esbuild ako devDependencies
│   ├── tsconfig.json
│   ├── build.mjs                 # esbuild skript -> ../custom_components/aquasmart_irrigation/www/aquasmart-flow-card.js (jeden bundlovaný súbor, minified)
│   └── src/
│       ├── aquasmart-flow-card.ts
│       ├── aquasmart-flow-card-editor.ts   # GUI editor: ha-device-picker + voliteľný title
│       └── types.ts                        # HomeAssistant/CardConfig/DiagramEntities typy
└── custom_components/aquasmart_irrigation/
    └── www/
        └── aquasmart-flow-card.js          # COMMITNUTÝ build output - HACS používatelia nemajú Node/npm, toto musí byť hotové v repozitári
```

**Prečo committed build output**: HACS kopíruje len `custom_components/`, žiadny build krok sa u používateľa nespúšťa. `frontend/` je dev-only zdroj; CI (bod 5) overí, že `www/aquasmart-flow-card.js` zodpovedá čerstvému buildu z `frontend/src`, aby nikdy nezostal "stale" po zmene zdroja.

### `aquasmart-flow-card.ts` — návrh

- `setConfig({device_id, title?})` → uloží config, vyvolá `hass.callWS({type: 'aquasmart_irrigation/diagram_entities', device_id})` raz (výsledok sa cachuje v inštancii, nemení sa za behu — zoznam entít sa mení len pri reštarte/reload integrácie).
- `set hass(hass)` (Lit reactive property) → re-render pri každej zmene stavu ktorejkoľvek sledovanej entity (Lit `hasChanged` porovnanie na referenciu `hass.states`).
- 4 uzly ako Lit `html` šablóny, vizuálne 1:1 podľa originálu (nádrž s výplňovým pruhom, tlakový okruh, prietokomer, zoznam vetiev/zón s tlačidlom "Zavrieť" volajúcim `hass.callService('switch', 'turn_off', {entity_id})`), ale farby/väčšina CSS cez **natívne HA theme premenné** (`var(--primary-color)`, `var(--success-color)`, `var(--warning-color)`, `var(--error-color)`, `var(--card-background-color)`, `var(--primary-text-color)`) namiesto pevných farieb controllera — aby karta ladila s používateľovou HA témou (light/dark/vlastná).
- Animácia "tečúcich bodiek" medzi uzlami: rovnaký CSS `@keyframes` prístup ako originál (`static styles = css\`...\``), aktívne len keď aspoň jedna zóna beží alebo čerpadlo beží.
- Hydrostatický tlak dopočítaný client-side rovnako ako originál: `level_m * 0.0981` bar.
- `static getConfigElement()` → vráti `<aquasmart-flow-card-editor>`; `static getStubConfig(hass)` → nájde prvé `aquasmart_irrigation` zariadenie a predvyplní `device_id`.
- `getCardSize()` → vráti odhad výšky (napr. `4`) pre Lovelace masonry layout.

### `aquasmart-flow-card-editor.ts`

Minimálny GUI editor: `<ha-device-picker>` filtrovaný na `integration: "aquasmart_irrigation"` + voliteľné textové pole `title`. Emituje `config-changed` event podľa HA konvencie pre card editory.

## 4. Testy

- **Python** (`tests/test_websocket_api.py`, nový): zaregistrovať WS príkaz na test `hass` inštancii (rovnaký `hass`/`mock_config_entry`/`enable_custom_integrations` fixture setup ako existujúce testy), zavolať `client.send_json_auto_id({"type": "aquasmart_irrigation/diagram_entities", "device_id": ...})` cez `hass_ws_client` fixtúru z `pytest-homeassistant-custom-component`, overiť správne namapované `entity_id` pre každú rolu vrátane zón.
- **Frontend** (`frontend/test/aquasmart-flow-card.test.ts`, nový, `@web/test-runner` + `@open-wc/testing` — bežný stack pre Lit komponenty): render karty s mock `hass` objektom a mock WS odpoveďou, overiť že sa vykreslia správne hodnoty (tlak, prietok, stav zóny) a že klik na "Zavrieť" zavolá `hass.callService` so správnymi parametrami.
- **aqua-smart repo**: rozšíriť existujúci test pre `/api/ha/v1/status`, že bežiaca zóna má nenulové `session_volume_liters` a nebežiaca `0.0`.

## 5. CI (`.github/workflows/validate.yml`, rozšíriť)

Nový job `frontend`:
```yaml
frontend:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with: { node-version: "20" }
    - run: npm ci
      working-directory: frontend
    - run: npm run build
      working-directory: frontend
    - run: git diff --exit-code custom_components/aquasmart_irrigation/www/aquasmart-flow-card.js
```
Posledný krok zlyhá CI, ak niekto upraví `frontend/src` a zabudne prebuildovať committed `www/` súbor — rovnaký princíp ako "generated file musí byť v sync", nech sa nikdy nedistribuuje zastaraná karta.

## Zámerne mimo rozsahu

- **SVG krivky medzi uzlami** — originál ich má v HTML markupe nepoužité (žiadny JS nikdy nenastavuje `d` atribút), takže karta ich tiež nebude mať; vizuál "tečúcich bodiek" plne nahrádza funkciu bez zbytočnej SVG matematiky.
- **"Záhradné ventily / ručný odber" riadok** (ručne detekovaný prietok bez bežiacej zóny) — vyžaduje priamy prístup k `total_flow_rate` naprieč zónami aj mimo bežiacich zón, čo dnešný `/api/ha/v1/status` kontrakt nerozlišuje od šumu; necháva sa ako budúce rozšírenie, karta v v1 zobrazí len automatické zóny.
- **Viacero AquaSmart zariadení na jednej karte** — jedna karta = jedno zariadenie (`device_id`), presne ako originál (jeden fyzický controller).
- **Build output pre staršie prehliadače (ES5)** — bundluje sa ako moderný ES modul; `add_extra_js_url(hass, url, es5=False)`.

## Overenie na konci

1. `cd frontend && npm install && npm run build` → over, že vznikne `../custom_components/aquasmart_irrigation/www/aquasmart-flow-card.js`.
2. `pytest` v `aquasmart-irrigation-ha` (vrátane nového `test_websocket_api.py`) pod WSL, rovnako ako doteraz — `enable_custom_integrations` + `hass_ws_client` fixtúra.
3. Skopírovať aktualizovaný `custom_components/aquasmart_irrigation/` do bežiaceho HA (rovnaký postup ako predtým) → reštart.
4. V Lovelace dashboarde **Pridať kartu → AquaSmart Flow Card (vlastná)** → cez editor vybrať zariadenie → over, že sa objavia všetky 4 uzly so správnymi živými hodnotami.
5. Spustiť zónu (cez `switch.zona_...` alebo priamo v controller UI) → over v HA karte do ~3s (WS push cez coordinator) že: uzol "Rozdeľovač" ukáže bežiacu vetvu, animácia bodiek sa aktivuje, tlak/prietok sa menia.
6. Zmeniť HA tému na svetlú/tmavú → over, že karta vizuálne ladí (farby idú z `var(--...)`, nie pevné hex hodnoty).
7. V `aqua-smart` repe spustiť `pytest` → over, že test na `session_volume_liters` prechádza a existujúce testy sa nepokazili.
