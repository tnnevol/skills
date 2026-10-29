/** 资源名（name）与短 ID 互转，Memos 的资源名为 `memos/{id}`、`users/{username}`、`attachments/{id}` 等。 */

export function normalizeName(kind: string, rawId: string): string {
  const value = rawId.trim()
  return value.includes('/') ? value : `${kind}/${value}`
}

/** 取出 `memos/abc/shares/xyz` 这类多段名的最后一段。 */
export function shortId(name: string): string {
  return name.includes('/') ? name.split('/').filter(Boolean).pop() || name : name
}

export const normalizeMemoName = (rawId: string): string => normalizeName('memos', rawId)
export const normalizeUserName = (rawId: string): string => normalizeName('users', rawId)
export const normalizeAttachmentName = (rawId: string): string => normalizeName('attachments', rawId)
export const normalizeSpaceName = (rawId: string): string => normalizeName('spaces', rawId)

/**
 * 构造 CEL 标签过滤表达式。
 * 服务端语法是 `"tag" in tags`（`tags == ["tag"]` 会报 unsupported value expression）。
 */
const LEADING_HASH_RE = /^#/

export function tagFilterExpr(tag: string): string {
  const name = tag.trim().replace(LEADING_HASH_RE, '')
  if (!name) {
    throw new Error('标签不能为空')
  }
  if (name.includes('"') || name.includes('\\')) {
    throw new Error('标签不能包含双引号或反斜杠')
  }
  return `"${name}" in tags`
}
