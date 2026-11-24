const DISPOSITION_FILENAME_RE = /filename\*?=(?:UTF-8''|")?([^";]+)/i
const FILENAME_EXT_RE = /\.([a-z0-9]{1,8})$/i

const MIME_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'text/plain': 'txt',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
}

export function extensionFor(contentType?: string, disposition?: string): string {
  const filename = disposition?.match(DISPOSITION_FILENAME_RE)?.[1]
  if (filename) {
    try {
      const ext = decodeURIComponent(filename).match(FILENAME_EXT_RE)?.[1]
      if (ext)
        return ext.toLowerCase()
    }
    catch {}
  }
  const mime = contentType?.split(';')[0]?.trim().toLowerCase() ?? ''
  return MIME_EXT[mime] ?? 'bin'
}
