"""Internal API (worker yuzeyi): claim / input / complete / failed + bakim.

document_control apps/core/internal.py deseni. Rol, servis token'indan gelir ve
engine ilgili asamanin rolu ile eslesmesini zorlar. Payload kuyruga girmez;
worker byte'lari yalnizca `input` ile ephemeral'dan ceker.
"""

from fastapi import APIRouter, Body, Depends, Header, Request, Response

from orchestrator import engine, metrics, results, webhook
from api.auth import service_role

router = APIRouter(prefix="/internal", tags=["internal"])


@router.post("/claim")
def claim(payload: dict = Body(...), role: str = Depends(service_role)):
    return engine.claim(payload["job_id"], payload["stage"], role)


@router.post("/input")
def input_bytes(payload: dict = Body(...), role: str = Depends(service_role)):
    data = engine.input_bytes(payload["job_id"], payload["lease"], role, payload["kind"])
    return Response(content=data, media_type="application/octet-stream")


@router.post("/complete")
def complete(payload: dict = Body(...), role: str = Depends(service_role)):
    return engine.complete(
        payload["job_id"], payload["lease"], role, output=payload.get("output")
    )


@router.post("/complete-binary")
async def complete_binary(
    request: Request,
    role: str = Depends(service_role),
    x_job_id: str = Header(...),
    x_lease: str = Header(...),
):
    body = await request.body()
    return engine.complete(x_job_id, x_lease, role, binary=body)


@router.post("/failed")
def failed(payload: dict = Body(...), role: str = Depends(service_role)):
    code = payload.get("code", "WORKER_FAILED")
    return engine.failed(payload["job_id"], payload["lease"], role, code)


@router.post("/maintenance")
def maintenance(role: str = Depends(service_role)):
    if role != "dispatcher":
        from platform_core.errors import DomainError

        raise DomainError("FORBIDDEN", 403)
    engine.reconcile()
    return {"ok": True}


@router.post("/retention")
def retention(role: str = Depends(service_role)):
    if role != "dispatcher":
        from platform_core.errors import DomainError

        raise DomainError("FORBIDDEN", 403)
    return results.purge_expired()


@router.post("/webhooks/dispatch")
def dispatch_webhooks(role: str = Depends(service_role)):
    if role != "dispatcher":
        from platform_core.errors import DomainError

        raise DomainError("FORBIDDEN", 403)
    return webhook.dispatch_pending()


@router.get("/metrics")
def observability_metrics(role: str = Depends(service_role)):
    if role != "dispatcher":
        from platform_core.errors import DomainError

        raise DomainError("FORBIDDEN", 403)
    return metrics.snapshot()
