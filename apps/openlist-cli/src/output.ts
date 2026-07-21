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
