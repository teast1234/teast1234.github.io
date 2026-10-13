# -*- coding: utf-8 -*-
"""Build museum/data/collection.json and compressed art/original assets.

Source of truth: generated_image/04_名画创作清单/已完成档案.json
Only status=已完成 works are published. Re-run before shipping museum updates.
"""
from __future__ import annotations

import hashlib
import json
import shutil
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "generated_image" / "04_名画创作清单" / "已完成档案.json"
ART_DIR_LIB = ROOT / "generated_image" / "03_艺术方向库"
OUT_DATA = Path(__file__).resolve().parent / "data" / "collection.json"
OUT_ART = Path(__file__).resolve().parent / "assets" / "art"
OUT_ORIG = Path(__file__).resolve().parent / "assets" / "original"

MAX_EDGE = 1400
JPEG_QUALITY = 82

# Public-domain Wikimedia thumbs for three classics lacking local 原作参考.
# Use special FilePath redirects (returns an allowed derivative size).
WIKIMEDIA_ORIGINALS = {
    "ART-07-001": "https://commons.wikimedia.org/wiki/Special:FilePath/Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg?width=800",
    "ART-07-005": "https://commons.wikimedia.org/wiki/Special:FilePath/Sanzio_01.jpg?width=800",
    "ART-19-001": "https://commons.wikimedia.org/wiki/Special:FilePath/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg?width=800",
}

# UI filter keys (only emit tags that appear in completed works)
CATEGORY_META = {
    "史前艺术": {"filter": "prehistoric", "label": "史前", "label_en": "Prehistoric"},
    "古埃及艺术": {"filter": "egypt", "label": "古埃及", "label_en": "Ancient Egypt"},
    "古希腊罗马艺术": {"filter": "classical", "label": "古典", "label_en": "Classical"},
    "拜占庭艺术": {"filter": "medieval", "label": "中世纪", "label_en": "Medieval"},
    "中世纪_罗曼式": {"filter": "medieval", "label": "中世纪", "label_en": "Medieval"},
    "中世纪_哥特式": {"filter": "medieval", "label": "中世纪", "label_en": "Medieval"},
    "文艺复兴": {"filter": "renaissance", "label": "文艺复兴", "label_en": "Renaissance"},
    "后印象派": {"filter": "postimpressionism", "label": "后印象", "label_en": "Post-Impressionism"},
}

FILTER_ORDER = [
    ("all", "全部", "All"),
    ("prehistoric", "史前", "Prehistoric"),
    ("egypt", "古埃及", "Ancient Egypt"),
    ("classical", "古典", "Classical"),
    ("medieval", "中世纪", "Medieval"),
    ("renaissance", "文艺复兴", "Renaissance"),
    ("postimpressionism", "后印象", "Post-Impressionism"),
]


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def compress_to_jpeg(src: Path, dest: Path) -> dict:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as im:
        im = im.convert("RGB")
        w, h = im.size
        scale = min(1.0, MAX_EDGE / max(w, h))
        if scale < 1.0:
            im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
        im.save(dest, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        ow, oh = im.size
    return {"width": ow, "height": oh, "bytes": dest.stat().st_size, "sha256": sha256_file(dest)}


def find_local_original(work_id: str) -> Path | None:
    hits = sorted(ART_DIR_LIB.rglob(f"{work_id}_*"))
    refs = [
        p
        for p in hits
        if p.is_file()
        and "01_参考资料" in p.parts
        and p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
        and ("参考" in p.name or "原作" in p.name or "摹本" in p.name)
    ]
    if not refs:
        return None
    # Prefer names containing 原作参考 / 参考
    refs.sort(key=lambda p: (0 if "原作参考" in p.name else 1, len(p.name)))
    return refs[0]


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "naiwa-museum-build/1.0 (personal blog; educational fair use of PD works)"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp, dest.open("wb") as out:
        shutil.copyfileobj(resp, out)


def english_slug(title: str) -> str:
    # Light EN subtitle for cards: keep Chinese title romanization-free; use literal fallback
    return title


def build() -> None:
    OUT_ART.mkdir(parents=True, exist_ok=True)
    OUT_ORIG.mkdir(parents=True, exist_ok=True)

    archive = json.loads(ARCHIVE.read_text(encoding="utf-8"))
    works = [w for w in archive if w.get("status") == "已完成"]
    works.sort(key=lambda w: w["id"])

    items = []
    used_filters: set[str] = set()
    tmp = Path(__file__).resolve().parent / "_tmp_dl"
    tmp.mkdir(exist_ok=True)

    for w in works:
        wid = w["id"]
        meta = CATEGORY_META.get(w["category"], {"filter": "other", "label": w["category"], "label_en": w["category"]})
        used_filters.add(meta["filter"])

        art_src = Path(w["completion"]["file"])
        if not art_src.is_file():
            raise FileNotFoundError(f"Missing art file for {wid}: {art_src}")

        art_dest = OUT_ART / f"{wid}.jpg"
        art_info = compress_to_jpeg(art_src, art_dest)

        original_rel = None
        original_note = None
        orig_src = find_local_original(wid)
        if orig_src is None and wid in WIKIMEDIA_ORIGINALS:
            dl = tmp / f"{wid}_wiki.jpg"
            if not dl.is_file() or dl.stat().st_size < 10_000:
                print(f"download original {wid} ...")
                download(WIKIMEDIA_ORIGINALS[wid], dl)
            orig_src = dl
            original_note = "wikimedia-public-domain"

        if orig_src is not None and orig_src.is_file():
            orig_dest = OUT_ORIG / f"{wid}.jpg"
            compress_to_jpeg(orig_src, orig_dest)
            original_rel = f"assets/original/{wid}.jpg"

        sources = w.get("background_sources") or []
        items.append(
            {
                "id": wid,
                "catalog": f"NMF-{wid}",
                "creation_title": w.get("creation_title") or w["title"],
                "title_en": english_slug(w.get("creation_title") or w["title"]),
                "original_title": w["title"],
                "artist": w.get("artist") or "佚名",
                "category": w["category"],
                "filter": meta["filter"],
                "era_label": meta["label"],
                "era_label_en": meta["label_en"],
                "original_date": w.get("original_date") or "",
                "original_location": w.get("original_location") or "",
                "background": w.get("creation_background") or "",
                "sources": sources,
                "art": f"assets/art/{wid}.jpg",
                "original": original_rel,
                "original_note": original_note,
                "art_meta": art_info,
            }
        )
        print(f"ok {wid} art={art_info['width']}x{art_info['height']} original={'yes' if original_rel else 'no'}")

    filters = [f for f in FILTER_ORDER if f[0] == "all" or f[0] in used_filters]
    payload = {
        "generated_from": str(ARCHIVE.relative_to(ROOT)).replace("\\", "/"),
        "count": len(items),
        "filters": [{"id": a, "label": b, "label_en": c} for a, b, c in filters],
        "works": items,
    }
    OUT_DATA.parent.mkdir(parents=True, exist_ok=True)
    OUT_DATA.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUT_DATA} ({len(items)} works)")

    # cleanup temp downloads (keep compressed originals)
    if tmp.exists():
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    build()
