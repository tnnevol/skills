import { readFileSync, existsSync } from 'node:fs';
import {
  formatTime,
  buildPostLink,
  mapVisibility,
  makeSlug,
  generateName,
  generateTimestamp,
  paginationSummary,
} from './utils.mjs';
import { HaloError } from './client.mjs';

export async function actionList(clients, { page = 1, limit = 20, keyword } = {}) {
  const params = { page, size: limit };
  // Note: Halo Extension API ignores keyword param, so we filter client-side
  const res = await clients.ext.get('/posts', params);
  let items = res.items || [];
  const total = res.total || 0;

  if (keyword) {
    const kw = keyword.toLowerCase();
    items = items.filter((item) => {
      const spec = item.spec || {};
      const meta = item.metadata || {};
      return (
        (spec.title || '').toLowerCase().includes(kw) ||
        (meta.name || '').toLowerCase().includes(kw) ||
        (spec.slug || '').toLowerCase().includes(kw)
      );
    });
  }

  if (items.length === 0) {
    if (keyword) {
      return `📭 没有找到包含 "${keyword}" 的文章`;
    }
    return '📭 没有找到文章，使用 /halo create 创建第一篇';
  }

  const lines = items.map((item) => {
    const meta = item.metadata || {};
    const spec = item.spec || {};
    const status = item.status || {};
    const slug = spec.slug || meta.name || '-';
    const link = buildPostLink(clients.ext.baseUrl, slug);
    return (
      `${spec.title || '-'}\n` +
      `  名称: ${meta.name}\n` +
      `  状态: ${status.phase === 'DRAFT' ? '草稿' : '已发布'}\n` +
      `  可见性: ${mapVisibility(spec.visible || 'PRIVATE')}\n` +
      `  阅读量: ${spec?.visitCount || 0}\n` +
      `  链接: ${link}\n` +
      `  时间: ${formatTime(meta.creationTimestamp)}`
    );
  });

  const displayTotal = keyword ? items.length : total;
  const summary = paginationSummary(displayTotal, page, limit);
  return `${summary}\n\n${lines.join('\n\n')}`;
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
    `标题: ${spec.title || '-'}\n` +
    `名称: ${meta.name}\n` +
    `可见性: ${mapVisibility(spec.visible || 'PRIVATE')}\n` +
    `发布时间: ${spec.publishTime ? formatTime(spec.publishTime) : '未发布'}\n` +
    `链接: ${link}`
  );
}

export async function actionCreate(clients, { title, content, contentFile, slug, publish, public: isPublic }) {
  if (!title) throw new HaloError('请提供文章标题 (--title)');

  let bodyContent = content || '';
  if (contentFile) {
    if (!existsSync(contentFile)) {
      throw new HaloError(`文件不存在: ${contentFile}`);
    }
    bodyContent = readFileSync(contentFile, 'utf-8');
  }

  if (!bodyContent.trim()) {
    throw new HaloError('请提供文章内容 (--content 或 --content-file)');
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
        visible: isPublic ? 'PUBLIC' : 'PRIVATE',
        pinned: false,
        allowComment: true,
        deleted: false,
        excerpt: { raw: '', autoGenerate: true },
        priority: 0,
        publish: !!publish,
      },
      apiVersion: 'content.halo.run/v1alpha1',
      kind: 'Post',
    },
    content: {
      raw: bodyContent,
      rawType: 'HTML',
    },
  };

  const res = await clients.console.post('/posts', payload);

  const createdName = res?.metadata?.name || res?.post?.metadata?.name || name;
  const link = buildPostLink(clients.ext.baseUrl, resolvedSlug);

  let resultMsg = `✅ 文章创建成功\n标题: ${title}\n名称: ${createdName}\n链接: ${link}`;

  if (publish) {
    await clients.console.put(`/posts/${createdName}/publish`, {});
    resultMsg += '\n状态: 已发布';
  } else {
    resultMsg += '\n状态: 草稿';
  }

  return resultMsg;
}

