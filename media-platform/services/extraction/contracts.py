import math
import re

from config.settings import settings

from platform_core.errors import DomainError


def output_schema(output, method):
    """Reject malformed or oversized output before it becomes a durable artifact."""
    try:
        if not set(output) == {
            "schema_version",
            "method",
            "engine_version",
            "pages",
            "processed_pages",
            "blocks",
        }:
            raise ValueError()
        if not (output["schema_version"] in (1, 2) and output["method"] == method):
            raise ValueError()
        if not (isinstance(output["engine_version"], str) and len(output["engine_version"]) <= 80):
            raise ValueError()
        pages = output["pages"]
        if not 1 <= len(pages) <= settings.MAX_PDF_PAGES:
            raise ValueError()
        ids = set()
        for page in pages:
            if not set(page) == {"page", "width", "height", "rotation"}:
                raise ValueError()
            if not (type(page["page"]) is int and 1 <= page["page"] <= settings.MAX_PDF_PAGES):
                raise ValueError()
            if not page["page"] not in ids:
                raise ValueError()
            ids.add(page["page"])
            if not all(
                (
                    isinstance(page[k], (float, int))
                    and math.isfinite(page[k])
                    and (0 < page[k] <= 20000)
                    for k in ("width", "height")
                )
            ):
                raise ValueError()
            if page["rotation"] not in (0, 90, 180, 270):
                raise ValueError()
        if not set(output["processed_pages"]) == ids:
            raise ValueError()
        if not len(output["blocks"]) <= 100000:
            raise ValueError()
        block_ids = set()
        for block in output["blocks"]:
            block_keys = {"block_id", "page", "bbox", "text", "confidence"}
            if output["schema_version"] == 2:
                block_keys |= {"words", "variant"}
            if set(block) != block_keys:
                raise ValueError()
            if output["schema_version"] == 2:
                if not re.fullmatch(r"[a-zA-Z0-9_-]{1,32}", block["variant"]):
                    raise ValueError()
                if not isinstance(block["words"], list) or len(block["words"]) > 1000:
                    raise ValueError()
                for word in block["words"]:
                    if set(word) != {"text", "bbox", "confidence"}:
                        raise ValueError()
                    if not isinstance(word["text"], str) or len(word["text"]) > 1000:
                        raise ValueError()
                    if not (
                        isinstance(word["confidence"], (int, float))
                        and 0 <= word["confidence"] <= 1
                    ):
                        raise ValueError()
                    if not (
                        len(word["bbox"]) == 4
                        and all(
                            isinstance(v, (int, float)) and math.isfinite(v) and abs(v) <= 20000
                            for v in word["bbox"]
                        )
                    ):
                        raise ValueError()
            if not re.fullmatch("[a-zA-Z0-9_-]{1,64}", block["block_id"]):
                raise ValueError()
            if not block["block_id"] not in block_ids:
                raise ValueError()
            block_ids.add(block["block_id"])
            if block["page"] not in ids:
                raise ValueError()
            if not (isinstance(block["text"], str) and len(block["text"]) <= 100000):
                raise ValueError()
            if not (
                len(block["bbox"]) == 4
                and all(
                    (
                        isinstance(v, (int, float)) and math.isfinite(v) and (abs(v) <= 20000)
                        for v in block["bbox"]
                    )
                )
            ):
                raise ValueError()
            if not (block["confidence"] is None or 0 <= block["confidence"] <= 1):
                raise ValueError()
    except (AssertionError, KeyError, TypeError, ValueError):
        raise DomainError("INVALID_OUTPUT", 422) from None
    return output
