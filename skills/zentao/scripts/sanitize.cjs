#!/usr/bin/env node

/**
 * 禅道输出脱敏工具
 * 
 * 隐藏：密码、Token、手机号、邮箱等敏感信息
 */

function sanitize(data) {
  if (!data) return data;

  // 字符串脱敏
  if (typeof data === 'string') {
    return data
      .replace(/(password|passwd|pwd)\s*[:=]\s*['"]?[^'"\s]+['"]?/gi, '$1: "[REDACTED]"')
      .replace(/token\s*[:=]\s*['"]?[a-zA-Z0-9]+['"]?/gi, 'token: "[REDACTED]"')
      .replace(/CHANDAO_PASSWORD\s*[:=]\s*['"]?[^'"\s]+['"]?/gi, 'CHANDAO_PASSWORD: "[REDACTED]"')
      .replace(/CHANDAO_ACCOUNT\s*[:=]\s*['"]?[^'"\s]+['"]?/gi, 'CHANDAO_ACCOUNT: "[REDACTED]"');
  }

  // 对象/数组递归脱敏
  if (typeof data === 'object') {
    const result = Array.isArray(data) ? [] : {};

    for (const key in data) {
      if (!data.hasOwnProperty(key)) continue;

      const lowerKey = key.toLowerCase();
      const sensitiveKeys = ['password', 'pwd', 'pass', 'token', 'secret', 'key', 'auth', 'authorization', 'cookie'];

      if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
        result[key] = '[REDACTED]';
      } else if (lowerKey === 'mobile' && typeof data[key] === 'string' && data[key].length >= 7) {
        // 手机号打码
        result[key] = data[key].slice(0, 3) + '****' + data[key].slice(-4);
      } else if (lowerKey === 'email' && typeof data[key] === 'string' && data[key].includes('@')) {
        // 邮箱打码
        const [user, domain] = data[key].split('@');
        result[key] = user.slice(0, 3) + '***@' + domain;
      } else {
        result[key] = sanitize(data[key]);
      }
    }

    return result;
  }

  return data;
}

module.exports = { sanitize };
