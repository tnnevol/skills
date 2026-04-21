/**
 * 环境变量加载 & 校验
 * 从环境变量或 .env 文件读取禅道配置
 */
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const env = {};

  // 优先使用环境变量
  env.CHANDAO_URL = process.env.CHANDAO_URL;
  env.CHANDAO_ACCOUNT = process.env.CHANDAO_ACCOUNT;
  env.CHANDAO_PASSWORD = process.env.CHANDAO_PASSWORD;

  // 如果环境变量没有，尝试从 .env 文件读取
  if (!env.CHANDAO_URL || !env.CHANDAO_ACCOUNT || !env.CHANDAO_PASSWORD) {
    const envPath = path.join(__dirname, "..", ".env");
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, "utf8").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        if (key) env[key] = value;
      }
    }
  }

  // 校验必填字段
  const missing = [];
  if (!env.CHANDAO_URL) missing.push("CHANDAO_URL");
  if (!env.CHANDAO_ACCOUNT) missing.push("CHANDAO_ACCOUNT");
  if (!env.CHANDAO_PASSWORD) missing.push("CHANDAO_PASSWORD");

  if (missing.length > 0) {
    return {
      error: true,
      message: `[CONFIG_MISSING] 缺少环境变量: ${missing.join(", ")}\n请设置环境变量或创建 .env 文件`,
    };
  }

  // 规范化 URL（去掉尾部斜杠）
  env.CHANDAO_URL = env.CHANDAO_URL.replace(/\/+$/, "");

  return { ...env, error: false };
}

module.exports = { loadEnv };
