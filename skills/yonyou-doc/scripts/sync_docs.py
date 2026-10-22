#!/usr/bin/env python3
"""同步 YonBuilder 移动开发文档（developer.yonyou.com/docs）的离线快照。

站点是 Raneto 静态文档（无 git 仓库、无 llms.txt、无 sitemap），所以用抓取
脚本 + 状态文件做同步，机制与 skills/fnnas-docs 一致。

用法：
  python3 scripts/sync_docs.py                 # 同步核心快照（菜单 + API 全量 + API 索引 + MTL 插件）
  python3 scripts/sync_docs.py --check         # 只检查线上是否变化，落后时 exit 1
  python3 scripts/sync_docs.py --all           # 额外抓全站 1697 页到 references/pages/（约 5.6MB，已 gitignore）
  python3 scripts/sync_docs.py --chapter Client-API/UI-Layout   # 只抓某个子章节到 references/pages/

产物（references/）：
  menu.md             全站菜单索引（分册 + 标题 + 路径）
  api-reference.md    /docs/Client-API/API 全量离线正文（415 个章节，按锚点分段）
  api-objects.md      方法 / 属性 / 常量索引（标题 + 锚点）
  mtl-plugins.md      MTL.js 原生插件章节离线正文
  .sync-state.json    同步状态（正文 sha256、条目数、时间），供 --check 比对

同步后 SKILL.md 的「同步」章节不用改；只有站点结构（菜单分册、API 页锚点）变化时
才需要人工核对 SKILL.md 的索引描述。
"""
from __future__ import annotations

import argparse
import datetime
import hashlib
import html
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE = "https://developer.yonyou.com"
API_PATH = "/docs/Client-API/API"
UA = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 Chrome/120 Safari/537.36"
}

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "references"
STATE = REF / ".sync-state.json"

BODY_START = re.compile(r'<section[^>]*class="[^"]*page-section-box[^"]*"[^>]*>', re.I)
H1_RE = re.compile(r'<h1 id="([^"]+)"[^>]*>([\s\S]*?)</h1>')
CATEGORY_SPLIT_RE = re.compile(r'<li class="category[^"]*">')
CATEGORY_TITLE_RE = re.compile(r'<h5 class="category-title">[\s\S]*?<a[^>]*>([\s\S]*?)</a>')
PAGE_LINK_RE = re.compile(r'<li class="page"><a href="(/docs/[^"#]*)"[^>]*>([\s\S]*?)</a></li>', re.I)
TAG_RE = re.compile(r"<[^>]+>")
CJK_RE = re.compile(r"[\u4e00-\u9fff]")

# 分册顺序与展示名（沿用旧版 menu.md 的措辞，站点新增分册自动追加）
CHAPTERS = {
    "YMDP": "总览/新手/模板",
    "Client-API": "API.js / MTL.js 原生插件 / 界面布局",
}
CHAPTER_ORDER = list(CHAPTERS)


# ---------------- 抓取与清洗 ----------------

def fetch(path: str, retries: int = 2) -> str:
    if not path.startswith("/"):
        path = "/" + path
    last = ""
    for attempt in range(retries + 1):
        req = urllib.request.Request(BASE + path, headers=UA)
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code}：{path} 不存在（可用 references/menu.md 核对路径）"
            if e.code < 500:
                break
        except Exception as e:  # 网络等其它异常
            last = f"抓取失败：{type(e).__name__} {e}"
        if attempt < retries:
            time.sleep(1.5)
    print(last, file=sys.stderr)
    return ""


def body_html(htm: str) -> str:
    m = BODY_START.search(htm)
    return htm[m.end():] if m else htm


def clean(fragment: str) -> str:
    fragment = re.sub(r"<(script|style)[\s\S]*?</\1>", "", fragment)
    fragment = re.sub(r"<br\s*/?>", "\n", fragment)
    fragment = re.sub(r"</(p|div|li|tr|td|th|h\d|table|thead|tbody|section)>", "\n", fragment)
    fragment = TAG_RE.sub(" ", fragment)
    text = html.unescape(fragment)
    text = text.replace("\xa0", " ")
    lines = [re.sub(r"[ \t]+", " ", l).strip() for l in text.split("\n")]
    return "\n".join(l for l in lines if l)


def sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


# ---------------- 解析 ----------------

