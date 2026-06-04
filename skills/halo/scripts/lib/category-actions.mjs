import {
  formatTime,
  buildCategoryLink,
  makeSlug,
  generateName,
  generateTimestamp,
  categoryPaginationSummary,
} from "./utils.mjs";
import { HaloError } from "./client.mjs";

export async function actionListCategories(
  clients,
  { page, limit, sort } = {},
) {
  const params = {};
  if (page !== undefined) params.page = page;
  if (limit !== undefined) params.size = limit;
  if (sort) params.sort = sort;

  const res = await clients.ext.get("/categories", params);
  const items = res.items || [];
  const total = res.total || 0;

  if (items.length === 0) {
    return "📂 没有找到分类";
  }

  const lines = items.map((item) => {
    const meta = item.metadata || {};
    const spec = item.spec || {};
    const status = item.status || {};
    const slug = spec.slug || meta.name || "-";
    const link = buildCategoryLink(clients.ext.baseUrl, slug);
    const postCount = status.postCount ?? status.visiblePostCount ?? "-";
    const children = spec.children?.length ? spec.children.join(", ") : "-";
    return (
      `${spec.displayName || "-"}\n` +
      `  名称: ${meta.name}\n` +
      `  slug: ${slug}\n` +
      `  文章数: ${postCount}\n` +
      `  优先级: ${spec.priority ?? 0}\n` +
      `  子分类: ${children}\n` +
      `  链接: ${link}\n` +
      `  创建时间: ${formatTime(meta.creationTimestamp)}`
    );
  });

  const summary = categoryPaginationSummary(total, page, limit);
  return `${summary}\n\n${lines.join("\n\n")}`;
}

export async function actionCreateCategory(
  clients,
  { displayName, slug, cover, description, priority },
) {
  if (!displayName) throw new HaloError("请提供分类显示名 (--display-name)");

  const resolvedSlug = slug || makeSlug(displayName);
  const timestamp = generateTimestamp();
  const name = generateName(resolvedSlug, timestamp);

  const spec = {
    displayName,
    slug: resolvedSlug,
    priority: priority !== undefined ? priority : 0,
    children: [],
  };
  if (cover) spec.cover = cover;
  if (description) spec.description = description;

  const payload = {
    apiVersion: "content.halo.run/v1alpha1",
    kind: "Category",
    metadata: { name },
    spec,
  };

  const res = await clients.ext.post("/categories", payload);
  const createdName = res?.metadata?.name || name;
  const link = buildCategoryLink(clients.ext.baseUrl, resolvedSlug);

  return (
    `✅ 分类创建成功\n` +
    `显示名: ${displayName}\n` +
    `名称: ${createdName}\n` +
    `slug: ${resolvedSlug}\n` +
    `链接: ${link}`
  );
}

export async function actionGetCategory(clients, name) {
  if (!name) throw new HaloError("请提供分类名称");

  let category;
  try {
    category = await clients.ext.get(`/categories/${name}`);
  } catch (err) {
    if (err.status === 404) throw new HaloError(`分类不存在: ${name}`);
    throw err;
  }

  const meta = category.metadata || {};
  const spec = category.spec || {};
  const status = category.status || {};
  const slug = spec.slug || meta.name || "-";
  const link = buildCategoryLink(clients.ext.baseUrl, slug);
  const postCount = status.postCount ?? status.visiblePostCount ?? "-";
  const children = spec.children?.length ? spec.children.join(", ") : "-";

  return (
    `${spec.displayName || "-"}\n` +
    `名称: ${meta.name}\n` +
    `slug: ${slug}\n` +
    `描述: ${spec.description || "-"}\n` +
    `封面: ${spec.cover || "-"}\n` +
    `优先级: ${spec.priority ?? 0}\n` +
    `子分类: ${children}\n` +
    `隐藏: ${spec.hideFromList ? "是" : "否"}\n` +
    `文章数: ${postCount}\n` +
    `链接: ${link}\n` +
    `创建时间: ${formatTime(meta.creationTimestamp)}`
  );
}

export async function actionUpdateCategory(
  clients,
  name,
  { displayName, slug: newSlug, cover, description, priority, hideFromList },
) {
  if (!name) throw new HaloError("请提供分类名称");

  let category;
  try {
    category = await clients.ext.get(`/categories/${name}`);
  } catch (err) {
    if (err.status === 404) throw new HaloError(`分类不存在: ${name}`);
    throw err;
  }

  const changes = [];
  const spec = category.spec || {};

  if (displayName) {
    changes.push(`显示名: ${spec.displayName || "(空)"} → ${displayName}`);
    spec.displayName = displayName;
  }
  if (newSlug) {
    changes.push(`slug: ${spec.slug || "(空)"} → ${newSlug}`);
    spec.slug = newSlug;
  }
  if (cover !== undefined) {
    changes.push("封面已更新");
    spec.cover = cover;
  }
  if (description !== undefined) {
    changes.push(`描述: ${spec.description || "(空)"} → ${description}`);
    spec.description = description;
  }
  if (priority !== undefined) {
    changes.push(`优先级: ${spec.priority ?? 0} → ${priority}`);
    spec.priority = priority;
  }
  if (hideFromList !== undefined) {
    changes.push(
      `隐藏: ${spec.hideFromList ? "是" : "否"} → ${hideFromList ? "是" : "否"}`,
    );
    spec.hideFromList = hideFromList;
  }

  if (changes.length === 0) {
    return "无变更";
  }

  category.spec = spec;
  category.metadata.version = category.metadata?.version || 1;

  try {
    await clients.ext.put(`/categories/${name}`, category);
  } catch (err) {
    if (err.status === 409) {
      const latest = await clients.ext.get(`/categories/${name}`);
      latest.spec = { ...latest.spec, ...spec };
      latest.metadata.version = latest.metadata?.version || 1;
      await clients.ext.put(`/categories/${name}`, latest);
      changes.push("（重试冲突）");
    } else {
      throw err;
    }
  }

  const slug = spec.slug || category.spec?.slug || "";
  const link = buildCategoryLink(clients.ext.baseUrl, slug);
  const summary = `变更:\n  ${changes.join("\n  ")}`;

  return `✅ 分类更新成功\n显示名: ${displayName || spec.displayName}\n链接: ${link}\n${summary}`;
}

export async function actionDeleteCategory(clients, name) {
  if (!name) throw new HaloError("请提供分类名称");

  let category;
  try {
    category = await clients.ext.get(`/categories/${name}`);
  } catch (err) {
    if (err.status === 404) throw new HaloError(`分类不存在: ${name}`);
    throw err;
  }

  const displayName = category?.spec?.displayName || name;
  await clients.ext.delete(`/categories/${name}`);

  return `🗑️ 分类已删除: ${displayName}`;
}
