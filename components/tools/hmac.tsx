"use client";

import { useState } from "react";
import { TextArea, ResultBox, selectCls, Field, Input } from "@/components/ui";
import { hmacText, type HashAlgo } from "@/lib/crypto";
import { bytesToBase64, bytesToBase64Url, bytesToHex } from "@/lib/utils";

const ALGOS: Array<[HashAlgo, string]> = [
  ["MD5", "HMAC-MD5"],
  ["SHA1", "HMAC-SHA1"],
  ["SHA256", "HMAC-SHA256"],
  ["SHA384", "HMAC-SHA384"],
  ["SHA512", "HMAC-SHA512"],
];

export default function HmacTool() {
  const [input, setInput] = useState("");
  const [key, setKey] = useState("");
  const [algo, setAlgo] = useState<HashAlgo>("SHA256");
  const [enc, setEnc] = useState("hex");

  const compute = () => {
    const bytes = hmacText(algo, key, input);
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
            <option value="hex">Hex</option>
            <option value="base64">Base64</option>
            <option value="base64url">Base64 URL-safe</option>
          </select>
        </Field>
      </div>
      <Field label="密钥">
        <Input type="text" value={key} onChange={(e) => setKey(e.target.value)} placeholder="输入密钥…" />
      </Field>
      <TextArea rows={4} placeholder={"输入消息文本…"} value={input} onChange={(e) => setInput(e.target.value)} />
      <ResultBox value={input && key ? compute() : ""} placeholder={"结果实时显示"} rows={2} />
    </div>
  );
}