export async function actionUpdate(clients, name, { title, content, contentFile, slug: newSlug, visible, cover, pinned }) {
  if (!name) throw new HaloError('请提供文章名称');

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

  const updatedPost = JSON.parse(JSON.stringify(currentPost));
  const updatedSpec = updatedPost.spec || {};
  if (!updatedPost.metadata) updatedPost.metadata = {};

  if (title) {
    changes.push(`标题: ${spec.title || '(空)'} → ${title}`);
    updatedSpec.title = title;
  }
  if (newSlug) {
    changes.push(`slug: ${updatedSpec.slug || '(空)'} → ${newSlug}`);
    updatedSpec.slug = newSlug;
  }
  if (visible) {
    const oldVis = mapVisibility(spec.visible || 'PRIVATE');
    updatedSpec.visible = visible;
    changes.push(`可见性: ${oldVis} → ${mapVisibility(visible)}`);
  }
  if (pinned !== undefined) {
    updatedSpec.pinned = pinned;
    changes.push(`置顶: ${pinned ? '是' : '否'}`);
  }
  if (cover !== undefined) {
    updatedSpec.cover = Array.isArray(cover) ? cover : [cover];
    changes.push('封面已更新');
  }

  let newVersion = meta.version || 1;

  if (content || contentFile) {
    let bodyContent = content || '';
    if (contentFile) {
      if (!existsSync(contentFile)) {
        throw new HaloError(`文件不存在: ${contentFile}`);
      }
      bodyContent = readFileSync(contentFile, 'utf-8');
    }
    if (!bodyContent.trim()) {
      throw new HaloError('文章内容为空');
    }

    const contentPayload = {
      raw: bodyContent,
      rawType: 'HTML',
    };

    try {
      await clients.console.put(`/posts/${name}/content`, contentPayload);
      changes.push('内容已更新');
    } catch (err) {
      if (err.status === 409) {
        currentPost = await clients.ext.get(`/posts/${name}`);
        newVersion = currentPost?.metadata?.version || newVersion;
        await clients.console.put(`/posts/${name}/content`, contentPayload);
        changes.push('内容已更新（重试冲突）');
      } else {
        throw err;
      }
    }

    currentPost = await clients.ext.get(`/posts/${name}`);
    newVersion = currentPost?.metadata?.version || newVersion;
  }

  if (Object.keys(updatedSpec).length > 0 || Object.keys(updatedPost.metadata).length > 0) {
    updatedSpec.slug = updatedSpec.slug || '';

    updatedPost.metadata.version = newVersion;

    try {
      await clients.ext.put(`/posts/${name}`, updatedPost);
    } catch (err) {
      if (err.status === 409) {
        const latest = await clients.ext.get(`/posts/${name}`);
        latest.spec = { ...latest.spec, ...updatedSpec };
        latest.metadata.version = latest.metadata?.version || 1;
        await clients.ext.put(`/posts/${name}`, latest);
        changes.push('元数据已更新（重试冲突）');
      } else {
        throw err;
      }
    }
  }

  const slug = updatedSpec.slug || spec.slug || '';
  const link = buildPostLink(clients.ext.baseUrl, slug);
  const summary = changes.length > 0 ? `变更:\n  ${changes.join('\n  ')}` : '无变更';

  return `✅ 文章更新成功\n标题: ${title || spec.title}\n链接: ${link}\n${summary}`;
}

export async function actionDelete(clients, name) {
  if (!name) throw new HaloError('请提供文章名称');

  let post;
  try {
    post = await clients.ext.get(`/posts/${name}`);
  } catch (err) {
    if (err.status === 404) throw new HaloError(`文章不存在: ${name}`);
    throw err;
  }

  const title = post?.spec?.title || name;
  await clients.ext.delete(`/posts/${name}`);

  return `🗑️ 文章已删除: ${title}`;
}

export async function actionPublish(clients, name) {
  if (!name) throw new HaloError('请提供文章名称');

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
  if (!name) throw new HaloError('请提供文章名称');

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
