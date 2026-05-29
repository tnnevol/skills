#!/usr/bin/env node
/**
 * chandao auth module — shared HTTP client + Token authentication + helpers
 *
 * Used by all module scripts as a library:
 *   import { api, paginate } from "./auth.js";
 *
 * Also runnable as a CLI:
 *   node auth.js --action login
 *   node auth.js --action get-token
 *   node auth.js --action list-products
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// ── Token cache ───────────────────────────────────────────────────
const CACHE_DIR = join(homedir(), ".cache", "chandao-skill");
const TOKEN_FILE = join(CACHE_DIR, "token.json");

function readToken() {
  try {
    return JSON.parse(readFileSync(TOKEN_FILE, "utf8")).token;
  } catch {
    return null;
  }
}

function writeToken(token) {
  try { mkdirSync(CACHE_DIR, { recursive: true }); } catch {}
  writeFileSync(TOKEN_FILE, JSON.stringify({ token, ts: Date.now() }));
}

// ── Config ────────────────────────────────────────────────────────
export function getConfig() {
  const url = process.env.CHANDAO_URL;
  const account = process.env.CHANDAO_ACCOUNT;
  const password = process.env.CHANDAO_PASSWORD;

  if (!url || !account || !password) {
    console.error("Error: missing required environment variables.");
    console.error("Please set: CHANDAO_URL, CHANDAO_ACCOUNT, CHANDAO_PASSWORD");
    process.exit(1);
  }

  return {
    baseUrl: url.replace(/\/+$/, ""),
    account,
    password,
  };
}

export function getBaseUrl() {
  return getConfig().baseUrl;
}

// ── Low-level API call ────────────────────────────────────────────
async function rawApi(method, path, body = null, token = null) {
  const config = getConfig();
  const url = `${config.baseUrl}/api.php/v2${path}`;

  const headers = { "Content-Type": "application/json" };
  if (token) headers["token"] = token;

  const opts = {
    method,
    headers,
    signal: AbortSignal.timeout(15000),
  };

  if (body !== null) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(url, opts);
  const data = await res.json();

  return { status: res.status, data };
}

// ── Login ─────────────────────────────────────────────────────────
async function login() {
  const config = getConfig();
  const { status, data } = await rawApi("POST", "/users/login", {
    account: config.account,
    password: config.password,
  });

  if (status !== 200 || data?.status !== "success") {
    console.error("Login failed: " + (data?.message || data?.errors || `HTTP ${status}`));
    process.exit(1);
  }

  const token = data.token;
  if (!token) {
    console.error("Login succeeded but no token returned.");
    process.exit(1);
  }

  writeToken(token);
  return token;
}

// ── Get token (auto-refresh) ──────────────────────────────────────
async function getToken() {
  const cached = readToken();
  if (cached) {
    const { status } = await rawApi("GET", "/users", null, cached);
    if (status !== 401) return cached;
  }
  return login();
}

// ── Authenticated API call (with 401 retry) ───────────────────────
export async function api(method, path, body = null) {
  let token = await getToken();
  let { status, data } = await rawApi(method, path, body, token);

  if (status === 401) {
    token = await login();
    const retry = await rawApi(method, path, body, token);
    status = retry.status;
    data = retry.data;
  }

  return { status, data };
}

// ── Helpers ───────────────────────────────────────────────────────
export function buildQuery(params) {
  const parts = [];
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    }
  }
  const qs = parts.join("&");
  return qs ? `?${qs}` : "";
}

export function paginate(path, params) {
  const q = buildQuery({
    pageID: params.page ?? 1,
    recPerPage: params.limit ?? 20,
    ...params.query,
  });
  return `${path}${q}`;
}

export function formatList(items, columns) {
  if (!items || items.length === 0) {
    console.log("No data found.");
    return;
  }
  const pad = (val, w) => String(val ?? "").padEnd(w);
  const widths = columns.map((col, i) =>
    Math.max(col.label.length, ...items.map(item => String(item[col.key] ?? "").length)),
  );
  const header = columns.map((col, i) => pad(col.label, widths[i])).join(" | ");
  console.log(header);
  console.log("─".repeat(header.length));
  for (const item of items) {
    const row = columns.map((col, i) => pad(item[col.key] ?? "", widths[i])).join(" | ");
    console.log(row);
  }
  console.log(`\nTotal: ${items.length}`);
}

// ── CLI Actions ───────────────────────────────────────────────────
const actions = {
  async login() {
    const token = await login();
    console.log("Login successful. Token cached.");
  },

  async "get-token"() {
    const token = await getToken();
    console.log(token);
  },

  async "list-products"() {
    const { status, data } = await api("GET", "/products?recPerPage=20");
    if (status !== 200 || data?.status !== "success") {
      console.error("Failed to list products: " + JSON.stringify(data));
      process.exit(1);
    }

    const products = data.products || data.data || [];
    if (products.length === 0) {
      console.log("No products found.");
      return;
    }

    const header = "| id | name | type | status |";
    console.log(header);
    console.log("─".repeat(header.length));
    for (const p of products) {
      console.log(`| ${p.id} | ${p.name} | ${p.type || "-"} | ${p.status || "-"} |`);
    }
    console.log(`\nTotal: ${products.length}`);
  },
};

// ── CLI entry ─────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const actionIdx = args.indexOf("--action");
  if (actionIdx === -1) {
    console.error("Usage: node auth.js --action <login|get-token|list-products>");
    process.exit(1);
  }

  const action = args[actionIdx + 1];
  if (!action || !actions[action]) {
    console.error(`Unknown action: ${action}`);
    console.error("Available actions: " + Object.keys(actions).join(", "));
    process.exit(1);
  }

  await actions[action]();
}

// Only run CLI when executed directly (not imported)
if (process.argv[1]?.endsWith("auth.js")) {
  main().catch((err) => {
    console.error("Fatal error:", err.message);
    process.exit(1);
  });
}
