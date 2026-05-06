#!/usr/bin/env node

/**
 * scripts/md2html.cjs — Markdown to HTML converter for ZenTao
 *
 * Converts Markdown content to HTML for ZenTao API fields:
 * - Story spec (需求描述)
 * - Testcase steps, expect, precondition (测试步骤/预期/前置条件)
 *
 * Uses the `marked` library (globally installed). Falls back to
 * a simple converter if marked is not available.
 *
 * Usage:
 *   const { md2html } = require('./md2html.cjs');
 *   const html = md2html(markdownString);
 */

function md2html(md) {
  if (!md || typeof md !== 'string') return md || '';

  // Try to use marked library first
  try {
    // Search common global node_modules paths
    const paths = [
      'marked',
      '/opt/data/home/.npm-global/lib/node_modules/marked',
      '/usr/lib/node_modules/marked',
      '/usr/local/lib/node_modules/marked',
    ];

    for (const p of paths) {
      try {
        const { marked } = require(p);
        if (marked && typeof marked.parse === 'function') {
          return marked.parse(md);
        }
      } catch (_) {
        continue;
      }
    }
  } catch (_) {
    // Fall through to simple converter
  }

  // Simple fallback converter — handles common ZenTao needs
  let html = md;

  // Code blocks (```lang ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const cls = lang ? ` class="language-${lang}"` : '';
    return `<pre><code${cls}>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Tables (simple)
  html = html.replace(/^\|(.+)\|$/gm, (match) => {
    const cells = match.split('|').filter(c => c.trim());
    if (cells.every(c => /^[\s-:]+$/.test(c))) return '<!-- table separator -->';
    const tds = cells.map(c => `<td>${c.trim()}</td>`).join('');
    return `<tr>${tds}</tr>`;
  });

  // Line breaks → <br>
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  // Wrap in paragraph
  html = `<p>${html}</p>`;

  // Clean up
  html = html.replace(/<p><(h[1-4]|ul|pre|hr|table)/g, '<$1');
  html = html.replace(/<\/(h[1-4]|ul|pre|table)><\/p>/g, '</$1>');
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p><!-- table separator --><\/p>/g, '<thead></thead><tbody>');

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { md2html };
