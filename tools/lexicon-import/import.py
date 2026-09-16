#!/usr/bin/env python3
"""Import and normalize pinned external tag lexicons.

Standard-library only. External CSV files are deliberately not committed.
Download them to --input-dir using the pinned source definitions, then run this
script. Output is deterministic JSON suitable for the classifier/review stage.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_term(value: str) -> str:
    value = value.strip().lower().replace("_", " ")
    value = re.sub(r"\\s+", " ", value)
    return value


def parse_aliases(value: str) -> list[str]:
    value = value.strip()
    if not value:
        return []
    # TagComplete aliases are commonly represented as a JSON-like list. Be
    # liberal here because source formats can evolve without changing meaning.
    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return sorted({normalize_term(str(x)) for x in parsed if str(x).strip()})
    except json.JSONDecodeError:
        pass
    return sorted({normalize_term(x) for x in re.split(r"[|;]", value) if x.strip()})


def parse_int(value: str) -> int | None:
    try:
        return int(value.strip())
    except (ValueError, AttributeError):
        return None


def read_rows(path: Path, source: dict[str, Any]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.reader(handle)
        for line_no, row in enumerate(reader, 1):
            if not row or not row[0].strip():
                continue
            raw = row[0].strip()
            term = normalize_term(raw)
            category = row[1].strip() if len(row) > 1 else ""
            post_count = parse_int(row[2]) if len(row) > 2 else None
            aliases = parse_aliases(row[3]) if len(row) > 3 else []
            rows.append({
                "term": term,
                "aliases": aliases,
                "source": {
                    "id": source["id"],
                    "source_term": raw,
                    "source_category": category or None,
                    "post_count": post_count,
                    "line": line_no,
                },
            })
    return rows


def merge_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    merged: dict[str, dict[str, Any]] = {}
    for row in rows:
        item = merged.setdefault(row["term"], {"term": row["term"], "aliases": set(), "sources": []})
        item["aliases"].update(a for a in row["aliases"] if a != row["term"])
        item["sources"].append(row["source"])
    result = []
    for item in merged.values():
        result.append({
            "term": item["term"],
            "aliases": sorted(item["aliases"]),
            "sources": sorted(item["sources"], key=lambda x: (x["id"], x["source_term"])),
        })
    return sorted(result, key=lambda x: x["term"])


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("target", choices=["safety"])
    parser.add_argument("--input-dir", type=Path, default=ROOT / "input")
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args()

    source_defs = [load_json(p) for p in sorted((ROOT / "sources").glob("*.json"))]
    all_rows: list[dict[str, Any]] = []
    inputs = []
    for source in source_defs:
        filename = Path(source["path"]).name
        path = args.input_dir / filename
        if not path.exists():
            raise SystemExit(f"Missing source file: {path}")
        rows = read_rows(path, source)
        all_rows.extend(rows)
        inputs.append({"id": source["id"], "file": filename, "rows": len(rows), "sha256": sha256(path), "blob_sha": source.get("blob_sha")})

    terms = merge_rows(all_rows)
    payload = {"schema_version": 1, "target": args.target, "inputs": inputs, "term_count": len(terms), "terms": terms}
    output = args.output or ROOT / "build" / args.target / "normalized.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(terms)} normalized terms to {output}")


if __name__ == "__main__":
    main()
