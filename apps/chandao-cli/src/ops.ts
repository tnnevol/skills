export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface OpCall {
  method: Method
  path: string
  body?: unknown
}

export type OpBuilder = (args: Record<string, any>) => OpCall

export interface OpDef {
  v1?: OpBuilder
  v2?: OpBuilder
}

function qs(params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '')
      continue
    search.append(key, String(value))
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}

function pageV1(args: Record<string, any>, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return { page: args.page ?? 1, limit: args.limit ?? 20, order: args.order ?? 'id_desc', ...extra }
}

function pageV2(args: Record<string, any>, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return { pageID: args.page ?? 1, recPerPage: args.limit ?? 20, orderBy: args.order ?? 'id_desc', ...extra }
}

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value))
    return value
  if (typeof value === 'string')
    return value.split(',').map(item => item.trim()).filter(Boolean)
  return []
}

function numbers(value: unknown): number[] {
  return toArray(value).map(item => Number(item))
}

function pick(args: Record<string, any>, keys: string[]): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  for (const key of keys) {
    if (args[key] !== undefined)
      body[key] = args[key]
  }
  return body
}

// ── Products ────────────────────────────────────────────────────────

function productBody(args: Record<string, any>): Record<string, unknown> {
  const body = pick(args, ['name', 'type', 'PO', 'QD', 'RD', 'desc', 'acl'])
  if (args.program !== undefined)
    body.program = Number(args.program)
  if (args.line !== undefined)
    body.line = Number(args.line)
  if (args.reviewer !== undefined)
    body.reviewer = toArray(args.reviewer)
  return body
}

// ── Projects ────────────────────────────────────────────────────────

function projectBody(args: Record<string, any>): Record<string, unknown> {
  const body = pick(args, ['name', 'model', 'begin', 'end', 'PM'])
  if (args.products !== undefined)
    body.products = numbers(args.products)
  if (args.parent !== undefined)
    body.parent = Number(args.parent)
  if (args.workflowGroup !== undefined)
    body.workflowGroup = Number(args.workflowGroup)
  return body
}

// ── Stories ─────────────────────────────────────────────────────────

function storyListPath(args: Record<string, any>): string {
  if (args.product)
    return `/products/${args.product}/stories`
  if (args.project)
    return `/projects/${args.project}/stories`
  if (args.execution)
    return `/executions/${args.execution}/stories`
  return '/stories'
}

function storyCreateBody(args: Record<string, any>, version: 'v1' | 'v2'): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: args.title,
  }
  if (version === 'v2')
    body.productID = Number(args.product)
  else
    body.product = Number(args.product)

  const numeric = version === 'v2'
    ? ['pri', 'module', 'parent', 'estimate', 'project', 'execution', 'branch']
    : ['pri', 'module', 'parent', 'estimate', 'branch']
  for (const key of numeric) {
    if (args[key] !== undefined)
      body[key] = Number(args[key])
  }
  for (const key of ['spec', 'category', 'source', 'sourceNote', 'verify', 'assignedTo']) {
    if (args[key] !== undefined)
      body[key] = args[key]
  }
  if (args.reviewer !== undefined)
    body.reviewer = toArray(args.reviewer)

  // 旧版 v1 对创建字段要求更严格：branch/pri/category 缺省会 400
  if (version === 'v1') {
    if (body.pri === undefined)
      body.pri = 3
    if (body.category === undefined)
      body.category = 'feature'
    if (body.branch === undefined)
      body.branch = 0
  }
  return body
}

function storyUpdateBody(args: Record<string, any>): Record<string, unknown> {
  const body = pick(args, ['title', 'spec', 'verify', 'category', 'source', 'sourceNote', 'assignedTo', 'status'])
  for (const key of ['module', 'parent', 'pri', 'product']) {
    if (args[key] !== undefined)
      body[key] = Number(args[key])
  }
  return body
}

// ── Tasks ───────────────────────────────────────────────────────────