def sidebar_html(htm: str) -> str:
    """截出左侧菜单容器，避免正文里的链接混进来。"""
    i = htm.find("page-menu-wrap")
    j = htm.find("page-section-box", i) if i >= 0 else -1
    return htm[i:j] if i >= 0 and j > i else htm


def parse_menu(htm: str) -> tuple[list[tuple[str, str, str]], dict[str, str]]:
    """返回 ([(分册 code, 标题, 路径)], {code: 站点分册名})，code 取路径第二段。"""
    entries: list[tuple[str, str, str]] = []
    titles: dict[str, str] = {}
    seen: set[str] = set()
    for part in CATEGORY_SPLIT_RE.split(sidebar_html(htm))[1:]:
        m = CATEGORY_TITLE_RE.search(part)
        cat = html.unescape(TAG_RE.sub("", m.group(1))).strip() if m else ""
        for path, inner in PAGE_LINK_RE.findall(part):
            path = path.rstrip("/")
            if path == "/docs" or path in seen:
                continue
            seen.add(path)
            title = html.unescape(TAG_RE.sub("", inner)).strip()
            seg = path.strip("/").split("/")
            code = seg[1] if len(seg) > 1 else "Others"
            if title:
                entries.append((code, title, path))
                if cat and code not in titles:
                    titles[code] = cat
    return entries, titles


def parse_anchors(htm: str) -> list[tuple[str, str]]:
    out = []
    for aid, inner in H1_RE.findall(htm):
        title = html.unescape(TAG_RE.sub("", inner)).strip()
        if title:
            out.append((aid, title))
    return out


def split_sections(htm: str) -> list[tuple[str, str, str]]:
    """按 h1 切段：[(anchor_id, 标题, 正文纯文本)]。"""
    matches = list(H1_RE.finditer(htm))
    sections = []
    for idx, m in enumerate(matches):
        aid = m.group(1)
        title = html.unescape(TAG_RE.sub("", m.group(2))).strip()
        if not title:
            continue
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(htm)
        text = clean(htm[m.end():end])
        sections.append((aid, title, text))
    return sections


def classify_anchors(anchors: list[tuple[str, str]]) -> tuple[list, list, list]:
    """按文档顺序分类：概述 / 属性 / 方法 / 常量。"""
    attrs, methods, consts = [], [], []
    first_method_idx = next((i for i, (aid, _) in enumerate(anchors) if aid == "getappinformation"), None)
    for i, (aid, title) in enumerate(anchors):
        if aid == "概述":
            continue
        if first_method_idx is not None and i < first_method_idx:
            attrs.append((aid, title))
        elif CJK_RE.search(title):
            consts.append((aid, title))
        else:
            methods.append((aid, title))
    return attrs, methods, consts


# ---------------- 渲染 ----------------

def render_menu(entries: list[tuple[str, str, str]], titles: dict[str, str], stamp: str) -> str:
    groups: dict[str, list[tuple[str, str]]] = {}
    for code, title, path in entries:
        groups.setdefault(code, []).append((title, path))

    order = [c for c in CHAPTER_ORDER if c in groups] + [c for c in groups if c not in CHAPTER_ORDER]
    out = [
        "# YonBuilder 移动开发文档 · 全站菜单索引",
        "",
        "> 抓取自 https://developer.yonyou.com/docs （Raneto 静态文档，侧边栏含全站菜单）",
        "",
        f"> 共 **{len(entries)}** 个页面条目，分 **{len(groups)}** 个分册。最后抓取：{stamp}",
        "",
        "> 用法：按下方分册找到目标路径 → 拼 `https://developer.yonyou.com` + 路径 → 用 "
        "`scripts/fetch_doc.py <路径>` 取正文（已抓过的章节优先读本地快照，不联网）。",
        "",
        "> 端 API 的方法**全部内联在 `/docs/Client-API/API` 一页**，用锚点定位，见 `api-objects.md`；"
        "全量正文见 `api-reference.md`。",
        "",
        "",
    ]
    for code in order:
        pages = groups[code]
        site = titles.get(code, "")
        desc = CHAPTERS.get(code, "")
        extra = f"（{desc}）" if desc else ""
        out.append(f"## {site or code}{extra}（`{code}`，{len(pages)} 条）")
        out.append("")
        out.append("| 标题 | 路径 |")
        out.append("| --- | --- |")
        for title, path in pages:
            out.append(f"| {title} | `{path}` |")
        out.append("")
    return "\n".join(out).rstrip() + "\n"


