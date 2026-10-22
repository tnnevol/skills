#!/usr/bin/env python3
"""查询 YonBuilder 移动开发文档（developer.yonyou.com/docs），本地快照优先。

用法：
  python3 fetch_doc.py /docs/Client-API/API            # 整个 API 页（有快照读快照，否则联网）
  python3 fetch_doc.py /docs/Client-API/API openwin    # 只取某个 API 章节（按锚点或方法名）
  python3 fetch_doc.py /docs/Client-API/API --list     # 列出该页全部章节（锚点 id + 标题）
  python3 fetch_doc.py /docs/Client-API/MTL/saoma      # MTL 插件页（已快照则离线）
  python3 fetch_doc.py <路径> --remote                 # 强制联网，忽略本地快照

本地快照由 scripts/sync_docs.py 生成，放在 references/ 下：
  api-reference.md    API 页全量正文（一个章节一段，带锚点注释）
  mtl-plugins.md      MTL.js 原生插件正文（带来源路径注释）
没有快照的章节自动回退到联网抓取，行为与旧版一致。
"""
from __future__ import annotations

import html
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

BASE = "https://developer.yonyou.com"
UA = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 Chrome/120 Safari/537.36"
}
API_PATH = "/docs/Client-API/API"
BODY_START = re.compile(r'<section[^>]*class="[^"]*page-section-box[^"]*"[^>]*>', re.I)
# 示例凭据打码（与 sync_docs.py 一致，避免把官方示例 AppID 当真实密钥）
MASK_RULES = [
    (re.compile(r"\bwx[0-9a-f]{16}\b"), "wx" + "*" * 16),
]

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "references"

# 快照分段格式：`## 标题` 紧跟 `<!-- anchor: xxx -->` 或 `<!-- source: /docs/... -->`
BLOCK_RE = re.compile(r"^## (.+)\n<!-- (anchor|source): (.+?) -->\n([\s\S]*?)(?=^## |\Z)", re.M)


def fetch(path: str) -> str:
    if not path.startswith("/"):
        path = "/" + path
    req = urllib.request.Request(BASE + path, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}：{path} 不存在（可用 references/menu.md 核对路径）")
    except Exception as e:  # 网络等其它异常
        print(f"抓取失败：{type(e).__name__} {e}")
    return ""


def clean(fragment: str) -> str:
    fragment = re.sub(r"<(script|style)[\s\S]*?</\1>", "", fragment)
    fragment = re.sub(r"<br\s*/?>", "\n", fragment)
    fragment = re.sub(r"</(p|div|li|tr|td|th|h\d|table|thead|tbody|section)>", "\n", fragment)
    fragment = re.sub(r"<[^>]+>", " ", fragment)
    text = html.unescape(fragment).replace("\xa0", " ")
    lines = [re.sub(r"[ \t]+", " ", l).strip() for l in text.split("\n")]
    out = "\n".join(l for l in lines if l)
    for rx, mask in MASK_RULES:
        out = rx.sub(mask, out)
    return out


def load_blocks(name: str) -> list[tuple[str, str, str, str]]:
    """读快照文件，返回 [(标题, 类型, 键, 正文)]。"""
    path = REF / name
    if not path.exists():
        return []
    text = path.read_text(encoding="utf-8")
    return [(m.group(1).strip(), m.group(2), m.group(3).strip(), m.group(4).strip())
            for m in BLOCK_RE.finditer(text)]


def find_block(blocks, key: str):
    low = key.lower().removeprefix("api.")
    for title, _, k, body in blocks:
        if k.lower() == low and k.lower() == key.lower():
            return title, body
    for title, _, k, body in blocks:
        if k.lower() == low or title.lower().removeprefix("api.") == low:
            return title, body
    return None


def api_offline(blocks, arg: str) -> int | None:
    if not blocks:
        return None
    if arg == "--list":
        for title, kind, key, _ in blocks:
            if kind == "anchor":
                print(f"{key}\t{title}")
        return 0
    if not arg:
        print((REF / "api-reference.md").read_text(encoding="utf-8"))
        return 0
    hit = find_block([b for b in blocks if b[1] == "anchor"], arg)
    if hit:
        title, body = hit
        print(f"## {title}\n\n{body}")
        return 0
    return None


def page_offline(blocks, path: str) -> int | None:
    hit = find_block([b for b in blocks if b[1] == "source"], path.rstrip("/"))
    if hit:
        title, body = hit
        print(f"## {title}\n\n{body}")
        return 0
    return None


def remote(path: str, arg: str) -> int:
    htm = fetch(path)
    if not htm:
        return 1

    if arg == "--list":
        for hid, inner in re.findall(r'<h1 id="([^"]+)"[^>]*>([\s\S]*?)</h1>', htm):
            name = html.unescape(re.sub(r"<[^>]+>", "", inner)).strip()
            if name:
                print(f"{hid}\t{name}")
        return 0

    if arg:
        i = htm.lower().find(f'id="{arg.lower()}"')
        if i < 0:
            print(f'未找到锚点 "{arg}"，可用 --list 查看本页全部章节')
            return 1
        j = htm.lower().find('<h1 id="', i + 10)
        j2 = htm.lower().find('<h2 id="', i + 10)
        end = min(x for x in (j if j > 0 else len(htm), j2 if j2 > 0 else len(htm)))
        print(clean(htm[i:end]))
        return 0

    # 整页：裁到正文容器，避免输出侧边栏导航
    m = BODY_START.search(htm)
    print(clean(htm[m.end():] if m else htm))
    return 0


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a for a in sys.argv[1:] if a.startswith("--")}
    if not args or "-h" in flags or "--help" in flags:
        print(__doc__)
        return 0

    path = args[0]
    arg = args[1] if len(args) > 1 else ("--list" if "--list" in flags else "")
    offline = "--remote" not in flags

    if offline and path.rstrip("/") == API_PATH:
        blocks = load_blocks("api-reference.md")
        if blocks:
            code = api_offline(blocks, arg)
            if code is not None:
                return code
            print("（本地快照没有该锚点，回退联网核对）", file=sys.stderr)
        else:
            print("（本地无 API 快照，回退联网；可先跑 scripts/sync_docs.py）", file=sys.stderr)

    if offline and path.startswith("/docs/Client-API/MTL/"):
        code = page_offline(load_blocks("mtl-plugins.md"), path)
        if code is not None:
            return code
        print("（本地无该 MTL 页快照，回退联网）", file=sys.stderr)

    return remote(path, arg)


if __name__ == "__main__":
    sys.exit(main())
