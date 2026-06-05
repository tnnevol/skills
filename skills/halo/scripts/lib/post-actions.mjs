import { readFileSync, existsSync } from "node:fs";
import {
  formatTime,
  buildPostLink,
  mapVisibility,
  makeSlug,
  generateName,
  generateTimestamp,
  paginationSummary,
} from "./utils.mjs";
import { HaloError } from "./client.mjs";

/**
 * Post module commands definition
 */
export const commands = {
  list: {
    description: "列出文章",
    usage: "list [--limit=N] [--page=N] [--keyword=xxx]",
    options: [
      { name: "limit", description: "每页数量，默认 20" },
      { name: "page", description: "页码，从 1 开始" },
      { name: "keyword", description: "搜索关键词" },
    ],
    execute: async (clients, opts) =>
      actionList(clients, {
        page: opts.page || 1,
        limit: opts.limit || 20,
        keyword: opts.keyword,
      }),
  },
  get: {
    description: "获取文章详情",
    usage: "get <name>",
    options: [],
    validate: (opts) => {
      if (!opts.name)
        throw new HaloError("请提供文章名称，用法: halo get <name>");
    },
    execute: (clients, opts) => actionGet(clients, opts.name),
  },
  create: {
    description: "创建文章",
    usage: "create --title=标题 --content=内容",
    options: [
      { name: "title", description: "文章标题" },
      { name: "content", description: "HTML 内容" },
      { name: "content-file", description: "本地 HTML 文件路径" },
      { name: "slug", description: "文章别名" },
      { name: "publish", description: "创建后立即发布", type: "flag" },
      { name: "public", description: "设置公开可见", type: "flag" },
    ],
    execute: (clients, opts) =>
      actionCreate(clients, {
        title: opts.title,
        content: opts.content,
        contentFile: opts["content-file"],
        slug: opts.slug,
        publish: opts.publish,
        public: opts.public,
      }),
  },
  update: {
    description: "更新文章",
    usage: "update <name> [--title=标题] [--content=内容]",
    options: [
      { name: "title", description: "文章标题" },
      { name: "content", description: "HTML 内容" },
      { name: "content-file", description: "本地 HTML 文件路径" },
      { name: "slug", description: "文章别名" },
      { name: "visible", description: "可见性: PUBLIC/PRIVATE" },
      { name: "cover", description: "封面 URL" },
      { name: "pinned", description: "是否置顶", type: "flag" },
      { name: "categories", description: "分类 metadata.name，多个用逗号分隔" },
      { name: "tags", description: "标签 metadata.name，多个用逗号分隔" },
    ],
    validate: (opts) => {
      if (!opts.name)
        throw new HaloError("请提供文章名称，用法: halo update <name>");
    },
    execute: (clients, opts) =>
      actionUpdate(clients, opts.name, {
        title: opts.title,
        content: opts.content,
        contentFile: opts["content-file"],
        slug: opts.slug,
        visible: opts.visible,
        cover: opts.cover,
        pinned: opts.pinned === undefined ? undefined : true,
        categories: opts.categories,
        tags: opts.tags,
      }),
  },
  delete: {
    description: "删除文章（默认回收站）",
    usage: "delete <name> [--permanent]",
    options: [
      { name: "permanent", description: "永久删除，不进回收站", type: "flag" },
    ],
    validate: (opts) => {
      if (!opts.name)
        throw new HaloError("请提供文章名称，用法: halo delete <name>");
    },
    execute: (clients, opts) =>
      actionDelete(clients, opts.name, {
        permanent: opts.permanent === true,
      }),
  },
  publish: {
    description: "发布文章",
    usage: "publish <name>",
    options: [],
    validate: (opts) => {
      if (!opts.name)
        throw new HaloError("请提供文章名称，用法: halo publish <name>");
    },
    execute: (clients, opts) => actionPublish(clients, opts.name),
  },
  unpublish: {
    description: "取消发布",
    usage: "unpublish <name>",
    options: [],
    validate: (opts) => {
      if (!opts.name)
        throw new HaloError("请提供文章名称，用法: halo unpublish <name>");
    },
    execute: (clients, opts) => actionUnpublish(clients, opts.name),
  },
};

