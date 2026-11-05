"""LLM API process giris noktasi (uvicorn)."""

from __future__ import annotations

import uvicorn

from app.config import get_settings
from app.entrypoints._common import configure_event_loop_policy


def main() -> None:
    configure_event_loop_policy()
    settings = get_settings()
    uvicorn.run(
        "app.api.app:create_app",
        factory=True,
        host=settings.api_host,
        port=settings.api_port,
        log_config=None,  # kendi JSON loglamamizi kullaniyoruz
        access_log=False,
    )


if __name__ == "__main__":
    main()
