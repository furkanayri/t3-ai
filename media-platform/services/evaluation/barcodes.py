"""Reconcile readings of physical symbols without guessing glyph substitutions."""


def same_symbol(a, b):
    a, b = a["evidence"], b["evidence"]
    if a["page"] != b["page"]:
        return False
    x0, y0, x1, y1 = a["bbox"]
    u0, v0, u1, v1 = b["bbox"]
    horizontal_overlap = min(x1, u1) > max(x0, u0)
    if a["method"] == b["method"] == "PDF_TEXT":
        return horizontal_overlap and min(y1, v1) > max(y0, v0)
    return horizontal_overlap and abs((y0 + y1 - v0 - v1) / 2) <= 55


def reconcile(candidates):
    groups = []
    for candidate in candidates:
        group = next((g for g in groups if all(same_symbol(candidate, c) for c in g)), None)
        if group is None:
            groups.append([candidate])
        else:
            group.append(candidate)
    result = []
    symbols = []
    for group in groups:
        decoded = [
            c
            for c in group
            if c["reliable"]
            and (
                "-linear-" in c["evidence"]["block_id"] or "-barcode-" in c["evidence"]["block_id"]
            )
            and c["evidence"]["method"] == "OCR"
        ]
        chosen = decoded or group
        result.extend(chosen)
        symbols.append({c["value"] for c in chosen if c["reliable"]})
    nonempty = [s for s in symbols if s]
    multiple = len(nonempty) > 1 and len(set.union(*nonempty)) > 1
    return result, multiple
