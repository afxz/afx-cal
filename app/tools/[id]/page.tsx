import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TOOL_MAP, CATEGORY_MAP } from "@/lib/meta";
import ToolPageClient from "@/components/ToolPageClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(TOOL_MAP).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const meta = TOOL_MAP[id];
  if (!meta) return { title: "未找到工具" };
  const cat = CATEGORY_MAP[meta.category];
  return {
    title: meta.name,
    description: `${meta.desc}（${cat.title}分类）。Afx Cal 开发者工具箱，全部在浏览器本地运行。`,
  };
}

export default async function ToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!TOOL_MAP[id]) notFound();
  return <ToolPageClient id={id} />;
}
