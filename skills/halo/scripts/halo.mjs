#!/usr/bin/env node

import { loadConfig } from "./lib/config.mjs";
import { createClients, HaloError } from "./lib/client.mjs";
import {
  actionList,
  actionGet,
  actionCreate,
  actionUpdate,
  actionDelete,
  actionPublish,
  actionUnpublish,
} from "./lib/post-actions.mjs";
import {
  actionListTags,
  actionCreateTag,
  actionGetTag,
  actionUpdateTag,
  actionDeleteTag,
} from "./lib/tag-actions.mjs";
import {
  actionListCategories,
  actionCreateCategory,
  actionGetCategory,
  actionUpdateCategory,
  actionDeleteCategory,
} from "./lib/category-actions.mjs";
import {
  actionListSinglePages,
  actionCreateSinglePage,
  actionGetSinglePage,
  actionUpdateSinglePage,
  actionDeleteSinglePage,
  actionPublishSinglePage,
  actionUnpublishSinglePage,
  actionRestoreSinglePage,
} from "./lib/singlepage-actions.mjs";

function parseArgs(argv) {
  const args = argv.slice(2);
  const action = args[0];
  const name = args[1] && !args[1].startsWith("--") ? args[1] : null;

  const opts = { name };

  for (let i = name ? 2 : 1; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;

    const eqIdx = arg.indexOf("=");
    if (eqIdx === -1) {
      const key = arg.slice(2);
      opts[key] = true;
    } else {
      const key = arg.slice(2, eqIdx);
      const value = arg.slice(eqIdx + 1);
      if (key === "page" || key === "limit") {
        opts[key] = parseInt(value, 10);
      } else if (key === "public") {
        opts.public = value === "true" || value === "";
      } else {
        opts[key] = value;
      }
    }
  }

  return { action, opts };
}

const USAGE = `用法: halo <action> [name] [options]

Actions:
  list [--limit=N] [--page=N] [--keyword=xxx]   列出文章
  get <name>                                    获取文章详情
  create --title=标题 --content=内容             创建文章
  update <name> [--title=标题] [--content=内容]  更新文章
  delete <name>                                 删除文章
  publish <name>                                发布文章
  unpublish <name>                              取消发布
  list-tags [--limit=N] [--page=N] [--sort=xxx] 列出标签
  create-tag --display-name=名称 [--slug=xxx]      创建标签
  update-tag <name> [--display-name=xxx] [--color=xxx]  更新标签
  get-tag <name>                                     获取标签详情
  delete-tag <name>                                删除标签
  list-categories [--limit=N] [--page=N] [--sort=xxx]  列出分类
  create-category --display-name=名称 [--slug=xxx]      创建分类
  get-category <name>                                   获取分类详情
  update-category <name> [--display-name=xxx]           更新分类
  delete-category <name>                               删除分类
  list-singlepages [--limit=N] [--page=N] [--keyword=xxx]  列出单页
  list-singlepages-trash [--limit=N] [--page=N]              列出回收站单页
  get-singlepage <name>                                   获取单页详情
  create-singlepage --title=标题 --content=内容             创建单页
  update-singlepage <name> [--title=标题] [--content=内容]  更新单页
  update-singlepage <name> --publish                      更新并发布单页
  delete-singlepage <name> [--permanent]                  删除单页（默认回收站）
  restore-singlepage <name>                               从回收站恢复单页
  publish-singlepage <name>                              发布单页
  unpublish-singlepage <name>                            取消发布单页

Options:
  --title=      文章标题 (create)
  --content=    HTML 内容 (create/update)
  --content-file=  本地 HTML 文件路径 (create/update)
  --slug=       文章别名 (create)
  --publish     创建后立即发布 (create)
  --public      设置公开可见 (create/update)
  --visible=    可见性: PUBLIC/PRIVATE (update)
  --pinned      是否置顶: true/false (update)
  --cover=      封面 URL (update)
  --display-name=  标签显示名 (create-tag/update-tag)
  --slug=       标签别名 (create-tag/update-tag)
  --color=      标签颜色，如 #ff0000 (create-tag/update-tag)
  --description= 标签/分类描述 (create-tag/update-tag/create-category/update-category)
  --priority=N   分类优先级，默认 0 (create-category/update-category)
  --hide-from-list  隐藏分类不在列表显示 (update-category)
  --permanent   永久删除单页，不进回收站 (delete-singlepage)
  --keyword=    搜索关键词 (list)
  --limit=N     每页数量，默认 20 (list/list-tags)
  --page=N      页码，从 1 开始 (list/list-tags)
  --sort=       排序字段，如 spec.displayName,asc (list-tags)
  --dry-run     预览操作，不实际执行`;

