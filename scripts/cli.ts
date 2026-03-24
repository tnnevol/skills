import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import * as p from '@clack/prompts'
import { manual, submodules, vendors } from '../meta.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function exec(cmd: string, cwd = root): string {
  return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

function execSafe(cmd: string, cwd = root): string | null {
  try {
    return exec(cmd, cwd)
  }
  catch {
    return null
  }
}

function getGitSha(dir: string): string | null {
  return execSafe('git rev-parse HEAD', dir)
}

function submoduleExists(path: string): boolean {
  const gitmodules = join(root, '.gitmodules')
  if (!existsSync(gitmodules))
    return false
  const content = readFileSync(gitmodules, 'utf-8')
  return content.includes(`path = ${path}`)
}

const RE_SUBMODULE_PATH = /path\s*=\s*(.+)/g

function getExistingSubmodulePaths(): string[] {
  const gitmodules = join(root, '.gitmodules')
  if (!existsSync(gitmodules))
    return []
  const content = readFileSync(gitmodules, 'utf-8')
  const matches = content.matchAll(RE_SUBMODULE_PATH)
  return Array.from(matches, match => match[1].trim())
}

function removeSubmodule(submodulePath: string): void {
  // 取消初始化子模块
  execSafe(`git submodule deinit -f ${submodulePath}`)
  // 从 .git/modules 中移除
  const gitModulesPath = join(root, '.git', 'modules', submodulePath)
  if (existsSync(gitModulesPath)) {
    rmSync(gitModulesPath, { recursive: true })
  }
  // 从工作树和 .gitmodules 中移除
  exec(`git rm -f ${submodulePath}`)
}

interface Project {
  name: string
  url: string
  type: 'source' | 'vendor'
  path: string
}

interface VendorConfig {
  source: string
  skills: Record<string, string> // sourceSkillName -> outputSkillName
}

async function initSubmodules(skipPrompt = false) {
  const allProjects: Project[] = [
    ...Object.entries(submodules).map(([name, url]) => ({
      name,
      url,
      type: 'source' as const,
      path: `sources/${name}`,
    })),
    ...Object.entries(vendors).map(([name, config]) => ({
      name,
      url: (config as VendorConfig).source,
      type: 'vendor' as const,
      path: `vendor/${name}`,
    })),
  ]

  const spinner = p.spinner()

  // 检查不在 meta.ts 中的多余子模块
  const existingSubmodulePaths = getExistingSubmodulePaths()
  const expectedPaths = new Set(allProjects.map(p => p.path))
  const extraSubmodules = existingSubmodulePaths.filter(path => !expectedPaths.has(path))

  if (extraSubmodules.length > 0) {
    p.log.warn(`发现 ${extraSubmodules.length} 个不在 meta.ts 中的子模块:`)
    for (const path of extraSubmodules) {
      p.log.message(`  - ${path}`)
    }

    const shouldRemove = skipPrompt
      ? true
      : await p.confirm({
          message: '是否移除这些多余的子模块？',
          initialValue: true,
        })

    if (p.isCancel(shouldRemove)) {
      p.cancel('已取消')
      return
    }

    if (shouldRemove) {
      for (const submodulePath of extraSubmodules) {
        spinner.start(`正在移除子模块: ${submodulePath}`)
        try {
          removeSubmodule(submodulePath)
          spinner.stop(`已移除: ${submodulePath}`)
        }
        catch (e) {
          spinner.stop(`移除 ${submodulePath} 失败: ${e}`)
        }
      }
    }
  }

  const existingProjects = allProjects.filter(p => submoduleExists(p.path))
  const newProjects = allProjects.filter(p => !submoduleExists(p.path))

  if (newProjects.length === 0) {
    p.log.info('所有子模块已初始化')
    return
  }

  const selected = skipPrompt
    ? newProjects
    : await p.multiselect({
        message: '选择要初始化的项目',
        options: newProjects.map(project => ({
          value: project,
          label: `${project.name} (${project.type})`,
          hint: project.url,
        })),
        initialValues: newProjects,
      })

  if (p.isCancel(selected)) {
    p.cancel('已取消')
    return
  }

  for (const project of selected as Project[]) {
    spinner.start(`正在添加子模块: ${project.name}`)

    // 确保父目录存在
    const parentDir = join(root, dirname(project.path))
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true })
    }

    try {
      exec(`git submodule add ${project.url} ${project.path}`)
      spinner.stop(`已添加: ${project.name}`)
    }
    catch (e) {
      spinner.stop(`添加 ${project.name} 失败: ${e}`)
    }
  }

  p.log.success('子模块已初始化')

  if (existingProjects.length > 0) {
    p.log.info(`已初始化: ${existingProjects.map(p => p.name).join(', ')}`)
  }
}

