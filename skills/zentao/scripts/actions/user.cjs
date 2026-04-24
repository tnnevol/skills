#!/usr/bin/env node

/**
 * actions/user.cjs — 用户管理写操作
 * 
 * 依赖：
 *   - api.cjs（post/put/del + dry-run）
 *   - validate.cjs（参数校验）
 *   - query.cjs（用户列表/详情查询）
 */

const { post, put, del, sanitize } = require('../api.cjs');
const { validate, required, length, email, account, enum: enumVal, id } = require('../validate.cjs');
const { getUser } = require('./query.cjs');

// ========== 用户角色枚举 ==========

const USER_ROLES = ['admin', 'dev', 'test', 'pm', 'qm', 'td', 'pd', 'top'];

// ========== 创建用户 ==========

/**
 * 创建用户
 * POST /api.php/v2/users
 */
async function createUser(params) {
  // 参数校验
  validate({
    account: { required: true, account: true },
    realname: { required: true, length: { min: 2, max: 30 } },
    password: { required: true, length: { min: 6, max: 20 } },
    email: { required: true, email: true },
    department: { length: { max: 100 } },
    role: { enum: USER_ROLES },
  }, params);

  const body = {
    account: params.account,
    realname: params.realname,
    password: params.password,
    email: params.email,
  };
  if (params.department) body.department = params.department;
  if (params.role) body.role = params.role;

  const res = await post('/users', body, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    // 账号/邮箱冲突友好提示
    if (res.httpStatus === 409 || (res.detail && res.detail.message && (res.detail.message.includes('account') || res.detail.message.includes('email')))) {
      throw new Error(`[创建失败] 账号或邮箱已存在: ${res.error}`);
    }
    throw new Error(`[创建失败] ${res.error}`);
  }

  console.log(`✅ 用户创建成功: ${params.account}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 更新用户 ==========

/**
 * 更新用户
 * PUT /api.php/v2/users/<id>
 */
async function updateUser(userId, params) {
  // 参数校验
  id(userId, '用户 ID');

  // 至少提供一个更新字段
  const updateFields = {};
  if (params.realname) updateFields.realname = params.realname;
  if (params.email) updateFields.email = params.email;
  if (params.department) updateFields.department = params.department;
  if (params.role) updateFields.role = params.role;

  if (Object.keys(updateFields).length === 0) {
    throw new Error('[更新失败] 至少提供一个更新字段: --realname / --email / --department / --role');
  }

  // 校验更新字段
  if (updateFields.realname) {
    length(updateFields.realname, '姓名', 2, 30);
  }
  if (updateFields.email) {
    email(updateFields.email, '邮箱');
  }
  if (updateFields.role) {
    enumVal(updateFields.role, '角色', USER_ROLES);
  }

  const res = await put(`/users/${userId}`, updateFields, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[更新失败] ${res.error}`);
  }

  console.log(`✅ 用户更新成功: ${userId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 删除用户 ==========

/**
 * 删除用户
 * DELETE /api.php/v2/users/<id>
 */
async function deleteUser(userId, params) {
  // 参数校验
  id(userId, '用户 ID');

  // 管理员不可删除（硬编码保护）
  if (userId === '1' || userId === 'admin') {
    throw new Error('[删除失败] 管理员账号不可删除');
  }

  const res = await del(`/users/${userId}`, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[删除失败] ${res.error}`);
  }

  console.log(`✅ 用户删除成功: ${userId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 激活用户 ==========

/**
 * 激活用户
 * PUT /api.php/v2/users/<id>/activate
 */
async function activateUser(userId, params) {
  id(userId, '用户 ID');

  const res = await put(`/users/${userId}/activate`, {}, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[激活失败] ${res.error}`);
  }

  console.log(`✅ 用户激活成功: ${userId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 解锁用户 ==========

/**
 * 解锁用户
 * PUT /api.php/v2/users/<id>/unlock
 */
async function unlockUser(userId, params) {
  id(userId, '用户 ID');

  const res = await put(`/users/${userId}/unlock`, {}, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[解锁失败] ${res.error}`);
  }

  console.log(`✅ 用户解锁成功: ${userId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 重置密码 ==========

/**
 * 重置密码
 * PUT /api.php/v2/users/<id>/password
 */
async function resetPassword(userId, params) {
  id(userId, '用户 ID');

  if (!params.password && !params.random) {
    throw new Error('[重置失败] 请提供新密码 --password=xxx 或 --random 生成随机密码');
  }

  const body = {};
  if (params.password) {
    length(params.password, '密码', 6, 20);
    body.password = params.password;
  }
  if (params.random) {
    body.random = true;
  }

  const res = await put(`/users/${userId}/password`, body, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[重置失败] ${res.error}`);
  }

  console.log(`✅ 密码重置成功: ${userId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== CLI 入口 ==========

if (require.main === module) {
  const action = process.argv[2];
  const arg1 = process.argv[3];

  function parseParams(args) {
    const params = {};
    for (const a of args) {
      if (a.startsWith('--')) {
        const [key, ...valueParts] = a.slice(2).split('=');
        const value = valueParts.length ? valueParts.join('=') : true;
        params[key] = value;
      }
    }
    return params;
  }

  async function run() {
    const params = parseParams(process.argv.slice(4));

    switch (action) {
      case 'create-user':
        await createUser(params);
        break;
      case 'update-user':
        if (!arg1) {
          console.error('用法: user.cjs update-user <id> [--realname=xxx] [--email=xxx] [--department=xxx] [--role=xxx]');
          process.exit(1);
        }
        await updateUser(arg1, params);
        break;
      case 'delete-user':
        if (!arg1) {
          console.error('用法: user.cjs delete-user <id>');
          process.exit(1);
        }
        await deleteUser(arg1, params);
        break;
      case 'activate-user':
        if (!arg1) {
          console.error('用法: user.cjs activate-user <id>');
          process.exit(1);
        }
        await activateUser(arg1, params);
        break;
      case 'unlock-user':
        if (!arg1) {
          console.error('用法: user.cjs unlock-user <id>');
          process.exit(1);
        }
        await unlockUser(arg1, params);
        break;
      case 'reset-password':
        if (!arg1) {
          console.error('用法: user.cjs reset-password <id> --password=xxx 或 --random');
          process.exit(1);
        }
        await resetPassword(arg1, params);
        break;
      default:
        console.log('用法: user.cjs <create-user|update-user|delete-user|activate-user|unlock-user|reset-password> [id] [options]');
        console.log('');
        console.log('命令:');
        console.log('  create-user      创建用户');
        console.log('  update-user      更新用户');
        console.log('  delete-user      删除用户');
        console.log('  activate-user    激活用户');
        console.log('  unlock-user      解锁用户');
        console.log('  reset-password   重置密码');
        console.log('');
        console.log('选项:');
        console.log('  --dry-run        模拟执行，不发送真实请求');
        console.log('  --yes            跳过二次确认');
    }
  }

  run().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}

module.exports = {
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  unlockUser,
  resetPassword,
};
