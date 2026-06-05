import {
  formatTime,
  buildTagLink,
  makeSlug,
  generateName,
  generateTimestamp,
  tagPaginationSummary,
} from "./utils.mjs";
import { HaloError } from "./client.mjs";

/**
 * Tag module commands definition
 */
export const commands = {
  "list-tags": {
    description: "列出标签",
    usage: "list-tags [--limit=N] [--page=N] [--sort=xxx]",
    options: [
      { name: "limit", description: "每页数量，默认 20" },
      { name: "page", description: "页码，从 1 开始" },
      { name: "sort", description: "排序字段，如 spec.displayName,asc" },
    ],
    execute: (clients, opts) =>
      actionListTags(clients, {
        page: opts.page !== undefined ? opts.page : 1,
        limit: opts.limit !== undefined ? opts.limit : 20,
        sort: opts.sort,
      }),
  },
  "create-tag": {
    description: "创建标签",
    usage: "create-tag --display-name=名称 [--slug=xxx]",
    options: [
      { name: "display-name", description: "标签显示名" },
      { name: "slug", description: "标签别名" },
      { name: "color", description: "标签颜色，如 #ff0000" },
      { name: "cover", description: "封面 URL" },
      { name: "description", description: "标签描述" },
    ],
    execute: (clients, opts) =>
      actionCreateTag(clients, {
        displayName: opts["display-name"],
        slug: opts.slug,
        color: opts.color,
        cover: opts.cover,
        description: opts.description,
      }),
  },
  "get-tag": {
    description: "获取标签详情",
    usage: "get-tag <name>",
    options: [],
    validate: (opts) => {
      if (!opts.name)
        throw new HaloError("请提供标签名称，用法: halo get-tag <name>");
    },
    execute: (clients, opts) => actionGetTag(clients, opts.name),
  },
  "update-tag": {
    description: "更新标签",
    usage: "update-tag <name> [--display-name=xxx] [--color=xxx]",
    options: [
      { name: "display-name", description: "标签显示名" },
      { name: "slug", description: "标签别名" },
      { name: "color", description: "标签颜色，如 #ff0000" },
      { name: "cover", description: "封面 URL" },
      { name: "description", description: "标签描述" },
    ],
    validate: (opts) => {
      if (!opts.name)
        throw new HaloError("请提供标签名称，用法: halo update-tag <name>");
    },
    execute: (clients, opts) =>
      actionUpdateTag(clients, opts.name, {
        displayName: opts["display-name"],
        slug: opts.slug,
        color: opts.color,
        cover: opts.cover,
        description: opts.description,
      }),
  },
  "delete-tag": {
    description: "删除标签",
    usage: "delete-tag <name>",
    options: [],
    validate: (opts) => {
      if (!opts.name)
        throw new HaloError("请提供标签名称，用法: halo delete-tag <name>");
    },
    execute: (clients, opts) => actionDeleteTag(clients, opts.name),
  },
};

export async function actionListTags(clients, { page, limit, sort } = {}) {
  const params = {};
  if (page !== undefined) params.page = page;
  if (limit !== undefined) params.size = limit;
  if (sort) params.sort = sort;

  const res = await clients.ext.get("/tags", params);
  const items = res.items || [];
  const total = res.total || 0;

  if (items.length === 0) {
    return "🏷️ 没有找到标签";
  }

  const lines = items.map((item) => {
    const meta = item.metadata || {};
    const spec = item.spec || {};
    const status = item.status || {};
    const slug = spec.slug || meta.name || "-";
    const link = buildTagLink(clients.ext.baseUrl, slug);
    const postCount = status.postCount ?? status.visiblePostCount ?? "-";
    return (
      `${spec.displayName || "-"}\n` +
      `  名称: ${meta.name}\n` +
      `  slug: ${slug}\n` +
      `  文章数: ${postCount}\n` +
      `  颜色: ${spec.color || "-"}\n` +
      `  链接: ${link}\n` +
      `  创建时间: ${formatTime(meta.creationTimestamp)}`
    );
  });

  const summary = tagPaginationSummary(total, page, limit);
  return `${summary}\n\n${lines.join("\n\n")}`;
}

