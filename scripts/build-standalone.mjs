/**
 * 生成 standalone 产物并补全静态资源，使其可独立运行：
 *   pnpm build:standalone
 *   pnpm start:standalone
 *
 * Next.js 的 standalone 产物不会自动包含 .next/static 与 public，
 * 需要手动复制，否则把产物单独部署（Docker 等）时样式与脚本会 404。
 */
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = process.cwd();

console.log("→ 构建 standalone 产物…");
execSync("next build", {
  stdio: "inherit",
  env: { ...process.env, NEXT_OUTPUT: "standalone" },
});

const copies = [
  [".next/static", ".next/standalone/.next/static"],
  ["public", ".next/standalone/public"],
];

for (const [from, to] of copies) {
  const src = resolve(root, from);
  if (!existsSync(src)) {
    console.log(`· 跳过 ${from}（不存在）`);
    continue;
  }
  const dest = resolve(root, to);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log(`· 已复制 ${from} → ${to}`);
}

console.log("\n✓ standalone 产物就绪，启动命令：pnpm start:standalone");