async function syncSubmodules() {
  const spinner = p.spinner()

  // 更新所有子模块
  spinner.start('正在更新子模块...')
  try {
    exec('git submodule update --remote --merge')
    spinner.stop('子模块已更新')
  }
  catch (e) {
    spinner.stop(`更新子模块失败: ${e}`)
    return
  }

  // 同步 Type 2 技能
  for (const [vendorName, config] of Object.entries(vendors)) {
    const vendorConfig = config as VendorConfig
    const vendorPath = join(root, 'vendor', vendorName)
    const vendorSkillsPath = join(vendorPath, 'skills')

    if (!existsSync(vendorPath)) {
      p.log.warn(`供应商子模块未找到: ${vendorName}. 请先运行 init。`)
      continue
    }

    if (!existsSync(vendorSkillsPath)) {
      p.log.warn(`供应商目录中没有技能文件夹: vendor/${vendorName}/skills/`)
      continue
    }

    // 同步每个指定的技能
    for (const [sourceSkillName, outputSkillName] of Object.entries(vendorConfig.skills)) {
      const sourceSkillPath = join(vendorSkillsPath, sourceSkillName)
      const outputPath = join(root, 'skills', outputSkillName)

      if (!existsSync(sourceSkillPath)) {
        p.log.warn(`技能未找到: vendor/${vendorName}/skills/${sourceSkillName}`)
        continue
      }

      spinner.start(`正在同步技能: ${sourceSkillName} → ${outputSkillName}`)

      // 移除现有输出目录以确保干净同步
      if (existsSync(outputPath)) {
        rmSync(outputPath, { recursive: true })
      }
      mkdirSync(outputPath, { recursive: true })

      // 从源技能复制所有文件到输出
      const files = readdirSync(sourceSkillPath, { recursive: true, withFileTypes: true })
      for (const file of files) {
        if (file.isFile()) {
          const fullPath = join(file.parentPath, file.name)
          const relativePath = fullPath.replace(sourceSkillPath, '')
          const destPath = join(outputPath, relativePath)

          // 确保目标目录存在
          const destDir = dirname(destPath)
          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true })
          }

          cpSync(fullPath, destPath)
        }
      }

      // 从供应商仓库根目录复制许可证文件（如果存在）
      const licenseNames = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'license.md', 'license.txt']
      for (const licenseName of licenseNames) {
        const licensePath = join(vendorPath, licenseName)
        if (existsSync(licensePath)) {
          cpSync(licensePath, join(outputPath, 'LICENSE.md'))
          break
        }
      }

      // 更新 SYNC.md（而非 GENERATION.md，适用于供应商技能）
      const sha = getGitSha(vendorPath)
      const syncPath = join(outputPath, 'SYNC.md')
      const date = new Date().toISOString().split('T')[0]

      const syncContent = `# 同步信息

- **来源:** \`vendor/${vendorName}/skills/${sourceSkillName}\`
- **Git SHA:** \`${sha}\`
- **同步时间:** ${date}
`

      writeFileSync(syncPath, syncContent)

      spinner.stop(`已同步: ${sourceSkillName} → ${outputSkillName}`)
    }
  }

  p.log.success('所有技能已同步')
}

async function checkUpdates() {
  const spinner = p.spinner()
  spinner.start('正在获取远程更改...')

  try {
    exec('git submodule foreach git fetch')
    spinner.stop('已获取远程更改')
  }
  catch (e) {
    spinner.stop(`获取失败: ${e}`)
    return
  }

  const updates: { name: string, type: string, behind: number }[] = []

  // 检查源
  for (const name of Object.keys(submodules)) {
    const path = join(root, 'sources', name)
    if (!existsSync(path))
      continue

    const behind = execSafe('git rev-list HEAD..@{u} --count', path)
    const count = behind ? Number.parseInt(behind) : 0
    if (count > 0) {
      updates.push({ name, type: 'source', behind: count })
    }
  }

  // 检查供应商
  for (const [name, config] of Object.entries(vendors)) {
    const vendorConfig = config as VendorConfig
    const path = join(root, 'vendor', name)
    if (!existsSync(path))
      continue

    const behind = execSafe('git rev-list HEAD..@{u} --count', path)
    const count = behind ? Number.parseInt(behind) : 0
    if (count > 0) {
      const skillNames = Object.values(vendorConfig.skills).join(', ')
      updates.push({ name: `${name} (${skillNames})`, type: 'vendor', behind: count })
    }
  }

  if (updates.length === 0) {
    p.log.success('所有子模块已是最新')
  }
  else {
    p.log.info('有更新可用:')
    for (const update of updates) {
      p.log.message(`  ${update.name} (${update.type}): ${update.behind} 个提交落后`)
    }
  }
}

function getExpectedSkillNames(): Set<string> {
  const expected = new Set<string>()

  // 来自子模块的技能（生成的技能使用与子模块键相同的名称）
  for (const name of Object.keys(submodules)) {
    expected.add(name)
  }

  // 来自供应商的技能（使用输出技能名称）
  for (const config of Object.values(vendors)) {
    const vendorConfig = config as VendorConfig
    for (const outputName of Object.values(vendorConfig.skills)) {
      expected.add(outputName)
    }
  }

  // 手动技能
  for (const name of manual) {
    expected.add(name)
  }

  return expected
}

