"""Constants for the AquaSmart Irrigation Controller integration."""
from __future__ import annotations

from datetime import timedelta

DOMAIN = "aquasmart_irrigation"

CONF_API_TOKEN = "api_token"
CONF_USE_HTTPS = "use_https"

DEFAULT_PORT = 8000
DEFAULT_USE_HTTPS = False
DEFAULT_ZONE_DURATION_SECONDS = 600

# The controller's /api/ha/v1/* contract is versioned (see
# docs/implementation_plans/home_assistant_integration_controller.md in the
# aqua-smart repo). Bump this only in lockstep with a verified, intentional
# upgrade of this integration's code to a newer contract version.
SUPPORTED_SCHEMA_VERSION = 1

DEFAULT_FALLBACK_POLL_INTERVAL = timedelta(seconds=60)
OPT_FALLBACK_POLL_INTERVAL = "fallback_poll_interval"
OPT_DEFAULT_ZONE_DURATION = "default_zone_duration"

# WebSocket reconnect backoff bounds (seconds) - see api.AquaSmartWebSocketListener.
WS_RECONNECT_MIN_DELAY = 5
WS_RECONNECT_MAX_DELAY = 60

SERVICE_START_ZONE = "start_zone"
SERVICE_SUSPEND = "suspend"
ATTR_DURATION = "duration"
ATTR_HOURS = "hours"
ATTR_VACATION = "vacation"
