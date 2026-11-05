"""Kafka offset contiguous-commit mantigi birim testleri.

Offset yalnizca sirali (contiguous) ilerler; yarim kalan bir offset'in otesine
gecilmez. Bu, worker DB commit sonrasi/Kafka commit oncesi coktugunde mesajin
guvenle yeniden islenmesini (at-least-once) saglar.
"""

from __future__ import annotations

from app.kafka.consumer import OffsetTracker, _PartitionProgress


def test_partition_progress_in_order() -> None:
    p = _PartitionProgress(first_offset=5)
    assert p.next_commit_offset() == 5  # henuz hicbir sey islenmedi
    p.complete(5)
    assert p.next_commit_offset() == 6
    p.complete(6)
    assert p.next_commit_offset() == 7


def test_partition_progress_out_of_order_holds_the_line() -> None:
    p = _PartitionProgress(first_offset=5)
    # 7 once biter ama 5/6 bitmeden commit ilerleyemez.
    p.complete(7)
    assert p.next_commit_offset() == 5
    p.complete(5)
    assert p.next_commit_offset() == 6
    # 6 bitince hem 6 hem (onceden biten) 7 kapanir.
    p.complete(6)
    assert p.next_commit_offset() == 8


def test_tracker_multi_partition() -> None:
    t = OffsetTracker()
    t.note_delivered(("topic", 0), 10)
    t.note_delivered(("topic", 1), 0)
    t.complete(("topic", 0), 10)
    offsets = {(tp.topic, tp.partition): tp.offset for tp in t.drain_commit_offsets()}
    assert offsets[("topic", 0)] == 11
    assert offsets[("topic", 1)] == 0  # p1'de ilerleme yok


def test_tracker_reset_partition() -> None:
    t = OffsetTracker()
    t.note_delivered(("topic", 0), 3)
    t.complete(("topic", 0), 3)
    t.reset([("topic", 0)])
    assert t.drain_commit_offsets() == []
