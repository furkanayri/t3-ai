"""Sentetik 16 kHz mono WAV uretici (medya testleri icin).

Varsayilan plan: sesli ton patlamalarini sessizlik bosluklariyla ayirir, boylece
VAD chunker birden fazla chunk uretir.
"""

import numpy as np

from services.media.vad import TARGET_RATE, write_wav

DEFAULT_PLAN = [(1.5, True), (0.8, False), (1.7, True), (0.8, False), (1.2, True)]


def speech_wav(plan=None):
    plan = plan or DEFAULT_PLAN
    pieces = []
    for duration, voiced in plan:
        count = int(duration * TARGET_RATE)
        t = np.arange(count) / TARGET_RATE
        if voiced:
            signal = 0.3 * np.sin(2 * np.pi * 220 * t) + 0.2 * np.sin(2 * np.pi * 440 * t)
            pieces.append((signal * 12000).astype(np.int16))
        else:
            pieces.append(np.zeros(count, np.int16))
    return write_wav(TARGET_RATE, np.concatenate(pieces))
