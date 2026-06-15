#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
from collections import deque
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


USER_AGENT = "Mozilla/5.0 (compatible; Codex Site Mirror/1.0)"


TEXT_EXTENSIONS = {
    ".html",
    ".js",
    ".css",
    ".json",
    ".map",
    ".txt",
    ".xml",
    ".svg",
}


ATTR_URL_RE = re.compile(r"""(?:href|src|poster)=["']([^"'#]+)["']""", re.IGNORECASE)
CSS_URL_RE = re.compile(r"""url\(([^)]+)\)""", re.IGNORECASE)
SRCSET_RE = re.compile(r"""srcset=["']([^"']+)["']""", re.IGNORECASE)
NUXT_PATH_RE = re.compile(r"""(/_nuxt/[^"' )]+)""")
ABSOLUTE_URL_RE = re.compile(r"""https?://[^"' )]+""", re.IGNORECASE)
ROOT_FILE_RE = re.compile(
    r"""["'](/[^"'?#]+\.(?:avif|css|eot|gif|ico|jpeg|jpg|js|json|map|mp4|otf|png|svg|ttf|webm|webp|woff2?|xml)(?:\?[^"']*)?)["']""",
    re.IGNORECASE,
)


def fetch(url: str) -> tuple[bytes, str]:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request) as response:
        content_type = response.headers.get("Content-Type", "")
        return response.read(), content_type


