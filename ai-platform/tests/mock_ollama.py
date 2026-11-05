"""Ollama API'sini taklit eden, ayarlanabilir sahte HTTP servisi.

Gercek model veya GPU CALISTIRILMAZ. Gecikme (latency), hata cevaplari ve donen
icerik test icinde ayarlanabilir; boylece timeout, gecici 5xx, basarili cevap ve
gecersiz JSON cikti gibi senaryolar deterministik bicimde test edilir.
"""

from __future__ import annotations

import json
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class MockOllamaState:
    def __init__(self) -> None:
        self.latency_seconds: float = 0.0
        self.status_code: int = 200
        self.response_text: str = "merhaba"
        self.prompt_tokens: int = 12
        self.completion_tokens: int = 7
        self.fail_times: int = 0  # ilk N cagriyi 503 ile reddet
        self.call_count: int = 0
        self.lock = threading.Lock()


class MockOllama:
    def __init__(self) -> None:
        self.state = MockOllamaState()
        handler = self._make_handler()
        self._server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        self._thread = threading.Thread(target=self._server.serve_forever, daemon=True)

    @property
    def url(self) -> str:
        return f"http://127.0.0.1:{self._server.server_address[1]}"

    def start(self) -> None:
        self._thread.start()

    def stop(self) -> None:
        self._server.shutdown()
        self._server.server_close()

    def _make_handler(self):  # type: ignore[no-untyped-def]
        state = self.state

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *args: object) -> None:  # sessiz
                return

            def _send_json(self, code: int, body: dict) -> None:
                data = json.dumps(body).encode("utf-8")
                self.send_response(code)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)

            def do_GET(self) -> None:  # noqa: N802
                if self.path.startswith("/api/version"):
                    self._send_json(200, {"version": "mock"})
                elif self.path.startswith("/api/tags"):
                    self._send_json(200, {"models": []})
                else:
                    self._send_json(404, {"error": "not found"})

            def do_POST(self) -> None:  # noqa: N802
                length = int(self.headers.get("Content-Length", "0"))
                _ = self.rfile.read(length)
                with state.lock:
                    state.call_count += 1
                    fail = state.fail_times > 0
                    if fail:
                        state.fail_times -= 1
                    latency = state.latency_seconds
                    status = state.status_code
                    text = state.response_text
                    pt = state.prompt_tokens
                    ct = state.completion_tokens

                if latency > 0:
                    time.sleep(latency)

                if fail:
                    self._send_json(503, {"error": "model yukleniyor"})
                    return
                if status != 200:
                    self._send_json(status, {"error": "mock error"})
                    return

                self._send_json(
                    200,
                    {
                        "model": "mock",
                        "message": {"role": "assistant", "content": text},
                        "done": True,
                        "prompt_eval_count": pt,
                        "eval_count": ct,
                        "total_duration": 1_000_000,
                    },
                )

        return Handler