function getExistingSkillNames(): string[] {
  const skillsDir = join(root, 'skills')
  if (!existsSync(skillsDir))
    return []

  return readdirSync(skillsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
}

async function cleanup(skipPrompt = false) {
  const spinner = p.spinner()
  let hasChanges = false

  // 1. 查找并移除多余子模块
  const allProjects: Project[] = [
    ...Object.entries(submodules).map(([name, url]) => ({
      name,
      url,
      type: 'source' as const,
      path: `sources/${name}`,
    })),
    ...Object.entries(vendors).map(([name, config]) => ({
      name,
      url: (config as VendorConfig).source,
      type: 'vendor' as const,
      path: `vendor/${name}`,
    })),
  ]

  const existingSubmodulePaths = getExistingSubmodulePaths()
  const expectedSubmodulePaths = new Set(allProjects.map(p => p.path))
  const extraSubmodules = existingSubmodulePaths.filter(path => !expectedSubmodulePaths.has(path))

  if (extraSubmodules.length > 0) {
    p.log.warn(`发现 ${extraSubmodules.length} 个不在 meta.ts 中的子模块:`)
    for (const path of extraSubmodules) {
      p.log.message(`  - ${path}`)
    }

    const shouldRemove = skipPrompt
      ? true
      : await p.confirm({
          message: '是否移除这些多余的子模块？',
          initialValue: true,
        })

    if (p.isCancel(shouldRemove)) {
      p.cancel('已取消')
      return
    }

    if (shouldRemove) {
      hasChanges = true
      for (const submodulePath of extraSubmodules) {
        spinner.start(`正在移除子模块: ${submodulePath}`)
        try {
          removeSubmodule(submodulePath)
          spinner.stop(`已移除: ${submodulePath}`)
        }
        catch (e) {
          spinner.stop(`移除 ${submodulePath} 失败: ${e}`)
        }
      }
    }
  }

  // 2. 查找并移除多余技能
  const existingSkills = getExistingSkillNames()
  const expectedSkills = getExpectedSkillNames()
  const extraSkills = existingSkills.filter(name => !expectedSkills.has(name))

  if (extraSkills.length > 0) {
    p.log.warn(`发现 ${extraSkills.length} 个不在 meta.ts 中的技能:`)
    for (const name of extraSkills) {
      p.log.message(`  - skills/${name}`)
    }

    const shouldRemove = skipPrompt
      ? true
      : await p.confirm({
          message: '是否移除这些多余的技能？',
          initialValue: true,
        })

    if (p.isCancel(shouldRemove)) {
      p.cancel('已取消')
      return
    }

    if (shouldRemove) {
      hasChanges = true
      for (const skillName of extraSkills) {
        spinner.start(`正在移除技能: ${skillName}`)
        try {
          rmSync(join(root, 'skills', skillName), { recursive: true })
          spinner.stop(`已移除: skills/${skillName}`)
        }
        catch (e) {
          spinner.stop(`移除 skills/${skillName} 失败: ${e}`)
        }
      }
    }
  }

  if (!hasChanges && extraSubmodules.length === 0 && extraSkills.length === 0) {
    p.log.success('一切已清理，未发现未使用的子模块或技能')
  }
  else if (hasChanges) {
    p.log.success('清理完成')
  }
}

async function main() {
  const args = process.argv.slice(2)
  const skipPrompt = args.includes('-y') || args.includes('--yes')
  const command = args.find(arg => !arg.startsWith('-'))

  // 直接处理子命令
  if (command === 'init') {
    p.intro('技能管理器 - 初始化')
    await initSubmodules(skipPrompt)
    p.outro('完成')
    return
  }

  if (command === 'sync') {
    p.intro('技能管理器 - 同步')
    await syncSubmodules()
    p.outro('完成')
    return
  }

  if (command === 'check') {
    p.intro('技能管理器 - 检查')
    await checkUpdates()
    p.outro('完成')
    return
  }

  if (command === 'cleanup') {
    p.intro('技能管理器 - 清理')
    await cleanup(skipPrompt)
    p.outro('完成')
    return
  }

  // 无子命令：显示交互菜单（需要交互）
  if (skipPrompt) {
    p.log.error('使用 -y 标志时需要指定命令')
    p.log.info('可用命令: init, sync, check, cleanup')
    process.exit(1)
  }

  p.intro('技能管理器')

  const action = await p.select({
    message: '您想做什么？',
    options: [
      { value: 'sync', label: '同步子模块', hint: '拉取最新版本并同步 Type 2 技能' },
      { value: 'init', label: '初始化子模块', hint: '添加新子模块' },
      { value: 'check', label: '检查更新', hint: '查看可用更新' },
      { value: 'cleanup', label: '清理', hint: '移除未使用的子模块和技能' },
    ],
  })

  if (p.isCancel(action)) {
    p.cancel('已取消')
    process.exit(0)
  }

  switch (action) {
    case 'init':
      await initSubmodules()
      break
    case 'sync':
      await syncSubmodules()
      break
    case 'check':
      await checkUpdates()
      break
    case 'cleanup':
      await cleanup()
      break
  }

  p.outro('完成')
}

main().catch(console.error)