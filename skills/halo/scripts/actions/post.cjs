/**
 * Halo 文章 CRUD 操作模块
 *
 * 双 API 策略:
 * - Console API（管理操作，触发快照流程）: create / publish / unpublish
 *   基地址: /apis/api.console.halo.run/v1alpha1/posts
 *   请求体格式: { post: {...}, content: {...} }（嵌套格式）
 *
 * - Extension API（内容查询/更新/删除）: list / get / update / delete
 *   基地址: /apis/content.halo.run/v1alpha1/posts
 *   请求体格式: 平铺格式
 *
 * 特殊：update 使用 Extension API 平铺格式（Console API 的 PUT /posts/{name} 在不带完整 content 时返回 500）
 * 如果 update 需要更新内容，先 PUT /apis/api.console.halo.run/v1alpha1/posts/{name}/content 更新内容，
 * 再 PUT /apis/content.halo.run/v1alpha1/posts/{name} 更新元数据。
 */

const { parseFlags, formatTime, truncate, slugify, md2html, buildPostLink } = require("../utils.cjs");

const EXT_POSTS_API = "/apis/content.halo.run/v1alpha1/posts";
const CONSOLE_POSTS_API = "/apis/api.console.halo.run/v1alpha1/posts";

// ============================================================
// 构建 Console API 的 PostRequest（嵌套格式）
// ============================================================
function buildPostRequest(postName, flags, raw, content, doPublish, visible, rawType) {
  const title = flags.title || "";
  const slug = flags.slug || "";
  const vis = visible || (flags.visible || "PRIVATE").toUpperCase();
  const rType = rawType || "HTML";  // 强制为 HTML（Halo 仅使用 HTML 格式）
  const categories = flags.categories ? flags.categories.split(",").map((s) => s.trim()) : [];
  const tags = flags.tags ? flags.tags.split(",").map((s) => s.trim()) : [];

  return {
    post: {
      apiVersion: "content.halo.run/v1alpha1",
      kind: "Post",
      metadata: {
        name: postName,
        labels: {},
        annotations: {},
      },
      spec: {
        title,
        slug: slug || undefined,
        aliases: [],
        categories,
        tags,
        meta: {
          labels: {},
          annotations: {},
        },
        publish: doPublish || false,
        pinned: flags.pinned === "true" || false,
        allowComment: flags.allowComment !== "false",
        visible: vis,
        template: "",
        cover: flags.cover || "",
        deprecated: false,
        deleted: false,
        priority: 0,
        excerpt: { autoGenerate: true, raw: "" },
        htmlMetas: [],
      },
    },
    content: {
      raw: raw || content || "",
      content: content || raw || "",
      rawType: rType,
    },
  };
}

// ============================================================
// 清理 undefined 字段（用于 spec）
// ============================================================
function cleanSpec(spec) {
  if (!spec.slug) delete spec.slug;
  if (!spec.cover) delete spec.cover;
  if (!spec.template) delete spec.template;
  return spec;
}

// ============================================================
// list — 列出文章（Extension API）
// ============================================================
async function actionList(api, args) {
  const { flags } = parseFlags(args);
  const page = Math.max(1, parseInt(flags.page) || 1);
  const size = Math.min(100, Math.max(1, parseInt(flags.limit) || 20));
  const keyword = flags.keyword || "";

  let url = `${EXT_POSTS_API}?page=${page}&size=${size}`;
  if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

  const data = await api("GET", url);
  const items = data.items || [];

  if (items.length === 0) {
    console.log("📭 没有找到文章。");
    return;
  }

  console.log(`\n📄 文章列表（共 ${data.total || items.length} 篇，第 ${page} 页）\n`);

  for (const item of items) {
    const spec = item.spec || {};
    const meta = item.metadata || {};
    const status = item.status || {};

    const badge = spec.publish ? "✅ 已发布" : "📝 草稿";
    const title = spec.title || "(无标题)";
    const date = formatTime(spec.publishTime || meta.creationTimestamp);
    const link = buildPostLink("", item);

    console.log(`  ${badge} | ${spec.visible || "PUBLIC"}`);
    console.log(`  标题: ${title}`);
    console.log(`  名称: ${meta.name}`);
    if (date) console.log(`  时间: ${date}`);
    console.log(`  阅读: ${status.visitCount || 0}`);
    console.log(`  链接: ${link}`);
    console.log("─".repeat(50));
  }

  if (data.hasNext || data.total > page * size) {
    console.log(`\n💡 使用 --page=${page + 1} 查看下一页`);
  }
}

