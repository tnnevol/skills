#!/usr/bin/env python3
"""
飞牛应用开发文档抓取脚本
从 developer.fnnas.com 抓取文档内容并转换为 Markdown

注意: developer.fnnas.com 对无末尾 / 的 URL 返回 308 重定向，
urllib 不支持 308，脚本手动处理该重定向。
"""

import urllib.request
import urllib.error
import urllib.parse
import ssl
import re
import os
import time

# SSL 上下文
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# 基础 URL
BASE_URL = "https://developer.fnnas.com/docs/"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# 文档列表
DOCS = {
    # 快速开始
    "quick-started/prerequisites": "references/quick-started/prerequisites.md",
    "quick-started/create-application": "references/quick-started/create-application.md",
    "quick-started/test-application": "references/quick-started/test-application.md",
    "quick-started/publish-application": "references/quick-started/publish-application.md",
    # 开发指南 - 基础
    "core-concepts/framework": "references/core-concepts/framework.md",
    "core-concepts/manifest": "references/core-concepts/manifest.md",
    "core-concepts/environment-variables": "references/core-concepts/environment-variables.md",
    "core-concepts/privilege": "references/core-concepts/privilege.md",
    "core-concepts/resource": "references/core-concepts/resource.md",
    "core-concepts/app-entry": "references/core-concepts/app-entry.md",
    "core-concepts/wizard": "references/core-concepts/wizard.md",
    # 开发指南 - 进阶
    "core-concepts/gateway-registration": "references/core-concepts/gateway-registration.md",
    "core-concepts/gateway-authentication": "references/core-concepts/gateway-authentication.md",
    "core-concepts/dependency": "references/core-concepts/dependency.md",
    "core-concepts/middleware": "references/core-concepts/middleware.md",
    "core-concepts/runtime": "references/core-concepts/runtime.md",
    # 开发指南 - 实战
    "core-concepts/native": "references/core-concepts/native.md",
    "core-concepts/docker": "references/core-concepts/docker.md",
    # 开发指南 - 规范
    "core-concepts/icon": "references/core-concepts/icon.md",
    # CLI 工具
    "cli/fnpack": "references/cli/fnpack.md",
    "cli/appcentercli": "references/cli/appcenter-cli.md",
}


def fetch_page(url):
    """获取页面内容，手动处理 308 重定向"""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            return resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        # 308 重定向：urllib 不支持，手动跟随
        if e.code == 308:
            location = e.headers.get('Location')
            if location:
                req2 = urllib.request.Request(location, headers=HEADERS)
                try:
                    with urllib.request.urlopen(req2, context=ctx, timeout=30) as resp2:
                        return resp2.read().decode('utf-8')
                except Exception as e2:
                    print(f"  ❌ 重定向后获取失败: {e2}")
                    return None
        print(f"  ❌ 获取失败: {e}")
        return None
    except Exception as e:
        print(f"  ❌ 获取失败: {e}")
        return None


def extract_article(html):
    """提取 article 标签内容"""
    match = re.search(r'<article[^>]*>(.*?)</article>', html, re.DOTALL)
    if match:
        return match.group(1)
    return None


