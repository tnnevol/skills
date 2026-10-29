import type { Command } from 'commander'
import { printSuccess } from '../output.js'
import { fail, getClient } from './shared.js'

export function registerMeCommand(program: Command): void {
  const me = program.command('me').description('查看当前用户与实例信息')

  me.command('get')
    .description('获取当前登录用户')
    .action(async (_options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const data = await client.get('/auth/me')
        printSuccess(data, 'me.get')
      }
      catch (error) {
        fail(error, '获取当前用户失败')
      }
    })

  me.command('stats')
    .description('获取用户统计（笔记数、标签分布等）')
    .option('--user <user>', '指定用户（users/xxx 或纯用户名），默认当前用户')
    .option('--filter <expr>', '统计过滤表达式')
    .action(async (options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        let userName: string = options.user || ''
        if (!userName) {
          const meData = await client.get<{ user?: { username?: string } }>('/auth/me')
          const username = meData?.user?.username
          if (!username) {
            throw new Error('无法从 /auth/me 解析当前用户名，请用 --user 指定')
          }
          userName = `users/${username}`
        }
        else if (!userName.includes('/')) {
          userName = `users/${userName}`
        }

        const data = await client.get(`/${userName}:getStats`, { filter: options.filter })
        printSuccess(data, 'me.stats')
      }
      catch (error) {
        fail(error, '获取用户统计失败')
      }
    })

  me.command('instance')
    .description('获取实例信息（版本、访问模式等）')
    .action(async (_options, cmd: Command) => {
      try {
        const client = getClient(cmd)
        const data = await client.get('/instance/profile')
        printSuccess(data, 'me.instance')
      }
      catch (error) {
        fail(error, '获取实例信息失败')
      }
    })
}
