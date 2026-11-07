# CPU imaji: control plane (API) + light/scan/media-cpu worker'lari.
# Dijital-PDF yolu + tesseract baseline OCR + ffmpeg demux burada tam calisir.
# GPU inference tier (PaddleOCR + faster-whisper) ayri imajdir: Dockerfile.gpu.
FROM python:3.13-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Sistem bagimliliklari: ffmpeg (medya demux/transcode), tesseract (baseline OCR,
# TR + Latin). Model agirliklari vendor'lanir/mount edilir; runtime indirme YOK.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ffmpeg \
      tesseract-ocr \
      tesseract-ocr-tur \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Bagimliliklar once (katman cache). Server dikisleri (psycopg/redis/pika/boto3)
# de kurulur; her seam ilgili env verilince devreye girer.
COPY requirements.txt requirements-server.txt ./
RUN pip install --upgrade pip \
 && pip install -r requirements.txt -r requirements-server.txt

COPY . .
# .instance (dev keyring/token) + muhtemel sqlite dosyasi icin yazilabilir dizin.
# app sahipligi ile onceden olusturulur ki ustune binen named volume ilk olusumda
# bu sahipligi devralsin (aksi halde root:root olur ve non-root app yazamaz).
RUN chmod +x docker/entrypoint.sh \
 && useradd --create-home --uid 10001 app \
 && mkdir -p /app/.instance \
 && chown -R app:app /app

USER app
EXPOSE 8000

# Saglik kontrolu control-plane /health ucuna.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/health',timeout=3).status==200 else 1)"

ENTRYPOINT ["/app/docker/entrypoint.sh"]
CMD ["api"]
