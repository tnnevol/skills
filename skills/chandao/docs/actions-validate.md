# Validate Layer — 参数校验

## 校验器概览

所有写操作（创建/更新/删除）都通过 `validate.cjs` 模块进行参数校验。
校验失败时抛出中文友好提示，方便用户快速修正。

## 基础校验器

### `required(value, fieldName)`

**用途：** 必填校验  
**示例：** `required(id, '任务 ID')`

```javascript
function required(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`[校验失败] ${fieldName} 不能为空`);
  }
  return value;
}
```

---

### `length(value, fieldName, min, max)`

**用途：** 字符串长度校验  
**示例：** `length(name, '任务名称', 2, 50)`

```javascript
function length(value, fieldName, min, max) {
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
```

---

### `email(value, fieldName)`

**用途：** 邮箱格式校验  
**示例：** `email(email, '邮箱')`

```javascript
function email(value, fieldName) {
  if (value === undefined || value === null || value === '') return value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new Error(`[校验失败] ${fieldName} 邮箱格式不正确: ${value}`);
  }
  return value;
}
```

---

### `date(value, fieldName)`

**用途：** 日期格式校验（YYYY-MM-DD）  
**示例：** `date(deadline, '截止日期')`

```javascript
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
```

---

### `enumVal(value, fieldName, allowedValues)`

**用途：** 枚举值校验  
**示例：** `enumVal(type, '类型', ['devel', 'test', 'design'])`

```javascript
function enumVal(value, fieldName, allowedValues) {
  if (value === undefined || value === null || value === '') return value;
  if (!allowedValues.includes(value)) {
    throw new Error(`[校验失败] ${fieldName} 必须是以下值之一: ${allowedValues.join(', ')}，当前值: ${value}`);
  }
  return value;
}
```

---

### `range(value, fieldName, min, max)`

**用途：** 数字范围校验  
**示例：** `range(priority, '优先级', 1, 4)`

```javascript
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
```

---

### `id(value, fieldName)`

**用途：** ID 格式校验（正整数）  
**示例：** `id(taskId, '任务 ID')`

```javascript
function id(value, fieldName) {
  required(value, fieldName);
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    throw new Error(`[校验失败] ${fieldName} 必须是正整数: ${value}`);
  }
  return num;
}
```

---

## 批量校验

使用 `validate()` 函数统一校验多个字段：

```javascript
const { validate, required, length, enum: enumVal } = require('./validate.cjs');

validate({
  name: { validator: required, args: ['任务名称'] },
  type: { validator: enumVal, args: ['任务类型', ['devel', 'test', 'design']] },
  estimate: { validator: range, args: ['预计工时', 0, 999] }
});
```

**校验失败示例：**
```
Error: [校验失败] 任务名称 不能为空
```
