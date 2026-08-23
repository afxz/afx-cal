"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CATEGORY_MAP, TOOLS, type ToolMeta } from "@/lib/meta";

export default function ToolShell({ meta, children }: { meta: ToolMeta; children: ReactNode }) {
  const cat = CATEGORY_MAP[meta.category];
  const idx = TOOLS.findIndex((t) => t.id === meta.id);
  const prev = idx > 0 ? TOOLS[idx - 1] : null;
  const next = idx < TOOLS.length - 1 ? TOOLS[idx + 1] : null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
      <div className="mb-4 flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
        <Link href="/" className="transition hover:text-zinc-700 dark:hover:text-zinc-200">
          ← 返回主页
        </Link>
        <span>/</span>
        <Link href="/" className="transition hover:text-zinc-700 dark:hover:text-zinc-200">
          {cat.icon} {cat.title}
        </Link>
      </div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{meta.name}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{meta.desc}</p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {children}
      </div>
      <div className="mt-6 flex items-center justify-between gap-3 text-sm">
        {prev ? (
          <Link
            href={`/tools/${prev.id}`}
            className="max-w-[45%] truncate rounded-lg border border-zinc-200 px-3 py-2 text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-indigo-800 dark:hover:text-indigo-400"
          >
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/tools/${next.id}`}
            className="max-w-[45%] truncate rounded-lg border border-zinc-200 px-3 py-2 text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-indigo-800 dark:hover:text-indigo-400"
          >
            {next.name} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
