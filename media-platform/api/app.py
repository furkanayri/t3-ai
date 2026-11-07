"""FastAPI control-plane uygulamasi (Faz 2).

Baslangicta dev keyring/token bootstrap + DB sema olusturulur. DomainError'lar
{code, status} JSON'una cevrilir. Worker varsayilan olarak surec-ici engine
cagirir; internal router dis worker'lar icin ayni yuzeyi HTTP'de acar.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from config.settings import settings
from platform_core import bootstrap
from platform_core.errors import DomainError
from orchestrator import db
from api import internal, public


def create_app():
    # Dev keyring/token + DB sema; starlette surumune bagli startup event'e
    # guvenmeden dogrudan kurulur.
    bootstrap.ensure_all()
    db.init_db()
    if settings.RUN_INPROC_WORKER:
        # Tek konteynerli dagitim: API + surec-ici worker ayni surecte.
        from workers.runner import start_background

        start_background()
    app = FastAPI(title="media-platform", version="0.2.0")

    @app.exception_handler(DomainError)
    async def _domain_error(request: Request, exc: DomainError):
        return JSONResponse(status_code=exc.status, content={"code": exc.code})

    @app.get("/health")
    def health():
        return {"ok": True}

    app.include_router(public.router)
    app.include_router(internal.router)
    return app


app = create_app()
