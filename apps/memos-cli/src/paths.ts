/**
 * 附件在服务端的访问路径。
 *
 * 资源名形如 `attachments/xxx`，本身已带 `attachments/` 前缀，
 * 拼接时**不能再补一层**，否则会得到 `/file/attachments/attachments/xxx/a.png` 这种 404 路径。
 */
export interface AttachmentPaths {
  /** 绝对地址（`{baseUrl}/file/attachments/xxx/a.png`）：用于站外下载、分享 */
  permanentPath: string
  /**
   * 相对地址（`/file/attachments/xxx/a.png`）：**写进笔记正文用这个**。
   *
   * 实例未配置 `instanceUrl` 时，服务端会拒收指向自己的绝对地址
   * （`absolute managed attachment image URLs require a configured instance URL`）。
   */
  relativePath: string
}

const TRAILING_SLASHES = /\/+$/

/** 去掉 baseUrl 末尾多余的斜杠，避免拼出 `//file/...`。 */
function trimTrailingSlashes(value: string): string {
  return value.replace(TRAILING_SLASHES, '')
}

export function buildAttachmentPaths(
  origin: string,
  attachmentName: string,
  filename: string,
): AttachmentPaths {
  const relativePath = `/file/${attachmentName}/${filename}`
  return {
    permanentPath: `${trimTrailingSlashes(origin)}${relativePath}`,
    relativePath,
  }
}
