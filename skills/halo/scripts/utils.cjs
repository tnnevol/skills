/**
 * Halo 脚本公共工具函数
 */

/**
 * Markdown → HTML 转换（轻量级，支持常用语法）
 * 支持：标题、粗体、行内代码、代码块、引用、表格、分隔线、换行
 */
function md2html(md) {
  if (!md) return "";
  
  // 修复：处理 \n 字面量 → 实际换行
  md = md.replace(/\\n/g, '\n');
  
  const lines = md.split("\n");
  const html = [];
  let inCodeBlock = false;
  let codeBlockContent = [];
  let codeLang = "";
  let inTable = false;
  let tableRows = [];

  function flushTable() {
    if (tableRows.length === 0) return;
    // 检查是否有分隔行（第二行是 ---|---）
    const isTable = tableRows.length >= 2 && /^[\s|:\-]+$/.test(tableRows[1]);
    if (isTable) {
      const dataRows = tableRows.filter((_, i) => i !== 1);
      let table = "<table>";
      dataRows.forEach((row, i) => {
        const cells = row.split("|").map((c) => c.trim()).filter((c) => c !== "");
        const tag = i === 0 ? "th" : "td";
        table += "<tr>" + cells.map((c) => `<${tag}>${c}</${tag}>`).join("") + "</tr>";
      });
      table += "</table>";
      html.push(table);
    } else {
      // 不是表格，正常处理每一行
      tableRows.forEach((line) => processLine(line));
    }
    tableRows = [];
    inTable = false;
  }

  function processLine(line) {
    // 分隔线
    if (/^---+\s*$/.test(line)) { html.push("<hr>"); return; }
    // 标题
    const heading = line.match(/^(#{1,6})\s+(.+)/);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${inlineFormat(heading[2])}</h${level}>`);
      return;
    }
    // 引用
    if (line.startsWith("> ")) {
      html.push(`<blockquote>${inlineFormat(line.slice(2))}</blockquote>`);
      return;
    }
    // 空行
    if (line.trim() === "") { return; }
    // 普通段落
    html.push(`<p>${inlineFormat(line)}</p>`);
  }

  function inlineFormat(text) {
    // 在代码块内不处理行内格式
    if (inCodeBlock) return text;
    
    // 行内代码
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
    // 粗体
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // 斜体
    text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return text;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 代码块
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        // 结束代码块
        const code = codeBlockContent.join("\n").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const cls = codeLang ? ` class="language-${codeLang}"` : "";
        html.push(`<pre><code${cls}>${code}</code></pre>`);
        codeBlockContent = [];
        codeLang = "";
        inCodeBlock = false;
      } else {
        // 开始代码块
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // 检测表格（包含 | 的行）
    if (line.includes("|")) {
      inTable = true;
      tableRows.push(line);
      continue;
    }

    // 如果之前在表格中，先 flush
    if (inTable) flushTable();

    processLine(line);
  }

  // 处理剩余的代码块或表格
  if (inCodeBlock) {
    const code = codeBlockContent.join("\n").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const cls = codeLang ? ` class="language-${codeLang}"` : "";
    html.push(`<pre><code${cls}>${code}</code></pre>`);
  }
  if (inTable) flushTable();

  return html.join("\n");
}

function truncate(str, len = 100) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "..." : str;
}

function formatTime(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    const Y = d.getFullYear();
    const M = String(d.getMonth() + 1).padStart(2, "0");
    const D = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${Y}-${M}-${D} ${h}:${m}`;
  } catch {
    return isoStr;
  }
}

function parseFlags(argList) {
  const flags = {};
  const positional = [];
  for (const arg of argList) {
    if (arg.startsWith("--")) {
      const eqIdx = arg.indexOf("=");
      if (eqIdx > 2) {
        const key = arg.slice(2, eqIdx);
        const value = arg.slice(eqIdx + 1);
        flags[key] = value;
      } else {
        const key = arg.slice(2);
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
}

/**
 * 从标题生成 slug（小写 + 数字 + 连字符，≤253）
 */
function slugify(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[\u4e00-\u9fa5]/g, (c) => c.charCodeAt(0).toString(16))
    .replace(/[^\w]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 253);
}

/**
 * 通用 API 调用函数
 * @param {boolean} silentFail - If true, return { _error: true, status, text } instead of exiting
 */
async function callAPI(BASE_URL, PAT, method, path, body, silentFail = false) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    Authorization: `Bearer ${PAT}`,
  };

  const options = { method, headers };

  if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
    options.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    if (silentFail) return { _error: true, message: err.message };
    console.error(`请求失败: ${err.message}`);
    console.error(`  URL: ${url}`);
    process.exit(1);
  }

  const text = await res.text();

  if (res.status >= 400) {
    if (silentFail) return { _error: true, status: res.status, text };
    let msg = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text);
      if (json.message) msg += `: ${json.message}`;
      else if (json.reason) msg += `: ${json.reason}`;
      else if (json.error) msg += `: ${json.error}`;
      else msg += `: ${text.slice(0, 200)}`;
    } catch {
      msg += `: ${text.slice(0, 200)}`;
    }
    console.error(`❌ ${msg}`);
    process.exit(1);
  }

  if (!text || text.trim() === "") return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * 格式化文章链接
 */
function buildPostLink(BASE_URL, post) {
  const spec = post.spec || {};
  const meta = post.metadata || {};
  const status = post.status || {};

  if (status.permalink) return status.permalink;
  if (spec.slug) return `${BASE_URL}/archives/${spec.slug}`;
  return `${BASE_URL}/?p=${meta.name}`;
}

module.exports = {
  truncate,
  formatTime,
  parseFlags,
  slugify,
  md2html,
  callAPI,
  buildPostLink,
};
