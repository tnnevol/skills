#!/usr/bin/env node
/**
 * chandao bug module
 *
 * Usage:
 *   node bug.js --action list [--product N] [--project N] [--execution N]
 *   node bug.js --action get --id <id>
 *   node bug.js --action create --product <id> --title <title>
 *   node bug.js --action update --id <id> --title <title>
 *   node bug.js --action resolve --id <id> --resolution <fixed|bydesign|willnotfix|external|duplicate|delay|postponed|notrepro>
 *   node bug.js --action close --id <id>
 *   node bug.js --action activate --id <id>
 *   node bug.js --action delete --id <id>
 *   node bug.js --action <write-action> --dry-run
 *   node bug.js --action delete --yes
 */

import { api, paginate } from "./auth.js";

const WRITE_ACTIONS = new Set([
  "create",
  "update",
  "resolve",
  "close",
  "activate",
  "delete",
]);

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
  let path = "/bugs";
  if (params.product) path = `/products/${params.product}/bugs`;
  else if (params.project) path = `/projects/${params.project}/bugs`;
  else if (params.execution) path = `/executions/${params.execution}/bugs`;

  path += paginate("", {
    limit: params.limit,
    page: params.page,
    query: { orderBy: "id_desc" },
  });

  const { data } = await api("GET", path);
  const items = data.bugs || data.data || [];
  if (!items.length) {
    console.log("No bugs found.");
    return;
  }

  const header = `| id | title | severity | pri | status |`;
  console.log(header);
  console.log("─".repeat(header.length));
  for (const b of items) {
    console.log(
      `| ${b.id} | ${(b.title || "").slice(0, 40)} | ${b.severity || "-"} | ${b.pri || "-"} | ${b.status || "-"} |`,
    );
  }
  console.log(`\nTotal: ${items.length}`);
}

async function get(params) {
  const { data } = await api("GET", `/bugs/${params.id}`);
  console.log(JSON.stringify(data, null, 2));
}

async function create(params) {
  if (!params.product || !params.title) {
    console.error("Error: create requires --product and --title");
    process.exit(1);
  }

  const body = {
    productID: Number(params.product),
    title: params.title,
    openedBuild: params.openedBuild
      ? typeof params.openedBuild === "string"
        ? [params.openedBuild]
        : params.openedBuild
      : ["trunk"],
  };
  if (params.project) body.project = Number(params.project);
  if (params.execution) body.execution = Number(params.execution);
  if (params.severity) body.severity = Number(params.severity);
  if (params.pri) body.pri = Number(params.pri);
  if (params.type) body.type = params.type;
  if (params.steps) body.steps = params.steps;
  if (params.story) body.story = Number(params.story);

  const { data } = await api("POST", "/bugs", body);
  if (data.status === "success") {
    console.log(`Bug created successfully. ID: ${data.id}`);
  } else {
    console.error("Failed to create bug:", JSON.stringify(data));
    process.exit(1);
  }
}

async function update(params) {
  if (!params.id) {
    console.error("Error: update requires --id");
    process.exit(1);
  }

  const { data: current } = await api("GET", `/bugs/${params.id}`);
  if (current.status !== "success") {
    console.error("Failed to get bug:", JSON.stringify(current));
    process.exit(1);
  }

  const body = {};
  const fields = [
    "title",
    "severity",
    "pri",
    "type",
    "steps",
    "story",
    "assignedTo",
    "status",
    "execution",
  ];
  for (const f of fields) {
    if (params[f] !== undefined) body[f] = params[f];
    else if (current[f] !== undefined) body[f] = current[f];
  }
  // Ensure execution is numeric if provided
  if (params.execution) body.execution = Number(params.execution);
  else if (current.execution) body.execution = Number(current.execution);

  const { data } = await api("PUT", `/bugs/${params.id}`, body);
  if (data.status === "success") {
    console.log(`Bug ${params.id} updated successfully.`);
  } else {
    console.error("Failed to update bug:", JSON.stringify(data));
    process.exit(1);
  }
}

async function resolve(params) {
  if (!params.id) {
    console.error("Error: resolve requires --id");
    process.exit(1);
  }
  if (!params.resolution) {
    console.error("Error: resolve requires --resolution");
    process.exit(1);
  }
  if (!params.resolvedBuild) {
    console.error("Error: resolve requires --resolvedBuild (影响版本)");
    process.exit(1);
  }

  const body = {
    resolution: params.resolution,
    resolvedBuild: params.resolvedBuild,
  };
  if (params.assignedTo) body.assignedTo = params.assignedTo;

  const { data } = await api("PUT", `/bugs/${params.id}/resolve`, body);
  if (data.status === "success") {
    console.log(
      `Bug ${params.id} resolved (resolution: ${params.resolution}).`,
    );
  } else {
    console.error("Failed to resolve bug:", JSON.stringify(data));
    process.exit(1);
  }
}

async function close(params) {
  const { data } = await api("PUT", `/bugs/${params.id}/close`);
  if (data.status === "success") {
    console.log(`Bug ${params.id} closed.`);
  } else {
    console.error("Failed to close bug:", JSON.stringify(data));
    process.exit(1);
  }
}

async function activate(params) {
  if (!params.openedBuild) {
    console.error("Error: activate requires --openedBuild (影响版本)");
    process.exit(1);
  }

  const openedBuild =
    typeof params.openedBuild === "string"
      ? [params.openedBuild]
      : params.openedBuild;
  const { data } = await api("PUT", `/bugs/${params.id}/activate`, {
    openedBuild,
  });
  if (data.status === "success") {
    console.log(`Bug ${params.id} activated.`);
  } else {
    console.error("Failed to activate bug:", JSON.stringify(data));
    process.exit(1);
  }
}

async function del(params) {
  const { data } = await api("DELETE", `/bugs/${params.id}`);
  if (data.status === "success") {
    console.log(`Bug ${params.id} deleted.`);
  } else {
    console.error("Failed to delete bug:", JSON.stringify(data));
    process.exit(1);
  }
}

// ── Dispatch ──────────────────────────────────────────────────────
const actions = {
  list,
  get,
  create,
  update,
  resolve,
  close,
  activate,
  delete: del,
};

async function main() {
  const params = parseArgs();
  if (!params.action || !actions[params.action]) {
    console.error(
      `Usage: node bug.js --action <${Object.keys(actions).join("|")}>`,
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
