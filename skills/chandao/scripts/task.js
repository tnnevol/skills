#!/usr/bin/env node
/**
 * chandao task module
 *
 * Usage:
 *   node task.js --action list --execution <id>
 *   node task.js --action get --id <id>
 *   node task.js --action create --execution <id> --name <name>
 *   node task.js --action update --id <id> --name <name>
 *   node task.js --action start --id <id>
 *   node task.js --action finish --id <id> --consumed <hours>
 *   node task.js --action close --id <id>
 *   node task.js --action activate --id <id>
 *   node task.js --action delete --id <id>
 *   node task.js --action <write-action> --dry-run
 *   node task.js --action delete --yes
 */

import { api, paginate } from "./auth.js";

const WRITE_ACTIONS = new Set([
  "create",
  "update",
  "start",
  "finish",
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
  if (!params.execution) {
    console.error("Error: list requires --execution");
    process.exit(1);
  }

  const path =
    `/executions/${params.execution}/tasks` +
    paginate("", {
      limit: params.limit,
      page: params.page,
      query: { orderBy: "id_desc" },
    });

  const { data } = await api("GET", path);
  const items = data.tasks || data.data || [];
  if (!items.length) {
    console.log("No tasks found.");
    return;
  }

  const header = `| id | name | type | status | assignedTo | estimate | consumed | left |`;
  console.log(header);
  console.log("─".repeat(header.length));
  for (const t of items) {
    console.log(
      `| ${t.id} | ${(t.name || "").slice(0, 20)} | ${t.type || "-"} | ${t.status || "-"} | ${t.assignedTo || "-"} | ${t.estimate || "0"} | ${t.consumed || "0"} | ${t.left || "0"} |`,
    );
  }
  console.log(`\nTotal: ${items.length}`);
}

async function get(params) {
  const { data } = await api("GET", `/tasks/${params.id}`);
  console.log(JSON.stringify(data, null, 2));
}

async function create(params) {
  if (!params.execution || !params.name) {
    console.error("Error: create requires --execution and --name");
    process.exit(1);
  }

  const body = {
    name: params.name,
    executionID: Number(params.execution),
  };
  if (params.type) body.type = params.type;
  if (params.assignedTo) body.assignedTo = params.assignedTo;
  if (params.estStarted) body.estStarted = params.estStarted;
  if (params.deadline) body.deadline = params.deadline;
  if (params.pri) body.pri = Number(params.pri);
  if (params.estimate) body.estimate = Number(params.estimate);
  if (params.module) body.module = Number(params.module);
  if (params.story) body.story = Number(params.story);
  if (params.desc) body.desc = params.desc;

  const { data } = await api("POST", "/tasks", body);
  if (data.status === "success") {
    console.log(`Task created successfully. ID: ${data.id}`);
  } else {
    console.error("Failed to create task:", JSON.stringify(data));
    process.exit(1);
  }
}

async function update(params) {
  if (!params.id) {
    console.error("Error: update requires --id");
    process.exit(1);
  }

  const { data: current } = await api("GET", `/tasks/${params.id}`);
  if (current.status !== "success") {
    console.error("Failed to get task:", JSON.stringify(current));
    process.exit(1);
  }

  const body = {};
  const fields = [
    "name",
    "type",
    "assignedTo",
    "estStarted",
    "deadline",
    "pri",
    "estimate",
    "module",
    "story",
    "desc",
  ];
  for (const f of fields) {
    if (params[f] !== undefined) body[f] = params[f];
    else if (current[f] !== undefined) body[f] = current[f];
  }
  if (params.execution) body.execution = Number(params.execution);
  else if (current.execution) body.execution = Number(current.execution);

  const { data } = await api("PUT", `/tasks/${params.id}`, body);
  if (data.status === "success") {
    console.log(`Task ${params.id} updated successfully.`);
  } else {
    console.error("Failed to update task:", JSON.stringify(data));
    process.exit(1);
  }
}

async function start(params) {
  const { data } = await api("PUT", `/tasks/${params.id}/start`);
  if (data.status === "success") {
    console.log(`Task ${params.id} started.`);
  } else {
    console.error("Failed to start task:", JSON.stringify(data));
    process.exit(1);
  }
}

async function finish(params) {
  if (!params.consumed) {
    console.error("Error: finish requires --consumed (hours)");
    process.exit(1);
  }

  const { data } = await api("PUT", `/tasks/${params.id}/finish`, {
    consumed: Number(params.consumed),
  });
  if (data.status === "success") {
    console.log(`Task ${params.id} finished.`);
  } else {
    console.error("Failed to finish task:", JSON.stringify(data));
    process.exit(1);
  }
}

async function close(params) {
  const { data } = await api("PUT", `/tasks/${params.id}/close`);
  if (data.status === "success") {
    console.log(`Task ${params.id} closed.`);
  } else {
    console.error("Failed to close task:", JSON.stringify(data));
    process.exit(1);
  }
}

async function activate(params) {
  if (!params.id) {
    console.error("Error: activate requires --id");
    process.exit(1);
  }

  const { data } = await api("PUT", `/tasks/${params.id}/activate`);
  if (data.status === "success") {
    console.log(`Task ${params.id} activated.`);
  } else {
    console.error("Failed to activate task:", JSON.stringify(data));
    process.exit(1);
  }
}

async function del(params) {
  const { data } = await api("DELETE", `/tasks/${params.id}`);
  if (data.status === "success") {
    console.log(`Task ${params.id} deleted.`);
  } else {
    console.error("Failed to delete task:", JSON.stringify(data));
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
  finish,
  close,
  activate,
  delete: del,
};

async function main() {
  const params = parseArgs();
  if (!params.action || !actions[params.action]) {
    console.error(
      `Usage: node task.js --action <${Object.keys(actions).join("|")}>`,
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
