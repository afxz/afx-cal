"use client";

import { TOOL_MAP } from "@/lib/meta";
import { TOOL_COMPONENTS } from "@/lib/registry";
import ToolShell from "@/components/ToolShell";
import { notFound } from "next/navigation";

/**
 * 工具页的客户端实现。
 * 必须在客户端读取 TOOL_COMPONENTS —— 服务端组件导入 'use client' 模块后，
 * 拿到的是客户端引用代理，成员在服务端均为 undefined。
 */
export default function ToolPageClient({ id }: { id: string }) {
  const meta = TOOL_MAP[id];
  const Component = TOOL_COMPONENTS[id];
  if (!meta || !Component) {
    notFound();
    return null;
  }
  return (
    <ToolShell meta={meta}>
      <Component />
    </ToolShell>
  );
}
