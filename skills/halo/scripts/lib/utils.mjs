const VISIBLE_MAP = {
  PUBLIC: '公开',
  PRIVATE: '私密',
  DRAFT: '草稿',
};

export function makeSlug(title) {
  if (!title) return 'post';

  // Keep CJK characters, Latin letters, and digits; replace others with dashes
  let result = '';
  for (const char of title) {
    if (/[一-鿿㐀-䶿a-zA-Z0-9]/.test(char)) {
      result += char;
    } else if (/[一-龥]/.test(char)) {
      result += char;
    } else {
      result += '-';
    }
  }

  result = result
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return result || 'post';
}

export function formatTime(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function buildPostLink(baseUrl, slug) {
  return `${baseUrl}/archives/${encodeURIComponent(slug)}`;
}

export function mapVisibility(value) {
  return VISIBLE_MAP[value] || value;
}

export function generateName(slug, timestamp) {
  return `${slug}-${timestamp}`;
}

export function generateTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export function paginationSummary(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  let msg = `共 ${total} 篇`;
  if (totalPages > 1) {
    msg += `，第 ${page} 页 / 共 ${totalPages} 页`;
    if (page < totalPages) {
      msg += `（使用 --page=${page + 1} 查看下一页）`;
    }
  }
  return msg;
}

export function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