function taskCreateBody(args: Record<string, any>, version: 'v1' | 'v2'): Record<string, unknown> {
  const body: Record<string, unknown> = { name: args.name }
  if (version === 'v2' && args.execution !== undefined)
    body.executionID = Number(args.execution)
  for (const key of ['type', 'assignedTo', 'estStarted', 'deadline', 'desc']) {
    if (args[key] !== undefined)
      body[key] = args[key]
  }
  for (const key of ['pri', 'estimate', 'module', 'story']) {
    if (args[key] !== undefined)
      body[key] = Number(args[key])
  }
  return body
}

function taskUpdateBody(args: Record<string, any>): Record<string, unknown> {
  const body = pick(args, ['name', 'type', 'assignedTo', 'estStarted', 'deadline', 'desc'])
  for (const key of ['pri', 'estimate', 'module', 'story', 'execution']) {
    if (args[key] !== undefined)
      body[key] = Number(args[key])
  }
  return body
}

function taskActionBody(args: Record<string, any>): Record<string, unknown> {
  const body = pick(args, ['assignedTo', 'realStarted', 'finishedDate', 'comment'])
  for (const key of ['consumed', 'left', 'estimate']) {
    if (args[key] !== undefined)
      body[key] = Number(args[key])
  }
  return body
}

// ── Executions ──────────────────────────────────────────────────────

function executionBody(args: Record<string, any>, version: 'v1' | 'v2'): Record<string, unknown> {
  const body = pick(args, ['name', 'begin', 'end', 'lifetime', 'PO', 'QD', 'PM', 'RD', 'acl'])
  if (version === 'v2' && args.project !== undefined)
    body.project = Number(args.project)
  if (args.products !== undefined)
    body.products = numbers(args.products)
  if (args.days !== undefined)
    body.days = Number(args.days)
  if (args.plans !== undefined)
    body.plans = typeof args.plans === 'string' ? JSON.parse(args.plans) : args.plans
  return body
}

// ── Bugs ────────────────────────────────────────────────────────────

function bugListPath(args: Record<string, any>): string {
  if (args.product)
    return `/products/${args.product}/bugs`
  if (args.project)
    return `/projects/${args.project}/bugs`
  if (args.execution)
    return `/executions/${args.execution}/bugs`
  return '/bugs'
}

function bugCreateBody(args: Record<string, any>, version: 'v1' | 'v2'): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: args.title,
    openedBuild: args.openedBuild ? toArray(args.openedBuild) : ['trunk'],
  }
  if (version === 'v2')
    body.productID = Number(args.product)
  else
    body.product = Number(args.product)

  for (const key of ['type', 'steps']) {
    if (args[key] !== undefined)
      body[key] = args[key]
  }
  for (const key of ['project', 'execution', 'severity', 'pri', 'story']) {
    if (args[key] !== undefined)
      body[key] = Number(args[key])
  }
  if (version === 'v1' && body.type === undefined)
    body.type = 'codeerror'
  return body
}

function bugUpdateBody(args: Record<string, any>): Record<string, unknown> {
  const body = pick(args, ['title', 'type', 'steps', 'assignedTo', 'status'])
  for (const key of ['severity', 'pri', 'story', 'execution']) {
    if (args[key] !== undefined)
      body[key] = Number(args[key])
  }
  return body
}

function bugActionBody(args: Record<string, any>): Record<string, unknown> {
  const body = pick(args, ['resolution', 'resolvedBuild', 'resolvedDate', 'assignedTo', 'comment'])
  if (args.duplicateBug !== undefined)
    body.duplicateBug = Number(args.duplicateBug)
  if (args.openedBuild !== undefined)
    body.openedBuild = args.openedBuild
  return body
}

// ── Test cases ──────────────────────────────────────────────────────

function testcaseListPath(args: Record<string, any>): string {
  if (args.product)
    return `/products/${args.product}/testcases`
  if (args.project)
    return `/projects/${args.project}/testcases`
  if (args.execution)
    return `/executions/${args.execution}/testcases`
  return '/testcases'
}

