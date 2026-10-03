from __future__ import annotations

import asyncio
import json

from django.test import override_settings

from config import websocket as websocket_config
from konnaxion.worlds.runtime import WorldRuntime, get_world_runtime


def _runtime() -> WorldRuntime:
    return WorldRuntime(
        universe_id=3,
        universe_key="research",
        world_id=7,
        world_key="research-innovation-commons",
        release_id=17,
        release_number=7,
        domain_schema="kx_w_research_innovation_commons_r7",
        ekoh_schema="kx_e_research_innovation_commons_r7",
    )


@override_settings(ALLOWED_HOSTS=["testserver"])
def test_reports_websocket_rejects_legacy_unscoped_path():
    events = [{"type": "websocket.connect"}]
    sent = []

    async def receive():
        return events.pop(0)

    async def send(event):
        sent.append(event)

    asyncio.run(
        websocket_config.websocket_application(
            {"path": "/ws/reports/custom", "headers": [(b"origin", b"http://testserver")]},
            receive,
            send,
        )
    )
    assert sent == [{"type": "websocket.close", "code": 4404}]


@override_settings(ALLOWED_HOSTS=["testserver"])
def test_reports_websocket_pins_world_release_for_socket_lifetime(monkeypatch):
    runtime = _runtime()
    events = [
        {"type": "websocket.connect"},
        {"type": "websocket.receive", "text": "ping"},
        {"type": "websocket.disconnect"},
    ]
    sent = []

    async def fake_resolve(*, world_key, universe_key=None, headers):
        assert universe_key is None
        assert world_key == runtime.world_key
        assert headers == [(b"origin", b"http://testserver")]
        return runtime

    async def receive():
        return events.pop(0)

    async def send(event):
        sent.append(event)

    monkeypatch.setattr(
        websocket_config,
        "resolve_websocket_world_runtime",
        fake_resolve,
    )

    asyncio.run(
        websocket_config.websocket_application(
            {
                "path": f"/ws/w/{runtime.world_key}/reports/custom",
                "headers": [(b"origin", b"http://testserver")],
            },
            receive,
            send,
        )
    )

    assert sent[0] == {"type": "websocket.accept"}
    connected = json.loads(sent[1]["text"])
    assert connected["kind"] == "connected"
    assert connected["channel"] == "w7.r17.reports.custom"
    assert connected["world"] == {
        "id": 7,
        "key": runtime.world_key,
        "release_id": 17,
        "release_number": 7,
    }
    assert sent[2] == {"type": "websocket.send", "text": "pong!"}
    keepalive = json.loads(sent[3]["text"])
    assert keepalive["payload"]["world_id"] == 7
    assert keepalive["payload"]["release_id"] == 17
    assert get_world_runtime() is None


@override_settings(ALLOWED_HOSTS=["testserver"])
def test_reports_websocket_accepts_universe_scoped_path(monkeypatch):
    runtime = _runtime()
    events = [
        {"type": "websocket.connect"},
        {"type": "websocket.disconnect"},
    ]
    sent = []

    async def fake_resolve(*, world_key, universe_key=None, headers):
        assert universe_key == runtime.universe_key
        assert world_key == runtime.world_key
        assert headers == [(b"origin", b"http://testserver")]
        return runtime

    async def receive():
        return events.pop(0)

    async def send(event):
        sent.append(event)

    monkeypatch.setattr(
        websocket_config,
        "resolve_websocket_world_runtime",
        fake_resolve,
    )

    asyncio.run(
        websocket_config.websocket_application(
            {
                "path": (
                    f"/ws/u/{runtime.universe_key}/w/{runtime.world_key}/"
                    "reports/custom"
                ),
                "headers": [(b"origin", b"http://testserver")],
            },
            receive,
            send,
        )
    )

    assert sent[0] == {"type": "websocket.accept"}
    connected = json.loads(sent[1]["text"])
    assert connected["universe"] == {
        "id": runtime.universe_id,
        "key": runtime.universe_key,
    }
    assert connected["world"]["release_id"] == runtime.release_id
    assert get_world_runtime() is None
