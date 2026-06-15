#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import mimetypes
import os
import re
from pathlib import Path
from typing import Iterable
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
USER_AGENT = "Mozilla/5.0 (compatible; Codex Asset Localizer/1.0)"
TEXT_EXTENSIONS = {".html", ".js", ".css", ".json", ".map", ".txt", ".xml", ".svg"}
LITERAL_URL_RE = re.compile(r"https?://[^\"'\s<>()]+", re.IGNORECASE)
ESCAPED_URL_RE = re.compile(r"https?:\\u002F\\u002F[^\"'\s<>()]+", re.IGNORECASE)
TARGET_FILENAMES = {"index.html", "state.js", "payload.js"}
FM_EXTENSION_MAP = {
    "jpg": ".jpg",
    "jpeg": ".jpg",
    "png": ".png",
    "gif": ".gif",
    "webp": ".webp",
    "avif": ".avif",
}
CONTENT_TYPE_EXTENSION_MAP = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/svg+xml": ".svg",
    "image/x-icon": ".ico",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
}


def iter_target_files(root: Path) -> Iterable[Path]:
    for file_path in root.rglob("*"):
        if not file_path.is_file():
            continue
        if file_path.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        if file_path.name not in TARGET_FILENAMES:
            continue
        yield file_path


def route_dir_for_file(file_path: Path) -> Path | None:
    rel = file_path.relative_to(ROOT)
    if rel.name == "index.html":
        return rel.parent

    parts = rel.parts
    if len(parts) >= 4 and parts[0] == "_nuxt" and parts[1] == "static" and rel.name in {"state.js", "payload.js"}:
        if len(parts) == 4:
            return Path(".")
        return Path(*parts[3:-1])

    return None


def normalize_match(raw: str) -> str:
    return raw.replace("\\u002F", "/").replace("\\/", "/")


def should_localize(url: str, hosts: set[str]) -> bool:
    parsed = urlparse(url)
    return parsed.netloc.lower() in hosts


def format_for_url(url: str) -> str:
    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    fmt = params.get("fm", [None])[0]
    if fmt:
        return fmt.lower()

    suffix = Path(parsed.path).suffix.lower().lstrip(".")
    if suffix == "jpeg":
        return "jpg"
    return suffix or "bin"


def infer_extension(url: str, content_type: str) -> str:
    fmt = format_for_url(url)
    mapped = FM_EXTENSION_MAP.get(fmt)
    if mapped:
        return mapped

    content_type = content_type.split(";")[0].strip().lower()
    if content_type in CONTENT_TYPE_EXTENSION_MAP:
        return CONTENT_TYPE_EXTENSION_MAP[content_type]

    guessed, _ = mimetypes.guess_type(parsed.path)
    if guessed and guessed in CONTENT_TYPE_EXTENSION_MAP:
        return CONTENT_TYPE_EXTENSION_MAP[guessed]

    suffix = Path(parsed.path).suffix.lower()
    if suffix:
        return suffix
    return ".bin"


def canonical_asset_key(url: str) -> str:
    parsed = urlparse(url)
    return f"{parsed.netloc}{parsed.path}|{format_for_url(url)}"


def asset_priority(url: str) -> tuple[int, int, int]:
    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    if not parsed.query:
        return (3, 0, 0)

    width = int(params.get("w", ["0"])[0] or 0)
    height = int(params.get("h", ["0"])[0] or 0)
    area = width * height
    has_fit = 1 if "fit" in params else 0
    return (2 if area else 1, area, has_fit)


def sanitize_stem(name: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", name).strip("-")
    return cleaned or "asset"


def local_asset_path(url: str, content_type: str, canonical_key: str) -> Path:
    parsed = urlparse(url)
    source_path = Path(parsed.path.lstrip("/"))
    stem = sanitize_stem(source_path.stem or source_path.name or "asset")
    suffix = infer_extension(url, content_type)
    digest = hashlib.sha1(canonical_key.encode("utf-8")).hexdigest()[:12]
    parent = ROOT / "mirror-assets" / parsed.netloc / source_path.parent
    return parent / f"{stem}__{digest}{suffix}"


def fetch_asset(url: str) -> tuple[bytes, str]:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request) as response:
        return response.read(), response.headers.get("Content-Type", "")


