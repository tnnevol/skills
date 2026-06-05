import { readFileSync, existsSync } from "node:fs";
import {
  formatTime,
  buildSinglePageLink,
  mapVisibility,
  makeSlug,
  generateName,
  generateTimestamp,
  paginationSummary,
} from "./utils.mjs";
import { HaloError } from "./client.mjs";

/**
 * SinglePage module commands definition
 */
export const commands = {
  "list-singlepages": {
    description: "列出单页",
    usage: "list-singlepages [--limit=N] [--page=N] [--keyword=xxx]",
    options: [
      { name: "limit", description: "每页数量，默认 20" },
      { name: "page", description: "页码，从 1 开始" },
      { name: "keyword", description: "搜索关键词" },
    ],
    execute: (clients, opts) =>
      actionListSinglePages(clients, {
        page: opts.page !== undefined ? opts.page : 1,
        limit: opts.limit !== undefined ? opts.limit : 20,
        keyword: opts.keyword,
        trash: false,
      }),
  },
  "list-singlepages-trash": {
    description: "列出回收站单页",
    usage: "list-singlepages-trash [--limit=N] [--page=N]",
    options: [
      { name: "limit", description: "每页数量，默认 20" },
      { name: "page", description: "页码，从 1 开始" },
    ],
    execute: (clients, opts) =>
      actionListSinglePages(clients, {
        page: opts.page !== undefined ? opts.page : 1,
        limit: opts.limit !== undefined ? opts.limit : 20,
        trash: true,
      }),
  },
  "create-singlepage": {
    description: "创建单页",
    usage: "create-singlepage --title=标题 --content=内容",
    options: [
      { name: "title", description: "单页标题" },
      { name: "content", description: "HTML 内容" },
      { name: "content-file", description: "本地 HTML 文件路径" },
      { name: "slug", description: "单页别名" },
      { name: "publish", description: "创建后立即发布", type: "flag" },
      { name: "public", description: "设置公开可见", type: "flag" },
    ],
    execute: (clients, opts) =>
      actionCreateSinglePage(clients, {
        title: opts.title,
        content: opts.content,
        contentFile: opts["content-file"],
        slug: opts.slug,
        publish: opts.publish,
        public: opts.public,
      }),
  },
  "get-singlepage": {
    description: "获取单页详情",
    usage: "get-singlepage <name>",
    options: [],
    validate: (opts) => {
      if (!opts.name)
        throw new HaloError("请提供单页名称，用法: halo get-singlepage <name>");
    },
    execute: (clients, opts) => actionGetSinglePage(clients, opts.name),
  },
  "update-singlepage": {
    description: "更新单页",
    usage: "update-singlepage <name> [--title=标题] [--content=内容]",
    options: [
      { name: "title", description: "单页标题" },
      { name: "content", description: "HTML 内容" },
      { name: "content-file", description: "本地 HTML 文件路径" },
      { name: "slug", description: "单页别名" },
      { name: "visible", description: "可见性: PUBLIC/PRIVATE" },
      { name: "publish", description: "更新并发布", type: "flag" },
    ],
    validate: (opts) => {
      if (!opts.name)
        throw new HaloError(
          "请提供单页名称，用法: halo update-singlepage <name>",
        );
    },
    execute: (clients, opts) =>
      actionUpdateSinglePage(clients, opts.name, {
        title: opts.title,
        content: opts.content,
        contentFile: opts["content-file"],
        slug: opts.slug,
        visible: opts.visible,
        publish: opts.publish,
      }),
  },
  "delete-singlepage": {
    description: "删除单页（默认回收站）",
    usage: "delete-singlepage <name> [--permanent]",
    options: [
      { name: "permanent", description: "永久删除，不进回收站", type: "flag" },
    ],
    validate: (opts) => {
      if (!opts.name)
        throw new HaloError(
          "请提供单页名称，用法: halo delete-singlepage <name>",
        );
    },
    execute: (clients, opts) =>
      actionDeleteSinglePage(clients, opts.name, {
        permanent: opts.permanent === true,
      }),
  },
  "restore-singlepage": {
    description: "从回收站恢复单页",
    usage: "restore-singlepage <name>",
    options: [],
    validate: (opts) => {
      if (!opts.name)
        throw new HaloError(
          "请提供单页名称，用法: halo restore-singlepage <name>",
        );
    },
    execute: (clients, opts) => actionRestoreSinglePage(clients, opts.name),
  },
  "publish-singlepage": {
    description: "发布单页",
    usage: "publish-singlepage <name>",
    options: [],
    validate: (opts) => {
      if (!opts.name)
        throw new HaloError(
          "请提供单页名称，用法: halo publish-singlepage <name>",
        );
    },
    execute: (clients, opts) => actionPublishSinglePage(clients, opts.name),
  },
  "unpublish-singlepage": {
    description: "取消发布单页",
    usage: "unpublish-singlepage <name>",
    options: [],
    validate: (opts) => {
      if (!opts.name)
        throw new HaloError(
          "请提供单页名称，用法: halo unpublish-singlepage <name>",
        );
    },
    execute: (clients, opts) => actionUnpublishSinglePage(clients, opts.name),
  },
};

