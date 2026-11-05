# Paylasilan uygulama image'i: API, Worker, Outbox Publisher ve Retry Dispatcher
# ayni image'i farkli komutlarla kullanir. (Ollama disinda GPU gerekmez.)
FROM python:3.12-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Once sadece bagimlilik tanimlarini kopyalayip kur (katman cache'i icin).
COPY pyproject.toml README.md ./
COPY src ./src
RUN pip install .

# Migration ve alembic yapilandirmasi (container icinden de calistirilabilir).
COPY alembic.ini ./
COPY migrations ./migrations
COPY scripts ./scripts

# Root olmayan kullanici.
RUN useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app
USER appuser

# Varsayilan: API. Diger process'ler compose'da command ile degistirilir.
CMD ["python", "-m", "app.entrypoints.api"]