def replace_urls_in_text(
    text: str,
    route_dir: Path,
    key_to_asset: dict[str, Path],
    hosts: set[str],
) -> tuple[str, int]:
    replacements = 0
    route_root = (ROOT / route_dir).resolve()

    def replace_match(match: re.Match[str]) -> str:
        nonlocal replacements
        original = match.group(0)
        normalized = normalize_match(original)
        if not should_localize(normalized, hosts):
            return original

        asset_path = key_to_asset.get(canonical_asset_key(normalized))
        if not asset_path:
            return original

        relative = Path(os.path.relpath(asset_path, route_root)).as_posix()
        replacements += 1
        return relative

    text = LITERAL_URL_RE.sub(replace_match, text)
    text = ESCAPED_URL_RE.sub(replace_match, text)
    return text, replacements


def collect_asset_urls(files: Iterable[Path], hosts: set[str]) -> set[str]:
    discovered: set[str] = set()
    for file_path in files:
        route_dir = route_dir_for_file(file_path)
        if route_dir is None:
            continue
        text = file_path.read_text(encoding="utf-8")
        for regex in (LITERAL_URL_RE, ESCAPED_URL_RE):
            for match in regex.findall(text):
                normalized = normalize_match(match)
                if should_localize(normalized, hosts):
                    discovered.add(normalized)
    return discovered


def choose_representative_urls(urls: Iterable[str]) -> dict[str, str]:
    representatives: dict[str, str] = {}
    for url in urls:
        key = canonical_asset_key(url)
        current = representatives.get(key)
        if current is None or asset_priority(url) > asset_priority(current):
            representatives[key] = url
    return representatives


def download_assets(representatives: dict[str, str]) -> dict[str, Path]:
    key_to_asset: dict[str, Path] = {}
    for canonical_key, url in sorted(representatives.items()):
        data, content_type = fetch_asset(url)
        local_path = local_asset_path(url, content_type, canonical_key)
        local_path.parent.mkdir(parents=True, exist_ok=True)
        local_path.write_bytes(data)
        key_to_asset[canonical_key] = local_path
        print(f"Saved {url} -> {local_path}")
    return key_to_asset


def rewrite_files(files: Iterable[Path], key_to_asset: dict[str, Path], hosts: set[str]) -> int:
    updated = 0
    for file_path in files:
        route_dir = route_dir_for_file(file_path)
        if route_dir is None:
            continue

        original = file_path.read_text(encoding="utf-8")
        rewritten, replacements = replace_urls_in_text(original, route_dir, key_to_asset, hosts)
        if replacements:
            file_path.write_text(rewritten, encoding="utf-8")
            updated += 1
            print(f"Updated {file_path} ({replacements} replacements)")
    return updated


def write_report(
    raw_urls: Iterable[str],
    representatives: dict[str, str],
    key_to_asset: dict[str, Path],
    updated_files: int,
) -> None:
    report = ROOT / "local-assets-summary.txt"
    lines = [
        f"Raw asset URLs: {len(set(raw_urls))}",
        f"Localized assets: {len(key_to_asset)}",
        f"Updated files: {updated_files}",
        "",
    ]
    for canonical_key, url in sorted(representatives.items()):
        lines.append(f"{url} -> {key_to_asset[canonical_key].relative_to(ROOT).as_posix()}")
    report.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Download remote site assets and rewrite references locally.")
    parser.add_argument(
        "--host",
        action="append",
        default=["www.datocms-assets.com"],
        help="Asset host to localize. Can be passed multiple times.",
    )
    args = parser.parse_args()

    hosts = {host.lower() for host in args.host}
    files = list(iter_target_files(ROOT))
    urls = collect_asset_urls(files, hosts)
    if not urls:
        print("No matching external assets found.")
        return 0

    representatives = choose_representative_urls(urls)
    key_to_asset = download_assets(representatives)
    updated_files = rewrite_files(files, key_to_asset, hosts)
    write_report(urls, representatives, key_to_asset, updated_files)
    print(f"Localized {len(key_to_asset)} assets across {updated_files} files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