export async function actionListSinglePages(
  clients,
  { page = 1, limit = 20, keyword, trash = false } = {},
) {
  const api = keyword ? clients.console : clients.ext;
  const params = { page, size: limit };
  if (keyword) params.keyword = keyword;

  const res = await api.get("/singlepages", params);
  const rawItems = res.items || [];
  const total = res.total || 0;

  const items = rawItems.map((item) => {
    if (item.singlePage) {
      const sp = item.singlePage;
      return {
        ...sp,
        status: sp.status || {},
        metadata: sp.metadata || {},
        spec: sp.spec || {},
      };
    }
    return item;
  });

  // 过滤回收站/正常单页
  const filteredItems = trash
    ? items.filter((item) => item.spec?.deleted === true)
    : items.filter((item) => item.spec?.deleted !== true);

  if (filteredItems.length === 0) {
    if (trash) {
      return "📭 回收站为空";
    }
    if (keyword) {
      return `📭 没有找到包含 "${keyword}" 的单页`;
    }
    return "📭 没有找到单页，使用 /halo create-singlepage 创建第一个单页";
  }

  const lines = filteredItems.map((item) => {
    const meta = item.metadata || {};
    const spec = item.spec || {};
    const status = item.status || {};
    const slug = spec.slug || meta.name || "-";
    const link = buildSinglePageLink(clients.ext.baseUrl, slug);
    const trashTag = spec.deleted === true ? " 🗑️回收站" : "";
    return (
      `${spec.title || "-"}${trashTag}\n` +
      `  名称: ${meta.name}\n` +
      `  状态: ${status.phase === "DRAFT" ? "草稿" : "已发布"}\n` +
      `  可见性: ${mapVisibility(spec.visible || "PRIVATE")}\n` +
      `  链接: ${link}\n` +
      `  时间: ${formatTime(meta.creationTimestamp)}`
    );
  });

  const displayTotal = keyword ? filteredItems.length : total;
  const summary = paginationSummary(displayTotal, page, limit);
  return `${summary}\n\n${lines.join("\n\n")}`;
}

export async function actionGetSinglePage(clients, name) {
  let res;
  try {
    res = await clients.ext.get(`/singlepages/${name}`);
  } catch (err) {
    if (err.status === 404) {
      throw new HaloError(`单页不存在: ${name}`);
    }
    throw err;
  }
  const meta = res.metadata || {};
  const spec = res.spec || {};
  const slug = spec.slug || name;
  const link = buildSinglePageLink(clients.ext.baseUrl, slug);

  return (
    `标题: ${spec.title || "-"}\n` +
    `名称: ${meta.name}\n` +
    `可见性: ${mapVisibility(spec.visible || "PRIVATE")}\n` +
    `发布时间: ${spec.publishTime ? formatTime(spec.publishTime) : "未发布"}\n` +
    `链接: ${link}`
  );
}

