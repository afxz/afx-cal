import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 工具类静态站点，全部路由静态预渲染
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