function parseSteps(raw: unknown): { steps: string[], expects: string[], stepType: string[] } {
  if (!raw)
    return { steps: [], expects: [], stepType: [] }
  const list = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (!Array.isArray(list))
    throw new Error('--steps 需要是 JSON 数组：[{"step":"...","expect":"..."}]')
  return {
    steps: list.map((item: any) => String(item.step ?? '')),
    expects: list.map((item: any) => String(item.expect ?? '')),
    stepType: list.map(() => 'step'),
  }
}

function testcaseBody(args: Record<string, any>, version: 'v1' | 'v2'): Record<string, unknown> {
  const body: Record<string, unknown> = { title: args.title }
  if (version === 'v2')
    body.productID = Number(args.product)
  else
    body.product = Number(args.product)

  for (const key of ['type', 'precondition']) {
    if (args[key] !== undefined)
      body[key] = args[key]
  }
  for (const key of ['module', 'story', 'pri', 'project', 'execution']) {
    if (args[key] !== undefined)
      body[key] = Number(args[key])
  }
  if (args.steps !== undefined) {
    const parsed = parseSteps(args.steps)
    if (version === 'v1') {
      // 旧版 v1 要求 steps 为对象数组：{desc, expect, type}
      body.steps = parsed.steps.map((desc, index) => ({
        desc,
        expect: parsed.expects[index] ?? '',
        type: 'step',
      }))
    }
    else {
      body.steps = parsed.steps
      body.expects = parsed.expects
      body.stepType = parsed.stepType
    }
  }
  if (version === 'v1') {
    if (body.type === undefined)
      body.type = 'feature'
    if (body.pri === undefined)
      body.pri = 3
  }
  return body
}

// ── Users ───────────────────────────────────────────────────────────

function userCreateBody(args: Record<string, any>, version: 'v1' | 'v2'): Record<string, unknown> {
  const body = pick(args, ['account', 'password', 'realname'])
  if (version === 'v2')
    return body
  for (const key of ['realname', 'email', 'role', 'gender']) {
    if (args[key] !== undefined)
      body[key] = args[key]
  }
  if (args.dept !== undefined)
    body.dept = Number(args.dept)
  if (args.visions !== undefined)
    body.visions = toArray(args.visions)
  if (args.group !== undefined)
    body.group = toArray(args.group).join(',')
  return body
}

function userUpdateBody(args: Record<string, any>, version: 'v1' | 'v2'): Record<string, unknown> {
  if (version === 'v2')
    return pick(args, ['realname', 'password', 'account'])
  const body = pick(args, ['realname', 'email', 'role', 'gender'])
  if (args.dept !== undefined)
    body.dept = Number(args.dept)
  if (args.visions !== undefined)
    body.visions = toArray(args.visions)
  if (args.group !== undefined)
    body.group = toArray(args.group).join(',')
  return body
}

// ── Registry ────────────────────────────────────────────────────────

