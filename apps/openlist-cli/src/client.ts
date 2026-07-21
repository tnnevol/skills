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

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (this.token) {
      requestHeaders["Authorization"] = this.token;
    }

    try {
      const response = await undiciRequest(url, {
        method: method.toUpperCase(),
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
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
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", path, body);
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
