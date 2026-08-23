"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";
import { TextArea, ResultBox, selectCls, Field, Input } from "@/components/ui";

const ALGOS = [
  ["MD5", "HMAC-MD5"],
  ["SHA1", "HMAC-SHA1"],
  ["SHA256", "HMAC-SHA256"],
  ["SHA384", "HMAC-SHA384"],
  ["SHA512", "HMAC-SHA512"],
] as const;

const HMAC_FNS: Record<string, (msg: string, key: string) => CryptoJS.lib.WordArray> = {
  MD5: CryptoJS.HmacMD5,
  SHA1: CryptoJS.HmacSHA1,
  SHA256: CryptoJS.HmacSHA256,
  SHA384: CryptoJS.HmacSHA384,
  SHA512: CryptoJS.HmacSHA512,
};

export default function HmacTool() {
  const [input, setInput] = useState("");
  const [key, setKey] = useState("");
  const [algo, setAlgo] = useState<(typeof ALGOS)[number][0]>("SHA256");
  const [enc, setEnc] = useState("hex");

  const compute = () => {
    const wa = HMAC_FNS[algo](input, key);
    if (enc === "base64") return CryptoJS.enc.Base64.stringify(wa);
    if (enc === "base64url") return CryptoJS.enc.Base64.stringify(wa).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return wa.toString(CryptoJS.enc.Hex);
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
