# Local Faster Whisper + Ollama worker for an 8 GB NVIDIA GPU.

FROM nvidia/cuda:12.1.0-base-ubuntu22.04

WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    OLLAMA_HOST=0.0.0.0 \
    OLLAMA_KEEP_ALIVE=-1

# Install Python, Ollama, FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.10 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates \
    zstd \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && curl -fsSL https://ollama.com/install.sh | sh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY requirements.txt ./

# Current CTranslate2 releases require CUDA 12 and cuDNN 9.
RUN pip3 install --no-cache-dir -r requirements.txt \
    "nvidia-cudnn-cu12==9.*" \
    nvidia-cublas-cu12 \
    && rm -rf ~/.cache/pip

# KRITIK: LD_LIBRARY_PATH düzeltmesi (dist-packages!)
ENV LD_LIBRARY_PATH=/usr/local/lib/python3.10/dist-packages/nvidia/cudnn/lib:/usr/local/lib/python3.10/dist-packages/nvidia/cublas/lib:$LD_LIBRARY_PATH

# Copy scripts
COPY worker.py entrypoint.sh ./
RUN chmod +x entrypoint.sh && mkdir -p /app/videos

# Start Ollama + Worker
ENTRYPOINT ["/app/entrypoint.sh"]