export async function actionCreateSinglePage(
  clients,
  { title, content, contentFile, slug, publish, public: isPublic },
) {
  if (!title) throw new HaloError("请提供单页标题 (--title)");

  let bodyContent = content || "";
  if (contentFile) {
    if (!existsSync(contentFile)) {
      throw new HaloError(`文件不存在: ${contentFile}`);
    }
    bodyContent = readFileSync(contentFile, "utf-8");
  }

  if (!bodyContent.trim()) {
    throw new HaloError("请提供单页内容 (--content 或 --content-file)");
  }

  const resolvedSlug = slug || makeSlug(title);
  const timestamp = generateTimestamp();
  const name = generateName(resolvedSlug, timestamp);

  const payload = {
    page: {
      metadata: {
        name,
      },
      spec: {
        title,
        slug: resolvedSlug,
        visible: isPublic ? "PUBLIC" : "PRIVATE",
        deleted: false,
        excerpt: { raw: "", autoGenerate: true },
        publish: !!publish,
        allowComment: true,
        pinned: false,
        priority: 0,
        template: "",
        cover: "",
        htmlMetas: [],
      },
      apiVersion: "content.halo.run/v1alpha1",
      kind: "SinglePage",
    },
    content: {
      raw: bodyContent,
      content: bodyContent,
      rawType: "HTML",
    },
  };

  const res = await clients.console.post("/singlepages", payload);

  const createdName = res?.metadata?.name || name;
  const link = buildSinglePageLink(clients.ext.baseUrl, resolvedSlug);

  let resultMsg = `✅ 单页创建成功\n标题: ${title}\n名称: ${createdName}\n链接: ${link}`;

  if (publish) {
    await clients.console.put(`/singlepages/${createdName}/publish`, {});
    resultMsg += "\n状态: 已发布";
  } else {
    resultMsg += "\n状态: 草稿";
  }

  return resultMsg;
}

export async function actionUpdateSinglePage(
  clients,
  name,
  { title, content, contentFile, slug: newSlug, visible, publish },
) {
  if (!name) throw new HaloError("请提供单页名称");

  let currentSinglePage;
  try {
    currentSinglePage = await clients.ext.get(`/singlepages/${name}`);
  } catch (err) {
    if (err.status === 404) {
      throw new HaloError(`单页不存在: ${name}`);
    }
    throw err;
  }

  const changes = [];
  const meta = currentSinglePage.metadata || {};
  const spec = currentSinglePage.spec || {};

  let updatedSinglePage = JSON.parse(JSON.stringify(currentSinglePage));
  let updatedSpec = updatedSinglePage.spec || {};
  if (!updatedSinglePage.metadata) updatedSinglePage.metadata = {};

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
      throw new HaloError("单页内容为空");
    }

    const contentPayload = {
      raw: bodyContent,
      content: bodyContent,
      rawType: "HTML",
    };

    try {
      await clients.console.put(`/singlepages/${name}/content`, contentPayload);
      changes.push("内容已更新");
    } catch (err) {
      if (err.status === 409) {
        currentSinglePage = await clients.ext.get(`/singlepages/${name}`);
        newVersion = currentSinglePage?.metadata?.version || newVersion;
        await clients.console.put(
          `/singlepages/${name}/content`,
          contentPayload,
        );
        changes.push("内容已更新（重试冲突）");
      } else {
        throw err;
      }
    }

    currentSinglePage = await clients.ext.get(`/singlepages/${name}`);
    newVersion = currentSinglePage?.metadata?.version || newVersion;

    updatedSinglePage = JSON.parse(JSON.stringify(currentSinglePage));
    updatedSpec = updatedSinglePage.spec || {};
    if (title) updatedSpec.title = title;
    if (newSlug) updatedSpec.slug = newSlug;
    if (visible) updatedSpec.visible = visible;
  }

  if (
    Object.keys(updatedSpec).length > 0 ||
    Object.keys(updatedSinglePage.metadata).length > 0
  ) {
    updatedSpec.slug = updatedSpec.slug || "";

    updatedSinglePage.metadata.version = newVersion;

    try {
      await clients.ext.put(`/singlepages/${name}`, updatedSinglePage);
    } catch (err) {
      if (err.status === 409) {
        const latest = await clients.ext.get(`/singlepages/${name}`);
        latest.spec = { ...latest.spec, ...updatedSpec };
        latest.metadata.version = latest.metadata?.version || 1;
        await clients.ext.put(`/singlepages/${name}`, latest);
        changes.push("元数据已更新（重试冲突）");
      } else {
        throw err;
      }
    }
  }

  const slug = updatedSpec.slug || spec.slug || "";
  const link = buildSinglePageLink(clients.ext.baseUrl, slug);
  const summary =
    changes.length > 0 ? `变更:\n  ${changes.join("\n  ")}` : "无变更";

  let resultMsg = `✅ 单页更新成功\n标题: ${title || spec.title}\n链接: ${link}\n${summary}`;

  if (publish) {
    await clients.console.put(`/singlepages/${name}/publish`, {});
    resultMsg += "\n状态: 已发布";
  }

  return resultMsg;
}

