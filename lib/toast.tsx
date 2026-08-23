"use client";

import { useEffect, useState } from "react";

interface ToastItem {
  id: number;
  msg: string;
  type: "ok" | "err";
}

export function toast(msg: string, type: "ok" | "err" = "ok") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("afx-toast", { detail: { msg, type, id: Date.now() + Math.random() } }),
  );
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail as ToastItem;
      setItems((prev) => [...prev, d]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== d.id)), 2200);
    };
    window.addEventListener("afx-toast", handler);
    return () => window.removeEventListener("afx-toast", handler);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
      {items.map((it) => (
        <div
          key={it.id}
          className={
            "rounded-lg px-4 py-2 text-sm font-medium shadow-lg transition " +
            (it.type === "ok"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-red-600 text-white")
          }
        >
          {it.msg}
        </div>
      ))}
    </div>
  );
}