// ============================================================
// get — 获取文章详情（Extension API）
// ============================================================
async function actionGet(api, apiSilent, baseUrl, args) {
  const { positional } = parseFlags(args);
  const name = positional[0];

  if (!name) {
    console.error("用法: api.cjs get <name>");
    process.exit(1);
  }

  const data = await api("GET", `${EXT_POSTS_API}/${name}`);
  const spec = data.spec || {};
  const meta = data.metadata || {};
  const status = data.status || {};

  const badge = spec.publish ? "✅ 已发布" : "📝 草稿";
  const title = spec.title || "(无标题)";
  const date = formatTime(spec.publishTime || meta.creationTimestamp);
  const categories = (data.categories || [])
    .map((c) => c.spec?.displayName || c.metadata?.name)
    .filter(Boolean);
  const tags = (data.tags || [])
    .map((t) => t.spec?.displayName || t.metadata?.name)
    .filter(Boolean);

  console.log(`\n📄 ${title}`);
  console.log("═".repeat(50));
  console.log(`  状态: ${badge} | 可见性: ${spec.visible || "PUBLIC"}`);
  console.log(`  名称: ${meta.name}`);
  if (spec.slug) console.log(`  Slug: ${spec.slug}`);
  if (date) console.log(`  时间: ${date}`);
  if (categories.length) console.log(`  分类: ${categories.join(", ")}`);
  if (tags.length) console.log(`  标签: ${tags.join(", ")}`);
  console.log(`  阅读: ${status.visitCount || 0}`);
  console.log(`  版本: ${meta.version}`);
  console.log(`  链接: ${buildPostLink(baseUrl, data)}`);

  // 尝试获取 head-content（Console API 端点，可能 403）
  try {
    const contentData = await apiSilent("GET", `${CONSOLE_POSTS_API}/${name}/head-content`);
    if (contentData && !contentData._error) {
      const content = contentData.content || contentData.raw || "";
      if (content) {
        console.log("\n── 内容预览 ──");
        console.log(truncate(content, 500));
      }
    }
  } catch {
    // 403 或网络错误时静默跳过
  }
}

// ============================================================
// create — 创建文章（Console API，触发快照）
// ============================================================
async function actionCreate(api, baseUrl, args) {
  const { flags } = parseFlags(args);
  const title = flags.title || "";
  const content = flags.content || "";
  const raw = flags.raw || "";
  const doPublish = flags.publish === "true" || flags.publish === "1";
  const isPublic = flags.public === true;       // --public 参数

  if (!title) {
    console.error("用法: api.cjs create --title=标题 [--raw=内容] [--slug=xxx] [--publish] [--public]");
    process.exit(1);
  }

  const postName = flags.slug || slugify(title);

  // 可见性：默认 PRIVATE，传 --public 才设为 PUBLIC
  const visible = isPublic ? "PUBLIC" : "PRIVATE";

  // 内容格式：固定为 HTML（Halo 仅使用 HTML 格式）
  const rawType = "HTML";
  
  // 如果用户传了 --raw，自动转换为 HTML，并同时用于 raw 和 content 字段
  let finalRaw = raw || content || "";
  let finalContent = content || "";
  
  if (raw && !content) {
    // 用户只传了 --raw，转换为 HTML 并同时用于 raw 和 content
    const htmlContent = md2html(raw);
    finalRaw = htmlContent;
    finalContent = htmlContent;
  } else if (!raw && content) {
    // 用户只传了 --content
    finalRaw = content;
    finalContent = content;
  } else if (raw && content) {
    // 用户同时传了 --raw 和 --content，优先使用 --content
    finalRaw = content;
    finalContent = content;
  }

  // 构建 PostRequest（嵌套格式）
  const postRequest = buildPostRequest(postName, { ...flags }, finalRaw, finalContent, doPublish, visible, rawType);
  cleanSpec(postRequest.post.spec);

  const data = await api("POST", CONSOLE_POSTS_API, postRequest);

  const spec = data.spec || {};
  const meta = data.metadata || {};
  const badge = spec.publish ? "✅ 已发布" : "📝 草稿（未发布）";

  console.log("\n✅ 文章创建成功");
  console.log(`  标题: ${spec.title}`);
  console.log(`  名称: ${meta.name}`);
  console.log(`  可见性: ${spec.visible || visible}`);
  console.log(`  格式: ${rawType}`);
  console.log(`  状态: ${badge}`);
  console.log(`  版本: ${meta.version}`);
  console.log(`  链接: ${buildPostLink(baseUrl, data)}`);

  if (!spec.publish) {
    console.log(`\n💡 使用 \`api.cjs publish ${meta.name}\` 发布文章`);
  }
}

