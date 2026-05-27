#!/usr/bin/env node

import { loadConfig } from './lib/config.mjs';
import { createClients, HaloError } from './lib/client.mjs';
import {
  actionList,
  actionGet,
  actionCreate,
  actionUpdate,
  actionDelete,
  actionPublish,
  actionUnpublish,
} from './lib/actions.mjs';

function parseArgs(argv) {
  const args = argv.slice(2);
  const action = args[0];
  const name = args[1] && !args[1].startsWith('--') ? args[1] : null;

  const opts = { name };

  for (let i = name ? 2 : 1; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--')) continue;

    const eqIdx = arg.indexOf('=');
    if (eqIdx === -1) {
      const key = arg.slice(2);
      opts[key] = true;
    } else {
      const key = arg.slice(2, eqIdx);
      const value = arg.slice(eqIdx + 1);
      if (key === 'page' || key === 'limit') {
        opts[key] = parseInt(value, 10);
      } else if (key === 'public') {
        opts.public = value === 'true' || value === '';
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
  --keyword=    搜索关键词 (list)
  --limit=N     每页数量，默认 20 (list)
  --page=N      页码，从 1 开始 (list)
  --dry-run     预览操作，不实际执行`;

async function main() {
  const { action, opts } = parseArgs(process.argv);

  if (!action || action === 'help' || action === '--help' || action === '-h') {
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
      case 'list':
        result = await actionList(clients, {
          page: opts.page || 1,
          limit: opts.limit || 20,
          keyword: opts.keyword,
        });
        break;

      case 'get':
        if (!opts.name) {
          throw new HaloError('请提供文章名称，用法: halo get <name>');
        }
        result = await actionGet(clients, opts.name);
        break;

      case 'create':
        result = await actionCreate(clients, {
          title: opts.title,
          content: opts.content,
          contentFile: opts['content-file'],
          slug: opts.slug,
          publish: opts.publish,
          public: opts.public,
        });
        break;

      case 'update':
        if (!opts.name) {
          throw new HaloError('请提供文章名称，用法: halo update <name>');
        }
        result = await actionUpdate(clients, opts.name, {
          title: opts.title,
          content: opts.content,
          contentFile: opts['content-file'],
          slug: opts.slug,
          visible: opts.visible,
          cover: opts.cover,
          pinned: opts.pinned === 'true',
        });
        break;

      case 'delete':
        if (!opts.name) {
          throw new HaloError('请提供文章名称，用法: halo delete <name>');
        }
        result = await actionDelete(clients, opts.name);
        break;

      case 'publish':
        if (!opts.name) {
          throw new HaloError('请提供文章名称，用法: halo publish <name>');
        }
        result = await actionPublish(clients, opts.name);
        break;

      case 'unpublish':
        if (!opts.name) {
          throw new HaloError('请提供文章名称，用法: halo unpublish <name>');
        }
        result = await actionUnpublish(clients, opts.name);
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