export async function actionList(
  clients,
  { page = 1, limit = 20, keyword } = {},
) {
  // Extension API doesn't support keyword, use Console API for search
  const api = keyword ? clients.console : clients.ext;
  const params = { page, size: limit };
  if (keyword) params.keyword = keyword;

  const res = await api.get("/posts", params);
  const rawItems = res.items || [];
  const total = res.total || 0;

  // Console API returns nested structure { post, stats, ... }, normalize to flat
  const items = rawItems.map((item) => {
    if (item.post) {
      const post = item.post;
      return {
        ...post,
        status: post.status || {},
        metadata: post.metadata || {},
        spec: post.spec || {},
      };
    }
    return item;
  });

  if (items.length === 0) {
    if (keyword) {
      return `📭 没有找到包含 "${keyword}" 的文章`;
    }
    return "📭 没有找到文章，使用 /halo create 创建第一篇";
  }

  const lines = items.map((item) => {
    const meta = item.metadata || {};
    const spec = item.spec || {};
    const status = item.status || {};
    const slug = spec.slug || meta.name || "-";
    const link = buildPostLink(clients.ext.baseUrl, slug);
    const visitCount = keyword
      ? item.stats?.visit || 0
      : item.status?.visitCount || spec?.visitCount || 0;
    return (
      `${spec.title || "-"}\n` +
      `  名称: ${meta.name}\n` +
      `  状态: ${status.phase === "DRAFT" ? "草稿" : "已发布"}\n` +
      `  可见性: ${mapVisibility(spec.visible || "PRIVATE")}\n` +
      `  阅读量: ${visitCount}\n` +
      `  链接: ${link}\n` +
      `  时间: ${formatTime(meta.creationTimestamp)}`
    );
  });

  const displayTotal = keyword ? items.length : total;
  const summary = paginationSummary(displayTotal, page, limit);
  return `${summary}\n\n${lines.join("\n\n")}`;
}

export async function actionGet(clients, name) {
  let res;
  try {
    res = await clients.ext.get(`/posts/${name}`);
  } catch (err) {
    if (err.status === 404) {
      throw new HaloError(`文章不存在: ${name}`);
    }
    throw err;
  }
  const meta = res.metadata || {};
  const spec = res.spec || {};
  const slug = spec.slug || name;
  const link = buildPostLink(clients.ext.baseUrl, slug);

  return (
    `标题: ${spec.title || "-"}\n` +
    `名称: ${meta.name}\n` +
    `可见性: ${mapVisibility(spec.visible || "PRIVATE")}\n` +
    `发布时间: ${spec.publishTime ? formatTime(spec.publishTime) : "未发布"}\n` +
    `链接: ${link}`
  );
}

