import { request as undiciRequest } from "undici";
import type { OpenListConfig } from "./config.js";

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

export class OpenListClient {
  private baseUrl: string;
  private token: string;

  constructor(config: OpenListConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.token = config.token;
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;

    // 二进制 body（文件上传）：不做 JSON 序列化，也不强制 json Content-Type
    const isRaw = Buffer.isBuffer(body) || body instanceof Uint8Array;

    const requestHeaders: Record<string, string> = {
      ...(isRaw ? {} : { "Content-Type": "application/json" }),
      ...headers,
    };

    if (this.token) {
      requestHeaders["Authorization"] = this.token;
    }

    try {
      const response = await undiciRequest(url, {
        method: method.toUpperCase(),
        headers: requestHeaders,
        body:
          body === undefined || body === null
            ? undefined
            : isRaw
              ? (body as Buffer)
              : JSON.stringify(body),
      });

      const responseBody = (await response.body.json()) as ApiResponse<T>;
      return responseBody;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`请求失败: ${error.message}`);
      }
      throw new Error("请求失败: 未知错误");
    }
  }

  async get<T = unknown>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>("GET", path);
  }

  async post<T = unknown>(
    path: string,
    body?: unknown,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("POST", path, body);
  }

  async put<T = unknown>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", path, body, headers);
  }

  async delete<T = unknown>(
    path: string,
    body?: unknown,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", path, body);
  }
}

export function createClient(config: OpenListConfig): OpenListClient {
  return new OpenListClient(config);
}
