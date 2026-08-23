"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";
import { TextArea, ResultBox, selectCls, Field } from "@/components/ui";

const ALGOS = [
  ["MD5", "MD5"],
  ["SHA1", "SHA-1"],
  ["SHA256", "SHA-256"],
  ["SHA384", "SHA-384"],
  ["SHA512", "SHA-512"],
] as const;

function bytesOf(wa: CryptoJS.lib.WordArray): Uint8Array {
  const hex = wa.toString(CryptoJS.enc.Hex);
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export default function HashTool() {
  const [input, setInput] = useState("");
  const [algo, setAlgo] = useState<(typeof ALGOS)[number][0]>("MD5");
  const [enc, setEnc] = useState("hex");

  const compute = () => {
    const fn = CryptoJS[algo] as (msg: string) => CryptoJS.lib.WordArray;
    const wa = fn(input);
    if (enc === "hex") return wa.toString(CryptoJS.enc.Hex);
    const bytes = bytesOf(wa);
    if (enc === "base64") return CryptoJS.enc.Base64.stringify(wa);
    return CryptoJS.enc.Base64.stringify(wa).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Field label="算法">
          <select className={selectCls + " w-full"} value={algo} onChange={(e) => setAlgo(e.target.value as never)}>
            {ALGOS.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="输出编码">
          <select className={selectCls + " w-full"} value={enc} onChange={(e) => setEnc(e.target.value)}>
            <option value="hex">Hex（小写）</option>
            <option value="base64">Base64</option>
            <option value="base64url">Base64 URL-safe</option>
          </select>
        </Field>
      </div>
      <TextArea rows={5} placeholder={"输入要计算哈希的文本…"} value={input} onChange={(e) => setInput(e.target.value)} />
      <ResultBox value={input ? compute() : ""} placeholder={"结果实时显示"} rows={2} />
    </div>
  );
}
