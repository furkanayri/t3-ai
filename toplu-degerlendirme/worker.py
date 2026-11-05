#!/usr/bin/env python3
"""Local batch video evaluation worker."""

import json
import os
import queue
import re
import shutil
import subprocess
import threading
import time
from datetime import datetime
from pathlib import Path

import boto3
import requests
from bson.objectid import ObjectId
from faster_whisper import WhisperModel
from pymongo import ASCENDING, MongoClient


def required_env(name):
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} is required")
    return value


RESULT_MODE = os.getenv("RESULT_MODE", "mongo").lower()
if RESULT_MODE not in {"mongo", "file"}:
    raise RuntimeError("RESULT_MODE must be either 'mongo' or 'file'")

MONGO_URI = os.getenv("MONGO_URI", "")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "heplin-local")
SQS_ENDPOINT_URL = required_env("SQS_ENDPOINT_URL")
SQS_QUEUE_NAME = os.getenv("SQS_QUEUE_NAME", "VideoJobQueueLocal")
AWS_REGION = os.getenv("AWS_REGION", "eu-west-1")
VIDEO_SOURCE = os.getenv("VIDEO_SOURCE", "local").lower()
LOCAL_VIDEO_DIR = Path(os.getenv("LOCAL_VIDEO_DIR", "/videos-source")).resolve()
R2_BUCKET_URL = os.getenv("R2_BUCKET_URL", "").rstrip("/")
WORK_DIR = Path(os.getenv("WORK_DIR", "/app/videos")).resolve()
MAX_PREFETCH = max(1, int(os.getenv("MAX_PREFETCH", "1")))
MAX_VIDEOS_TO_PROCESS = max(0, int(os.getenv("MAX_VIDEOS_TO_PROCESS", "0")))
AUDIO_THRESHOLD_DB = float(os.getenv("AUDIO_THRESHOLD_DB", "-60"))
WHISPER_MODEL_NAME = os.getenv("WHISPER_MODEL", "large-v3")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cuda")
WHISPER_COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8_float16")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")
RUN_ID = os.getenv("RUN_ID", "").strip()
RUNS_DIR = Path(os.getenv("RUNS_DIR", "/app/.local-runs")).resolve()

if RESULT_MODE == "mongo" and not MONGO_URI:
    raise RuntimeError("MONGO_URI is required when RESULT_MODE=mongo")
if RESULT_MODE == "file" and not RUN_ID:
    raise RuntimeError("RUN_ID is required when RESULT_MODE=file")

if VIDEO_SOURCE not in {"local", "r2"}:
    raise RuntimeError("VIDEO_SOURCE must be either 'local' or 'r2'")
if VIDEO_SOURCE == "r2" and not R2_BUCKET_URL:
    raise RuntimeError("R2_BUCKET_URL is required when VIDEO_SOURCE=r2")

WORK_DIR.mkdir(parents=True, exist_ok=True)

sqs = boto3.client(
    "sqs",
    region_name=AWS_REGION,
    endpoint_url=SQS_ENDPOINT_URL,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "test"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "test"),
)


def resolve_queue_url():
    last_error = None
    for _ in range(30):
        try:
            return sqs.get_queue_url(QueueName=SQS_QUEUE_NAME)["QueueUrl"]
        except Exception as error:
            last_error = error
            time.sleep(2)
    raise RuntimeError(f"SQS queue is not ready: {last_error}")


SQS_URL = resolve_queue_url()

mongo_client = None
processed_collection = None
run_dir = None
results_dir = None

if RESULT_MODE == "mongo":
    print("Connecting to local MongoDB...")
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    mongo_client.admin.command("ping")
    db = mongo_client[MONGO_DB_NAME]
    processed_collection = db["processed_interviews"]
    processed_collection.create_index(
        [("candidateAnswerId", ASCENDING), ("answerId", ASCENDING)],
        unique=True,
        name="candidate_answer_unique_result",
        partialFilterExpression={
            "candidateAnswerId": {"$type": "objectId"},
            "answerId": {"$type": "objectId"},
        },
    )
    print(f"MongoDB connected: {MONGO_DB_NAME}")
else:
    run_dir = (RUNS_DIR / RUN_ID).resolve()
    if run_dir.parent != RUNS_DIR:
        raise RuntimeError("RUN_ID escaped RUNS_DIR")
    results_dir = run_dir / "results"
    results_dir.mkdir(parents=True, exist_ok=True)
    print(f"Comparison results: {results_dir}")

