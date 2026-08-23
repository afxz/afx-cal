"use client";

import { useMemo, useState } from "react";
import CryptoJS from "crypto-js";
import { TextArea, Input, KeyValue, ErrorBox, selectCls, Field, isErr } from "@/components/ui";
import { base64UrlToBytes, bytesToUtf8, relativeTime } from "@/lib/utils";

function b64urlDecodeJson(s: string): unknown | null {
  const bytes = base64UrlToBytes(s);
  if (!bytes) return null;
  try {
    return JSON.parse(bytesToUtf8(bytes));
  } catch {
    return null;
  }
}

function fmtJson(v: unknown): string {
  return JSON.stringify(v, null, 2);
}

function fmtTime(t: number | undefined): string {
  if (t === undefined) return "";
  const d = new Date(t * 1000);
  return `${d.toLocaleString("zh-CN", { hour12: false })}（${relativeTime(d)}）`;
}

export default function JwtTool() {
  const [input, setInput] = useState("");
  const [secret, setSecret] = useState("");

  const result = useMemo(() => {
    const t = input.trim();
    if (!t) return null;
    const parts = t.split(".");
    if (parts.length !== 3) return { error: "JWT 应包含三段（header.payload.signature）" };
    const header = b64urlDecodeJson(parts[0]);
    const payload = b64urlDecodeJson(parts[1]);
    if (!header || !payload) return { error: "Header 或 Payload 无法解码为 JSON" };
    const h = header as Record<string, unknown>;
    const p = payload as Record<string, unknown>;
    return { header, payload, h, p, parts };
  }, [input]);

  const verify = useMemo(() => {
    if (!result || isErr(result) || !secret) return null;
    const { parts, h } = result;
    const alg = String(h["alg"] ?? "");
    const map: Record<string, (msg: string, key: string) => CryptoJS.lib.WordArray> = {
      HS256: CryptoJS.HmacSHA256,
      HS384: CryptoJS.HmacSHA384,
      HS512: CryptoJS.HmacSHA512,
    };
    const fn = map[alg];
    if (!fn) return { ok: null, msg: `算法 ${alg} 不支持签名校验` };
    const expect = fn(`${parts[0]}.${parts[1]}`, secret)
      .toString(CryptoJS.enc.Base64)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return { ok: expect === parts[2], msg: expect === parts[2] ? "签名有效 ✓" : "签名无效 ✗（密钥不匹配或内容被篡改）" };
  }, [result, secret]);

  const exp = result && !isErr(result) ? ((result.p as Record<string, unknown>)["exp"] as number | undefined) : undefined;
  const iat = result && !isErr(result) ? ((result.p as Record<string, unknown>)["iat"] as number | undefined) : undefined;
  const nbf = result && !isErr(result) ? ((result.p as Record<string, unknown>)["nbf"] as number | undefined) : undefined;

  return (
    <div className="space-y-3">
      <TextArea rows={5} placeholder={"粘贴 JWT（eyJhbGciOi…）"} value={input} onChange={(e) => setInput(e.target.value)} />
      {result && !isErr(result) && (
        <>
          <Field label="签名校验密钥（可选，用于 HS256/384/512）">
            <Input type="text" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="输入密钥后可校验签名" />
          </Field>
          {verify && (
            <div
              className={
                "rounded-lg px-3 py-2 text-sm " +
                (verify.ok === true
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400")
              }
            >
              {verify.msg}
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Header</div>
              <div className="mb-2 flex flex-wrap gap-1">
                {!!result.h["alg"] && <Badge text={`alg: ${String(result.h["alg"])}`} />}
                {!!result.h["typ"] && <Badge text={`typ: ${String(result.h["typ"])}`} />}
                {!!result.h["kid"] && <Badge text={`kid: ${String(result.h["kid"])}`} />}
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-zinc-700 dark:text-zinc-300">
                {fmtJson(result.header)}
              </pre>
            </div>
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Payload</div>
              <div className="mb-2 flex flex-wrap gap-1">
                {exp !== undefined && <Badge text={`exp: ${new Date(exp * 1000).toLocaleString("zh-CN", { hour12: false })}`} />}
                {iat !== undefined && <Badge text={`iat: ${new Date(iat * 1000).toLocaleString("zh-CN", { hour12: false })}`} />}
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-zinc-700 dark:text-zinc-300">
                {fmtJson(result.payload)}
              </pre>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="px-4">
              <KeyValue k="签发时间 (iat)" v={fmtTime(iat)} />
              <KeyValue k="过期时间 (exp)" v={fmtTime(exp)} />
              <KeyValue k="生效时间 (nbf)" v={fmtTime(nbf)} />
              {exp !== undefined && (
                <KeyValue
                  k="当前状态"
                  v={
                    exp * 1000 < Date.now() ? (
                      <span className="text-red-500">已过期</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">未过期（剩余 {Math.ceil((exp * 1000 - Date.now()) / 3600000)} 小时）</span>
                    )
                  }
                />
              )}
            </div>
          </div>
        </>
      )}
      {isErr(result) && <ErrorBox msg={result.error} />}
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-xs text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
      {text}
    </span>
  );
}
