import type { ApiResponse } from "./client.js";

let prettyMode = false;

export function setPretty(pretty: boolean): void {
  prettyMode = pretty;
}

export function printResult(data: unknown): void {
  if (prettyMode) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(JSON.stringify(data));
  }
}

export function printSuccess(data: unknown, operation?: string): void {
  const result: Record<string, unknown> = {
    success: true,
  };

  if (operation) {
    result.operation = operation;
  }

  result.data = data;
  printResult(result);
}

export function printError(message: string, code?: number): void {
  const result: Record<string, unknown> = {
    success: false,
    message,
  };

  if (code !== undefined) {
    result.code = code;
  }

  console.error(JSON.stringify(result));
  process.exit(code ?? 1);
}

export function handleApiResponse<T>(
  response: ApiResponse<T>,
  operation?: string,
): void {
  if (response.code === 200) {
    printSuccess(response.data, operation);
  } else {
    printError(response.message || "Unknown error", response.code);
  }
}

// 列表接口响应形如 { content, total }。当返回体带有数值型 total 时，
// 依据请求的 page/perPage 计算总页数，并在输出中附带 pagination 信息。
export function handlePagedResponse<T>(
  response: ApiResponse<T>,
  operation: string,
  paging: { page: number; perPage: number },
): void {
  if (response.code !== 200) {
    printError(response.message || "Unknown error", response.code);
    return;
  }

  const result: Record<string, unknown> = {
    success: true,
    operation,
    data: response.data,
  };

  const data = response.data as { total?: unknown } | null | undefined;
  if (data && typeof data.total === "number") {
    const { page, perPage } = paging;
    result.pagination = {
      page,
      perPage,
      total: data.total,
      totalPages: perPage > 0 ? Math.ceil(data.total / perPage) : 0,
    };
  }

  printResult(result);
}
