import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 默认使用常规构建产物，"next start" 可正常工作。
  // 需要自托管的精简产物（Docker 等）时改用：
  //   pnpm build:standalone && pnpm start:standalone
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
};

export default nextConfig;
