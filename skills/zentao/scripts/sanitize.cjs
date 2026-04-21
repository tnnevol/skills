/**
 * sanitize.cjs — 敏感信息脱敏
 * 
 * 脱敏规则：
 * - password → ***
 * - mobile → 138****5678（保留前3后4）
 * - email → tes***@test.com（保留前3字符，@前加***）
 * - phone → 同上处理
 * - token → ***
 */

// 邮箱脱敏：保留前3个字符 + *** + @之后
function maskEmail(email) {
  if (!email) return "";
  const atIndex = email.indexOf("@");
  if (atIndex === -1) return "***";
  const prefix = email.substring(0, Math.min(atIndex, 3));
  const suffix = email.substring(atIndex);
  return prefix + "***" + suffix;
}

// 手机号脱敏：保留前3后4
function maskPhone(phone) {
  if (!phone || typeof phone !== "string") return "***";
  if (phone.length <= 7) return "***";
  return phone.substring(0, 3) + "****" + phone.substring(phone.length - 4);
}

// 密码/Token 脱敏
function maskSecret(value) {
  if (!value) return "***";
  return "***";
}

// 递归脱敏对象
function sanitize(data, path = "") {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  const sensitiveKeys = ["password", "token", "resetToken"];
  const phoneKeys = ["mobile", "phone"];
  const emailKeys = ["email"];

  if (Array.isArray(data)) {
    return data.map((item) => sanitize(item, path));
  }

  const result = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    if (sensitiveKeys.includes(lowerKey)) {
      result[key] = maskSecret(value);
    } else if (phoneKeys.includes(lowerKey)) {
      result[key] = maskPhone(value);
    } else if (emailKeys.includes(lowerKey)) {
      result[key] = maskEmail(value);
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitize(value, `${path}.${key}`);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// CLI 入口
if (require.main === module) {
  const action = process.argv[2];
  if (action === "test") {
    // 自测
    const testCases = [
      { input: "13812345678", expect: "138****5678", fn: maskPhone },
      { input: "test@example.com", expect: "tes***@example.com", fn: maskEmail },
      { input: "secret123", expect: "***", fn: maskSecret },
      { input: "", expect: "***", fn: maskSecret },
      { input: null, expect: "***", fn: maskSecret },
    ];
    let pass = 0;
    for (const tc of testCases) {
      const result = tc.fn(tc.input);
      if (result === tc.expect) pass++;
      else console.log(`❌ ${tc.fn.name}("${tc.input}") → "${result}" (期望 "${tc.expect}")`);
    }
    console.log(`✅ sanitize self-test: ${pass}/${testCases.length} passed`);
    process.exit(pass === testCases.length ? 0 : 1);
  }
}

module.exports = { sanitize, maskEmail, maskPhone, maskSecret };