export async function actionCreate(
  clients,
  { title, content, contentFile, slug, publish, public: isPublic },
) {
  if (!title) throw new HaloError("请提供文章标题 (--title)");

  let bodyContent = content || "";
  if (contentFile) {
    if (!existsSync(contentFile)) {
      throw new HaloError(`文件不存在: ${contentFile}`);
    }
    bodyContent = readFileSync(contentFile, "utf-8");
  }

  if (!bodyContent.trim()) {
    throw new HaloError("请提供文章内容 (--content 或 --content-file)");
  }

  const resolvedSlug = slug || makeSlug(title);
  const timestamp = generateTimestamp();
  const name = generateName(resolvedSlug, timestamp);

  const payload = {
    post: {
      metadata: {
        name,
      },
      spec: {
        title,
        slug: resolvedSlug,
        visible: isPublic ? "PUBLIC" : "PRIVATE",
        pinned: false,
        allowComment: true,
        deleted: false,
        excerpt: { raw: "", autoGenerate: true },
        priority: 0,
        publish: !!publish,
      },
      apiVersion: "content.halo.run/v1alpha1",
      kind: "Post",
    },
    content: {
      raw: bodyContent,
      content: bodyContent,
      rawType: "HTML",
    },
  };

  const res = await clients.console.post("/posts", payload);

  const createdName = res?.metadata?.name || res?.post?.metadata?.name || name;
  const link = buildPostLink(clients.ext.baseUrl, resolvedSlug);

  let resultMsg = `✅ 文章创建成功\n标题: ${title}\n名称: ${createdName}\n链接: ${link}`;

  if (publish) {
    await clients.console.put(`/posts/${createdName}/publish`, {});
    resultMsg += "\n状态: 已发布";
  } else {
    resultMsg += "\n状态: 草稿";
  }

  return resultMsg;
}

export async function actionUpdate(
  clients,
  name,
  {
    title,
    content,
    contentFile,
    slug: newSlug,
    visible,
    cover,
    pinned,
    categories,
    tags,
  },
) {
  if (!name) throw new HaloError("请提供文章名称");

  let currentPost;
  try {
    currentPost = await clients.ext.get(`/posts/${name}`);
  } catch (err) {
    if (err.status === 404) {
      throw new HaloError(`文章不存在: ${name}`);
    }
    throw err;
  }

  const changes = [];
  const meta = currentPost.metadata || {};
  const spec = currentPost.spec || {};

  let updatedPost = JSON.parse(JSON.stringify(currentPost));
  let updatedSpec = updatedPost.spec || {};
  if (!updatedPost.metadata) updatedPost.metadata = {};

  if (title) {
    changes.push(`标题: ${spec.title || "(空)"} → ${title}`);
    updatedSpec.title = title;
  }
  if (newSlug) {
    changes.push(`slug: ${updatedSpec.slug || "(空)"} → ${newSlug}`);
    updatedSpec.slug = newSlug;
  }
  if (visible) {
    const oldVis = mapVisibility(spec.visible || "PRIVATE");
    updatedSpec.visible = visible;
    changes.push(`可见性: ${oldVis} → ${mapVisibility(visible)}`);
  }
  if (pinned !== undefined) {
    updatedSpec.pinned = pinned;
    changes.push(`置顶: ${pinned ? "是" : "否"}`);
  }
  if (cover !== undefined) {
    updatedSpec.cover = Array.isArray(cover) ? cover : [cover];
    changes.push("封面已更新");
  }
  if (categories !== undefined) {
    updatedSpec.categories = Array.isArray(categories)
      ? categories
      : [categories];
    changes.push(`分类: ${updatedSpec.categories.join(", ")}`);
  }
  if (tags !== undefined) {
    updatedSpec.tags = Array.isArray(tags) ? tags : [tags];
    changes.push(`标签: ${updatedSpec.tags.join(", ")}`);
  }

  let newVersion = meta.version || 1;

  if (content || contentFile) {
    let bodyContent = content || "";
    if (contentFile) {
      if (!existsSync(contentFile)) {
        throw new HaloError(`文件不存在: ${contentFile}`);
      }
      bodyContent = readFileSync(contentFile, "utf-8");
    }
    if (!bodyContent.trim()) {
      throw new HaloError("文章内容为空");
    }

    const contentPayload = {
      raw: bodyContent,
      content: bodyContent,
      rawType: "HTML",
    };

    try {
      await clients.console.put(`/posts/${name}/content`, contentPayload);
      changes.push("内容已更新");
    } catch (err) {
      if (err.status === 409) {
        currentPost = await clients.ext.get(`/posts/${name}`);
        newVersion = currentPost?.metadata?.version || newVersion;
        await clients.console.put(`/posts/${name}/content`, contentPayload);
        changes.push("内容已更新（重试冲突）");
      } else {
        throw err;
      }
    }

    currentPost = await clients.ext.get(`/posts/${name}`);
    newVersion = currentPost?.metadata?.version || newVersion;

    // Re-fetch latest post as base for metadata update to preserve new headSnapshot
    updatedPost = JSON.parse(JSON.stringify(currentPost));
    updatedSpec = updatedPost.spec || {};
    // Re-apply spec changes on the fresh post
    if (title) updatedSpec.title = title;
    if (newSlug) updatedSpec.slug = newSlug;
    if (visible) updatedSpec.visible = visible;
    if (pinned !== undefined) updatedSpec.pinned = pinned;
    if (cover !== undefined)
      updatedSpec.cover = Array.isArray(cover) ? cover : [cover];
    if (categories !== undefined)
      updatedSpec.categories = Array.isArray(categories)
        ? categories
        : [categories];
    if (tags !== undefined)
      updatedSpec.tags = Array.isArray(tags) ? tags : [tags];
  }

  if (
    Object.keys(updatedSpec).length > 0 ||
    Object.keys(updatedPost.metadata).length > 0
  ) {
    updatedSpec.slug = updatedSpec.slug || "";

    updatedPost.metadata.version = newVersion;

    try {
      await clients.ext.put(`/posts/${name}`, updatedPost);
    } catch (err) {
      if (err.status === 409) {
        const latest = await clients.ext.get(`/posts/${name}`);
        latest.spec = { ...latest.spec, ...updatedSpec };
        latest.metadata.version = latest.metadata?.version || 1;
        await clients.ext.put(`/posts/${name}`, latest);
        changes.push("元数据已更新（重试冲突）");
      } else {
        throw err;
      }
    }
  }

  const slug = updatedSpec.slug || spec.slug || "";
  const link = buildPostLink(clients.ext.baseUrl, slug);
  const summary =
    changes.length > 0 ? `变更:\n  ${changes.join("\n  ")}` : "无变更";

  return `✅ 文章更新成功\n标题: ${title || spec.title}\n链接: ${link}\n${summary}`;
}

