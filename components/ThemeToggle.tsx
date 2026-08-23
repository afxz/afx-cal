"use client";

import { useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

export function applyTheme(mode: ThemeMode) {
  const dark =
    mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function getThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("afx-theme") as ThemeMode) || "system";
}

export function setThemeMode(mode: ThemeMode) {
  localStorage.setItem("afx-theme", mode);
  applyTheme(mode);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getThemeMode());

  const cycle = () => {
    const next: ThemeMode = mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
    setMode(next);
    setThemeMode(next);
  };

  const label = mode === "light" ? "浅色" : mode === "dark" ? "深色" : "跟随系统";

  return (
    <button
      type="button"
      onClick={cycle}
      title={`主题：${label}（点击切换）`}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      <span>{mode === "light" ? "☀️" : mode === "dark" ? "🌙" : "🖥"}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
