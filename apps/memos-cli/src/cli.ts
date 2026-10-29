import { createRequire } from 'node:module'
import { Command } from 'commander'
import { registerAttachmentCommand } from './commands/attachment.js'
import { registerAuthCommand } from './commands/auth.js'
import { registerCommentCommand } from './commands/comment.js'
import { registerMeCommand } from './commands/me.js'
import { registerMemoCommand } from './commands/memo.js'
import { registerReactionCommand } from './commands/reaction.js'
import { registerRelationCommand } from './commands/relation.js'
import { registerShareCommand } from './commands/share.js'
import { registerSpaceCommand } from './commands/space.js'
import { registerTagCommand } from './commands/tag.js'
import { setPretty } from './output.js'

const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

const program = new Command()

program
  .name('memos-cli')
  .description('CLI for Memos - A self-hosted timeline-based note service')
  .version(version)
  .option('--base-url <url>', 'Memos 服务地址（或 env: MEMOS_BASE_URL）')
  .option('--token <token>', '访问令牌（或 env: MEMOS_ACCESS_TOKEN）')
  .option('--api-path <path>', 'API 路径前缀，默认 /api/v1；v0.32+ 用 /api（或 env: MEMOS_API_PATH）')
  .option('--pretty', '美化 JSON 输出')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts()
    if (opts.pretty) {
      setPretty(true)
    }
  })

registerAuthCommand(program)
registerMemoCommand(program)
registerCommentCommand(program)
registerTagCommand(program)
registerReactionCommand(program)
registerRelationCommand(program)
registerAttachmentCommand(program)
registerShareCommand(program)
registerSpaceCommand(program)
registerMeCommand(program)

program.parse()