def render_api_reference(sections: list[tuple[str, str, str]], stamp: str, menu_count: int) -> str:
    out = [
        "# API 对象 · 离线全量正文",
        "",
        "> 来源：https://developer.yonyou.com/docs/Client-API/API （一页内联全部 API）",
        f"> 快照：{stamp}，共 **{len(sections)}** 个章节，由 `scripts/sync_docs.py` 生成，请勿手工编辑。",
        "",
        "> 定位：`scripts/fetch_doc.py /docs/Client-API/API <锚点或方法名>` 会优先读本文件；"
        "不改脚本时也可直接在本文件里搜方法名。索引见 `api-objects.md`。",
        "",
        "---",
        "",
    ]
    for aid, title, text in sections:
        out.append(f"## {title}")
        out.append(f"<!-- anchor: {aid} -->")
        out.append("")
        out.append(text if text else "（本节无正文，站点原文为空）")
        out.append("")
    return "\n".join(out).rstrip() + "\n"


def render_api_objects(anchors, sections, stamp: str) -> str:
    attrs, methods, consts = classify_anchors(anchors)
    lines = [
        "# API 对象 · 方法与属性索引",
        "",
        "> 来源：`https://developer.yonyou.com/docs/Client-API/API`（一页内联全部 API）",
        "",
        "> 定位方式：拼锚点，如 `https://developer.yonyou.com/docs/Client-API/API#openwin`；"
        "离线查询用 `python3 scripts/fetch_doc.py /docs/Client-API/API openwin`。",
        "",
        f"> 共 **{len(methods)}** 个方法、**{len(attrs)}** 个属性、**{len(consts)}** 个常量/枚举，"
        f"快照 {stamp}。",
        "",
        "",
        "## 一、方法（`api.xxx`）",
        "",
        "| 方法 | 锚点 |",
        "| --- | --- |",
    ]
    for aid, title in methods:
        lines.append(f"| `api.{title}` | `#{aid}` |")
    lines += ["", "## 二、属性", "", "| 属性 | 锚点 |", "| --- | --- |"]
    for aid, title in attrs:
        lines.append(f"| `api.{title}` | `#{aid}` |")
    lines += ["", "## 三、常量 / 枚举 / 事件", "", "| 名称 | 锚点 |", "| --- | --- |"]
    for aid, title in consts:
        lines.append(f"| {title} | `#{aid}` |")
    return "\n".join(lines).rstrip() + "\n"


def render_mtl(pages: list[tuple[str, str, str]], stamp: str) -> str:
    out = [
        "# MTL.js 原生插件 · 离线正文",
        "",
        "> 来源：`https://developer.yonyou.com/docs/Client-API/MTL/*`（原生插件模块文档）",
        f"> 快照：{stamp}，共 **{len(pages)}** 个模块，由 `scripts/sync_docs.py` 生成，请勿手工编辑。",
        "",
        "---",
        "",
    ]
    for title, path, text in pages:
        out.append(f"## {title}")
        out.append(f"<!-- source: {path} -->")
        out.append("")
        out.append(text if text else "（本节无正文，站点原文为空）")
        out.append("")
    return "\n".join(out).rstrip() + "\n"


# ---------------- 同步 / 检查 ----------------

def core_sync(entries, titles, api_htm, stamp):
    sections = split_sections(api_htm)
    anchors = parse_anchors(api_htm)
    if len(anchors) != len(sections):
        print(f"警告：锚点 {len(anchors)} 个、切段 {len(sections)} 段，数量不一致（空标题章节已跳过）", file=sys.stderr)

    mtl_pages = []
    for code, title, path in entries:
        if not path.startswith("/docs/Client-API/MTL/"):
            continue
        htm = fetch(path)
        if htm:
            mtl_pages.append((title, path, clean(body_html(htm))))
        time.sleep(0.2)

    REF.mkdir(parents=True, exist_ok=True)
    (REF / "menu.md").write_text(render_menu(entries, titles, stamp), encoding="utf-8")
    (REF / "api-reference.md").write_text(
        render_api_reference(sections, stamp, len(entries)), encoding="utf-8")
    (REF / "api-objects.md").write_text(
        render_api_objects(anchors, sections, stamp), encoding="utf-8")
    (REF / "mtl-plugins.md").write_text(render_mtl(mtl_pages, stamp), encoding="utf-8")

    attrs, methods, consts = classify_anchors(anchors)
    state = {
        "generated_at": stamp,
        "base_url": BASE,
        "api_path": API_PATH,
        "menu_count": len(entries),
        "menu_sha256": sha("\n".join(f"{t}\t{p}" for _, t, p in entries)),
        "api_sections": len(sections),
        "api_sha256": sha("\n".join(t for _, _, t in sections)),
        "api_methods": len(methods),
        "api_attributes": len(attrs),
        "api_constants": len(consts),
        "mtl_pages": len(mtl_pages),
        "generator": "scripts/sync_docs.py",
    }
    STATE.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return state


