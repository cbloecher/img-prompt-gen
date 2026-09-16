#!/usr/bin/env python3
"""Apply durable reviewed decisions to a normalized lexicon.

Unknown terms are not guessed. They become review candidates, ordered by source
frequency, so future discovery rules can be added without silently inventing
safety classifications.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
VALID = {"irrelevant", "contextual_safe", "contextual_review", "explicit_unsafe"}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def max_count(term: dict[str, Any]) -> int:
    return max((s.get("post_count") or 0 for s in term.get("sources", [])), default=0)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("target", choices=["safety"])
    parser.add_argument("--normalized", type=Path)
    args = parser.parse_args()

    build_dir = ROOT / "build" / args.target
    normalized = load(args.normalized or build_dir / "normalized.json")
    rules = load(ROOT / "rules" / f"{args.target}.json")
    decisions_doc = load(ROOT / "decisions" / f"{args.target}.json")
    decisions = {d["term"]: d for d in decisions_doc["decisions"]}

    unknown_classes = sorted({d["classification"] for d in decisions.values()} - VALID)
    if unknown_classes:
        raise SystemExit(f"Unknown classifications: {unknown_classes}")

    classified, irrelevant, review = [], [], []
    for term in normalized["terms"]:
        decision = decisions.get(term["term"])
        if decision:
            out = {**term, "classification": decision["classification"], "category": decision.get("category"), "curated": decision.get("curated", False)}
            if out["classification"] == "irrelevant":
                irrelevant.append(out)
            else:
                classified.append(out)
        else:
            review.append({**term, "classification": None, "category": None, "review_reason": "no durable decision", "priority_post_count": max_count(term)})

    review.sort(key=lambda x: (-x["priority_post_count"], x["term"]))
    classified.sort(key=lambda x: (x["classification"], x.get("category") or "", x["term"]))
    irrelevant.sort(key=lambda x: x["term"])

    build_dir.mkdir(parents=True, exist_ok=True)
    outputs = {
        "classified.json": classified,
        "review.json": review,
        "irrelevant.json": irrelevant,
    }
    for name, terms in outputs.items():
        payload = {"schema_version": 1, "target": args.target, "classifications": list(rules["classifications"]), "term_count": len(terms), "terms": terms}
        (build_dir / name).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {len(terms)} terms to {build_dir / name}")


if __name__ == "__main__":
    main()
