#!/usr/bin/env node
/**
 * chandao execution (sprint/iteration) module
 *
 * Usage:
 *   node execution.js --action list [--project N] [--status all|undone|wait|doing]
 *   node execution.js --action get --id <id>
 *   node execution.js --action create --project <id> --name <name> --begin <date> --end <date>
 *   node execution.js --action update --id <id> --name <name> --begin <date> --end <date>
 *   node execution.js --action start --id <id>
 *   node execution.js --action suspend --id <id>
 *   node execution.js --action close --id <id>
 *   node execution.js --action delete --id <id>
 *   node execution.js --action link-products --id <id> --products <id1,id2>
 *   node execution.js --action <write-action> --dry-run
 *   node execution.js --action delete --yes
 */

import { api, formatList, paginate } from "./auth.js";

const WRITE_ACTIONS = new Set([
  "create",
  "update",
  "start",
  "suspend",
  "close",
  "delete",
  "link-products",
]);

// ── Args parser ───────────────────────────────────────────────────
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
  // Parse --products as array
  if (typeof params.products === "string") {
    params.products = params.products.split(",").map(Number);
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
  let path = "/executions";
  const query = {};
  if (params.project) path = `/projects/${params.project}/executions`;
  if (params.status) query.status = params.status;
  query.orderBy = "id_desc";

  path += paginate("", { limit: params.limit, page: params.page, query });

  const { data } = await api("GET", path);
  const items = data.executions || data.data || [];
  formatList(items, [
    { label: "id", key: "id" },
    { label: "name", key: "name" },
    { label: "status", key: "status" },
    { label: "begin", key: "begin" },
    { label: "end", key: "end" },
  ]);
}

async function get(params) {
  const { data } = await api("GET", `/executions/${params.id}`);
  console.log(JSON.stringify(data, null, 2));
}

async function create(params) {
  if (!params.project || !params.name || !params.begin || !params.end) {
    console.error("Error: create requires --project, --name, --begin, --end");
    process.exit(1);
  }

  const body = {
    project: Number(params.project),
    name: params.name,
    begin: params.begin,
    end: params.end,
  };
  if (params.lifetime) body.lifetime = params.lifetime;
  if (params.days) body.days = Number(params.days);
  if (params.products)
    body.products = (
      typeof params.products === "string"
        ? params.products.split(",")
        : params.products
    ).map(Number);
  if (params.plans)
    body.plans =
      typeof params.plans === "string"
        ? JSON.parse(params.plans)
        : params.plans;
  if (params.PO) body.PO = params.PO;
  if (params.QD) body.QD = params.QD;
  if (params.PM) body.PM = params.PM;
  if (params.RD) body.RD = params.RD;
  if (params.acl) body.acl = params.acl;

  const { data } = await api("POST", "/executions", body);
  if (data.status === "success") {
    console.log(`Execution created successfully. ID: ${data.id}`);
  } else {
    console.error("Failed to create execution:", JSON.stringify(data));
    process.exit(1);
  }
}

async function update(params) {
  if (!params.id) {
    console.error("Error: update requires --id");
    process.exit(1);
  }

  // Get current values first
  const { data: current } = await api("GET", `/executions/${params.id}`);
  if (current.status !== "success") {
    console.error("Failed to get execution:", JSON.stringify(current));
    process.exit(1);
  }

  const cur = current;
  const body = {
    name: params.name ?? cur.name,
    begin: params.begin ?? cur.begin,
    end: params.end ?? cur.end,
  };
  // Preserve all other fields
  if (params.project) body.project = Number(params.project);
  else if (cur.project) body.project = Number(cur.project);
  if (params.lifetime ?? cur.lifetime)
    body.lifetime = params.lifetime ?? cur.lifetime;
  if (params.days ?? cur.days) body.days = Number(params.days ?? cur.days);
  if (params.products)
    body.products = (
      typeof params.products === "string"
        ? params.products.split(",")
        : params.products
    ).map(Number);
  else if (cur.products) body.products = cur.products;
  if (cur.plans) body.plans = cur.plans;
  if (params.PO ?? cur.PO) body.PO = params.PO ?? cur.PO;
  if (params.QD ?? cur.QD) body.QD = params.QD ?? cur.QD;
  if (params.PM ?? cur.PM) body.PM = params.PM ?? cur.PM;
  if (params.RD ?? cur.RD) body.RD = params.RD ?? cur.RD;
  if (params.acl ?? cur.acl) body.acl = params.acl ?? cur.acl;
  if (cur.status) body.status = cur.status;

  const { data } = await api("PUT", `/executions/${params.id}`, body);
  if (data.status === "success") {
    console.log(`Execution ${params.id} updated successfully.`);
  } else {
    console.error("Failed to update execution:", JSON.stringify(data));
    process.exit(1);
  }
}

async function start(params) {
  const { data } = await api("PUT", `/executions/${params.id}/start`);
  if (data.status === "success") {
    console.log(`Execution ${params.id} started.`);
  } else {
    console.error("Failed to start execution:", JSON.stringify(data));
    process.exit(1);
  }
}

async function suspend(params) {
  const { data } = await api("PUT", `/executions/${params.id}/suspend`);
  if (data.status === "success") {
    console.log(`Execution ${params.id} suspended.`);
  } else {
    console.error("Failed to suspend execution:", JSON.stringify(data));
    process.exit(1);
  }
}

async function close(params) {
  const { data } = await api("PUT", `/executions/${params.id}/close`);
  if (data.status === "success") {
    console.log(`Execution ${params.id} closed.`);
  } else {
    console.error("Failed to close execution:", JSON.stringify(data));
    process.exit(1);
  }
}

async function del(params) {
  const { data } = await api("DELETE", `/executions/${params.id}`);
  if (data.status === "success") {
    console.log(`Execution ${params.id} deleted.`);
  } else {
    console.error("Failed to delete execution:", JSON.stringify(data));
    process.exit(1);
  }
}

async function linkProducts(params) {
  if (!params.id || !params.products) {
    console.error("Error: link-products requires --id and --products");
    process.exit(1);
  }

  const products =
    typeof params.products === "string"
      ? params.products.split(",").map(Number)
      : params.products;
  const body = { products };
  if (params.plans) {
    body.plans =
      typeof params.plans === "string"
        ? JSON.parse(params.plans)
        : params.plans;
  }

  const { data } = await api(
    "POST",
    `/executions/${params.id}/linkProducts`,
    body,
  );
  if (data.status === "success") {
    console.log(`Products linked to execution ${params.id}.`);
  } else {
    console.error("Failed to link products:", JSON.stringify(data));
    process.exit(1);
  }
}

// ── Dispatch ──────────────────────────────────────────────────────
const actions = {
  list,
  get,
  create,
  update,
  start,
  suspend,
  close,
  delete: del,
  "link-products": linkProducts,
};

async function main() {
  const params = parseArgs();
  if (!params.action || !actions[params.action]) {
    console.error(
      `Usage: node execution.js --action <${Object.keys(actions).join("|")}>`,
    );
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