export const OPS: Record<string, OpDef> = {
  // products
  'product.list': {
    v1: a => ({ method: 'GET', path: `/products${qs(pageV1(a, a.program ? { program: a.program } : {}))}` }),
    v2: a => ({ method: 'GET', path: `/products${qs(pageV2(a, a.program ? { program: a.program } : {}))}` }),
  },
  'product.get': {
    v1: a => ({ method: 'GET', path: `/products/${a.id}` }),
    v2: a => ({ method: 'GET', path: `/products/${a.id}` }),
  },
  'product.create': {
    v1: a => ({ method: 'POST', path: '/products', body: productBody(a) }),
    v2: a => ({ method: 'POST', path: '/products', body: productBody(a) }),
  },
  'product.update': {
    v1: a => ({ method: 'PUT', path: `/product/${a.id}`, body: productBody(a) }),
    v2: a => ({ method: 'PUT', path: `/products/${a.id}`, body: productBody(a) }),
  },
  'product.delete': {
    v1: a => ({ method: 'DELETE', path: `/products/${a.id}` }),
    v2: a => ({ method: 'DELETE', path: `/products/${a.id}` }),
  },

  // projects
  'project.list': {
    v1: a => ({ method: 'GET', path: `/projects${qs(pageV1(a, a.program ? { program: a.program } : {}))}` }),
    v2: a => ({ method: 'GET', path: `/projects${qs(pageV2(a, a.program ? { program: a.program } : {}))}` }),
  },
  'project.get': {
    v1: a => ({ method: 'GET', path: `/projects/${a.id}` }),
    v2: a => ({ method: 'GET', path: `/projects/${a.id}` }),
  },
  'project.create': {
    v1: a => ({ method: 'POST', path: '/projects', body: projectBody(a) }),
    v2: a => ({ method: 'POST', path: '/projects', body: projectBody(a) }),
  },
  'project.update': {
    v1: a => ({ method: 'PUT', path: `/projects/${a.id}`, body: projectBody(a) }),
    v2: a => ({ method: 'PUT', path: `/projects/${a.id}`, body: projectBody(a) }),
  },
  'project.delete': {
    v1: a => ({ method: 'DELETE', path: `/projects/${a.id}` }),
    v2: a => ({ method: 'DELETE', path: `/projects/${a.id}` }),
  },
  'project.listByProgram': {
    v1: a => ({ method: 'GET', path: `/projects${qs(pageV1(a, { program: a.program }))}` }),
    v2: a => ({ method: 'GET', path: `/programs/${a.program}/projects${qs(pageV2(a))}` }),
  },

  // stories
  'story.list': {
    v1: a => ({ method: 'GET', path: storyListPath(a) + qs(pageV1(a)) }),
    v2: a => ({ method: 'GET', path: storyListPath(a) + qs(pageV2(a)) }),
  },
  'story.get': {
    v1: (a) => {
      if (a.specVersion !== undefined)
        throw new Error('v1 不支持按版本读取需求，请使用 --api-version v2 或 Web 查看历史版本。')
      return { method: 'GET', path: `/stories/${a.id}` }
    },
    v2: a => ({ method: 'GET', path: `/stories/${a.id}${qs({ version: a.specVersion })}` }),
  },
  'story.create': {
    v1: a => ({ method: 'POST', path: '/stories', body: storyCreateBody(a, 'v1') }),
    v2: a => ({ method: 'POST', path: '/stories', body: storyCreateBody(a, 'v2') }),
  },
  'story.update': {
    v1: a => ({ method: 'PUT', path: `/stories/${a.id}`, body: storyUpdateBody(a) }),
    v2: a => ({ method: 'PUT', path: `/stories/${a.id}`, body: storyUpdateBody(a) }),
  },
  'story.close': {
    v1: a => ({ method: 'POST', path: `/stories/${a.id}/close`, body: pick(a, ['closedReason', 'comment']) }),
    v2: a => ({ method: 'PUT', path: `/stories/${a.id}/close`, body: pick(a, ['closedReason', 'comment']) }),
  },
  'story.change': {
    v1: a => ({ method: 'POST', path: `/stories/${a.id}/change`, body: { ...pick(a, ['title', 'spec', 'verify']), reviewer: toArray(a.reviewer) } }),
    v2: a => ({ method: 'PUT', path: `/stories/${a.id}/change`, body: { ...pick(a, ['title', 'spec', 'verify']), reviewer: toArray(a.reviewer) } }),
  },
  'story.activate': {
    v1: a => ({ method: 'POST', path: `/stories/${a.id}/active` }),
    v2: a => ({ method: 'PUT', path: `/stories/${a.id}/activate` }),
  },
  'story.delete': {
    v1: a => ({ method: 'DELETE', path: `/stories/${a.id}` }),
    v2: a => ({ method: 'DELETE', path: `/stories/${a.id}` }),
  },

  // tasks
  'task.list': {
    v1: a => ({ method: 'GET', path: `/executions/${a.execution}/tasks${qs(pageV1(a))}` }),
    v2: a => ({ method: 'GET', path: `/executions/${a.execution}/tasks${qs(pageV2(a))}` }),
  },
  'task.get': {
    v1: a => ({ method: 'GET', path: `/tasks/${a.id}` }),
    v2: a => ({ method: 'GET', path: `/tasks/${a.id}` }),
  },
  'task.create': {
    v1: a => ({ method: 'POST', path: `/executions/${a.execution}/tasks`, body: taskCreateBody(a, 'v1') }),
    v2: a => ({ method: 'POST', path: '/tasks', body: taskCreateBody(a, 'v2') }),
  },
  'task.update': {
    v1: a => ({ method: 'PUT', path: `/tasks/${a.id}`, body: taskUpdateBody(a) }),
    v2: a => ({ method: 'PUT', path: `/tasks/${a.id}`, body: taskUpdateBody(a) }),
  },
  'task.delete': {
    v1: a => ({ method: 'DELETE', path: `/tasks/${a.id}` }),
    v2: a => ({ method: 'DELETE', path: `/tasks/${a.id}` }),
  },

  'task.start': {
    v1: a => ({ method: 'POST', path: `/tasks/${a.id}/start`, body: taskActionBody(a) }),
    v2: a => ({ method: 'PUT', path: `/tasks/${a.id}/start`, body: taskActionBody(a) }),
  },
  'task.pause': {
    v1: a => ({ method: 'POST', path: `/tasks/${a.id}/pause`, body: taskActionBody(a) }),
    v2: a => ({ method: 'PUT', path: `/tasks/${a.id}/pause`, body: taskActionBody(a) }),
  },
  'task.restart': {
    v1: a => ({ method: 'POST', path: `/tasks/${a.id}/restart`, body: taskActionBody(a) }),
    v2: a => ({ method: 'PUT', path: `/tasks/${a.id}/restart`, body: taskActionBody(a) }),
  },
  'task.finish': {
    v1: a => ({ method: 'POST', path: `/tasks/${a.id}/finish`, body: taskActionBody(a) }),
    v2: a => ({ method: 'PUT', path: `/tasks/${a.id}/finish`, body: taskActionBody(a) }),
  },
  'task.close': {
    v1: a => ({ method: 'POST', path: `/tasks/${a.id}/close`, body: taskActionBody(a) }),
    v2: a => ({ method: 'PUT', path: `/tasks/${a.id}/close`, body: taskActionBody(a) }),
  },
  'task.activate': {
    v1: a => ({ method: 'POST', path: `/tasks/${a.id}/active` }),
    v2: a => ({ method: 'PUT', path: `/tasks/${a.id}/activate` }),
  },

  // executions
  'execution.list': {
    v1: a => ({ method: 'GET', path: (a.project ? `/projects/${a.project}/executions` : '/executions') + qs(pageV1(a, a.status ? { status: a.status } : {})) }),
    v2: a => ({ method: 'GET', path: (a.project ? `/projects/${a.project}/executions` : '/executions') + qs(pageV2(a, a.status ? { status: a.status } : {})) }),
  },
  'execution.get': {
    v1: a => ({ method: 'GET', path: `/executions/${a.id}` }),
    v2: a => ({ method: 'GET', path: `/executions/${a.id}` }),
  },
  'execution.create': {
    v1: a => ({ method: 'POST', path: `/projects/${a.project}/executions`, body: executionBody(a, 'v1') }),
    v2: a => ({ method: 'POST', path: '/executions', body: executionBody(a, 'v2') }),
  },
  'execution.update': {
    v1: a => ({ method: 'PUT', path: `/executions/${a.id}`, body: executionBody(a, 'v1') }),
    v2: a => ({ method: 'PUT', path: `/executions/${a.id}`, body: executionBody(a, 'v2') }),
  },
  'execution.delete': {
    v1: a => ({ method: 'DELETE', path: `/executions/${a.id}` }),
    v2: a => ({ method: 'DELETE', path: `/executions/${a.id}` }),
  },
  'execution.start': { v2: a => ({ method: 'PUT', path: `/executions/${a.id}/start` }) },
  'execution.suspend': { v2: a => ({ method: 'PUT', path: `/executions/${a.id}/suspend` }) },
  'execution.close': { v2: a => ({ method: 'PUT', path: `/executions/${a.id}/close` }) },

  // bugs
  'bug.list': {
    v1: a => ({ method: 'GET', path: bugListPath(a) + qs(pageV1(a)) }),
    v2: a => ({ method: 'GET', path: bugListPath(a) + qs(pageV2(a)) }),
  },
  'bug.get': {
    v1: a => ({ method: 'GET', path: `/bugs/${a.id}` }),
    v2: a => ({ method: 'GET', path: `/bugs/${a.id}` }),
  },
  'bug.create': {
    v1: a => ({ method: 'POST', path: '/bugs', body: bugCreateBody(a, 'v1') }),
    v2: a => ({ method: 'POST', path: '/bugs', body: bugCreateBody(a, 'v2') }),
  },
  'bug.update': {
    v1: a => ({ method: 'PUT', path: `/bugs/${a.id}`, body: bugUpdateBody(a) }),
    v2: a => ({ method: 'PUT', path: `/bugs/${a.id}`, body: bugUpdateBody(a) }),
  },
  'bug.delete': {
    v1: a => ({ method: 'DELETE', path: `/bugs/${a.id}` }),
    v2: a => ({ method: 'DELETE', path: `/bugs/${a.id}` }),
  },
  'bug.resolve': {
    v1: a => ({ method: 'POST', path: `/bugs/${a.id}/resolve`, body: bugActionBody(a) }),
    v2: a => ({ method: 'PUT', path: `/bugs/${a.id}/resolve`, body: bugActionBody(a) }),
  },
  'bug.close': {
    v1: a => ({ method: 'POST', path: `/bugs/${a.id}/close`, body: pick(a, ['comment']) }),
    v2: a => ({ method: 'PUT', path: `/bugs/${a.id}/close`, body: pick(a, ['comment']) }),
  },
  'bug.activate': {
    v1: a => ({ method: 'POST', path: `/bugs/${a.id}/active`, body: pick(a, ['openedBuild', 'comment']) }),
    v2: a => ({ method: 'PUT', path: `/bugs/${a.id}/activate`, body: pick(a, ['openedBuild', 'comment']) }),
  },
  'bug.confirm': {
    v1: a => ({ method: 'POST', path: `/bugs/${a.id}/confirm`, body: pick(a, ['comment']) }),
    v2: a => ({ method: 'PUT', path: `/bugs/${a.id}/confirm`, body: pick(a, ['comment']) }),
  },

  // test cases
  'testcase.list': {
    v1: a => ({ method: 'GET', path: testcaseListPath(a) + qs(pageV1(a)) }),
    v2: a => ({ method: 'GET', path: testcaseListPath(a) + qs(pageV2(a)) }),
  },
  'testcase.get': {
    v1: a => ({ method: 'GET', path: `/testcases/${a.id}${qs({ version: a.specVersion })}` }),
    v2: a => ({ method: 'GET', path: `/testcases/${a.id}${qs({ version: a.specVersion })}` }),
  },
  'testcase.create': {
    v1: a => ({ method: 'POST', path: '/testcases', body: testcaseBody(a, 'v1') }),
    v2: a => ({ method: 'POST', path: '/testcases', body: testcaseBody(a, 'v2') }),
  },
  'testcase.update': {
    v1: a => ({ method: 'PUT', path: `/testcases/${a.id}`, body: testcaseBody(a, 'v1') }),
    v2: a => ({ method: 'PUT', path: `/testcases/${a.id}`, body: testcaseBody(a, 'v2') }),
  },
  'testcase.delete': {
    v1: a => ({ method: 'DELETE', path: `/testcases/${a.id}` }),
    v2: a => ({ method: 'DELETE', path: `/testcases/${a.id}` }),
  },

  // users
  'user.list': {
    v1: a => ({ method: 'GET', path: `/users${qs(pageV1(a, { browse: a.browse, full: a.full }))}` }),
    v2: a => ({ method: 'GET', path: `/users${qs(pageV2(a))}` }),
  },
  'user.get': {
    v1: a => ({ method: 'GET', path: `/users/${a.id}` }),
    v2: a => ({ method: 'GET', path: `/users/${a.id}` }),
  },
  'user.create': {
    v1: a => ({ method: 'POST', path: '/users', body: userCreateBody(a, 'v1') }),
    v2: a => ({ method: 'POST', path: '/users', body: userCreateBody(a, 'v2') }),
  },
  'user.update': {
    v1: a => ({ method: 'PUT', path: `/users/${a.id}`, body: userUpdateBody(a, 'v1') }),
    v2: a => ({ method: 'PUT', path: `/users/${a.id}`, body: userUpdateBody(a, 'v2') }),
  },
  'user.delete': {
    v1: a => ({ method: 'DELETE', path: `/users/${a.id}` }),
    v2: a => ({ method: 'DELETE', path: `/users/${a.id}` }),
  },

  // test tasks（测试单，仅 v1 读接口；创建需要 build，见 skill 文档）
  'testtask.list': {
    v1: a => ({
      method: 'GET',
      path: `/testtasks${qs(pageV1(a, {
        product: a.product,
        project: a.project,
        status: a.status,
      }))}`,
    }),
  },
  'testtask.get': {
    v1: a => ({ method: 'GET', path: `/testtasks/${a.id}` }),
  },
  'testtask.delete': {
    v1: a => ({ method: 'DELETE', path: `/testtasks/${a.id}` }),
  },

  // files
  'file.get': {
    v2: a => ({ method: 'GET', path: `/files/${a.id}` }),
  },

  // groups / departments（仅 v1）
  'group.list': {
    v1: () => ({ method: 'GET', path: '/groups' }),
  },
  'dept.list': {
    v1: () => ({ method: 'GET', path: '/departments' }),
  },
  'dept.get': {
    v1: a => ({ method: 'GET', path: `/departments/${a.id}` }),
  },
}