def full_sync(entries, prefix: str | None = None) -> int:
    pages = REF / "pages"
    pages.mkdir(parents=True, exist_ok=True)
    targets = [e for e in entries if not prefix or e[2].startswith(prefix)]
    written = 0
    for i, (code, title, path) in enumerate(targets, 1):
        htm = fetch(path)
        if not htm:
            continue
        text = clean(body_html(htm))
        name = path.strip("/").replace("/", "__") + ".md"
        (pages / name).write_text(
            f"<!-- source: {BASE}{path} -->\n\n# {title}\n\n{text}\n", encoding="utf-8")
        written += 1
        if i % 50 == 0:
            print(f"  已抓取 {i}/{len(targets)} …", file=sys.stderr)
        time.sleep(0.15)
    print(f"全量快照写入 references/pages/：{written} 页（已 gitignore）")
    return written


def check() -> int:
    state = json.loads(STATE.read_text(encoding="utf-8"))
    htm = fetch(API_PATH)
    if not htm:
        print("检查失败：无法抓取文档页", file=sys.stderr)
        return 2

    entries, _ = parse_menu(htm)
    anchors = parse_anchors(htm)
    sections = split_sections(htm)
    menu_sha = sha("\n".join(f"{t}\t{p}" for _, t, p in entries))
    api_sha = sha("\n".join(t for _, _, t in sections))

    stale = []
    if len(entries) != state["menu_count"] or menu_sha != state["menu_sha256"]:
        stale.append(f"菜单 {state['menu_count']} → {len(entries)} 条")
    if api_sha != state["api_sha256"]:
        stale.append(f"API 页正文变化（{state['api_sections']} → {len(sections)} 章节）")

    print(f"上次同步：{state['generated_at']}")
    print(f"菜单：{state['menu_count']} → {len(entries)} 条")
    print(f"API 章节：{state['api_sections']} → {len(sections)}")
    print("MTL 插件页未逐页校验（同步时会刷新）")
    if stale:
        print("状态：有更新 —— " + "；".join(stale))
        print("执行 `python3 scripts/sync_docs.py` 刷新快照")
        return 1
    print("状态：已是最新")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="同步 YonBuilder 移动开发文档离线快照")
    ap.add_argument("--check", action="store_true", help="只检查线上是否变化，落后时 exit 1")
    ap.add_argument("--all", action="store_true", help="额外抓全站页面到 references/pages/")
    ap.add_argument("--chapter", metavar="PREFIX", help="只抓指定路径前缀到 references/pages/（如 Client-API/UI-Layout）")
    args = ap.parse_args()

    if args.check:
        return check()

    stamp = datetime.date.today().isoformat()
    htm = fetch(API_PATH)
    if not htm:
        print("同步失败：无法抓取文档首页/API 页", file=sys.stderr)
        return 2
    entries, titles = parse_menu(htm)
    if not entries:
        print("同步失败：未能解析侧边栏菜单（站点结构可能已改版）", file=sys.stderr)
        return 2

    state = core_sync(entries, titles, htm, stamp)
    print(
        f"核心快照已更新（{stamp}）：菜单 {state['menu_count']} 条、"
        f"API {state['api_sections']} 章节（方法 {state['api_methods']} / "
        f"属性 {state['api_attributes']} / 常量 {state['api_constants']}）、"
        f"MTL {state['mtl_pages']} 页"
    )

    if args.all or args.chapter:
        prefix = None
        if args.chapter:
            prefix = "/docs/" + args.chapter.strip("/") if not args.chapter.startswith("/docs/") else args.chapter
        full_sync(entries, prefix)
    return 0


if __name__ == "__main__":
    sys.exit(main())