def html_to_markdown(html):
    """将 HTML 转换为 Markdown"""
    if not html:
        return ""

    text = html

    # 处理标题
    text = re.sub(r'<h1[^>]*>(.*?)</h1>', r'# \1\n\n', text, flags=re.DOTALL)
    text = re.sub(r'<h2[^>]*>(.*?)</h2>', r'## \1\n\n', text, flags=re.DOTALL)
    text = re.sub(r'<h3[^>]*>(.*?)</h3>', r'### \1\n\n', text, flags=re.DOTALL)
    text = re.sub(r'<h4[^>]*>(.*?)</h4>', r'#### \1\n\n', text, flags=re.DOTALL)
    text = re.sub(r'<h5[^>]*>(.*?)</h5>', r'##### \1\n\n', text, flags=re.DOTALL)

    # 处理代码块
    def replace_code_block(m):
        lang = m.group(1) or ''
        code = m.group(2)
        code = re.sub(r'<[^>]+>', '', code)
        code = code.strip()
        return f'```{lang}\n{code}\n```\n\n'

    text = re.sub(r'<pre[^>]*><code[^>]*class="language-(\w+)"[^>]*>(.*?)</code></pre>',
                  replace_code_block, text, flags=re.DOTALL)
    text = re.sub(r'<pre[^>]*><code[^>]*>(.*?)</code></pre>',
                  lambda m: f'```\n{m.group(1)}\n```\n\n', text, flags=re.DOTALL)
    text = re.sub(r'<pre[^>]*>(.*?)</pre>',
                  lambda m: f'```\n{m.group(1)}\n```\n\n', text, flags=re.DOTALL)

    # 处理行内代码
    text = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', text)

    # 处理粗体和斜体
    text = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', text, flags=re.DOTALL)
    text = re.sub(r'<b[^>]*>(.*?)</b>', r'**\1**', text, flags=re.DOTALL)
    text = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', text, flags=re.DOTALL)
    text = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', text, flags=re.DOTALL)

    # 处理链接
    text = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', r'[\2](\1)', text, flags=re.DOTALL)

    # 处理图片
    text = re.sub(r'<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*/?>',
                  r'![\2](\1)', text)
    text = re.sub(r'<img[^>]*src="([^"]*)"[^>]*/?>', r'![](\1)', text)

    # 处理列表
    text = re.sub(r'<ul[^>]*>', '\n', text)
    text = re.sub(r'</ul>', '\n', text)
    text = re.sub(r'<ol[^>]*>', '\n', text)
    text = re.sub(r'</ol>', '\n', text)
    text = re.sub(r'<li[^>]*>(.*?)</li>', r'- \1\n', text, flags=re.DOTALL)

    # 处理表格
    text = re.sub(r'<table[^>]*>', '\n', text)
    text = re.sub(r'</table>', '\n', text)
    text = re.sub(r'<thead[^>]*>', '', text)
    text = re.sub(r'</thead>', '', text)
    text = re.sub(r'<tbody[^>]*>', '', text)
    text = re.sub(r'</tbody>', '', text)
    text = re.sub(r'<tr[^>]*>(.*?)</tr>', lambda m: m.group(1).strip() + '\n', text, flags=re.DOTALL)
    text = re.sub(r'<th[^>]*>(.*?)</th>', r'| \1 ', text, flags=re.DOTALL)
    text = re.sub(r'<td[^>]*>(.*?)</td>', r'| \1 ', text, flags=re.DOTALL)

    # 处理引用块
    text = re.sub(r'<blockquote[^>]*>(.*?)</blockquote>',
                  lambda m: '> ' + m.group(1).strip().replace('\n', '\n> ') + '\n\n',
                  text, flags=re.DOTALL)

    # 处理段落
    text = re.sub(r'<p[^>]*>(.*?)</p>', r'\1\n\n', text, flags=re.DOTALL)

    # 处理换行
    text = re.sub(r'<br\s*/?>', '\n', text)
    text = re.sub(r'<hr\s*/?>', '\n---\n\n', text)

    # 处理提示框 (admonition)
    text = re.sub(r'<div[^>]*class="admonition admonition-(\w+)"[^>]*>.*?<p[^>]*class="admonition-title"[^>]*>(.*?)</p>(.*?)</div>',
                  lambda m: f':::{m.group(1)}\n**{m.group(2)}**\n{m.group(3).strip()}\n:::\n\n',
                  text, flags=re.DOTALL)

    # 移除剩余 HTML 标签
    text = re.sub(r'<[^>]+>', '', text)

    # 清理 HTML 实体
    text = text.replace('&amp;', '&')
    text = text.replace('&lt;', '<')
    text = text.replace('&gt;', '>')
    text = text.replace('&quot;', '"')
    text = text.replace('&#39;', "'")
    text = text.replace('&nbsp;', ' ')
    text = text.replace('\u0000', '')

    # 清理多余空白
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()

    return text


def add_header(title, content):
    """添加文档头部"""
    header = f"""---
title: {title}
source: https://developer.fnnas.com/docs/
---

"""
    return header + content


def main():
    """主函数"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)

    total = len(DOCS)
    success = 0
    failed = []

    print(f"📚 开始抓取飞牛应用开发文档 (共 {total} 篇)")
    print("=" * 50)

    for doc_path, file_path in DOCS.items():
        url = BASE_URL + doc_path
        print(f"\n📄 [{success + 1}/{total}] {doc_path}")
        print(f"   URL: {url}")

        # 获取页面
        html = fetch_page(url)
        if not html:
            failed.append(doc_path)
            continue

        # 提取 article 内容
        article = extract_article(html)
        if not article:
            print(f"  ⚠️ 未找到 article 标签")
            failed.append(doc_path)
            continue

        # 转换为 Markdown
        markdown = html_to_markdown(article)

        # 提取标题
        title_match = re.search(r'<h1[^>]*>(.*?)</h1>', article, re.DOTALL)
        title = re.sub(r'<[^>]+>', '', title_match.group(1)).strip() if title_match else doc_path.split('/')[-1]

        # 添加头部
        markdown = add_header(title, markdown)

        # 创建目录
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        # 保存文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(markdown)

        print(f"  ✅ 保存成功: {file_path}")
        print(f"     标题: {title}")
        print(f"     大小: {len(markdown)} 字符")

        success += 1

        # 避免请求过快
        time.sleep(0.5)

    # 汇总
    print("\n" + "=" * 50)
    print(f"📊 抓取完成:")
    print(f"   ✅ 成功: {success}/{total}")
    if failed:
        print(f"   ❌ 失败: {len(failed)}")
        for f in failed:
            print(f"      - {f}")
    else:
        print(f"   🎉 全部成功!")


if __name__ == "__main__":
    main()
