"""
Async API client for the AquaSmart Irrigation Controller's /api/ha/v1/* REST +
WebSocket contract. See docs/implementation_plans/home_assistant_integration_controller.md
in the aqua-smart repo for the authoritative contract this talks to.
"""
from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, Callable

import aiohttp

from .const import WS_RECONNECT_MAX_DELAY, WS_RECONNECT_MIN_DELAY

_LOGGER = logging.getLogger(__name__)


class AquaSmartApiError(Exception):
    """Base error for AquaSmart API communication."""


class AquaSmartAuthError(AquaSmartApiError):
    """Raised when the API token is rejected (HTTP 401 / WS handshake 401)."""


class AquaSmartConnectionError(AquaSmartApiError):
    """Raised when the controller cannot be reached at all."""


class AquaSmartApiClient:
    """Thin async client for the controller's /api/ha/v1/* contract and control endpoints."""

    def __init__(
        self,
        session: aiohttp.ClientSession,
        host: str,
        port: int,
        api_token: str,
        use_https: bool = False,
    ) -> None:
        self._session = session
        self._api_token = api_token
        scheme = "https" if use_https else "http"
        self._base_url = f"{scheme}://{host}:{port}"

    @property
    def api_token(self) -> str:
        return self._api_token

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self._api_token}"}

    async def _request(self, method: str, path: str, **kwargs: Any) -> dict[str, Any]:
        url = f"{self._base_url}{path}"
        try:
            async with self._session.request(
                method,
                url,
                headers=self._headers(),
                timeout=aiohttp.ClientTimeout(total=10),
                **kwargs,
            ) as resp:
                if resp.status == 401:
                    raise AquaSmartAuthError(f"Unauthorized calling {path}")
                resp.raise_for_status()
                if resp.content_type == "application/json":
                    return await resp.json()
                return {}
        except AquaSmartAuthError:
            raise
        except (aiohttp.ClientError, asyncio.TimeoutError) as err:
            raise AquaSmartConnectionError(f"Error communicating with controller at {url}: {err}") from err

    # --- Discovery & status (see get_ha_discovery / get_ha_status in aqua-smart's src/web/app.py) ---

    async def discovery(self) -> dict[str, Any]:
        return await self._request("GET", "/api/ha/v1/discovery")

    async def get_status(self) -> dict[str, Any]:
        return await self._request("GET", "/api/ha/v1/status")

    # --- Control actions (existing aqua-smart endpoints, now accepting API tokens too) ---

    async def start_zone(self, zone_id: str, duration: int) -> dict[str, Any]:
        return await self._request("POST", f"/api/zones/{zone_id}/start", json={"duration": duration})

    async def stop_zone(self, zone_id: str) -> dict[str, Any]:
        return await self._request("POST", f"/api/zones/{zone_id}/stop")

    async def toggle_main_water(self, enabled: bool) -> dict[str, Any]:
        return await self._request("POST", "/api/system/main_water", json={"enabled": enabled})

    async def set_winter_mode(self, enabled: bool) -> dict[str, Any]:
        return await self._request("POST", "/api/system/winter_mode", json={"enabled": enabled})

    async def suspend(self, hours: int | None = None, vacation: bool = False) -> dict[str, Any]:
        payload: dict[str, Any] = {"vacation": vacation}
        if hours is not None:
            payload["hours"] = hours
        return await self._request("POST", "/api/system/suspend", json=payload)

    async def resume(self) -> dict[str, Any]:
        return await self._request("POST", "/api/system/resume")

    async def force_close_all(self) -> dict[str, Any]:
        return await self._request("POST", "/api/valves/force_close_all")

    async def reset_fault(self) -> dict[str, Any]:
        return await self._request("POST", "/api/inverter/reset-fault")

    # --- WebSocket ---

    def ws_url(self) -> str:
        scheme = "wss" if self._base_url.startswith("https") else "ws"
        host_port = self._base_url.split("://", 1)[1]
        return f"{scheme}://{host_port}/ws/ha/v1/status?token={self._api_token}"


class AquaSmartWebSocketListener:
    """
    Maintains a persistent connection to /ws/ha/v1/status and invokes `on_message`
    with each parsed status payload (the primary, low-latency update path - see
    coordinator.AquaSmartDataUpdateCoordinator). Reconnects forever with
    exponential backoff (WS_RECONNECT_MIN_DELAY..WS_RECONNECT_MAX_DELAY, reset to
    the minimum after any successful connect) until stop() is called — the
    controller already does nothing special for a client that keeps retrying, so
    there is no reason to ever give up permanently except on a 401, which means
    the token itself was revoked, not a transient network issue.
    """

    def __init__(
        self,
        session: aiohttp.ClientSession,
        client: AquaSmartApiClient,
        on_message: Callable[[dict[str, Any]], None],
        on_auth_failure: Callable[[], None] | None = None,
    ) -> None:
        self._session = session
        self._client = client
        self._on_message = on_message
        self._on_auth_failure = on_auth_failure
        self._task: asyncio.Task | None = None
        self._stopped = False

    def start(self) -> None:
        self._stopped = False
        self._task = asyncio.create_task(self._run())

    async def stop(self) -> None:
        self._stopped = True
        if self._task is not None:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None

    async def _run(self) -> None:
        delay = WS_RECONNECT_MIN_DELAY
        while not self._stopped:
            try:
                async with self._session.ws_connect(
                    self._client.ws_url(), heartbeat=20, timeout=10
                ) as ws:
                    delay = WS_RECONNECT_MIN_DELAY  # reset backoff after a successful connect
                    async for msg in ws:
                        if msg.type == aiohttp.WSMsgType.TEXT:
                            try:
                                self._on_message(json.loads(msg.data))
                            except ValueError:
                                _LOGGER.warning("Received non-JSON message on AquaSmart WebSocket, ignoring")
                        elif msg.type in (aiohttp.WSMsgType.CLOSED, aiohttp.WSMsgType.ERROR):
                            break
            except aiohttp.WSServerHandshakeError as err:
                if err.status == 401:
                    _LOGGER.warning("AquaSmart WebSocket rejected our API token (401)")
                    if self._on_auth_failure:
                        self._on_auth_failure()
                    return
                _LOGGER.debug("AquaSmart WebSocket handshake failed: %s", err)
            except (aiohttp.ClientError, asyncio.TimeoutError, OSError) as err:
                _LOGGER.debug("AquaSmart WebSocket connection error: %s", err)

            if self._stopped:
                return
            await asyncio.sleep(delay)
            delay = min(delay * 2, WS_RECONNECT_MAX_DELAY)
