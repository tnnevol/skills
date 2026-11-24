import type { Command } from 'commander'
import { Option } from 'commander'
import { printError } from '../output.js'
import { requireOption, runOperation, runUpdate } from './shared.js'
import { registerStoryImagesCommand } from './story-images.js'

interface OptDef {
  flags: string
  description: string
  defaultValue?: string | number | boolean
}

interface ActionDef {
  command: string
  description: string
  options?: OptDef[]
  op: string
  transform?: (opts: Record<string, any>) => Record<string, any>
  requireYes?: boolean
}

interface ResourceDef {
  name: string
  entityKey: string
  description: string
  listOptions?: OptDef[]
  getOptions?: OptDef[]
  createOptions?: OptDef[]
  updateOptions?: OptDef[]
  actions?: ActionDef[]
}

const ID_OPTION: OptDef = { flags: '--id <id>', description: '资源 ID' }
const PAGE_OPTIONS: OptDef[] = [
  { flags: '--page <n>', description: '页码，默认 1' },
  { flags: '--limit <n>', description: '每页数量，默认 20' },
]

function addOptions(command: Command, options: OptDef[] | undefined): void {
  for (const option of options ?? []) {
    const opt = new Option(option.flags, option.description)
    if (option.defaultValue !== undefined)
      opt.default(option.defaultValue)
    command.addOption(opt)
  }
}

function withId(options: OptDef[] | undefined): OptDef[] {
  return [ID_OPTION, ...(options ?? [])]
}

function registerResource(program: Command, def: ResourceDef): void {
  const group = program.command(def.name).description(def.description)

  if (def.listOptions) {
    const list = group.command('list').description(`列出 ${def.name}`)
    addOptions(list, [...PAGE_OPTIONS, ...def.listOptions])
    list.action(async (_opts, cmd: Command) => {
      await runOperation(cmd, `${def.name}.list`, cmd.optsWithGlobals() as Record<string, any>)
    })
  }

  if (def.getOptions) {
    const get = group.command('get').description(`查看 ${def.name} 详情`)
    addOptions(get, withId(def.getOptions))
    get.action(async (_opts, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as Record<string, any>
      requireOption(opts.id, `${def.name} get 需要 --id`)
      await runOperation(cmd, `${def.name}.get`, opts)
    })
  }

  if (def.createOptions) {
    const create = group.command('create').description(`创建 ${def.name}`)
    addOptions(create, def.createOptions)
    create.action(async (_opts, cmd: Command) => {
      await runOperation(cmd, `${def.name}.create`, cmd.optsWithGlobals() as Record<string, any>)
    })
  }

  if (def.updateOptions) {
    const update = group.command('update').description(`更新 ${def.name}（自动回填未修改字段）`)
    addOptions(update, withId(def.updateOptions))
    update.action(async (_opts, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as Record<string, any>
      requireOption(opts.id, `${def.name} update 需要 --id`)
      await runUpdate(cmd, def.name, def.entityKey, opts)
    })
  }

  if (def.actions) {
    for (const action of def.actions) {
      const command = group.command(action.command).description(action.description)
      addOptions(command, withId(action.options))
      if (action.requireYes)
        command.option('--yes', '确认删除（必填）')
      command.action(async (_opts, cmd: Command) => {
        const opts = cmd.optsWithGlobals() as Record<string, any>
        requireOption(opts.id, `${def.name} ${action.command} 需要 --id`)
        if (action.requireYes && opts.yes !== true)
          printError(`删除需要 --yes 确认`)
        const args = action.transform ? action.transform(opts) : opts
        await runOperation(cmd, action.op, args)
      })
    }
  }
}

