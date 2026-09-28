"use client";

import { useState } from "react";
import { TextArea, ResultBox, selectCls, Field } from "@/components/ui";
import { hashText, type HashAlgo } from "@/lib/crypto";
import { bytesToBase64, bytesToBase64Url, bytesToHex } from "@/lib/utils";

const ALGOS: Array<[HashAlgo, string]> = [
  ["MD5", "MD5"],
  ["SHA1", "SHA-1"],
  ["SHA256", "SHA-256"],
  ["SHA384", "SHA-384"],
  ["SHA512", "SHA-512"],
];

export default function HashTool() {
  const [input, setInput] = useState("");
  const [algo, setAlgo] = useState<HashAlgo>("MD5");
  const [enc, setEnc] = useState("hex");

  const compute = () => {
    const bytes = hashText(algo, input);
    if (enc === "base64") return bytesToBase64(bytes);
    if (enc === "base64url") return bytesToBase64Url(bytes);
    return bytesToHex(bytes);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Field label="算法">
          <select className={selectCls + " w-full"} value={algo} onChange={(e) => setAlgo(e.target.value as HashAlgo)}>
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