print(f"Loading Whisper model: {WHISPER_MODEL_NAME} ({WHISPER_DEVICE}/{WHISPER_COMPUTE_TYPE})")
try:
    whisper_model = WhisperModel(
        WHISPER_MODEL_NAME,
        device=WHISPER_DEVICE,
        compute_type=WHISPER_COMPUTE_TYPE,
    )
    active_whisper_device = WHISPER_DEVICE
    active_whisper_compute_type = WHISPER_COMPUTE_TYPE
except Exception as error:
    print(f"GPU Whisper initialization failed, falling back to CPU int8: {error}")
    whisper_model = WhisperModel(WHISPER_MODEL_NAME, device="cpu", compute_type="int8")
    active_whisper_device = "cpu"
    active_whisper_compute_type = "int8"

print(f"Whisper ready; Ollama model: {OLLAMA_MODEL}")
process_queue = queue.Queue(maxsize=MAX_PREFETCH)


def as_object_id(value, field_name):
    try:
        return ObjectId(str(value))
    except Exception as error:
        raise ValueError(f"Invalid {field_name}: {value}") from error


def safe_video_name(file_key):
    if not isinstance(file_key, str) or not file_key.strip():
        raise ValueError("fileKey is required")
    file_name = Path(file_key).name
    if file_name != file_key or file_name in {".", ".."}:
        raise ValueError("fileKey must be a plain file name in local mode")
    return file_name


def acquire_video(file_key, answer_id):
    file_name = safe_video_name(file_key) if VIDEO_SOURCE == "local" else Path(file_key).name
    work_path = WORK_DIR / f"{answer_id}-{file_name}"
    if VIDEO_SOURCE == "local":
        source_path = (LOCAL_VIDEO_DIR / file_name).resolve()
        if source_path.parent != LOCAL_VIDEO_DIR:
            raise ValueError("Resolved video path escaped LOCAL_VIDEO_DIR")
        if not source_path.is_file():
            raise FileNotFoundError(f"Local video was not found: {file_name}")
        shutil.copy2(source_path, work_path)
        return work_path

    response = requests.get(f"{R2_BUCKET_URL}/{file_key}", stream=True, timeout=30)
    response.raise_for_status()
    with work_path.open("wb") as output:
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            output.write(chunk)
    return work_path


def detect_audio(video_path):
    command = ["ffmpeg", "-i", str(video_path), "-af", "volumedetect", "-f", "null", "-"]
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=60, check=False)
        output = result.stderr
        mean_match = re.search(r"mean_volume:\s*([-\d.]+)\s*dB", output)
        duration_match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", output)
        average_db = float(mean_match.group(1)) if mean_match else -100.0
        duration = 0.0
        if duration_match:
            hours, minutes, seconds = duration_match.groups()
            duration = int(hours) * 3600 + int(minutes) * 60 + float(seconds)
        return average_db > AUDIO_THRESHOLD_DB, average_db, duration
    except Exception as error:
        print(f"Audio detection failed, continuing with transcription: {error}")
        return True, 0.0, 0.0


def transcribe_video(video_path):
    segments, _ = whisper_model.transcribe(str(video_path), language="tr")
    return " ".join(segment.text.strip() for segment in segments).strip()


def evaluate_transcript(question, evaluation_criteria, transcript):
    prompt = f"""Sen bir mülakat değerlendirme asistanısın.

SORU:
{question}

DEĞERLENDİRME KRİTERLERİ:
{evaluation_criteria or "Belirtilmedi"}

ADAYIN CEVABI:
{transcript}

Değerlendirmeni JSON formatında döndür:
- score: 1.0 - 5.0 arası ondalıklı sayı
- reasoning: 2-3 cümle Türkçe açıklama

Sadece geçerli JSON döndür."""
    response = requests.post(
        f"{OLLAMA_HOST}/api/generate",
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "keep_alive": os.getenv("OLLAMA_KEEP_ALIVE", "5m"),
            "options": {"temperature": 0.2, "num_predict": 600, "top_p": 0.9},
        },
        timeout=300,
    )
    response.raise_for_status()
    result = json.loads(response.json().get("response", "{}"))
    score = max(1.0, min(5.0, float(result.get("score", 3.0))))
    reasoning = str(result.get("reasoning", "Değerlendirme yapıldı.")).strip()
    return score, reasoning


