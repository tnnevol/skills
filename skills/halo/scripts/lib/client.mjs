const EXTENSION_API = '/apis/content.halo.run/v1alpha1';
const CONSOLE_API = '/apis/api.console.halo.run/v1alpha1';

export class HaloError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'HaloError';
    this.status = status;
  }
}

function formatError(status, body) {
  if (status === 401) return '认证失败，请检查 HALO_PAT 是否正确';
  if (status === 403) return '无操作权限';
  if (status === 404) return '资源不存在';
  if (status === 409) return '资源版本冲突（乐观锁），已自动重试';
  if (status >= 500) return `服务器异常 (${status})，请稍后重试`;
  const msg = body?.message || body?.detail || body;
  return msg || `请求失败 (${status})`;
}

async function request(baseUrl, pat, method, path, body) {
  const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;

  const headers = {
    Authorization: `Bearer ${pat}`,
  };

  if (body !== undefined && method !== 'GET' && method !== 'DELETE') {
    headers['Content-Type'] = 'application/json';
  }

  const init = {
    method: method.toUpperCase(),
    headers,
  };

  if (body !== undefined && method !== 'GET' && method !== 'DELETE') {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, init);
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      throw new HaloError(`无法连接到 Halo 实例 (${baseUrl})，请确认服务是否运行`);
    }
    throw new HaloError(`网络请求失败: ${err.message}`);
  }

  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new HaloError(formatError(response.status, data), response.status);
  }

  return data;
}

export class ExtensionClient {
  constructor(baseUrl, pat) {
    this.baseUrl = baseUrl;
    this.pat = pat;
    this.basePath = EXTENSION_API;
  }

  get(path, params) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(this.baseUrl, this.pat, 'GET', `${this.basePath}${path}${qs}`);
  }

  post(path, body) {
    return request(this.baseUrl, this.pat, 'POST', `${this.basePath}${path}`, body);
  }

  put(path, body) {
    return request(this.baseUrl, this.pat, 'PUT', `${this.basePath}${path}`, body);
  }

  patch(path, body) {
    return request(this.baseUrl, this.pat, 'PATCH', `${this.basePath}${path}`, body);
  }

  delete(path) {
    return request(this.baseUrl, this.pat, 'DELETE', `${this.basePath}${path}`);
  }
}

export class ConsoleClient {
  constructor(baseUrl, pat) {
    this.baseUrl = baseUrl;
    this.pat = pat;
    this.basePath = CONSOLE_API;
  }

  get(path, params) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(this.baseUrl, this.pat, 'GET', `${this.basePath}${path}${qs}`);
  }

  post(path, body) {
    return request(this.baseUrl, this.pat, 'POST', `${this.basePath}${path}`, body);
  }

  put(path, body) {
    return request(this.baseUrl, this.pat, 'PUT', `${this.basePath}${path}`, body);
  }

  patch(path, body) {
    return request(this.baseUrl, this.pat, 'PATCH', `${this.basePath}${path}`, body);
  }

  delete(path) {
    return request(this.baseUrl, this.pat, 'DELETE', `${this.basePath}${path}`);
  }
}

export function createClients(config) {
  return {
    ext: new ExtensionClient(config.baseUrl, config.pat),
    console: new ConsoleClient(config.baseUrl, config.pat),
  };
}
