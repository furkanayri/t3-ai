"""Ince HTTP istemci. Varsayilan transport httpx; test icin httpx uyumlu bir
istemci (orn. FastAPI TestClient) enjekte edilebilir."""


class MediaPlatformError(RuntimeError):
    """Platform 4xx/5xx yaniti. `code` platform hata kodu (varsa)."""

    def __init__(self, status_code, code="", message=""):
        self.status_code = status_code
        self.code = code
        super().__init__(message or code or f"HTTP {status_code}")


class Client:
    def __init__(self, base_url=None, token=None, *, http_client=None, timeout=30):
        if http_client is None:
            import httpx

            http_client = httpx.Client(base_url=base_url, timeout=timeout)
        self._http = http_client
        self._token = token

    # -- dahili --------------------------------------------------------------
    def _headers(self, extra=None):
        headers = {}
        if self._token:
            headers["Authorization"] = f"Bearer {self._token}"
        if extra:
            headers.update(extra)
        return headers

    @staticmethod
    def _unwrap(response):
        if response.status_code >= 400:
            code = ""
            try:
                body = response.json()
                code = body.get("code", "") if isinstance(body, dict) else ""
            except Exception:  # noqa: BLE001 - govde JSON olmayabilir
                pass
            raise MediaPlatformError(response.status_code, code)
        return response.json()

    # -- public API ----------------------------------------------------------
    def submit(self, data, *, document_type=None, profile="document"):
        """Asset gonder. Belge profilinde document_type zorunlu; medya profilinde
        tur byte'lardan tespit edilir. Doner: {asset_id, job_id}."""
        headers = {"Content-Type": "application/octet-stream", "X-Profile": profile}
        if document_type:
            headers["X-Document-Type"] = document_type
        response = self._http.post(
            "/v1/assets", content=data, headers=self._headers(headers)
        )
        return self._unwrap(response)

    def status(self, job_id):
        return self._unwrap(
            self._http.get(f"/v1/jobs/{job_id}", headers=self._headers())
        )

    def result(self, job_id):
        """Sonucu cek (delete-on-delivery: ikinci cagri 404/NOT_FOUND)."""
        return self._unwrap(
            self._http.get(f"/v1/jobs/{job_id}/result", headers=self._headers())
        )

    def cancel(self, job_id):
        return self._unwrap(
            self._http.post(f"/v1/jobs/{job_id}/cancel", headers=self._headers())
        )

    def close(self):
        if hasattr(self._http, "close"):
            self._http.close()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()
