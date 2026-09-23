"use client";

import { useState, type ReactNode } from "react";
import { toast } from "@/lib/toast";

// ---------- 样式常量 ----------

export const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 " +
  "placeholder-zinc-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 " +
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500";

export const selectCls =
  "rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-sm text-zinc-900 outline-none transition " +
  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 " +
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium " +
  "text-white transition hover:bg-indigo-500 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50";

export const btnGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium " +
  "text-zinc-700 transition hover:bg-zinc-50 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 " +
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";

export const cardCls =
  "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900";

// ---------- 基础控件 ----------

export function Field({
  label,
  children,
  className = "",
  hint,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <label className={"block " + className}>
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
      )}
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-400 dark:text-zinc-500">{hint}</span>}
    </label>
  );
}

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputCls + (className ? " " + className : "")} {...props} />;
}

export function TextArea({
  rows = 6,
  mono = true,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { mono?: boolean }) {
  return (
    <textarea
      rows={rows}
      className={
        inputCls + " resize-y " + (mono ? "font-mono text-[13px] leading-relaxed " : "") + className
      }
      {...props}
    />
  );
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function CopyButton({
  getText,
  label = "复制",
}: {
  getText: () => string;
  label?: string;
}) {
  const onClick = async () => {
    const ok = await copyText(getText());
    toast(ok ? "已复制到剪贴板" : "复制失败");
  };
  return (
    <button type="button" onClick={onClick} className={btnGhost + " !px-2.5 !py-1.5 text-xs"}>
      📋 {label}
    </button>
  );
}

// ---------- 输出框 ----------

export function ResultBox({
  value,
  placeholder = "结果将在这里显示",
  rows = 6,
}: {
  value: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          输出 {value ? `(${value.length} 字符)` : ""}
        </span>
        <CopyButton getText={() => value} />
      </div>
      <textarea
        rows={rows}
        readOnly
        placeholder={placeholder}
        value={value}
        className={inputCls + " resize-y font-mono text-[13px] leading-relaxed"}
        spellCheck={false}
      />
    </div>
  );
}

export function KeyValue({ k, v, mono = false }: { k: string; v: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-zinc-100 py-2 last:border-0 dark:border-zinc-800">
      <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">{k}</span>
      <span
        className={
          "text-right text-sm font-medium text-zinc-900 dark:text-zinc-100 " + (mono ? "font-mono" : "")
        }
      >
        {v}
      </span>
    </div>
  );
}

// ---------- 双向转换器 ----------

export interface ConverterOptions {
  opts: Record<string, string>;
  set: (patch: Record<string, string>) => void;
}

export function Converter({
  encode,
  decode,
  options,
  placeholder = "在此输入内容…",
  rows = 7,
  encodeBtnLabel = "编码 →",
  decodeBtnLabel = "← 解码",
}: {
  encode: (text: string, opts: Record<string, string>) => string;
  decode: (text: string, opts: Record<string, string>) => string;
  options?: (ctx: ConverterOptions) => ReactNode;
  placeholder?: string;
  rows?: number;
  encodeBtnLabel?: string;
  decodeBtnLabel?: string;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [opts, setOptsState] = useState<Record<string, string>>({});

  const set = (patch: Record<string, string>) => setOptsState((p) => ({ ...p, ...patch }));
  const swap = () => {
    setInput(output);
    setOutput(input);
    setError("");
  };

  const run = (fn: (t: string, o: Record<string, string>) => string) => {
    if (!input) {
      setOutput("");
      setError("");
      return;
    }
    try {
      setOutput(fn(input, opts));
      setError("");
    } catch (e) {
      setOutput("");
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-3">
      {options && <div className="flex flex-wrap items-end gap-3">{options({ opts, set })}</div>}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            输入 ({input.length} 字符)
          </span>
          <button
            type="button"
            className="text-xs text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
            onClick={() => {
              setInput("");
              setOutput("");
              setError("");
            }}
          >
            清空
          </button>
        </div>
        <textarea
          rows={rows}
          value={input}
          placeholder={placeholder}
          spellCheck={false}
          onChange={(e) => setInput(e.target.value)}
          className={inputCls + " resize-y font-mono text-[13px] leading-relaxed"}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btnPrimary} onClick={() => run(encode)}>
          {encodeBtnLabel}
        </button>
        <button type="button" className={btnPrimary} onClick={() => run(decode)}>
          {decodeBtnLabel}
        </button>
        <button type="button" className={btnGhost} onClick={swap}>
          ⇅ 交换
        </button>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
          ⚠ {error}
        </div>
      )}
      <ResultBox value={output} rows={rows} />
    </div>
  );
}

// ---------- 表格 ----------

export function Table({
  head,
  rows,
  className = "",
}: {
  head: string[];
  rows: ReactNode[][];
  className?: string;
}) {
  return (
    <div className={"overflow-x-auto " + className}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
              {r.map((c, j) => (
                <td key={j} className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ErrorBox({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
      ⚠ {msg}
    </div>
  );
}

/**
 * 类型守卫：判断是否为 { error: string } 结果。
 * 注意不要用 `"error" in x` 直接窄化——TS 对对象字面量联合推断
 * 会给缺失属性添加可选 `undefined`，导致 in 窄化失效。
 */
export function isErr(r: unknown): r is { error: string } {
  return !!r && typeof r === "object" && "error" in r;
}