export async function actionDeleteSinglePage(
  clients,
  name,
  { permanent = false } = {},
) {
  if (!name) throw new HaloError("请提供单页名称");

  let singlePage;
  try {
    singlePage = await clients.ext.get(`/singlepages/${name}`);
  } catch (err) {
    if (err.status === 404) throw new HaloError(`单页不存在: ${name}`);
    throw err;
  }

  const title = singlePage?.spec?.title || name;

  if (permanent) {
    // 永久删除：直接调用 DELETE API
    await clients.ext.delete(`/singlepages/${name}`);
    return `💀 单页已永久删除: ${title}`;
  } else {
    // 移入回收站：设置 spec.deleted = true
    const updatedSinglePage = JSON.parse(JSON.stringify(singlePage));
    updatedSinglePage.spec.deleted = true;
    updatedSinglePage.metadata.version =
      updatedSinglePage.metadata?.version || 1;

    try {
      await clients.ext.put(`/singlepages/${name}`, updatedSinglePage);
    } catch (err) {
      if (err.status === 409) {
        // 版本冲突，重新获取最新版本后重试
        const latest = await clients.ext.get(`/singlepages/${name}`);
        latest.spec.deleted = true;
        latest.metadata.version = latest.metadata?.version || 1;
        await clients.ext.put(`/singlepages/${name}`, latest);
      } else {
        throw err;
      }
    }

    return `🗑️ 单页已移入回收站: ${title}\n💡 提示：使用 --permanent 参数可永久删除`;
  }
}

export async function actionPublishSinglePage(clients, name) {
  if (!name) throw new HaloError("请提供单页名称");

  let singlePage;
  try {
    singlePage = await clients.ext.get(`/singlepages/${name}`);
  } catch (err) {
    if (err.status === 404) throw new HaloError(`单页不存在: ${name}`);
    throw err;
  }

  const title = singlePage?.spec?.title || name;
  const slug = singlePage?.spec?.slug || name;

  await clients.console.put(`/singlepages/${name}/publish`, {});
  const link = buildSinglePageLink(clients.ext.baseUrl, slug);

  return `✅ 单页已发布: ${title}\n链接: ${link}`;
}

export async function actionUnpublishSinglePage(clients, name) {
  if (!name) throw new HaloError("请提供单页名称");

  let singlePage;
  try {
    singlePage = await clients.ext.get(`/singlepages/${name}`);
  } catch (err) {
    if (err.status === 404) throw new HaloError(`单页不存在: ${name}`);
    throw err;
  }

  const title = singlePage?.spec?.title || name;
  await clients.console.put(`/singlepages/${name}/unpublish`, {});

  return `📝 单页已取消发布: ${title}，现为草稿`;
}

export async function actionRestoreSinglePage(clients, name) {
  if (!name) throw new HaloError("请提供单页名称");

  let singlePage;
  try {
    singlePage = await clients.ext.get(`/singlepages/${name}`);
  } catch (err) {
    if (err.status === 404) throw new HaloError(`单页不存在: ${name}`);
    throw err;
  }

  if (singlePage.spec?.deleted !== true) {
    throw new HaloError(`单页不在回收站中: ${name}`);
  }

  // 从回收站恢复：设置 spec.deleted = false
  const updatedSinglePage = JSON.parse(JSON.stringify(singlePage));
  updatedSinglePage.spec.deleted = false;
  updatedSinglePage.metadata.version = updatedSinglePage.metadata?.version || 1;

  try {
    await clients.ext.put(`/singlepages/${name}`, updatedSinglePage);
  } catch (err) {
    if (err.status === 409) {
      const latest = await clients.ext.get(`/singlepages/${name}`);
      latest.spec.deleted = false;
      latest.metadata.version = latest.metadata?.version || 1;
      await clients.ext.put(`/singlepages/${name}`, latest);
    } else {
      throw err;
    }
  }

  const title = singlePage?.spec?.title || name;
  return `✅ 单页已从回收站恢复: ${title}`;
}