def decode_text(data: bytes) -> str:
    for encoding in ("utf-8", "utf-8-sig", "latin-1"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


def clean_url(raw: str) -> str | None:
    value = raw.strip().strip("'\"")
    if not value:
        return None
    if value.startswith("data:") or value.startswith("mailto:") or value.startswith("javascript:"):
        return None
    return value


def normalize_url(base_url: str, raw: str) -> str | None:
    value = clean_url(raw)
    if not value:
        return None
    if value.startswith("//"):
        parsed = urlparse(base_url)
        return f"{parsed.scheme}:{value}"
    return urljoin(base_url, value)


def is_same_origin(candidate: str, origin: str) -> bool:
    parsed_candidate = urlparse(candidate)
    parsed_origin = urlparse(origin)
    return (
        parsed_candidate.scheme == parsed_origin.scheme
        and parsed_candidate.netloc == parsed_origin.netloc
    )


def looks_like_text(url: str, content_type: str) -> bool:
    if content_type.startswith("text/"):
        return True
    if any(token in content_type for token in ("javascript", "json", "xml", "svg")):
        return True
    suffix = Path(urlparse(url).path).suffix.lower()
    return suffix in TEXT_EXTENSIONS or suffix == ""


def local_path_for_url(destination: Path, url: str, html_route: bool = False) -> Path:
    parsed = urlparse(url)
    path = parsed.path or "/"
    if html_route or path.endswith("/") or "." not in Path(path).name:
        clean = path.strip("/")
        if not clean:
            return destination / "index.html"
        return destination / clean / "index.html"
    return destination / path.lstrip("/")


def extract_urls(base_url: str, text: str) -> set[str]:
    discovered: set[str] = set()

    for raw in ATTR_URL_RE.findall(text):
        normalized = normalize_url(base_url, raw)
        if normalized:
            discovered.add(normalized)

    for raw in CSS_URL_RE.findall(text):
        normalized = normalize_url(base_url, raw)
        if normalized:
            discovered.add(normalized)

    for raw in SRCSET_RE.findall(text):
        for item in raw.split(","):
            candidate = item.strip().split(" ")[0]
            normalized = normalize_url(base_url, candidate)
            if normalized:
                discovered.add(normalized)

    for raw in NUXT_PATH_RE.findall(text):
        normalized = normalize_url(base_url, raw)
        if normalized:
            discovered.add(normalized)

    for raw in ABSOLUTE_URL_RE.findall(text):
        normalized = normalize_url(base_url, raw)
        if normalized:
            discovered.add(normalized)

    for raw in ROOT_FILE_RE.findall(text):
        normalized = normalize_url(base_url, raw)
        if normalized:
            discovered.add(normalized)

    return discovered


def parse_manifest_routes(text: str) -> list[str]:
    match = re.search(r"routes:\[(.*)\]", text)
    if not match:
        raise RuntimeError("Could not find route list in manifest.js")
    raw_routes = re.findall(r'"(.*?)"', match.group(1))
    routes: list[str] = []
    for route in raw_routes:
        decoded = route.encode("utf-8").decode("unicode_escape")
        routes.append(decoded)
    return routes


def find_static_build_id(html: str) -> str:
    match = re.search(r"/_nuxt/static/([^/]+)/manifest\.js", html)
    if not match:
        raise RuntimeError("Could not find Nuxt static build id in root HTML")
    return match.group(1)


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def write_file(path: Path, data: bytes) -> None:
    ensure_parent(path)
    path.write_bytes(data)


def iter_route_payload_urls(origin: str, build_id: str, routes: Iterable[str]) -> list[str]:
    payloads = [urljoin(origin, f"/_nuxt/static/{build_id}/state.js")]
    payloads.append(urljoin(origin, f"/_nuxt/static/{build_id}/manifest.js"))
    payloads.append(urljoin(origin, f"/_nuxt/static/{build_id}/payload.js"))

    for route in routes:
        if route == "/":
            continue
        route_path = route.lstrip("/")
        payloads.append(urljoin(origin, f"/_nuxt/static/{build_id}/{route_path}/payload.js"))

    return payloads


def main() -> int:
    parser = argparse.ArgumentParser(description="Mirror a statically generated Nuxt site.")
    parser.add_argument("--url", required=True, help="Base website URL, e.g. https://example.com/")
    parser.add_argument("--dest", required=True, help="Destination directory for mirrored files.")
    args = parser.parse_args()

    origin = args.url.rstrip("/") + "/"
    destination = Path(args.dest).resolve()
    destination.mkdir(parents=True, exist_ok=True)

    visited: set[str] = set()
    queue: deque[tuple[str, bool]] = deque()
    external_urls: set[str] = set()
    saved_files: list[Path] = []

    root_bytes, root_content_type = fetch(origin)
    root_html = decode_text(root_bytes)
    build_id = find_static_build_id(root_html)

    manifest_url = urljoin(origin, f"/_nuxt/static/{build_id}/manifest.js")
    manifest_text = decode_text(fetch(manifest_url)[0])
    routes = parse_manifest_routes(manifest_text)

    route_urls = [origin] + [urljoin(origin, route.lstrip("/")) for route in routes if route != "/"]
    for route_url in route_urls:
        queue.append((route_url, True))

    for payload_url in iter_route_payload_urls(origin, build_id, routes):
        queue.append((payload_url, False))

    while queue:
        current_url, html_route = queue.popleft()
        if current_url in visited:
            continue
        visited.add(current_url)

        try:
            data, content_type = fetch(current_url)
        except Exception as exc:  # pragma: no cover - network dependent
            print(f"Skipping {current_url}: {exc}", file=sys.stderr)
            continue

        local_path = local_path_for_url(destination, current_url, html_route=html_route)
        write_file(local_path, data)
        saved_files.append(local_path)
        print(f"Saved {current_url} -> {local_path}")

        if looks_like_text(current_url, content_type):
            text = decode_text(data)
            for discovered in extract_urls(current_url, text):
                if is_same_origin(discovered, origin):
                    queue.append((discovered, False))
                else:
                    external_urls.add(discovered)

    external_report = destination / "external-urls.txt"
    ensure_parent(external_report)
    external_report.write_text("\n".join(sorted(external_urls)) + "\n", encoding="utf-8")

    summary = destination / "mirror-summary.txt"
    summary.write_text(
        "\n".join(
            [
                f"Origin: {origin}",
                f"Build ID: {build_id}",
                f"Routes mirrored: {len(route_urls)}",
                f"Files saved: {len(saved_files)}",
                f"External URLs discovered: {len(external_urls)}",
            ]
        )
        + "\n",
        encoding="utf-8",
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