/** 供命令层生成生命周期操作名：task.start / bug.resolve ... */
export function actionOp(resource: string, action: string): string {
  return `${resource}.${action}`
}

/** 各资源 update 需要合并的字段（ZenTao PUT 会重置未提交字段） */
export const UPDATE_MERGE_FIELDS: Record<string, string[]> = {
  product: ['name', 'program', 'line', 'type', 'PO', 'reviewer', 'desc', 'QD', 'RD', 'acl'],
  project: ['name', 'model', 'begin', 'end', 'PM', 'products', 'parent', 'workflowGroup'],
  story: ['title', 'spec', 'verify', 'category', 'source', 'sourceNote', 'assignedTo', 'module', 'parent', 'pri', 'product'],
  task: ['name', 'type', 'assignedTo', 'estStarted', 'deadline', 'desc', 'pri', 'estimate', 'module', 'story', 'execution'],
  execution: ['name', 'begin', 'end', 'lifetime', 'PO', 'QD', 'PM', 'RD', 'acl', 'products', 'days'],
  bug: ['title', 'type', 'steps', 'assignedTo', 'status', 'severity', 'pri', 'story', 'execution'],
  testcase: ['title', 'type', 'precondition', 'module', 'story', 'pri', 'product', 'project', 'execution'],
  user: ['realname', 'email', 'role', 'gender', 'dept', 'visions', 'group'],
}
