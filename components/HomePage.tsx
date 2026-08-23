"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, TOOLS } from "@/lib/meta";

export default function HomePage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOLS;
    return TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.keywords.toLowerCase().includes(q) ||
        t.id.includes(q),
    );
  }, [query]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl text-white shadow-lg shadow-indigo-600/25">
          ⚡
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Afx Cal</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          面向开发与日常编码的计算器 / 工具箱 · 9 大分类 · {TOOLS.length} 个小工具 · 全部在浏览器本地运行
        </p>
        <div className="mx-auto mt-5 max-w-xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索工具，如 base64、json、房贷、时区…"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-400">没有找到匹配「{query}」的工具</div>
      ) : query ? (
        <section>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <ToolCard key={t.id} id={t.id} name={t.name} desc={t.desc} icon={CATEGORIES.find((c) => c.id === t.category)?.icon ?? "🧰"} />
            ))}
          </div>
        </section>
      ) : (
        CATEGORIES.map((cat) => {
          const tools = TOOLS.filter((t) => t.category === cat.id);
          return (
            <section key={cat.id} className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg">{cat.icon}</span>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{cat.title}</h2>
                <span className="text-xs text-zinc-400">{tools.length} 个工具</span>
              </div>
              <p className="mb-3 text-xs text-zinc-400 dark:text-zinc-500">{cat.blurb}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((t) => (
                  <ToolCard key={t.id} id={t.id} name={t.name} desc={t.desc} icon={cat.icon} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function ToolCard({ id, name, desc, icon }: { id: string; name: string; desc: string; icon: string }) {
  return (
    <Link
      href={`/tools/${id}`}
      className="group flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
    >
      <span className="mt-0.5 text-xl">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-zinc-900 transition group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
          {name}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {desc}
        </span>
      </span>
    </Link>
  );
}