def convert_score(score):
    return round((score - 1) * 2.5, 2)


def result_key(body):
    return {
        "candidateAnswerId": as_object_id(body["candidateAnswerId"], "candidateAnswerId"),
        "answerId": as_object_id(body["answerId"], "answerId"),
    }


def atomic_write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    with temporary.open("w", encoding="utf-8") as output:
        json.dump(value, output, ensure_ascii=False, indent=2)
        output.flush()
        os.fsync(output.fileno())
    temporary.replace(path)


def serialize_value(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat() + "Z"
    if isinstance(value, dict):
        return {key: serialize_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [serialize_value(item) for item in value]
    return value


def set_run_state(status, **extra):
    if RESULT_MODE != "file":
        return
    state_path = run_dir / "state.json"
    existing = {}
    try:
        with state_path.open("r", encoding="utf-8") as source:
            existing = json.load(source)
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    atomic_write_json(state_path, {
        **existing,
        "runId": RUN_ID,
        "status": status,
        "updatedAt": datetime.utcnow().isoformat() + "Z",
        **extra,
    })


def set_active(body=None):
    if RESULT_MODE != "file":
        return
    active_path = run_dir / "active.json"
    if body is None:
        active_path.unlink(missing_ok=True)
        return
    atomic_write_json(active_path, {
        "runId": RUN_ID,
        "answerId": str(body.get("answerId", "")),
        "fileKey": body.get("fileKey", ""),
        "question": body.get("question", ""),
        "startedAt": datetime.utcnow().isoformat() + "Z",
    })


def upsert_result(body, values):
    key = result_key(body)
    result = {
        **key,
        "candidateId": as_object_id(body["candidateId"], "candidateId"),
        "userId": as_object_id(body["userId"], "userId"),
        "interviewId": as_object_id(body["interviewId"], "interviewId"),
        "questionId": str(body["questionId"]),
        "fileKey": body["fileKey"],
        "question": body["question"],
        "evaluationCriteria": body.get("evaluationCriteria", ""),
        "oldScore": body.get("oldScore"),
        "scoreBand": body.get("scoreBand"),
        "sourceSha256": body.get("sourceSha256"),
        "runId": body.get("runId"),
        "processedAt": datetime.utcnow(),
        **values,
    }
    if RESULT_MODE == "mongo":
        processed_collection.update_one(key, {"$set": result}, upsert=True)
        return

    if body.get("runId") != RUN_ID:
        raise ValueError("Message runId does not match worker RUN_ID")
    output_path = results_dir / f"{str(key['answerId'])}.json"
    atomic_write_json(output_path, serialize_value(result))


def downloader_thread():
    print("SQS downloader started")
    while True:
        if process_queue.full():
            time.sleep(1)
            continue
        try:
            response = sqs.receive_message(
                QueueUrl=SQS_URL,
                MaxNumberOfMessages=1,
                WaitTimeSeconds=20,
                VisibilityTimeout=900,
            )
            for message in response.get("Messages", []):
                body = json.loads(message["Body"])
                process_queue.put({"body": body, "message": message})
        except Exception as error:
            print(f"Downloader error: {error}")
            time.sleep(5)


def process_video(item):
    start_time = time.time()
    body = item["body"]
    message = item["message"]
    video_path = None
    has_audio = None
    print(f"Processing: {body['fileKey']}")
    set_active(body)
    try:
        video_path = acquire_video(body["fileKey"], body["answerId"])
        has_audio, average_db, duration = detect_audio(video_path)
        if not has_audio:
            upsert_result(body, {
                "status": "FAILED", "transcript": None, "evaluationScore": None,
                "evaluationReasoning": None,
                "diagnostics": {
                    "hasAudio": False, "audioDetectionMethod": "ffmpeg_volume_detect",
                    "averageVolumeDb": average_db, "videoDurationSeconds": duration,
                    "errors": ["NO_AUDIO_DETECTED"],
                    "processingTimeSeconds": round(time.time() - start_time, 2),
                },
                "modelVersions": {
                    "whisper": WHISPER_MODEL_NAME,
                    "whisperDevice": active_whisper_device,
                    "whisperComputeType": active_whisper_compute_type,
                    "llm": OLLAMA_MODEL,
                },
            })
            print("Video has no detectable audio")
            return

        transcript = transcribe_video(video_path)
        if len(transcript) < 10:
            upsert_result(body, {
                "status": "FAILED", "transcript": transcript, "evaluationScore": None,
                "evaluationReasoning": None,
                "diagnostics": {
                    "hasAudio": True, "audioDetectionMethod": "ffmpeg_volume_detect",
                    "averageVolumeDb": average_db, "videoDurationSeconds": duration,
                    "errors": ["TRANSCRIPT_TOO_SHORT"],
                    "processingTimeSeconds": round(time.time() - start_time, 2),
                },
                "modelVersions": {
                    "whisper": WHISPER_MODEL_NAME,
                    "whisperDevice": active_whisper_device,
                    "whisperComputeType": active_whisper_compute_type,
                    "llm": OLLAMA_MODEL,
                },
            })
            print("Transcript is too short")
            return

        llm_score, reasoning = evaluate_transcript(
            body["question"], body.get("evaluationCriteria", ""), transcript
        )
        final_score = convert_score(llm_score)
        upsert_result(body, {
            "status": "SUCCESS", "transcript": transcript,
            "evaluationScore": final_score, "evaluationReasoning": reasoning,
            "diagnostics": {
                "hasAudio": True, "audioDetectionMethod": "ffmpeg_volume_detect",
                "averageVolumeDb": average_db, "videoDurationSeconds": duration,
                "errors": [], "processingTimeSeconds": round(time.time() - start_time, 2),
            },
            "modelVersions": {
                "whisper": WHISPER_MODEL_NAME, "whisperDevice": active_whisper_device,
                "whisperComputeType": active_whisper_compute_type, "llm": OLLAMA_MODEL,
            },
        })
        print(f"Completed: {body['fileKey']} - score {final_score}/10")
    except Exception as error:
        print(f"Processing failed: {error}")
        try:
            upsert_result(body, {
                "status": "FAILED", "transcript": None, "evaluationScore": None,
                "evaluationReasoning": None,
                "diagnostics": {
                    "hasAudio": has_audio, "errors": [f"PROCESSING_ERROR: {error}"],
                    "processingTimeSeconds": round(time.time() - start_time, 2),
                },
                "modelVersions": {
                    "whisper": WHISPER_MODEL_NAME,
                    "whisperDevice": active_whisper_device,
                    "whisperComputeType": active_whisper_compute_type,
                    "llm": OLLAMA_MODEL,
                },
            })
        except Exception as save_error:
            print(f"Failed to persist error result: {save_error}")
    finally:
        set_active(None)
        try:
            sqs.delete_message(QueueUrl=SQS_URL, ReceiptHandle=message["ReceiptHandle"])
        except Exception as error:
            print(f"Failed to delete SQS message: {error}")
        try:
            if video_path is not None:
                video_path.unlink(missing_ok=True)
        except Exception as error:
            print(f"Failed to remove working copy: {error}")


def main():
    print("Local video evaluation worker started")
    print(f"Queue: {SQS_QUEUE_NAME}")
    print(f"Video source: {VIDEO_SOURCE}")
    if RESULT_MODE == "mongo":
        print(f"Result collection: {MONGO_DB_NAME}.processed_interviews")
    else:
        print(f"Result mode: comparison files ({RUN_ID})")
        set_run_state("processing", startedAt=datetime.utcnow().isoformat() + "Z")
    threading.Thread(target=downloader_thread, daemon=True).start()
    processed_count = 0
    while True:
        try:
            item = process_queue.get(timeout=60)
            process_video(item)
            process_queue.task_done()
            processed_count += 1
            if MAX_VIDEOS_TO_PROCESS and processed_count >= MAX_VIDEOS_TO_PROCESS:
                print(f"Reached MAX_VIDEOS_TO_PROCESS={MAX_VIDEOS_TO_PROCESS}; stopping")
                set_run_state("completed", completedAt=datetime.utcnow().isoformat() + "Z")
                return
        except queue.Empty:
            print("No jobs in queue; waiting")
        except KeyboardInterrupt:
            print("Shutting down")
            return
        except Exception as error:
            print(f"Worker loop error: {error}")
            time.sleep(5)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        set_run_state("failed", error=str(error), failedAt=datetime.utcnow().isoformat() + "Z")
        raise
    finally:
        if mongo_client is not None:
            mongo_client.close()
