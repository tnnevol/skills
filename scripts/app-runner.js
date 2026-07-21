#!/usr/bin/env node
import { select, isCancel, cancel } from "@clack/prompts";
import { readdirSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const appsDir = join(rootDir, "apps");

const command = process.argv[2];

if (!command) {
  console.error("用法: node app-runner.js <dev|build|clean|bump|publish>");
  process.exit(1);
}

// 扫描 apps/ 下的应用
const apps = readdirSync(appsDir).filter((dir) => {
  return existsSync(join(appsDir, dir, "package.json"));
});

if (apps.length === 0) {
  console.error("apps/ 目录下没有找到任何应用");
  process.exit(1);
}

// 选择应用
const app = await select({
  message: "选择应用",
  options: apps.map((a) => ({ value: a, label: a })),
});

if (isCancel(app)) {
  cancel("已取消");
  process.exit(0);
}

const appPath = join(appsDir, app);
const pkgPath = join(appPath, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
const packageName = pkg.name;

console.log(`\n选择的应用: ${app} (${packageName})\n`);

// 执行命令
switch (command) {
  case "dev":
  case "build":
  case "clean":
    execSync(`pnpm --filter ${packageName} ${command}`, {
      cwd: rootDir,
      stdio: "inherit",
    });
    break;

  case "bump":
    execSync(`pnpm exec bumpp --no-push`, { cwd: appPath, stdio: "inherit" });
    break;

  case "publish": {
    console.log(`\n正在构建 ${app}...`);
    execSync(`pnpm --filter ${packageName} build`, {
      cwd: rootDir,
      stdio: "inherit",
    });
    console.log(`\n正在发布 ${app}...`);
    execSync(`pnpm --filter ${packageName} publish --access public`, {
      cwd: rootDir,
      stdio: "inherit",
    });
    break;
  }

  default:
    console.error(`未知命令: ${command}`);
    process.exit(1);
}
