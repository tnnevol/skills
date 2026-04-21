/**
 * auth.cjs — Token 获取、缓存、自动刷新
 * 
 * 核心逻辑：
 * - getToken() → 优先读缓存，无缓存则 POST /api/v2/users/login
 * - Token 缓存到本地文件（跨会话复用）
 * - 401 时自动清除缓存并重新登录
 */
const fs = require("fs");
const path = require("path");
const { loadEnv } = require("./env.cjs");

const TOKEN_CACHE_FILE = path.join(__dirname, ".token_cache.json");
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 小时默认有效期

function loadTokenCache() {
  try {
    if (fs.existsSync(TOKEN_CACHE_FILE)) {
      const raw = fs.readFileSync(TOKEN_CACHE_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch (e) {
    // 忽略读取错误
  }
  return null;
}

function saveTokenCache(token) {
  const cache = {
    token,
    createdAt: Date.now(),
  };
  fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache), "utf8");
}

function clearTokenCache() {
  try {
    if (fs.existsSync(TOKEN_CACHE_FILE)) {
      fs.unlinkSync(TOKEN_CACHE_FILE);
    }
  } catch (e) {
    // 忽略
  }
}

function isTokenExpired(cache) {
  if (!cache) return true;
  const age = Date.now() - cache.createdAt;
  return age > TOKEN_TTL_MS;
}

async function getToken(baseUrl) {
  // 1. 尝试读缓存
  const cache = loadTokenCache();
  if (cache && !isTokenExpired(cache)) {
    return cache.token;
  }

  // 2. 缓存过期或不存在，重新登录
  clearTokenCache();
  const env = loadEnv();
  if (env.error) {
    throw new Error(env.message);
  }

  const url = `${env.CHANDAO_URL}/api/v2/users/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      account: env.CHANDAO_ACCOUNT,
      password: env.CHANDAO_PASSWORD,
    }),
  });

  const data = await res.json();
  if (data.status !== "success") {
    throw new Error(`禅道登录失败: ${data.message || "未知错误"}`);
  }

  const token = data.token;
  saveTokenCache(token);
  return token;
}

// CLI 入口
if (require.main === module) {
  const action = process.argv[2];

  if (action === "login") {
    const env = loadEnv();
    if (env.error) {
      console.log(env.message);
      process.exit(1);
    }
    getToken(env.CHANDAO_URL)
      .then((token) => console.log("✅ Token 获取成功"))
      .catch((e) => {
        console.error(`❌ ${e.message}`);
        process.exit(1);
      });
  } else if (action === "clear") {
    clearTokenCache();
    console.log("✅ Token 缓存已清除");
  } else if (action === "status") {
    const cache = loadTokenCache();
    if (cache && !isTokenExpired(cache)) {
      const remaining = Math.round((TOKEN_TTL_MS - (Date.now() - cache.createdAt)) / 60000);
      console.log(`✅ Token 有效，剩余 ${remaining} 分钟`);
    } else {
      console.log("⏳ Token 不存在或已过期");
    }
  }
}

module.exports = { getToken, clearTokenCache };
