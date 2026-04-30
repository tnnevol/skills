#!/usr/bin/env node

/**
 * actions/product.cjs — 产品管理写操作
 * 
 * 依赖：
 *   - api.cjs（post/put/del + dry-run）
 *   - validate.cjs（参数校验）
 *   - query.cjs（产品列表/详情查询）
 */

const { post, put, del } = require('../api.cjs');
const { validate, required, length, id, enum: enumVal } = require('../validate.cjs');

// ========== 产品状态枚举 ==========

const PRODUCT_STATUSES = {
  normal: '正常',
  closed: '已关闭',
  deleted: '已删除',
};

const PRODUCT_TYPES = ['normal', 'branch', 'platform'];

// ========== 创建产品 ==========

/**
 * 创建产品
 * POST /api.php/v2/products
 */
async function createProduct(params) {
  // 参数校验
  validate({
    name: { required: true, length: { min: 2, max: 100 } },
    code: { required: true, length: { min: 1, max: 30 } },
    type: { enum: PRODUCT_TYPES },
    desc: { length: { max: 500 } },
    owner: { length: { max: 30 } },
    QD: { length: { max: 30 } },
    RD: { length: { max: 30 } },
  }, params);

  const body = {
    name: params.name,
    code: params.code,
    type: params.type || 'normal',
  };
  if (params.desc) body.desc = params.desc;
  if (params.owner) body.PO = params.owner;
  if (params.QD) body.QD = params.QD;
  if (params.RD) body.RD = params.RD;
  if (params.line) body.line = params.line;

  const res = await post('/products', body, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[创建失败] ${res.error}`);
  }

  console.log(`✅ 产品创建成功: ${params.name} (ID: ${res.data.id})`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 更新产品 ==========

/**
 * 更新产品
 * PUT /api.php/v2/products/<id>
 */
async function updateProduct(productId, params) {
  id(productId, '产品 ID');

  // 至少提供一个更新字段
  const updateFields = {};
  if (params.name) updateFields.name = params.name;
  if (params.code) updateFields.code = params.code;
  if (params.type) updateFields.type = params.type;
  if (params.desc !== undefined) updateFields.desc = params.desc;
  if (params.owner) updateFields.PO = params.owner;
  if (params.QD) updateFields.QD = params.QD;
  if (params.RD) updateFields.RD = params.RD;
  if (params.line) updateFields.line = params.line;
  if (params.status) updateFields.status = params.status;

  if (Object.keys(updateFields).length === 0) {
    throw new Error('[更新失败] 至少提供一个更新字段: --name / --code / --type / --desc / --owner / --QD / --RD / --status');
  }

  // 校验更新字段
  if (updateFields.name) {
    length(updateFields.name, '名称', 2, 100);
  }
  if (updateFields.code) {
    length(updateFields.code, '代号', 1, 30);
  }
  if (updateFields.type) {
    enumVal(updateFields.type, '类型', PRODUCT_TYPES);
  }

  const res = await put(`/products/${productId}`, updateFields, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[更新失败] ${res.error}`);
  }

  console.log(`✅ 产品更新成功: ${productId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 关闭产品 ==========

/**
 * 关闭产品
 * PUT /api.php/v2/products/<id>/close
 */
async function closeProduct(productId, params) {
  id(productId, '产品 ID');

  const body = {};
  if (params.closedReason) body.closedReason = params.closedReason;

  const res = await put(`/products/${productId}/close`, body, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[关闭失败] ${res.error}`);
  }

  console.log(`✅ 产品已关闭: ${productId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 删除产品 ==========

/**
 * 删除产品
 * DELETE /api.php/v2/products/<id>
 */
async function deleteProduct(productId, params = {}) {
  id(productId, '产品 ID');

  const res = await del(`/products/${productId}`, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[删除失败] ${res.error}`);
  }

  console.log(`✅ 产品已删除: ${productId}`);
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
        // 转 camelCase：dry-run → dryRun
        const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        params[camelKey] = value;
      }
    }
    return params;
  }

  async function run() {
    const needsId = ['update-product', 'close-product', 'delete-product'].includes(action);
    
    let params;
    if (needsId) {
      params = parseParams(process.argv.slice(4));
    } else {
      params = parseParams(process.argv.slice(3));
    }

    switch (action) {
      case 'create-product':
        await createProduct(params);
        break;
      case 'update-product':
        if (!arg1) {
          console.error('用法: product.cjs update-product <id> [--name=xxx] [--code=xxx] [--type=xxx] [--desc=xxx] [--owner=xxx] [--QD=xxx] [--RD=xxx]');
          process.exit(1);
        }
        await updateProduct(arg1, params);
        break;
      case 'close-product':
        if (!arg1) {
          console.error('用法: product.cjs close-product <id> [--closedReason=xxx]');
          process.exit(1);
        }
        await closeProduct(arg1, params);
        break;
      case 'delete-product':
        if (!arg1) {
          console.error('用法: product.cjs delete-product <id>');
          process.exit(1);
        }
        await deleteProduct(arg1, params);
        break;
      default:
        console.log('用法: product.cjs <create-product|update-product|close-product|delete-product> [id] [options]');
        console.log('');
        console.log('命令:');
        console.log('  create-product   创建产品');
        console.log('  update-product   更新产品');
        console.log('  close-product    关闭产品');
        console.log('  delete-product   删除产品');
        console.log('');
        console.log('选项:');
        console.log('  --dry-run        模拟执行，不发送真实请求');
        console.log('  --name=NAME      产品名称');
        console.log('  --code=CODE      产品代号');
        console.log('  --type=TYPE      产品类型 (normal/branch/platform)');
        console.log('  --desc=DESC      产品描述');
        console.log('  --owner=USER     产品负责人');
        console.log('  --QD=USER        测试负责人');
        console.log('  --RD=USER        发布负责人');
        console.log('  --closedReason=X 关闭原因');
    }
  }

  run().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}

// ========== 导出 API ==========

module.exports = {
  createProduct,
  updateProduct,
  closeProduct,
  deleteProduct,
};
