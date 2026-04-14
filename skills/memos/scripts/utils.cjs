/**
 * Memos 脚本公共工具函数
 */

function normalizeMemoId(id) {
  if (!id) return id;
  if (id.startsWith("memos/")) return id;
  return `memos/${id}`;
}

function stripMemoPrefix(id) {
  if (!id) return id;
  return id.replace(/^memos\//, "");
}

function formatVisibility(v) {
  if (!v) return "PRIVATE";
  return v.toUpperCase();
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

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function parseFlags(argList) {
  const flags = {};
  const positional = [];
  for (const arg of argList) {
    if (arg.startsWith("--")) {
      const [key, ...rest] = arg.slice(2).split("=");
      flags[key] = rest.length > 0 ? rest.join("=") : true;
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
}

async function callAPI(BASE_URL, ACCESS_TOKEN, method, path, body) {
  const { sanitize } = require("./sanitize.cjs");
  const url = `${BASE_URL}${path}`;
  const fetchOptions = {
    method,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  };

  if (body) {
    fetchOptions.headers["Content-Type"] = "application/json";
    fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const res = await fetch(url, fetchOptions);
  const text = await res.text();

  if (res.status >= 400) {
    console.error(`HTTP ${res.status} 错误:`);
    console.error(sanitize(text));
    process.exit(1);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * 从笔记 creator 字段提取当前用户 ID
 */
async function getCurrentUserId(callAPI) {
  let userId = "1";
  try {
    const data = await callAPI("GET", "/api/v1/memos?pageSize=1");
    const creator = data.memos?.[0]?.creator;
    if (creator && creator.startsWith("users/")) {
      userId = creator.replace("users/", "");
    }
  } catch {
    // fallback to userId = 1
  }
  return userId;
}

/**
 * 分页获取所有笔记（用于标签统计、用户统计等）
 */
async function fetchAllMemos(callAPI, maxPages = 50) {
  const allMemos = [];
  let nextPageToken = "";
  let totalPages = 0;

  while (true) {
    let url = `/api/v1/memos?pageSize=100`;
    if (nextPageToken) {
      url += `&pageToken=${encodeURIComponent(nextPageToken)}`;
    }

    const data = await callAPI("GET", url);
    const memos = data.memos || [];
    totalPages++;
    allMemos.push(...memos);

    nextPageToken = data.nextPageToken || "";
    if (!nextPageToken || totalPages >= maxPages) break;
  }

  return allMemos;
}

module.exports = {
  normalizeMemoId,
  stripMemoPrefix,
  formatVisibility,
  truncate,
  formatTime,
  formatBytes,
  parseFlags,
  callAPI,
  getCurrentUserId,
  fetchAllMemos,
};
