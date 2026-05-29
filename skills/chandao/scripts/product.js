#!/usr/bin/env node
/**
 * chandao product module
 *
 * Usage:
 *   node product.js --action list
 *   node product.js --action get --id <id>
 *   node product.js --action create --name <name>
 *   node product.js --action update --id <id> --name <name>
 *   node product.js --action delete --id <id>
 *   node product.js --action list-by-program --program <id>
 *   node product.js --action <write-action> --dry-run
 *   node product.js --action delete --yes
 */

import { api, paginate } from "./auth.js";

const WRITE_ACTIONS = new Set(["create", "update", "delete"]);

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      params[key] = args[i + 1] ?? true;
      if (params[key] !== true) i++;
    } else if (!params.action) {
      params.action = args[i];
    }
  }
  if (typeof params.reviewer === "string") {
    params.reviewer = params.reviewer.split(",");
  }
  return params;
}

function checkDryRun(action) {
  if (WRITE_ACTIONS.has(action) && process.argv.includes("--dry-run")) {
    console.log("[DRY RUN] Would execute:", process.argv.slice(2).join(" "));
    process.exit(0);
  }
}

function checkYes(action) {
  if (action === "delete" && !process.argv.includes("--yes")) {
    console.log("Delete requires --yes to confirm.");
    process.exit(0);
  }
}

// ── Actions ───────────────────────────────────────────────────────
async function list(params) {
  const path = "/products" + paginate("", { limit: params.limit, page: params.page, query: { orderBy: "id_desc" } });

  const { data } = await api("GET", path);
  const items = data.products || data.data || [];
  if (!items.length) { console.log("No products found."); return; }

  const header = `| id | name | type | status | PO |`;
  console.log(header);
  console.log("─".repeat(header.length));
  for (const p of items) {
    console.log(`| ${p.id} | ${(p.name || "").slice(0, 30)} | ${p.type || "-"} | ${p.status || "-"} | ${p.PO || "-"} |`);
  }
  console.log(`\nTotal: ${items.length}`);
}

async function get(params) {
  const { data } = await api("GET", `/products/${params.id}`);
  console.log(JSON.stringify(data, null, 2));
}

async function create(params) {
  if (!params.name) {
    console.error("Error: create requires --name");
    process.exit(1);
  }

  const body = { name: params.name };
  if (params.program) body.program = Number(params.program);
  if (params.line) body.line = Number(params.line);
  if (params.type) body.type = params.type;
  if (params.PO) body.PO = params.PO;
  if (params.reviewer) body.reviewer = typeof params.reviewer === "string" ? params.reviewer.split(",") : params.reviewer;
  if (params.desc) body.desc = params.desc;
  if (params.QD) body.QD = params.QD;
  if (params.RD) body.RD = params.RD;
  if (params.acl) body.acl = params.acl;

  const { data } = await api("POST", "/products", body);
  if (data.status === "success") {
    console.log(`Product created successfully. ID: ${data.id}`);
  } else {
    console.error("Failed to create product:", JSON.stringify(data));
    process.exit(1);
  }
}

async function update(params) {
  if (!params.id) { console.error("Error: update requires --id"); process.exit(1); }

  const { data: current } = await api("GET", `/products/${params.id}`);
  if (current.status !== "success") { console.error("Failed to get product:", JSON.stringify(current)); process.exit(1); }

  const body = {};
  const fields = ["name", "program", "line", "type", "PO", "reviewer", "desc", "QD", "RD", "acl"];
  for (const f of fields) {
    if (params[f] !== undefined) body[f] = params[f];
    else if (current[f] !== undefined) body[f] = current[f];
  }

  const { data } = await api("PUT", `/products/${params.id}`, body);
  if (data.status === "success") {
    console.log(`Product ${params.id} updated successfully.`);
  } else {
    console.error("Failed to update product:", JSON.stringify(data));
    process.exit(1);
  }
}

async function del(params) {
  const { data } = await api("DELETE", `/products/${params.id}`);
  if (data.status === "success") {
    console.log(`Product ${params.id} deleted.`);
  } else {
    console.error("Failed to delete product:", JSON.stringify(data));
    process.exit(1);
  }
}

async function listByProgram(params) {
  if (!params.program) {
    console.error("Error: list-by-program requires --program");
    process.exit(1);
  }

  const { data } = await api("GET", `/programs/${params.program}/products`);
  const items = data.products || data.data || [];
  if (!items.length) { console.log("No products found for this program."); return; }

  const header = `| id | name | type | status | PO |`;
  console.log(header);
  console.log("─".repeat(header.length));
  for (const p of items) {
    console.log(`| ${p.id} | ${(p.name || "").slice(0, 30)} | ${p.type || "-"} | ${p.status || "-"} | ${p.PO || "-"} |`);
  }
  console.log(`\nTotal: ${items.length}`);
}

// ── Dispatch ──────────────────────────────────────────────────────
const actions = { list, get, create, update, delete: del, "list-by-program": listByProgram };

async function main() {
  const params = parseArgs();
  if (!params.action || !actions[params.action]) {
    console.error(`Usage: node product.js --action <${Object.keys(actions).join("|")}>`);
    process.exit(1);
  }

  checkDryRun(params.action);
  checkYes(params.action);

  await actions[params.action](params);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
