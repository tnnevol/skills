import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

// 从 apps/openlist-cli/.env 加载环境变量，供单元测试使用
const currentDir = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(currentDir, '../../.env') })