export async function actionDelete(clients, name, { permanent } = {}) {
  if (!name) throw new HaloError("请提供文章名称");

  let post;
  try {
    post = await clients.ext.get(`/posts/${name}`);
  } catch (err) {
    if (err.status === 404) throw new HaloError(`文章不存在: ${name}`);
    throw err;
  }

  const title = post?.spec?.title || name;

  if (permanent) {
    // Permanent delete using Extension API
    await clients.ext.delete(`/posts/${name}`);
    return `🗑️ 文章已永久删除: ${title}`;
  } else {
    // Soft delete (recycle) using Console API
    await clients.console.put(`/posts/${name}/recycle`, {});
    return `♻️ 文章已移入回收站: ${title}`;
  }
}

export async function actionPublish(clients, name) {
  if (!name) throw new HaloError("请提供文章名称");

  let post;
  try {
    post = await clients.ext.get(`/posts/${name}`);
  } catch (err) {
    if (err.status === 404) throw new HaloError(`文章不存在: ${name}`);
    throw err;
  }

  const title = post?.spec?.title || name;
  const slug = post?.spec?.slug || name;

  await clients.console.put(`/posts/${name}/publish`, {});
  const link = buildPostLink(clients.ext.baseUrl, slug);

  return `✅ 文章已发布: ${title}\n链接: ${link}`;
}

export async function actionUnpublish(clients, name) {
  if (!name) throw new HaloError("请提供文章名称");

  let post;
  try {
    post = await clients.ext.get(`/posts/${name}`);
  } catch (err) {
    if (err.status === 404) throw new HaloError(`文章不存在: ${name}`);
    throw err;
  }

  const title = post?.spec?.title || name;
  await clients.console.put(`/posts/${name}/unpublish`, {});

  return `📝 文章已取消发布: ${title}，现为草稿`;
}
