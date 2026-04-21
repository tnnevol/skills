/**
 * actions/query.cjs — 6 个查询命令的输出格式化
 * 
 * 列表命令：表格输出
 * 详情命令：卡片输出
 */
const { queryList, queryDetail, sanitize } = require("../api.cjs");

// ============ 表格输出 ============

function table(headers, rows) {
  if (rows.length === 0) {
    console.log("📭 暂无数据");
    return;
  }

  // 计算每列宽度
  const widths = headers.map((h, i) =>
    Math.max(
      String(h).length,
      ...rows.map((r) => String(r[i] ?? "").length)
    )
  );

  // 表头
  const headerLine = "| " + headers.map((h, i) => pad(h, widths[i])).join(" | ") + " |";
  const separator = "|" + widths.map((w) => "-".repeat(w + 2)).join("|") + "|";

  console.log(headerLine);
  console.log(separator);

  // 数据行
  for (const row of rows) {
    console.log("| " + headers.map((h, i) => pad(String(row[i] ?? ""), widths[i])).join(" | ") + " |");
  }
}

function pad(str, len) {
  return str.padEnd(len, " ");
}

// ============ 卡片输出 ============

function card(title, fields) {
  console.log(`📋 ${title}`);
  console.log("━".repeat(40));
  for (const [label, value] of fields) {
    if (value !== undefined && value !== null && value !== "") {
      console.log(`  ${label}: ${value}`);
    }
  }
  console.log("━".repeat(40));
}

// ============ 用户模块 ============

async function listUsers(params = {}) {
  const result = await queryList("/users", {
    page: params.page,
    limit: params.limit,
    browseType: params.browseType || "inside",
    orderBy: params.orderBy || "id_asc",
  });

  const users = Array.isArray(result.data) ? result.data : [];
  const sanitized = sanitize({ users }).users;

  table(
    ["账号", "姓名", "角色", "部门", "手机"],
    sanitized.map((u) => [
      u.account || "-",
      u.realname || u.nickname || "-",
      u.role || "-",
      u.dept || "-",
      u.mobile || "-",
    ])
  );

  if (result.hasMore) {
    console.log(`\n💡 还有更多，使用 --page=${params.page + 1} 查看下一页`);
  }
  console.log(`\n共 ${users.length} 条 (第 ${params.page || 1} 页)`);
}

async function getUser(id) {
  const result = await queryDetail("/users", id);
  const user = sanitize(result.result || result.data || result);

  card(`用户: ${user.realname || user.account || id}`, [
    ["账号", user.account],
    ["姓名", user.realname],
    ["角色", user.role],
    ["部门", user.dept],
    ["手机", user.mobile],
    ["邮箱", user.email],
    ["类型", user.type],
    ["上级", user.superior],
    ["加入日期", user.join],
    ["状态", user.deleted === "1" ? "已删除" : "正常"],
  ]);
}

// ============ 产品模块 ============

async function listProducts(params = {}) {
  const result = await queryList("/products", {
    page: params.page,
    limit: params.limit,
    browseType: params.browseType || "all",
    orderBy: params.orderBy || "id_asc",
  });

  const products = Array.isArray(result.data) ? result.data : [];

  table(
    ["ID", "名称", "类型", "负责人", "状态"],
    products.map((p) => [
      String(p.id || "-"),
      p.name || "-",
      p.type || "-",
      p.PO || "-",
      p.status || "-",
    ])
  );

  if (result.hasMore) {
    console.log(`\n💡 还有更多，使用 --page=${params.page + 1} 查看下一页`);
  }
  console.log(`\n共 ${products.length} 条 (第 ${params.page || 1} 页)`);
}

async function getProduct(id) {
  const result = await queryDetail("/products", id);
  const product = result.result || result.data || result;

  const statusText = {
    normal: "正常",
    closed: "已关闭",
    suspended: "已暂停",
  };

  card(`产品: ${product.name || id}`, [
    ["ID", product.id],
    ["名称", product.name],
    ["类型", product.type],
    ["状态", statusText[product.status] || product.status],
    ["负责人", product.PO],
    ["测试负责人", product.QD],
    ["发布负责人", product.RD],
    ["所属项目集", product.programName || product.program],
    ["创建时间", product.createdDate],
  ]);
}

// ============ 项目模块 ============

async function listProjects(params = {}) {
  const result = await queryList("/projects", {
    page: params.page,
    limit: params.limit,
    browseType: params.browseType || "all",
    orderBy: params.orderBy || "id_asc",
  });

  const projects = Array.isArray(result.data) ? result.data : [];

  table(
    ["ID", "名称", "模式", "起止时间", "状态"],
    projects.map((p) => [
      String(p.id || "-"),
      p.name || "-",
      p.model || "-",
      `${p.begin || "?"} ~ ${p.end || "?"}`,
      p.status || "-",
    ])
  );

  if (result.hasMore) {
    console.log(`\n💡 还有更多，使用 --page=${params.page + 1} 查看下一页`);
  }
  console.log(`\n共 ${projects.length} 条 (第 ${params.page || 1} 页)`);
}

async function getProject(id) {
  const result = await queryDetail("/projects", id);
  const project = result.result || result.data || result;

  const statusText = {
    wait: "未开始",
    doing: "进行中",
    suspended: "已暂停",
    closed: "已关闭",
    done: "已完成",
  };

  card(`项目: ${project.name || id}`, [
    ["ID", project.id],
    ["名称", project.name],
    ["模式", project.model],
    ["类型", project.type],
    ["状态", statusText[project.status] || project.status],
    ["开始日期", project.begin],
    ["结束日期", project.end],
    ["项目负责人", project.PM],
    ["产品负责人", project.PO],
    ["进度", project.progress ? `${project.progress}%` : "-"],
    ["团队人数", project.teamCount],
  ]);
}

// CLI 入口
if (require.main === module) {
  const action = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];

  // 解析 --page=N --limit=N 参数
  function parseParams(args) {
    const params = {};
    for (const a of args) {
      if (a.startsWith("--page=")) params.page = parseInt(a.split("=")[1]);
      if (a.startsWith("--limit=")) params.limit = parseInt(a.split("=")[1]);
      if (a.startsWith("--browseType=")) params.browseType = a.split("=")[1];
    }
    return params;
  }

  async function run() {
    const params = parseParams(process.argv.slice(4));
    switch (action) {
      case "users":
        await listUsers(params);
        break;
      case "user":
        await getUser(arg1);
        break;
      case "products":
        await listProducts(params);
        break;
      case "product":
        await getProduct(arg1);
        break;
      case "projects":
        await listProjects(params);
        break;
      case "project":
        await getProject(arg1);
        break;
      default:
        console.log("用法: query.cjs <users|user|products|product|projects|project> [id] [--page=N] [--limit=N]");
    }
  }
  run().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}

module.exports = {
  listUsers, getUser,
  listProducts, getProduct,
  listProjects, getProject,
};
