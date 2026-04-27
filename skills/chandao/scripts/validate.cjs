#!/usr/bin/env node

/**
 * 禅道参数校验层
 * 
 * 所有写操作共用此模块进行参数校验
 * 校验失败抛出中文友好提示
 */

// ========== 基础校验器 ==========

/**
 * 必填校验
 */
function required(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`[校验失败] ${fieldName} 不能为空`);
  }
  return value;
}

/**
 * 长度校验
 */
function length(value, fieldName, min, max) {
  // 可选字段：值为空时跳过校验
  if (value === undefined || value === null || value === '') return value;
  const str = String(value);
  if (min && str.length < min) {
    throw new Error(`[校验失败] ${fieldName} 长度不能少于 ${min} 个字符`);
  }
  if (max && str.length > max) {
    throw new Error(`[校验失败] ${fieldName} 长度不能超过 ${max} 个字符`);
  }
  return value;
}

/**
 * 邮箱格式校验
 */
function email(value, fieldName) {
  if (value === undefined || value === null || value === '') return value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new Error(`[校验失败] ${fieldName} 邮箱格式不正确: ${value}`);
  }
  return value;
}

/**
 * 日期格式校验（YYYY-MM-DD）
 */
function date(value, fieldName) {
  if (value === undefined || value === null || value === '') return value;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    throw new Error(`[校验失败] ${fieldName} 日期格式应为 YYYY-MM-DD: ${value}`);
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    throw new Error(`[校验失败] ${fieldName} 不是有效日期: ${value}`);
  }
  return value;
}

/**
 * 枚举值校验
 */
function enumVal(value, fieldName, allowedValues) {
  if (value === undefined || value === null || value === '') return value;
  if (!allowedValues.includes(value)) {
    throw new Error(`[校验失败] ${fieldName} 必须是以下值之一: ${allowedValues.join(', ')}，当前值: ${value}`);
  }
  return value;
}

/**
 * 数字范围校验
 */
function range(value, fieldName, min, max) {
  if (value === undefined || value === null || value === '') return value;
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`[校验失败] ${fieldName} 必须是数字: ${value}`);
  }
  if (min !== undefined && num < min) {
    throw new Error(`[校验失败] ${fieldName} 不能小于 ${min}`);
  }
  if (max !== undefined && num > max) {
    throw new Error(`[校验失败] ${fieldName} 不能大于 ${max}`);
  }
  return num;
}

/**
 * ID 格式校验（正整数）
 */
function id(value, fieldName) {
  required(value, fieldName);
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1) {
    throw new Error(`[校验失败] ${fieldName} 必须是正整数: ${value}`);
  }
  return num;
}

/**
 * 手机号格式校验（中国大陆）
 */
function mobile(value, fieldName) {
  if (value === undefined || value === null || value === '') return value;
  const mobileRegex = /^1[3-9]\d{9}$/;
  if (!mobileRegex.test(value)) {
    throw new Error(`[校验失败] ${fieldName} 手机号格式不正确: ${value}`);
  }
  return value;
}

/**
 * 账号格式校验（字母数字下划线，3-30 字符）
 */
function account(value, fieldName) {
  required(value, fieldName);
  const accountRegex = /^[a-zA-Z0-9_]{3,30}$/;
  if (!accountRegex.test(value)) {
    throw new Error(`[校验失败] ${fieldName} 格式不正确（字母/数字/下划线，3-30 字符）: ${value}`);
  }
  return value;
}

// ========== 批量校验 ==========

/**
 * 批量校验一组字段
 * @param {object} fields - 字段定义 { fieldName: { required, length, email, date, enum, range, id, mobile, account } }
 * @param {object} data - 实际数据
 */
function validate(fields, data) {
  const errors = [];

  for (const [fieldName, rules] of Object.entries(fields)) {
    const value = data[fieldName];

    try {
      if (rules.required) required(value, fieldName);
      if (rules.length) length(value, fieldName, rules.length.min, rules.length.max);
      if (rules.email) email(value, fieldName);
      if (rules.date) date(value, fieldName);
      if (rules.enum) enumVal(value, fieldName, rules.enum);
      if (rules.range) range(value, fieldName, rules.range.min, rules.range.max);
      if (rules.id) id(value, fieldName);
      if (rules.mobile) mobile(value, fieldName);
      if (rules.account) account(value, fieldName);
    } catch (err) {
      errors.push(err.message);
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
}

module.exports = {
  required,
  length,
  email,
  date,
  enum: enumVal,
  range,
  id,
  mobile,
  account,
  validate,
};