async function main() {
  const { action, opts } = parseArgs(process.argv);

  if (!action || action === "help" || action === "--help" || action === "-h") {
    console.log(USAGE);
    return;
  }

  let config;
  try {
    config = loadConfig();
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }

  const clients = createClients(config);

  try {
    let result;
    switch (action) {
      case "list":
        result = await actionList(clients, {
          page: opts.page || 1,
          limit: opts.limit || 20,
          keyword: opts.keyword,
        });
        break;

      case "get":
        if (!opts.name) {
          throw new HaloError("请提供文章名称，用法: halo get <name>");
        }
        result = await actionGet(clients, opts.name);
        break;

      case "create":
        result = await actionCreate(clients, {
          title: opts.title,
          content: opts.content,
          contentFile: opts["content-file"],
          slug: opts.slug,
          publish: opts.publish,
          public: opts.public,
        });
        break;

      case "update":
        if (!opts.name) {
          throw new HaloError("请提供文章名称，用法: halo update <name>");
        }
        result = await actionUpdate(clients, opts.name, {
          title: opts.title,
          content: opts.content,
          contentFile: opts["content-file"],
          slug: opts.slug,
          visible: opts.visible,
          cover: opts.cover,
          pinned: opts.pinned === undefined ? undefined : true,
        });
        break;

      case "delete":
        if (!opts.name) {
          throw new HaloError("请提供文章名称，用法: halo delete <name>");
        }
        result = await actionDelete(clients, opts.name);
        break;

      case "publish":
        if (!opts.name) {
          throw new HaloError("请提供文章名称，用法: halo publish <name>");
        }
        result = await actionPublish(clients, opts.name);
        break;

      case "unpublish":
        if (!opts.name) {
          throw new HaloError("请提供文章名称，用法: halo unpublish <name>");
        }
        result = await actionUnpublish(clients, opts.name);
        break;

      case "list-tags":
        result = await actionListTags(clients, {
          page: opts.page !== undefined ? opts.page : 1,
          limit: opts.limit !== undefined ? opts.limit : 20,
          sort: opts.sort,
        });
        break;

      case "create-tag":
        result = await actionCreateTag(clients, {
          displayName: opts["display-name"],
          slug: opts.slug,
          color: opts.color,
          cover: opts.cover,
          description: opts.description,
        });
        break;

      case "delete-tag":
        if (!opts.name) {
          throw new HaloError("请提供标签名称，用法: halo delete-tag <name>");
        }
        result = await actionDeleteTag(clients, opts.name);
        break;

      case "get-tag":
        if (!opts.name) {
          throw new HaloError("请提供标签名称，用法: halo get-tag <name>");
        }
        result = await actionGetTag(clients, opts.name);
        break;

      case "update-tag":
        if (!opts.name) {
          throw new HaloError("请提供标签名称，用法: halo update-tag <name>");
        }
        result = await actionUpdateTag(clients, opts.name, {
          displayName: opts["display-name"],
          slug: opts.slug,
          color: opts.color,
          cover: opts.cover,
          description: opts.description,
        });
        break;

      case "list-categories":
        result = await actionListCategories(clients, {
          page: opts.page !== undefined ? opts.page : 1,
          limit: opts.limit !== undefined ? opts.limit : 20,
          sort: opts.sort,
        });
        break;

      case "create-category":
        result = await actionCreateCategory(clients, {
          displayName: opts["display-name"],
          slug: opts.slug,
          cover: opts.cover,
          description: opts.description,
          priority:
            opts.priority !== undefined
              ? parseInt(opts.priority, 10)
              : undefined,
        });
        break;

      case "get-category":
        if (!opts.name) {
          throw new HaloError("请提供分类名称，用法: halo get-category <name>");
        }
        result = await actionGetCategory(clients, opts.name);
        break;

      case "update-category":
        if (!opts.name) {
          throw new HaloError(
            "请提供分类名称，用法: halo update-category <name>",
          );
        }
        result = await actionUpdateCategory(clients, opts.name, {
          displayName: opts["display-name"],
          slug: opts.slug,
          cover: opts.cover,
          description: opts.description,
          priority:
            opts.priority !== undefined
              ? parseInt(opts.priority, 10)
              : undefined,
          hideFromList: opts["hide-from-list"] !== undefined,
        });
        break;

      case "delete-category":
        if (!opts.name) {
          throw new HaloError(
            "请提供分类名称，用法: halo delete-category <name>",
          );
        }
        result = await actionDeleteCategory(clients, opts.name);
        break;

      case "list-singlepages":
        result = await actionListSinglePages(clients, {
          page: opts.page !== undefined ? opts.page : 1,
          limit: opts.limit !== undefined ? opts.limit : 20,
          keyword: opts.keyword,
          trash: false,
        });
        break;

      case "list-singlepages-trash":
        result = await actionListSinglePages(clients, {
          page: opts.page !== undefined ? opts.page : 1,
          limit: opts.limit !== undefined ? opts.limit : 20,
          trash: true,
        });
        break;

      case "create-singlepage":
        result = await actionCreateSinglePage(clients, {
          title: opts.title,
          content: opts.content,
          contentFile: opts["content-file"],
          slug: opts.slug,
          publish: opts.publish,
          public: opts.public,
        });
        break;

      case "get-singlepage":
        if (!opts.name) {
          throw new HaloError(
            "请提供单页名称，用法: halo get-singlepage <name>",
          );
        }
        result = await actionGetSinglePage(clients, opts.name);
        break;

      case "update-singlepage":
        if (!opts.name) {
          throw new HaloError(
            "请提供单页名称，用法: halo update-singlepage <name>",
          );
        }
        result = await actionUpdateSinglePage(clients, opts.name, {
          title: opts.title,
          content: opts.content,
          contentFile: opts["content-file"],
          slug: opts.slug,
          visible: opts.visible,
          publish: opts.publish,
        });
        break;

      case "delete-singlepage":
        if (!opts.name) {
          throw new HaloError(
            "请提供单页名称，用法: halo delete-singlepage <name>",
          );
        }
        result = await actionDeleteSinglePage(clients, opts.name, {
          permanent: opts.permanent === true,
        });
        break;

      case "restore-singlepage":
        if (!opts.name) {
          throw new HaloError(
            "请提供单页名称，用法: halo restore-singlepage <name>",
          );
        }
        result = await actionRestoreSinglePage(clients, opts.name);
        break;

      case "publish-singlepage":
        if (!opts.name) {
          throw new HaloError(
            "请提供单页名称，用法: halo publish-singlepage <name>",
          );
        }
        result = await actionPublishSinglePage(clients, opts.name);
        break;

      case "unpublish-singlepage":
        if (!opts.name) {
          throw new HaloError(
            "请提供单页名称，用法: halo unpublish-singlepage <name>",
          );
        }
        result = await actionUnpublishSinglePage(clients, opts.name);
        break;

      default:
        console.error(`❌ 未知操作: ${action}\n\n${USAGE}`);
        process.exit(1);
    }

    console.log(result);
  } catch (err) {
    if (err instanceof HaloError) {
      console.error(`❌ ${err.message}`);
    } else {
      console.error(`❌ 执行出错: ${err.message}`);
    }
    process.exit(1);
  }
}

main();
