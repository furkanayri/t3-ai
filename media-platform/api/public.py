"""Public API (tenant yuzeyi): submit / status / result / cancel.

Kaynak byte'lari octet-stream govdesinde gelir. X-Profile basligi profili secer
(document | media, varsayilan document); belge profilinde tur X-Document-Type
basligindadir, medya profilinde tur byte'lardan tespit edilir. Sonuc GET /result
ile cekildiginde teslim edilip silinir (delete-on-delivery). Tenant izolasyonu
her uc noktada zorlanir.
"""

from fastapi import APIRouter, Depends, Header, Request

from orchestrator import engine, results
from api.auth import tenant_id

router = APIRouter(prefix="/v1", tags=["public"])


@router.post("/assets", status_code=202)
async def submit_asset(
    request: Request,
    tenant: str = Depends(tenant_id),
    x_profile: str = Header("document"),
    x_document_type: str = Header(""),
):
    body = await request.body()
    return engine.submit(tenant, x_document_type, body, profile=x_profile)


@router.get("/jobs/{job_id}")
def job_status(job_id: str, tenant: str = Depends(tenant_id)):
    return engine.job_status(tenant, job_id)


@router.get("/jobs/{job_id}/result")
def job_result(job_id: str, tenant: str = Depends(tenant_id)):
    result = results.deliver(tenant, job_id)
    return result


@router.post("/jobs/{job_id}/cancel")
def job_cancel(job_id: str, tenant: str = Depends(tenant_id)):
    return engine.cancel(tenant, job_id)
