#!/usr/bin/env node

/**
 * 禅道环境变量加载与校验
 * 
 * 加载优先级：
 *   1. 进程环境变量（最高）
 *   2. skill 目录下的 .env 文件
 * 
 * 必须变量：CHANDAO_URL、CHANDAO_ACCOUNT、CHANDAO_PASSWORD
 * 可选变量：CHANDAO_TIMEOUT（请求超时，默认 30000ms）
 */

const fs = require('fs');
const path = require('path');

// ========== 常量定义 ==========

/** API 路径前缀（v2 RESTful） */
const API_PATH_PREFIX = '/api.php/v2';

/** 默认请求超时（ms），可通过 CHANDAO_TIMEOUT 环境变量覆盖 */
const DEFAULT_TIMEOUT = 30000;

// .env 文件缓存（进程生命周期只读一次）
let cachedEnvFile = null;

/**
 * 从 skill 目录读取 .env 文件（结果缓存）
 */
function loadEnvFile() {
  if (cachedEnvFile !== null) return cachedEnvFile;

  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    cachedEnvFile = {};
    return cachedEnvFile;
  }

  const config = {};
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
    config[key] = value;
  }
  cachedEnvFile = config;
  return cachedEnvFile;
}

/**
 * 获取配置
 * @param {string} key - 环境变量名
 * @returns {string|undefined}
 */
function getConfig(key) {
  // 进程环境变量优先，其次 .env 文件
  const envFileConfig = loadEnvFile();
  return process.env[key] || envFileConfig[key];
}

/**
 * 获取并校验必须的环境变量
 * 缺失任一变量时直接退出
 */
function loadRequired() {
  const url = getConfig('CHANDAO_URL');
  const account = getConfig('CHANDAO_ACCOUNT');
  const password = getConfig('CHANDAO_PASSWORD');

  const missing = [];
  if (!url) missing.push('CHANDAO_URL');
  if (!account) missing.push('CHANDAO_ACCOUNT');
  if (!password) missing.push('CHANDAO_PASSWORD');

  if (missing.length > 0) {
    console.error(`[CONFIG_MISSING] 缺少必须的环境变量: ${missing.join(', ')}`);
    console.error('请设置环境变量或在 .env 文件中配置');
    process.exit(1);
  }

  return {
    baseUrl: url.replace(/\/+$/, ''),  // 去除末尾斜杠
    account,
    password,
  };
}

/**
 * 获取请求超时时间（环境变量可覆盖）
 * @returns {number}
 */
function getTimeout() {
  const envTimeout = getConfig('CHANDAO_TIMEOUT');
  if (envTimeout) {
    const n = parseInt(envTimeout, 10);
    if (!isNaN(n) && n > 0) return n;
  }
  return DEFAULT_TIMEOUT;
}

module.exports = { getConfig, loadRequired, loadEnvFile, API_PATH_PREFIX, DEFAULT_TIMEOUT, getTimeout };
