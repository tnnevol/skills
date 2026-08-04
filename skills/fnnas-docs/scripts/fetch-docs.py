#!/usr/bin/env python3
"""
飞牛应用开发文档同步脚本
从 developer.fnnas.com/llms.txt 和 developer.fnnas.com/llms-full.txt
解析并同步 Markdown 文档。llms.txt 作为文档索引，llms-full.txt 提供正文。

文档结构：
- 每篇文档以 "Source: https://developer.fnnas.com/docs/<path>" 或
  "Source: https://developer.fnnas.com/api/<path>" 开头
- 后跟空行、# 标题和正文内容
"""

import urllib.request
import urllib.error
import ssl
import os
import posixpath
import re

# SSL 上下文
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

LLMS_FULL_URL = "https://developer.fnnas.com/llms-full.txt"
LLMS_INDEX_URL = "https://developer.fnnas.com/llms.txt"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# URL 路径到本地保存路径的映射规则
PATH_MAPPING = {
    "guide": "references/guide.md",
}


def fetch_url(url):
    """获取 URL 内容"""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
            return resp.read().decode('utf-8')
    except Exception as e:
        print(f"  ❌ 获取失败: {e}")
        return None


def resolve_local_path(doc_path):
    """根据文档路径确定本地保存路径"""
    if doc_path in PATH_MAPPING:
        return PATH_MAPPING[doc_path]

    # quick-started/prerequisites -> references/quick-started/prerequisites.md
    # core-concepts/manifest -> references/core-concepts/manifest.md
    # examples/native -> references/examples/native.md
    # cli/fnpack -> references/cli/fnpack.md
    # update-log/20260705 -> references/update-log/20260705.md
    if "/" in doc_path:
        return f"references/{doc_path}.md"

    return f"references/{doc_path}.md"


def rewrite_relative_links(content, doc_path):
    """将内容中的相对链接重写为本地 references/ 路径"""
    # 站点内相对路径：./quick-started/prerequisites.md -> ../quick-started/prerequisites.md
    # ../core-concepts/manifest.md -> ../core-concepts/manifest.md
    def replace_link(m):
        text = m.group(1)
        href = m.group(2)

        # 跳过外部链接和锚点
        if href.startswith("http://") or href.startswith("https://") or href.startswith("#"):
            return m.group(0)

        # 处理 ./xxx.md 相对路径
        if href.startswith("./"):
            href = href[2:]

        # 处理 ../xxx/xxx.md 相对路径，保留原样即可，因为本地目录结构与站点一致
        if href.startswith("../"):
            return f"[{text}]({href})"

        # 处理站点内绝对文档路径。源站的 docs/ 和 api/ 在本地都位于
        # references/ 下，因此根据当前文档位置计算相对路径。
        if href.startswith("/docs/") or href.startswith("/api/"):
            target, separator, anchor = href.partition("#")
            if target.startswith("/docs/"):
                target_path = target[len("/docs/"):]
            else:
                target_path = target[len("/"):]
            target_path = target_path.rstrip("/")
            if target_path.endswith(".md"):
                target_path = target_path[:-3]

            current_file = f"references/{doc_path}.md"
            target_file = f"references/{target_path}.md"
            local_path = posixpath.relpath(
                target_file,
                posixpath.dirname(current_file),
            )
            if separator:
                local_path += f"#{anchor}"
            return f"[{text}]({local_path})"

        # 处理站点图片资源 /img/xxx
        if href.startswith("/img/"):
            return f"[{text}](https://developer.fnnas.com{href})"

        return m.group(0)

    content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', replace_link, content)
    return content


def parse_index(text):
    """解析 llms.txt，返回索引中声明的本地文档路径集合"""
    paths = set()
    pattern = r"\[[^\]]+\]\((https://developer\.fnnas\.com/(docs|api)/[^)]+)\)"

    for match in re.finditer(pattern, text):
        url = match.group(1).rstrip("/")
        site_path = url.split("developer.fnnas.com/", 1)[1]
        if site_path.startswith("docs/"):
            site_path = site_path[len("docs/"):]
        paths.add(site_path)

    return paths


def parse_docs(text, allowed_paths=None):
    """解析 llms-full.txt，返回 [(doc_path, title, content), ...]"""
    docs = []

    # 按 Source: 行分割，兼容 docs 和 api 两个文档根路径。
    pattern = r"^Source: (https://developer\.fnnas\.com/(docs|api)/([^\s]+?))/?\n\n"
    matches = list(re.finditer(pattern, text, re.MULTILINE))

    for i, match in enumerate(matches):
        url = match.group(1).rstrip('/')
        root = match.group(2)
        source_path = match.group(3).rstrip('/')
        doc_path = source_path if root == "docs" else f"{root}/{source_path}"
        if allowed_paths is not None and doc_path not in allowed_paths:
            continue

        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        section = text[start:end].strip()

        # 提取标题（第一行 # 标题）
        lines = section.split('\n')
        title = doc_path
        content_start = 0

        if lines and lines[0].startswith('# '):
            title = lines[0][2:].strip()
            content_start = 1
        elif lines and lines[0].startswith('## '):
            title = lines[0][3:].strip()
            content_start = 1

        body = '\n'.join(lines[content_start:]).strip()
        body = rewrite_relative_links(body, doc_path)

        docs.append((doc_path, title, body, url))

    return docs


def add_frontmatter(title, source_url):
    """生成 Markdown frontmatter"""
    return f"""---
title: {title}
source: {source_url}
---

"""


def main():
    # 脚本位于 scripts/ 目录下，工作目录应为技能根目录
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(base_dir)

    print("📚 开始同步飞牛应用开发文档")
    print(f"   索引: {LLMS_INDEX_URL}")
    print(f"   正文: {LLMS_FULL_URL}")
    print("=" * 50)

    index_text = fetch_url(LLMS_INDEX_URL)
    allowed_paths = None
    if index_text:
        allowed_paths = parse_index(index_text)
        if not allowed_paths:
            print("  ❌ llms.txt 未解析到文档，停止同步以避免清空或写入错误内容")
            return
        print(f"   索引文档: {len(allowed_paths)} 篇")
    else:
        print("  ⚠️ llms.txt 获取失败，将回退为同步 llms-full.txt 中的全部文档")

    text = fetch_url(LLMS_FULL_URL)
    if not text:
        return

    docs = parse_docs(text, allowed_paths)
    total = len(docs)
    success = 0
    failed = []

    print(f"\n📝 解析到 {total} 篇文档")

    for doc_path, title, body, url in docs:
        file_path = resolve_local_path(doc_path)
        print(f"\n📄 [{success + 1}/{total}] {doc_path}")
        print(f"   保存: {file_path}")

        try:
            os.makedirs(os.path.dirname(file_path), exist_ok=True)

            content = add_frontmatter(title, url) + body + '\n'
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"  ✅ 成功 ({len(content)} 字符)")
            success += 1
        except Exception as e:
            print(f"  ❌ 失败: {e}")
            failed.append(doc_path)

    print("\n" + "=" * 50)
    print(f"📊 同步完成:")
    print(f"   ✅ 成功: {success}/{total}")
    if failed:
        print(f"   ❌ 失败: {len(failed)}")
        for f in failed:
            print(f"      - {f}")
    else:
        print(f"   🎉 全部成功!")


if __name__ == "__main__":
    main()