// ============================================================
// update — 更新文章（Extension API 平铺格式）
//
// Console API PUT /posts/{name} 需要完整 PostRequest（嵌套格式 + 有效 content），
// 不带有效 content 会返回 500，带 content 可能 409 冲突。
// 因此 update 使用 Extension API 平铺格式（只需 spec，不需要 content）。
// 如果用户传了 --raw/--content，先单独更新内容端点，再更新元数据。
// ============================================================
async function actionUpdate(api, baseUrl, args) {
  const { flags, positional } = parseFlags(args);
  const name = positional[0];

  if (!name) {
    console.error("用法: api.cjs update <name> [--title=xxx] [--raw=xxx] [--content=xxx]");
    process.exit(1);
  }

  // 1. 获取最新版本（处理乐观锁）
  const current = await api("GET", `${EXT_POSTS_API}/${name}`);
  const currentSpec = current.spec || {};
  const currentMeta = current.metadata || {};

  // 2. 如果用户传了内容更新，先单独更新内容（Console API）
  if (flags.raw || flags.content) {
    let rawContent = flags.raw || flags.content;
    let contentContent = flags.content || (flags.raw ? md2html(flags.raw) : undefined);
    
    // 根据 Halo 使用 raw 字段渲染的特性，raw 和 content 都存 HTML
    if (flags.raw && !flags.content) {
      // 用户只传了 --raw，转换为 HTML 并同时用于 raw 和 content
      const htmlContent = md2html(flags.raw);
      rawContent = htmlContent;
      contentContent = htmlContent;
    } else if (!flags.raw && flags.content) {
      // 用户只传了 --content
      rawContent = contentContent;
    } else if (flags.raw && flags.content) {
      // 用户同时传了 --raw 和 --content，优先使用 --content
      rawContent = contentContent;
    }
    
    const contentBody = {
      raw: rawContent,
      content: contentContent,
      rawType: "HTML",  // 强制使用 HTML 格式
    };
    await api("PUT", `${CONSOLE_POSTS_API}/${name}/content`, contentBody);
  }

  // 3. 构建平铺格式的 Post 对象（Extension API）
  const updatedPost = {
    apiVersion: current.apiVersion || "content.halo.run/v1alpha1",
    kind: current.kind || "Post",
    metadata: { ...currentMeta },
    spec: { ...currentSpec },
  };

  // 应用字段更新
  if (flags.title) updatedPost.spec.title = flags.title;
  if (flags.slug !== undefined) updatedPost.spec.slug = flags.slug || undefined;
  if (flags.visible) updatedPost.spec.visible = flags.visible.toUpperCase();
  if (flags.categories) updatedPost.spec.categories = flags.categories.split(",").map((s) => s.trim());
  if (flags.tags) updatedPost.spec.tags = flags.tags.split(",").map((s) => s.trim());
  if (flags.cover !== undefined) updatedPost.spec.cover = flags.cover || undefined;
  if (flags.pinned !== undefined) updatedPost.spec.pinned = flags.pinned === "true";
  if (flags.allowComment !== undefined) updatedPost.spec.allowComment = flags.allowComment === "true";

  cleanSpec(updatedPost.spec);

  // 4. PUT 更新元数据（Extension API 平铺格式）
  const data = await api("PUT", `${EXT_POSTS_API}/${name}`, updatedPost);

  const spec = data.spec || {};
  const meta = data.metadata || {};

  console.log("\n✅ 文章更新成功");
  console.log(`  标题: ${spec.title}`);
  console.log(`  名称: ${meta.name}`);
  console.log(`  版本: ${meta.version}`);
  if (flags.raw || flags.content) {
    console.log(`  内容: 已更新`);
  }
  console.log(`  链接: ${buildPostLink(baseUrl, data)}`);
}

// ============================================================
// delete — 删除文章（Extension API）
// ============================================================
async function actionDelete(api, args) {
  const { positional } = parseFlags(args);
  const name = positional[0];

  if (!name) {
    console.error("用法: api.cjs delete <name>");
    process.exit(1);
  }

  // 先获取文章信息用于确认
  const current = await api("GET", `${EXT_POSTS_API}/${name}`);
  const spec = current.spec || {};

  console.log(`\n⚠️  确定要删除文章吗？`);
  console.log(`  标题: ${spec.title || "(无标题)"}`);
  console.log(`  名称: ${name}`);

  await api("DELETE", `${EXT_POSTS_API}/${name}`);

  console.log(`\n✅ 文章已删除: ${name}`);
}

// ============================================================
// publish/unpublish — 发布/取消发布（Console API）
// ============================================================
async function actionPublish(api, baseUrl, args, doPublish) {
  const { positional } = parseFlags(args);
  const name = positional[0];

  if (!name) {
    const actionName = doPublish ? "publish" : "unpublish";
    console.error(`用法: api.cjs ${actionName} <name>`);
    process.exit(1);
  }

  // Console API 的 /publish 或 /unpublish 子端点触发完整发布流程
  // 会生成 permalink、设置 conditions（DRAFT/PUBLISHED）
  const action = doPublish ? "publish" : "unpublish";
  const data = await api("PUT", `${CONSOLE_POSTS_API}/${name}/${action}`);

  const spec = data.spec || {};
  const meta = data.metadata || {};
  const status = data.status || {};
  const badge = spec.publish ? "✅ 已发布" : "📝 已取消发布";

  console.log(`\n✅ 文章${doPublish ? "发布" : "取消发布"}成功`);
  console.log(`  标题: ${spec.title}`);
  console.log(`  名称: ${meta.name}`);
  console.log(`  状态: ${badge}`);
  console.log(`  版本: ${meta.version}`);
  if (status.conditions) {
    console.log(`  条件: ${JSON.stringify(status.conditions)}`);
  }

  if (doPublish) {
    console.log(`  链接: ${buildPostLink(baseUrl, data)}`);
  }
}

module.exports = {
  actionList,
  actionGet,
  actionCreate,
  actionUpdate,
  actionDelete,
  actionPublish,
};
