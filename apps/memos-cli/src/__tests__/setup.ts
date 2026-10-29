/**
 * 测试环境准备。
 *
 * 凭据只从进程环境变量读取（例如写进 ~/.zshrc 后由 shell 注入），
 * 不在仓库内放置任何 .env 或凭据文件。
 */

// 供 shell 未加载时给出明确提示，缺失时在 requireEnv 中抛错
export const REQUIRED_ENV = ['MEMOS_BASE_URL', 'MEMOS_ACCESS_TOKEN'] as const
