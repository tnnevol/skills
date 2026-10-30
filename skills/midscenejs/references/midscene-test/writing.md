# 编写与设计 YAML 用例

## 术语

| 术语 | 含义 |
| --- | --- |
| Workflow Document（工作流文档） | 整份 YAML 文件 |
| Case（用例） | `cases` 列表下的单条用例 |
| Step（步骤） | `steps` 或钩子内的**单次 Node 调用**，一个 Step 只调一个 Node |
| Hook（生命周期钩子） | `beforeAll` / `beforeEach` / `afterEach` / `afterAll` |

## 一个典型的 YAML

```yaml title="cases/search.yaml"
beforeEach:
  - gotoUrl: https://your-shop.example

cases:
  - name: 搜索商品
    steps:
      - aiAct: 在搜索框输入“马克杯”，点击搜索按钮
      - aiAssert: 搜索结果中包含马克杯
```

字符串简写规则：`gotoUrl` 后字符串作为 `url`，`aiAct` / `aiAssert` 后字符串作为 `prompt`。需要多字段时改对象写法。

## 用例设计约定（最容易写错的地方）

Midscene Test 采用**顺序执行 + 显式状态共享**：

1. **按声明顺序线性执行**：YAML 只描述线性步骤，**不引入 DAG、条件分支或循环**。需要复杂动态编排时，在外部用代码生成确定的线性步骤序列再交给 runner。
2. **每个 Step 无状态且独立**：Step 之间**没有隐式状态或数据传递**，**不支持跨步骤输出引用**。每次调用只依赖本步骤显式参数和项目级 `context`。要在步骤间共享数据，只能写自定义 Node 读写项目共享的 `context`。

由此推出一条实务规则：**每条 AI 指令都要自身完整**，不能用“上一步”“刚才那个”指代。

```yaml
steps:
  - aiAct: 点击商品详情页的收藏星标，将其点亮
  # ❌ 断言不会继承上一步的指令上下文，"上一步的图标"无法被识别
  - aiAssert: 上一步的图标已经点亮
```

```yaml
steps:
  - aiAct: 点击商品详情页的收藏星标，将其点亮
  # ✅ 直接写明检查对象和预期状态
  - aiAssert: 商品详情页的收藏星标处于点亮状态
```

界面画面会保留前一步操作后的结果，但**指令文本不会继承**。

## 用 Node

Node 既可在 `steps` 调用，也可在 `beforeEach` 等钩子里调用，语法完全一致。常用 Node 见 [builtin-nodes.md](builtin-nodes.md)。

`aiAssert` 要自定义失败提示时展开成对象：

```yaml
steps:
  - aiAssert:
      prompt: 购物车中有一件马克杯
      message: 加入购物车后购物车数量不符
```

## 用例粒度建议

- **一个 Case 一件事**：便于失败时定位，重试也不至于整条长流程报废。
- **AI 步骤写业务意图**，不要写微观操作序列；细粒度点击会让界面微调直接断用例。
- **关键节点必须 `aiAssert`**：界面操作执行完成不代表测试通过。
- **准备/清理放钩子**，别混在 `steps` 里——钩子在重试时也会执行（`beforeEach`/`afterEach` 每次执行都跑）。

## 相关

- Node 清单与传参：[builtin-nodes.md](builtin-nodes.md)
- 钩子执行时机与并发：[execution.md](execution.md)
- 运行与报告：[running.md](running.md)
- 自定义 Node：[extend.md](extend.md)
