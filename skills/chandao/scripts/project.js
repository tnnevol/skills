#!/usr/bin/env node
/**
 * chandao project module
 *
 * Usage:
 *   node project.js --action list
 *   node project.js --action get --id <id>
 *   node project.js --action create --name <name> --model <scrum|waterfall|kanban|agileplus|waterfallplus> --begin <date> --end <date>
 *   node project.js --action update --id <id> --name <name>
 *   node project.js --action delete --id <id>
 *   node project.js --action list-by-program --program <id>
 *   node project.js --action <write-action> --dry-run
 *   node project.js --action delete --yes
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
  const path = "/projects" + paginate("", { limit: params.limit, page: params.page, query: { orderBy: "id_desc" } });

  const { data } = await api("GET", path);
  const items = data.projects || data.data || [];
  if (!items.length) { console.log("No projects found."); return; }

  const header = `| id | name | model | status | begin | end |`;
  console.log(header);
  console.log("─".repeat(header.length));
  for (const p of items) {
    console.log(`| ${p.id} | ${(p.name || "").slice(0, 30)} | ${p.model || "-"} | ${p.status || "-"} | ${p.begin || "-"} | ${p.end || "-"} |`);
  }
  console.log(`\nTotal: ${items.length}`);
}

async function get(params) {
  const { data } = await api("GET", `/projects/${params.id}`);
  console.log(JSON.stringify(data, null, 2));
}

async function create(params) {
  if (!params.name || !params.model || !params.begin || !params.end) {
    console.error("Error: create requires --name, --model, --begin, --end");
    process.exit(1);
  }

  const body = {
    name: params.name,
    model: params.model,
    begin: params.begin,
    end: params.end,
  };
  if (params.products) {
    body.products = (typeof params.products === "string" ? params.products.split(",") : params.products).map(Number);
  }
  if (params.parent) body.parent = Number(params.parent);
  if (params.workflowGroup) body.workflowGroup = Number(params.workflowGroup);
  if (params.PM) body.PM = params.PM;

  const { data } = await api("POST", "/projects", body);
  if (data.status === "success") {
    console.log(`Project created successfully. ID: ${data.id}`);
  } else {
    console.error("Failed to create project:", JSON.stringify(data));
    process.exit(1);
  }
}

async function update(params) {
  if (!params.id) { console.error("Error: update requires --id"); process.exit(1); }

  const { data: current } = await api("GET", `/projects/${params.id}`);
  if (current.status !== "success") { console.error("Failed to get project:", JSON.stringify(current)); process.exit(1); }

  const body = {};
  const fields = ["name", "model", "begin", "end", "parent", "PM"];
  for (const f of fields) {
    if (params[f] !== undefined) body[f] = params[f];
    else if (current[f] !== undefined) body[f] = current[f];
  }
  if (params.products) {
    body.products = (typeof params.products === "string" ? params.products.split(",") : params.products).map(Number);
  } else if (current.products) {
    body.products = current.products;
  }
  if (current.workflowGroup) body.workflowGroup = current.workflowGroup;

  const { data } = await api("PUT", `/projects/${params.id}`, body);
  if (data.status === "success") {
    console.log(`Project ${params.id} updated successfully.`);
  } else {
    console.error("Failed to update project:", JSON.stringify(data));
    process.exit(1);
  }
}

async function del(params) {
  const { data } = await api("DELETE", `/projects/${params.id}`);
  if (data.status === "success") {
    console.log(`Project ${params.id} deleted.`);
  } else {
    console.error("Failed to delete project:", JSON.stringify(data));
    process.exit(1);
  }
}

async function listByProgram(params) {
  if (!params.program) {
    console.error("Error: list-by-program requires --program");
    process.exit(1);
  }

  const { data } = await api("GET", `/programs/${params.program}/projects`);
  const items = data.projects || data.data || [];
  if (!items.length) { console.log("No projects found for this program."); return; }

  const header = `| id | name | model | status | begin | end |`;
  console.log(header);
  console.log("─".repeat(header.length));
  for (const p of items) {
    console.log(`| ${p.id} | ${(p.name || "").slice(0, 30)} | ${p.model || "-"} | ${p.status || "-"} | ${p.begin || "-"} | ${p.end || "-"} |`);
  }
  console.log(`\nTotal: ${items.length}`);
}

// ── Dispatch ──────────────────────────────────────────────────────
const actions = { list, get, create, update, delete: del, "list-by-program": listByProgram };

async function main() {
  const params = parseArgs();
  if (!params.action || !actions[params.action]) {
    console.error(`Usage: node project.js --action <${Object.keys(actions).join("|")}>`);
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
