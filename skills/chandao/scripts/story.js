#!/usr/bin/env node
/**
 * chandao story (requirement) module
 *
 * Usage:
 *   node story.js --action list [--product N] [--project N] [--execution N]
 *   node story.js --action get --id <id>
 *   node story.js --action create --product <id> --title <title>
 *   node story.js --action update --id <id> --title <title>
 *   node story.js --action change --id <id> --reviewer <a1,a2>
 *   node story.js --action close --id <id> --reason <done|subdivided|duplicate|postponed|willnotdo|cancel|bydesign>
 *   node story.js --action activate --id <id>
 *   node story.js --action delete --id <id>
 *   node story.js --action <write-action> --dry-run
 *   node story.js --action delete --yes
 */

import { api, paginate } from "./auth.js";

const WRITE_ACTIONS = new Set([
  "create",
  "update",
  "change",
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
  let path = "/stories";
  if (params.product) path = `/products/${params.product}/stories`;
  else if (params.project) path = `/projects/${params.project}/stories`;
  else if (params.execution) path = `/executions/${params.execution}/stories`;

  path += paginate("", {
    limit: params.limit,
    page: params.page,
    query: { orderBy: "id_desc" },
  });

  const { data } = await api("GET", path);
  const items = data.stories || data.data || [];
  if (!items.length) {
    console.log("No stories found.");
    return;
  }

  const header = `| id | title | status | pri |`;
  console.log(header);
  console.log("─".repeat(header.length));
  for (const s of items) {
    console.log(
      `| ${s.id} | ${(s.title || "").slice(0, 40)} | ${s.status || "-"} | ${s.pri || "-"} |`,
    );
  }
  console.log(`\nTotal: ${items.length}`);
}

async function get(params) {
  const { data } = await api("GET", `/stories/${params.id}`);
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
  };
  if (params.pri) body.pri = Number(params.pri);
  if (params.module) body.module = Number(params.module);
  if (params.parent) body.parent = Number(params.parent);
  if (params.estimate) body.estimate = Number(params.estimate);
  if (params.spec) body.spec = params.spec;
  if (params.category) body.category = params.category;
  if (params.source) body.source = params.source;
  if (params.verify) body.verify = params.verify;
  if (params.assignedTo) body.assignedTo = params.assignedTo;
  if (params.reviewer)
    body.reviewer =
      typeof params.reviewer === "string"
        ? params.reviewer.split(",")
        : params.reviewer;
  if (params.project) body.project = Number(params.project);
  if (params.execution) body.execution = Number(params.execution);

  const { data } = await api("POST", "/stories", body);
  if (data.status === "success") {
    console.log(`Story created successfully. ID: ${data.id}`);
  } else {
    console.error("Failed to create story:", JSON.stringify(data));
    process.exit(1);
  }
}

async function update(params) {
  if (!params.id) {
    console.error("Error: update requires --id");
    process.exit(1);
  }

  const { data: current } = await api("GET", `/stories/${params.id}`);
  if (current.status !== "success") {
    console.error("Failed to get story:", JSON.stringify(current));
    process.exit(1);
  }

  const body = {};
  const fields = [
    "title",
    "spec",
    "verify",
    "module",
    "parent",
    "pri",
    "category",
    "source",
    "assignedTo",
    "product",
  ];
  for (const f of fields) {
    if (params[f] !== undefined) body[f] = params[f];
    else if (current[f] !== undefined) body[f] = current[f];
  }
  // Only update status if explicitly provided
  if (params.status) body.status = params.status;

  const { data } = await api("PUT", `/stories/${params.id}`, body);
  if (data.status === "success") {
    console.log(`Story ${params.id} updated successfully.`);
  } else {
    console.error("Failed to update story:", JSON.stringify(data));
    process.exit(1);
  }
}

async function change(params) {
  if (!params.id) {
    console.error("Error: change requires --id");
    process.exit(1);
  }
  if (!params.reviewer) {
    console.error("Error: change requires --reviewer");
    process.exit(1);
  }

  const reviewer =
    typeof params.reviewer === "string"
      ? params.reviewer.split(",")
      : params.reviewer;
  const body = { reviewer };
  if (params.title) body.title = params.title;
  if (params.spec) body.spec = params.spec;
  if (params.verify) body.verify = params.verify;

  const { data } = await api("PUT", `/stories/${params.id}/change`, body);
  if (data.status === "success") {
    console.log(`Story ${params.id} change submitted for review.`);
  } else {
    console.error("Failed to change story:", JSON.stringify(data));
    process.exit(1);
  }
}

async function close(params) {
  if (!params.id) {
    console.error("Error: close requires --id");
    process.exit(1);
  }
  if (!params.reason) {
    console.error(
      "Error: close requires --reason (done|subdivided|duplicate|postponed|willnotdo|cancel|bydesign)",
    );
    process.exit(1);
  }

  const body = { closedReason: params.reason };
  if (params.comment) body.comment = params.comment;

  const { data } = await api("PUT", `/stories/${params.id}/close`, body);
  if (data.status === "success") {
    console.log(`Story ${params.id} closed.`);
  } else {
    console.error("Failed to close story:", JSON.stringify(data));
    process.exit(1);
  }
}

async function activate(params) {
  if (!params.id) {
    console.error("Error: activate requires --id");
    process.exit(1);
  }

  const { data } = await api("PUT", `/stories/${params.id}/activate`);
  if (data.status === "success") {
    console.log(`Story ${params.id} activated.`);
  } else {
    console.error("Failed to activate story:", JSON.stringify(data));
    process.exit(1);
  }
}

async function del(params) {
  const { data } = await api("DELETE", `/stories/${params.id}`);
  if (data.status === "success") {
    console.log(`Story ${params.id} deleted.`);
  } else {
    console.error("Failed to delete story:", JSON.stringify(data));
    process.exit(1);
  }
}

// ── Dispatch ──────────────────────────────────────────────────────
const actions = {
  list,
  get,
  create,
  update,
  change,
  close,
  activate,
  delete: del,
};

async function main() {
  const params = parseArgs();
  if (!params.action || !actions[params.action]) {
    console.error(
      `Usage: node story.js --action <${Object.keys(actions).join("|")}>`,
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