export function registerResourceCommands(program: Command): void {
  registerResource(program, {
    name: 'product',
    entityKey: 'product',
    description: '产品管理',
    listOptions: [
      { flags: '--program <id>', description: '按项目集过滤' },
      { flags: '--order <order>', description: '排序，默认 id_desc' },
    ],
    getOptions: [],
    createOptions: [
      { flags: '--name <name>', description: '产品名称（必填）' },
      { flags: '--program <id>', description: '所属项目集' },
      { flags: '--line <id>', description: '所属产品线' },
      { flags: '--type <type>', description: 'normal | branch | platform' },
      { flags: '--PO <account>', description: '产品负责人' },
      { flags: '--QD <account>', description: '测试负责人' },
      { flags: '--RD <account>', description: '发布负责人' },
      { flags: '--reviewer <list>', description: '评审人，逗号分隔' },
      { flags: '--desc <text>', description: '产品描述' },
      { flags: '--acl <acl>', description: 'open | private' },
    ],
    updateOptions: [
      { flags: '--name <name>', description: '产品名称' },
      { flags: '--program <id>', description: '所属项目集' },
      { flags: '--line <id>', description: '所属产品线' },
      { flags: '--type <type>', description: 'normal | branch | platform' },
      { flags: '--PO <account>', description: '产品负责人' },
      { flags: '--QD <account>', description: '测试负责人' },
      { flags: '--RD <account>', description: '发布负责人' },
      { flags: '--reviewer <list>', description: '评审人，逗号分隔' },
      { flags: '--desc <text>', description: '产品描述' },
      { flags: '--acl <acl>', description: 'open | private' },
    ],
    actions: [
      {
        command: 'list-by-program',
        description: '列出项目集下的产品',
        options: [{ flags: '--program <id>', description: '项目集 ID（必填）' }],
        op: 'product.listByProgram',
        transform: opts => ({ ...opts, program: opts.program }),
      },
      {
        command: 'delete',
        description: '删除产品',
        op: 'product.delete',
        requireYes: true,
      },
    ],
  })

  registerResource(program, {
    name: 'project',
    entityKey: 'project',
    description: '项目管理',
    listOptions: [
      { flags: '--program <id>', description: '按项目集过滤' },
      { flags: '--order <order>', description: '排序，默认 id_desc' },
    ],
    getOptions: [],
    createOptions: [
      { flags: '--name <name>', description: '项目名称（必填）' },
      { flags: '--model <model>', description: 'scrum | waterfall | kanban | agileplus | waterfallplus（必填）' },
      { flags: '--begin <date>', description: '开始日期（必填）' },
      { flags: '--end <date>', description: '结束日期（必填）' },
      { flags: '--PM <account>', description: '项目经理' },
      { flags: '--products <list>', description: '关联产品，逗号分隔' },
      { flags: '--parent <id>', description: '父项目集/项目' },
      { flags: '--workflowGroup <id>', description: '工作流分组' },
    ],
    updateOptions: [
      { flags: '--name <name>', description: '项目名称' },
      { flags: '--model <model>', description: '项目模型' },
      { flags: '--begin <date>', description: '开始日期' },
      { flags: '--end <date>', description: '结束日期' },
      { flags: '--PM <account>', description: '项目经理' },
      { flags: '--products <list>', description: '关联产品，逗号分隔' },
      { flags: '--parent <id>', description: '父项目集/项目' },
      { flags: '--workflowGroup <id>', description: '工作流分组' },
    ],
    actions: [
      {
        command: 'list-by-program',
        description: '列出项目集下的项目',
        options: [{ flags: '--program <id>', description: '项目集 ID（必填）' }],
        op: 'project.listByProgram',
        transform: opts => ({ ...opts, program: opts.program }),
      },
      {
        command: 'delete',
        description: '删除项目',
        op: 'project.delete',
        requireYes: true,
      },
    ],
  })

  registerResource(program, {
    name: 'story',
    entityKey: 'story',
    description: '需求管理',
    listOptions: [
      { flags: '--product <id>', description: '按产品过滤' },
      { flags: '--project <id>', description: '按项目过滤' },
      { flags: '--execution <id>', description: '按执行过滤' },
      { flags: '--order <order>', description: '排序，默认 id_desc' },
    ],
    getOptions: [
      { flags: '--spec-version <n>', description: '按版本读取（仅 v2；默认最新版本）' },
    ],
    createOptions: [
      { flags: '--product <id>', description: '所属产品（必填）' },
      { flags: '--title <title>', description: '需求标题（必填）' },
      { flags: '--pri <n>', description: '优先级' },
      { flags: '--module <id>', description: '所属模块' },
      { flags: '--parent <id>', description: '父需求' },
      { flags: '--estimate <n>', description: '预计工时' },
      { flags: '--spec <html>', description: '需求描述（HTML 片段，创建时必填）' },
      { flags: '--verify <html>', description: '验收标准（HTML 片段，创建时必填）' },
      { flags: '--category <category>', description: '需求类型' },
      { flags: '--source <source>', description: '需求来源' },
      { flags: '--assignedTo <account>', description: '指派给' },
      { flags: '--reviewer <list>', description: '评审人，逗号分隔' },
      { flags: '--project <id>', description: '所属项目' },
      { flags: '--execution <id>', description: '所属执行' },
    ],
    updateOptions: [
      { flags: '--title <title>', description: '需求标题' },
      { flags: '--spec <html>', description: '需求描述（HTML 片段，创建时必填）' },
      { flags: '--verify <html>', description: '验收标准（HTML 片段，创建时必填）' },
      { flags: '--category <category>', description: '需求类型' },
      { flags: '--source <source>', description: '需求来源' },
      { flags: '--sourceNote <text>', description: '来源备注' },
      { flags: '--assignedTo <account>', description: '指派给' },
      { flags: '--module <id>', description: '所属模块' },
      { flags: '--parent <id>', description: '父需求' },
      { flags: '--pri <n>', description: '优先级' },
      { flags: '--product <id>', description: '所属产品' },
      { flags: '--status <status>', description: '状态（通常不需要）' },
    ],
    actions: [
      {
        command: 'close',
        description: '关闭需求（需 --reason）',
        options: [
          { flags: '--reason <reason>', description: 'done|subdivided|duplicate|postponed|willnotdo|cancel|bydesign' },
          { flags: '--comment <text>', description: '备注' },
        ],
        op: 'story.close',
        transform: opts => ({ ...opts, closedReason: opts.reason }),
      },
      {
        command: 'change',
        description: '变更需求（需 --reviewer）',
        options: [
          { flags: '--reviewer <list>', description: '评审人，逗号分隔（必填）' },
          { flags: '--title <title>', description: '新标题' },
          { flags: '--spec <html>', description: '新描述' },
          { flags: '--verify <html>', description: '新验收标准' },
        ],
        op: 'story.change',
      },
      {
        command: 'activate',
        description: '激活需求',
        op: 'story.activate',
      },
      {
        command: 'delete',
        description: '删除需求',
        op: 'story.delete',
        requireYes: true,
      },
    ],
  })

  const storyGroup = program.commands.find(command => command.name() === 'story')
  if (storyGroup)
    registerStoryImagesCommand(storyGroup)

  registerResource(program, {
    name: 'task',
    entityKey: 'task',
    description: '任务管理',
    listOptions: [
      { flags: '--execution <id>', description: '执行 ID（必填）' },
      { flags: '--order <order>', description: '排序，默认 id_desc' },
    ],
    getOptions: [],
    createOptions: [
      { flags: '--execution <id>', description: '所属执行（必填）' },
      { flags: '--name <name>', description: '任务名称（必填）' },
      { flags: '--type <type>', description: 'devel | test | design | discuss | ui' },
      { flags: '--assignedTo <account>', description: '指派给' },
      { flags: '--estStarted <date>', description: '预计开始' },
      { flags: '--deadline <date>', description: '截止日期' },
      { flags: '--pri <n>', description: '优先级' },
      { flags: '--estimate <n>', description: '预计工时' },
      { flags: '--module <id>', description: '所属模块' },
      { flags: '--story <id>', description: '关联需求' },
      { flags: '--desc <text>', description: '任务描述' },
    ],
    updateOptions: [
      { flags: '--name <name>', description: '任务名称' },
      { flags: '--type <type>', description: '任务类型' },
      { flags: '--assignedTo <account>', description: '指派给' },
      { flags: '--estStarted <date>', description: '预计开始' },
      { flags: '--deadline <date>', description: '截止日期' },
      { flags: '--pri <n>', description: '优先级' },
      { flags: '--estimate <n>', description: '预计工时' },
      { flags: '--module <id>', description: '所属模块' },
      { flags: '--story <id>', description: '关联需求' },
      { flags: '--execution <id>', description: '所属执行' },
      { flags: '--desc <text>', description: '任务描述' },
    ],
    actions: [
      {
        command: 'start',
        description: '开始任务',
        options: [
          { flags: '--assignedTo <account>', description: '指派人' },
          { flags: '--realStarted <date>', description: '实际开始时间' },
          { flags: '--consumed <n>', description: '已消耗工时' },
          { flags: '--left <n>', description: '剩余工时' },
          { flags: '--comment <text>', description: '备注' },
        ],
        op: 'task.start',
      },
      {
        command: 'pause',
        description: '暂停任务',
        options: [{ flags: '--comment <text>', description: '备注' }],
        op: 'task.pause',
      },
      {
        command: 'restart',
        description: '继续任务',
        options: [
          { flags: '--consumed <n>', description: '已消耗工时' },
          { flags: '--left <n>', description: '剩余工时' },
          { flags: '--comment <text>', description: '备注' },
        ],
        op: 'task.restart',
      },
      {
        command: 'finish',
        description: '完成任务（需 --consumed）',
        options: [
          { flags: '--consumed <n>', description: '总消耗工时（必填）' },
          { flags: '--left <n>', description: '剩余工时' },
          { flags: '--assignedTo <account>', description: '指派人' },
          { flags: '--finishedDate <date>', description: '完成时间' },
          { flags: '--comment <text>', description: '备注' },
        ],
        op: 'task.finish',
      },
      {
        command: 'close',
        description: '关闭任务',
        options: [{ flags: '--comment <text>', description: '备注' }],
        op: 'task.close',
      },
      {
        command: 'activate',
        description: '激活任务',
        op: 'task.activate',
      },
      {
        command: 'delete',
        description: '删除任务',
        op: 'task.delete',
        requireYes: true,
      },
    ],
  })

  registerResource(program, {
    name: 'execution',
    entityKey: 'execution',
    description: '执行/迭代管理',
    listOptions: [
      { flags: '--project <id>', description: '按项目过滤' },
      { flags: '--status <status>', description: 'undone | wait | doing | all' },
      { flags: '--order <order>', description: '排序，默认 id_desc' },
    ],
    getOptions: [],
    createOptions: [
      { flags: '--project <id>', description: '所属项目（必填）' },
      { flags: '--name <name>', description: '执行名称（必填）' },
      { flags: '--begin <date>', description: '开始日期（必填）' },
      { flags: '--end <date>', description: '结束日期（必填）' },
      { flags: '--lifetime <lifetime>', description: 'short | long | ops' },
      { flags: '--days <n>', description: '迭代天数' },
      { flags: '--products <list>', description: '关联产品，逗号分隔' },
      { flags: '--plans <json>', description: '关联计划 JSON' },
      { flags: '--PO <account>', description: '产品负责人' },
      { flags: '--QD <account>', description: '测试负责人' },
      { flags: '--PM <account>', description: '项目经理' },
      { flags: '--RD <account>', description: '发布负责人' },
      { flags: '--acl <acl>', description: 'open | private' },
    ],
    updateOptions: [
      { flags: '--name <name>', description: '执行名称' },
      { flags: '--begin <date>', description: '开始日期' },
      { flags: '--end <date>', description: '结束日期' },
      { flags: '--lifetime <lifetime>', description: 'short | long | ops' },
      { flags: '--days <n>', description: '迭代天数' },
      { flags: '--products <list>', description: '关联产品，逗号分隔' },
      { flags: '--PO <account>', description: '产品负责人' },
      { flags: '--QD <account>', description: '测试负责人' },
      { flags: '--PM <account>', description: '项目经理' },
      { flags: '--RD <account>', description: '发布负责人' },
      { flags: '--acl <acl>', description: 'open | private' },
    ],
    actions: [
      { command: 'start', description: '启动执行（仅 v2）', op: 'execution.start' },
      { command: 'suspend', description: '暂停执行（仅 v2）', op: 'execution.suspend' },
      { command: 'close', description: '关闭执行（仅 v2）', op: 'execution.close' },
      { command: 'delete', description: '删除执行', op: 'execution.delete', requireYes: true },
    ],
  })

  registerResource(program, {
    name: 'bug',
    entityKey: 'bug',
    description: 'Bug 管理',
    listOptions: [
      { flags: '--product <id>', description: '按产品过滤' },
      { flags: '--project <id>', description: '按项目过滤' },
      { flags: '--execution <id>', description: '按执行过滤' },
      { flags: '--order <order>', description: '排序，默认 id_desc' },
    ],
    getOptions: [],
    createOptions: [
      { flags: '--product <id>', description: '所属产品（必填）' },
      { flags: '--title <title>', description: 'Bug 标题（必填）' },
      { flags: '--openedBuild <build>', description: '影响版本，默认 trunk' },
      { flags: '--project <id>', description: '所属项目' },
      { flags: '--execution <id>', description: '所属执行' },
      { flags: '--severity <n>', description: '严重程度 1-4' },
      { flags: '--pri <n>', description: '优先级' },
      { flags: '--type <type>', description: 'codeerror | config | install | security | performance' },
      { flags: '--steps <text>', description: '重现步骤' },
      { flags: '--story <id>', description: '相关需求' },
    ],
    updateOptions: [
      { flags: '--title <title>', description: 'Bug 标题' },
      { flags: '--severity <n>', description: '严重程度' },
      { flags: '--pri <n>', description: '优先级' },
      { flags: '--type <type>', description: 'Bug 类型' },
      { flags: '--steps <text>', description: '重现步骤' },
      { flags: '--story <id>', description: '相关需求' },
      { flags: '--assignedTo <account>', description: '指派给' },
      { flags: '--status <status>', description: '状态（通常不需要）' },
      { flags: '--execution <id>', description: '所属执行' },
    ],
    actions: [
      {
        command: 'resolve',
        description: '解决 Bug',
        options: [
          { flags: '--resolution <resolution>', description: 'fixed | bydesign | notrepro | duplicate | postponed | willnotdo | tostory | external' },
          { flags: '--duplicateBug <id>', description: '重复 Bug ID' },
          { flags: '--resolvedBuild <build>', description: '解决版本' },
          { flags: '--resolvedDate <date>', description: '解决时间' },
          { flags: '--assignedTo <account>', description: '指派给' },
          { flags: '--comment <text>', description: '备注' },
        ],
        op: 'bug.resolve',
      },
      {
        command: 'close',
        description: '关闭 Bug',
        options: [{ flags: '--comment <text>', description: '备注' }],
        op: 'bug.close',
      },
      {
        command: 'activate',
        description: '激活 Bug',
        options: [
          { flags: '--openedBuild <build>', description: '影响版本' },
          { flags: '--comment <text>', description: '备注' },
        ],
        op: 'bug.activate',
      },
      {
        command: 'confirm',
        description: '确认 Bug',
        options: [{ flags: '--comment <text>', description: '备注' }],
        op: 'bug.confirm',
      },
      { command: 'delete', description: '删除 Bug', op: 'bug.delete', requireYes: true },
    ],
  })

  registerResource(program, {
    name: 'testcase',
    entityKey: 'testcase',
    description: '测试用例管理',
    listOptions: [
      { flags: '--product <id>', description: '按产品过滤' },
      { flags: '--project <id>', description: '按项目过滤' },
      { flags: '--execution <id>', description: '按执行过滤' },
      { flags: '--order <order>', description: '排序，默认 id_desc' },
    ],
    getOptions: [
      { flags: '--spec-version <n>', description: '按版本读取（仅 v2；默认最新版本）' },
    ],
    createOptions: [
      { flags: '--product <id>', description: '所属产品（必填）' },
      { flags: '--title <title>', description: '用例标题（必填）' },
      { flags: '--steps <json>', description: '步骤 JSON：[{"step":"...","expect":"..."}]（必填）' },
      { flags: '--module <id>', description: '所属模块' },
      { flags: '--story <id>', description: '关联需求' },
      { flags: '--pri <n>', description: '优先级' },
      { flags: '--type <type>', description: '用例类型' },
      { flags: '--precondition <text>', description: '前置条件' },
      { flags: '--project <id>', description: '所属项目' },
      { flags: '--execution <id>', description: '所属执行' },
    ],
    updateOptions: [
      { flags: '--title <title>', description: '用例标题' },
      { flags: '--steps <json>', description: '步骤 JSON：[{"step":"...","expect":"..."}]' },
      { flags: '--module <id>', description: '所属模块' },
      { flags: '--story <id>', description: '关联需求' },
      { flags: '--pri <n>', description: '优先级' },
      { flags: '--type <type>', description: '用例类型' },
      { flags: '--precondition <text>', description: '前置条件' },
      { flags: '--product <id>', description: '所属产品' },
      { flags: '--project <id>', description: '所属项目' },
      { flags: '--execution <id>', description: '所属执行' },
    ],
    actions: [
      { command: 'delete', description: '删除测试用例', op: 'testcase.delete', requireYes: true },
    ],
  })

  registerResource(program, {
    name: 'user',
    entityKey: 'user',
    description: '用户管理',
    listOptions: [
      { flags: '--browse <type>', description: 'inside | outside（仅 v1）' },
      { flags: '--full', description: '返回完整字段（仅 v1）' },
      { flags: '--order <order>', description: '排序，默认 id_desc' },
    ],
    getOptions: [],
    createOptions: [
      { flags: '--account <account>', description: '账号（必填）' },
      { flags: '--password <password>', description: '密码（必填）' },
      { flags: '--realname <name>', description: '姓名（必填）' },
      { flags: '--gender <f|m>', description: '性别：f 女 / m 男' },
      { flags: '--role <role>', description: '职位：dev/qa/pm/po/td/pd/qd/top/others（仅 v1 生效）' },
      { flags: '--dept <id>', description: '部门 ID（仅 v1）' },
      { flags: '--visions <list>', description: '视野，如 rnd,lite（仅 v1）' },
      { flags: '--group <list>', description: '权限分组 ID，逗号分隔（仅 v1）' },
      { flags: '--email <email>', description: '邮箱（仅 v1）' },
    ],
    updateOptions: [
      { flags: '--realname <name>', description: '姓名' },
      { flags: '--gender <f|m>', description: '性别' },
      { flags: '--role <role>', description: '职位（仅 v1）' },
      { flags: '--dept <id>', description: '部门 ID（仅 v1）' },
      { flags: '--visions <list>', description: '视野（仅 v1）' },
      { flags: '--group <list>', description: '权限分组，逗号分隔（仅 v1）' },
      { flags: '--email <email>', description: '邮箱（仅 v1）' },
    ],
    actions: [
      { command: 'delete', description: '删除用户', op: 'user.delete', requireYes: true },
    ],
  })

  const testtask = program.command('testtask').description('测试单（仅 v1 读接口；创建需 build）')
  const ttList = testtask.command('list').description('列出测试单')
  ttList.option('--product <id>', '按产品过滤')
  ttList.option('--project <id>', '按项目过滤')
  ttList.option('--status <status>', '状态过滤')
  ttList.option('--page <n>', '页码，默认 1')
  ttList.option('--limit <n>', '每页数量，默认 20')
  ttList.action(async (_opts, cmd: Command) => {
    await runOperation(cmd, 'testtask.list', cmd.optsWithGlobals() as Record<string, any>)
  })
  testtask.command('get').description('查看测试单详情').option('--id <id>', '测试单 ID').action(async (_opts, cmd: Command) => {
    const opts = cmd.optsWithGlobals() as Record<string, any>
    requireOption(opts.id, 'testtask get 需要 --id')
    await runOperation(cmd, 'testtask.get', opts)
  })
  testtask.command('delete').description('删除测试单').option('--id <id>', '测试单 ID').option('--yes', '确认删除（必填）').action(async (_opts, cmd: Command) => {
    const opts = cmd.optsWithGlobals() as Record<string, any>
    requireOption(opts.id, 'testtask delete 需要 --id')
    if (opts.yes !== true)
      printError('删除需要 --yes 确认')
    await runOperation(cmd, 'testtask.delete', opts)
  })

  const group = program.command('group').description('权限分组/角色')
  group.command('list').description('列出权限分组（角色）及成员/权限').action(async (_opts, cmd: Command) => {
    await runOperation(cmd, 'group.list', {})
  })

  const dept = program.command('dept').description('部门')
  dept.command('list').description('列出部门').action(async (_opts, cmd: Command) => {
    await runOperation(cmd, 'dept.list', {})
  })
  dept.command('get').description('查看部门详情').option('--id <id>', '部门 ID').action(async (_opts, cmd: Command) => {
    const opts = cmd.optsWithGlobals() as Record<string, any>
    requireOption(opts.id, 'dept get 需要 --id')
    await runOperation(cmd, 'dept.get', opts)
  })
}
