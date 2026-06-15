#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BUILD_ID = next((ROOT / "_nuxt" / "static").iterdir()).name
BASE_TAG_SCRIPT = (
    "<script>"
    "(function(){"
    'var p=window.location.pathname||"/";'
    'var last=p.substring(p.lastIndexOf("/")+1);'
    'if(!/\\/$/.test(p)&&last&&!/\\.[^\\/]+$/.test(last))p+="/";'
    'document.write(\'<base href="\'+p.replace(/"/g,"%22")+\'">\');'
    "})();"
    "</script>"
)


def relative_prefix(from_dir: Path) -> str:
    rel = Path.cwd()
    rel = Path(Path(".").resolve())
    root_rel = Path(__import__("os").path.relpath(ROOT, from_dir)).as_posix()
    return "./" if root_rel == "." else root_rel.rstrip("/") + "/"


def to_href(current_dir: Path, route: str) -> str:
    route = route.strip("/")
    target = ROOT if not route else ROOT / route
    rel = Path(__import__("os").path.relpath(target, current_dir)).as_posix()
    return "./" if rel == "." else rel.rstrip("/") + "/"


def patch_html(file_path: Path) -> None:
    prefix = relative_prefix(file_path.parent)
    text = file_path.read_text(encoding="utf-8")

    if "<base href=" not in text and BASE_TAG_SCRIPT not in text:
        text = text.replace("<head>", f"<head>{BASE_TAG_SCRIPT}", 1)

    text = re.sub(
        r'((?:href|src)=["\'])/(_nuxt/[^"\']+)',
        lambda m: f"{m.group(1)}{prefix}{m.group(2)}",
        text,
    )
    text = re.sub(
        r'((?:href|src)=["\'])/(foot-mobile\.webp)',
        lambda m: f"{m.group(1)}{prefix}{m.group(2)}",
        text,
    )

    def replace_href(match: re.Match[str]) -> str:
        quote = match.group(1)
        route = match.group(2)
        if route.startswith("_nuxt/") or route.startswith("foot-mobile.webp"):
            return match.group(0)
        return f'href={quote}{to_href(file_path.parent, route)}{quote}'

    text = re.sub(r'href=(["\'])/([^"\']*)\1', replace_href, text)
    file_path.write_text(text, encoding="utf-8")


def patch_state(file_path: Path) -> None:
    text = file_path.read_text(encoding="utf-8")
    helper = (
        'window.__NUXT_BASE__=window.__NUXT_BASE__||(function(){'
        f'var m="/_nuxt/static/{BUILD_ID}",f={{basePath:"/",assetsPath:"/_nuxt/",staticAssetsBase:"/_nuxt/static/{BUILD_ID}"}};'
        'if(typeof window==="undefined")return f;'
        'for(var s=document.getElementsByTagName("script"),i=s.length-1;i>=0;i--){'
        'var src=s[i].src||"";'
        'try{var p=new URL(src,window.location.href).pathname;var x=p.indexOf(m);'
        'if(x!==-1){var b=x===0?"/":p.slice(0,x+1);return{basePath:b,assetsPath:b+"_nuxt/",staticAssetsBase:b+"_nuxt/static/'
        f'{BUILD_ID}"'
        '};}}catch(e){}}return f;})();'
    )

    if not text.startswith("window.__NUXT_BASE__="):
        text = helper + text

    text = text.replace(
        f'staticAssetsBase:"\\u002F_nuxt\\u002Fstatic\\u002F{BUILD_ID}"',
        'staticAssetsBase:window.__NUXT_BASE__.staticAssetsBase',
    )
    text = text.replace(
        'config:{_app:{basePath:"\\u002F",assetsPath:"\\u002F_nuxt\\u002F",cdnURL:a},content:{dbHash:"b25b294c"}}',
        'config:{_app:{basePath:window.__NUXT_BASE__.basePath,assetsPath:window.__NUXT_BASE__.assetsPath,cdnURL:a},content:{dbHash:"b25b294c"}}',
    )
    text = text.replace(
        'config:{_app:{basePath:g,assetsPath:"\\u002F_nuxt\\u002F",cdnURL:a},content:{dbHash:"b25b294c"}}',
        'config:{_app:{basePath:window.__NUXT_BASE__.basePath,assetsPath:window.__NUXT_BASE__.assetsPath,cdnURL:a},content:{dbHash:"b25b294c"}}',
    )

    file_path.write_text(text, encoding="utf-8")


def patch_bundle_assets(file_path: Path) -> None:
    text = file_path.read_text(encoding="utf-8")
    text = text.replace('src:"/foot-mobile.webp"', 'src:window.__NUXT_BASE__.basePath+"foot-mobile.webp"')
    file_path.write_text(text, encoding="utf-8")


def main() -> int:
    for html_file in ROOT.rglob("index.html"):
        patch_html(html_file)

    for state_file in (ROOT / "_nuxt" / "static").rglob("state.js"):
        patch_state(state_file)

    for js_file in (ROOT / "_nuxt").glob("*.js"):
        if "foot-mobile.webp" in js_file.read_text(encoding="utf-8"):
            patch_bundle_assets(js_file)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