export async function actionCreateTag(
  clients,
  { displayName, slug, color, cover, description },
) {
  if (!displayName) throw new HaloError("请提供标签显示名 (--display-name)");

  const resolvedSlug = slug || makeSlug(displayName);
  const timestamp = generateTimestamp();
  const name = generateName(resolvedSlug, timestamp);

  const spec = {
    displayName,
    slug: resolvedSlug,
  };
  if (color) spec.color = color;
  if (cover) spec.cover = cover;
  if (description) spec.description = description;

  const payload = {
    apiVersion: "content.halo.run/v1alpha1",
    kind: "Tag",
    metadata: { name },
    spec,
  };

  const res = await clients.ext.post("/tags", payload);
  const createdName = res?.metadata?.name || name;
  const link = buildTagLink(clients.ext.baseUrl, resolvedSlug);

  return (
    `✅ 标签创建成功\n` +
    `显示名: ${displayName}\n` +
    `名称: ${createdName}\n` +
    `slug: ${resolvedSlug}\n` +
    `链接: ${link}`
  );
}

export async function actionGetTag(clients, name) {
  if (!name) throw new HaloError("请提供标签名称");

  let tag;
  try {
    tag = await clients.ext.get(`/tags/${name}`);
  } catch (err) {
    if (err.status === 404) throw new HaloError(`标签不存在: ${name}`);
    throw err;
  }

  const meta = tag.metadata || {};
  const spec = tag.spec || {};
  const status = tag.status || {};
  const slug = spec.slug || meta.name || "-";
  const link = buildTagLink(clients.ext.baseUrl, slug);
  const postCount = status.postCount ?? status.visiblePostCount ?? "-";

  return (
    `${spec.displayName || "-"}\n` +
    `名称: ${meta.name}\n` +
    `slug: ${slug}\n` +
    `描述: ${spec.description || "-"}\n` +
    `颜色: ${spec.color || "-"}\n` +
    `封面: ${spec.cover || "-"}\n` +
    `文章数: ${postCount}\n` +
    `链接: ${link}\n` +
    `创建时间: ${formatTime(meta.creationTimestamp)}`
  );
}

export async function actionUpdateTag(
  clients,
  name,
  { displayName, slug: newSlug, color, cover, description },
) {
  if (!name) throw new HaloError("请提供标签名称");

  let tag;
  try {
    tag = await clients.ext.get(`/tags/${name}`);
  } catch (err) {
    if (err.status === 404) throw new HaloError(`标签不存在: ${name}`);
    throw err;
  }

  const changes = [];
  const spec = tag.spec || {};

  if (displayName) {
    changes.push(`显示名: ${spec.displayName || "(空)"} → ${displayName}`);
    spec.displayName = displayName;
  }
  if (newSlug) {
    changes.push(`slug: ${spec.slug || "(空)"} → ${newSlug}`);
    spec.slug = newSlug;
  }
  if (color !== undefined) {
    changes.push(`颜色: ${spec.color || "(空)"} → ${color}`);
    spec.color = color;
  }
  if (cover !== undefined) {
    changes.push("封面已更新");
    spec.cover = cover;
  }
  if (description !== undefined) {
    changes.push(`描述: ${spec.description || "(空)"} → ${description}`);
    spec.description = description;
  }

  if (changes.length === 0) {
    return "无变更";
  }

  tag.spec = spec;
  tag.metadata.version = tag.metadata?.version || 1;

  try {
    await clients.ext.put(`/tags/${name}`, tag);
  } catch (err) {
    if (err.status === 409) {
      const latest = await clients.ext.get(`/tags/${name}`);
      latest.spec = { ...latest.spec, ...spec };
      latest.metadata.version = latest.metadata?.version || 1;
      await clients.ext.put(`/tags/${name}`, latest);
      changes.push("（重试冲突）");
    } else {
      throw err;
    }
  }

  const slug = spec.slug || tag.spec?.slug || "";
  const link = buildTagLink(clients.ext.baseUrl, slug);
  const summary = `变更:\n  ${changes.join("\n  ")}`;

  return `✅ 标签更新成功\n显示名: ${displayName || spec.displayName}\n链接: ${link}\n${summary}`;
}

export async function actionDeleteTag(clients, name) {
  if (!name) throw new HaloError("请提供标签名称");

  let tag;
  try {
    tag = await clients.ext.get(`/tags/${name}`);
  } catch (err) {
    if (err.status === 404) throw new HaloError(`标签不存在: ${name}`);
    throw err;
  }

  const displayName = tag?.spec?.displayName || name;
  await clients.ext.delete(`/tags/${name}`);

  return `🗑️ 标签已删除: ${displayName}`;
}
