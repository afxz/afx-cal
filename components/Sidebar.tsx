"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, TOOLS } from "@/lib/meta";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const activeTool = pathname.startsWith("/tools/") ? pathname.split("/")[2] : null;

  const nav = (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {CATEGORIES.map((cat) => {
        const tools = TOOLS.filter((t) => t.category === cat.id);
        return (
          <div key={cat.id} className="mb-4">
            <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              {cat.icon} {cat.title}
            </div>
            <div className="space-y-0.5">
              {tools.map((t) => (
                <Link
                  key={t.id}
                  href={`/tools/${t.id}`}
                  className={
                    "block truncate rounded-md px-2 py-1.5 text-[13px] transition " +
                    (activeTool === t.id
                      ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200")
                  }
                >
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* 顶部栏（移动端） */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 py-2.5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 lg:hidden">
        <button
          type="button"
          aria-label="打开菜单"
          className="rounded-lg border border-zinc-300 p-1.5 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
          onClick={() => setOpen(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
        <Link href="/" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          ⚡ Afx Cal
        </Link>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      {/* 桌面侧边栏 */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-lg text-white">⚡</span>
          <span>
            <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-100">Afx Cal</span>
            <span className="block text-[11px] text-zinc-400 dark:text-zinc-500">开发者工具箱 · 38 个工具</span>
          </span>
        </Link>
        {nav}
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <ThemeToggle />
        </div>
      </aside>

      {/* 移动端抽屉 */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">⚡ Afx Cal</span>
              <button
                type="button"
                aria-label="关闭菜单"
                className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}
    </>
  );
}
