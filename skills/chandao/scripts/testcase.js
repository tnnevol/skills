#!/usr/bin/env node
/**
 * chandao testcase module
 *
 * Usage:
 *   node testcase.js --action list [--product N] [--project N] [--execution N]
 *   node testcase.js --action get --id <id>
 *   node testcase.js --action create --product <id> --title <title> [--steps '[{"step":"...","expect":"...","type":"step"}]']
 *   node testcase.js --action update --id <id> --title <title>
 *   node testcase.js --action delete --id <id>
 *   node testcase.js --action <write-action> --dry-run
 *   node testcase.js --action delete --yes
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
  // Parse --steps as JSON array
  if (params.steps && typeof params.steps === "string") {
    try {
      params.steps = JSON.parse(params.steps);
    } catch {}
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

// Convert [{step, expect, type}] to parallel arrays {steps, expects, stepType}
function stepsToArrays(stepObjs) {
  if (!stepObjs || !Array.isArray(stepObjs)) return null;
  return {
    steps: stepObjs.map((s) => s.step),
    expects: stepObjs.map((s) => s.expect),
    stepType: stepObjs.map((s) => s.type || "step"),
  };
}

// ── Actions ───────────────────────────────────────────────────────
async function list(params) {
  let path = "/testcases";
  if (params.product) path = `/products/${params.product}/testcases`;
  else if (params.project) path = `/projects/${params.project}/testcases`;
  else if (params.execution) path = `/executions/${params.execution}/testcases`;

  path += paginate("", {
    limit: params.limit,
    page: params.page,
    query: { orderBy: "id_desc" },
  });

  const { data } = await api("GET", path);
  const items = data.testcases || data.data || [];
  if (!items.length) {
    console.log("No testcases found.");
    return;
  }

  const header = `| id | title | pri | type | status |`;
  console.log(header);
  console.log("─".repeat(header.length));
  for (const t of items) {
    console.log(
      `| ${t.id} | ${(t.title || "").slice(0, 40)} | ${t.pri || "-"} | ${t.type || "-"} | ${t.status || "-"} |`,
    );
  }
  console.log(`\nTotal: ${items.length}`);
}

async function get(params) {
  const { data } = await api("GET", `/testcases/${params.id}`);
  console.log(JSON.stringify(data, null, 2));
}

async function create(params) {
  if (!params.product || !params.title) {
    console.error("Error: create requires --product and --title");
    process.exit(1);
  }
  if (!params.steps) {
    console.error("Error: create requires --steps (测试用例必须包含步骤)");
    process.exit(1);
  }

  const body = {
    productID: Number(params.product),
    title: params.title,
  };
  if (params.module) body.module = Number(params.module);
  if (params.story) body.story = Number(params.story);
  if (params.pri) body.pri = Number(params.pri);
  if (params.type) body.type = params.type;
  if (params.precondition) body.precondition = params.precondition;
  if (params.project) body.project = Number(params.project);
  if (params.execution) body.execution = Number(params.execution);

  // Steps conversion
  if (params.steps) {
    const converted = stepsToArrays(params.steps);
    if (converted) {
      body.steps = converted.steps;
      body.expects = converted.expects;
      body.stepType = converted.stepType;
    }
  }

  const { data } = await api("POST", "/testcases", body);
  if (data.status === "success") {
    console.log(`Testcase created successfully. ID: ${data.id}`);
  } else {
    console.error("Failed to create testcase:", JSON.stringify(data));
    process.exit(1);
  }
}

async function update(params) {
  if (!params.id) {
    console.error("Error: update requires --id");
    process.exit(1);
  }

  const { data: current } = await api("GET", `/testcases/${params.id}`);
  if (current.status !== "success") {
    console.error("Failed to get testcase:", JSON.stringify(current));
    process.exit(1);
  }

  // Fix typo in API response field
  const curModule = current.module ?? current.moudule;

  const body = {};
  const fields = ["title", "module", "story", "pri", "type", "precondition"];
  for (const f of fields) {
    if (params[f] !== undefined) body[f] = params[f];
    else if (current[f] !== undefined) body[f] = current[f];
  }

  // Steps update - only modify steps if explicitly provided
  if (params.steps) {
    const converted = stepsToArrays(params.steps);
    if (converted) {
      body.steps = converted.steps;
      body.expects = converted.expects;
      body.stepType = converted.stepType;
    }
  } else {
    // Preserve existing steps/expects/stepType when not updating
    if (current.steps) body.steps = current.steps;
    if (current.expects) body.expects = current.expects;
    if (current.stepType) body.stepType = current.stepType;
  }

  const { data } = await api("PUT", `/testcases/${params.id}`, body);
  if (data.status === "success") {
    console.log(`Testcase ${params.id} updated successfully.`);
  } else {
    console.error("Failed to update testcase:", JSON.stringify(data));
    process.exit(1);
  }
}

async function del(params) {
  const { data } = await api("DELETE", `/testcases/${params.id}`);
  if (data.status === "success") {
    console.log(`Testcase ${params.id} deleted.`);
  } else {
    console.error("Failed to delete testcase:", JSON.stringify(data));
    process.exit(1);
  }
}

// ── Dispatch ──────────────────────────────────────────────────────
const actions = { list, get, create, update, delete: del };

async function main() {
  const params = parseArgs();
  if (!params.action || !actions[params.action]) {
    console.error(
      `Usage: node testcase.js --action <${Object.keys(actions).join("|")}>`,
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
