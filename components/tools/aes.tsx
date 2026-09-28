"use client";

import { useState } from "react";
import { TextArea, ErrorBox, selectCls, Field, Input, btnGhost } from "@/components/ui";
import {
  aesDecryptWithKey,
  aesEncryptWithKey,
  aesOpenSslDecrypt,
  aesOpenSslEncrypt,
  type AesMode,
} from "@/lib/crypto";
import { base64ToBytes, bytesToBase64, bytesToHex, bytesToUtf8, hexToBytes, utf8ToBytes } from "@/lib/utils";

type KeyKind = "pass" | "b64" | "hex";

export default function AesTool() {
  const [mode, setMode] = useState<AesMode>("CBC");
  const [keyKind, setKeyKind] = useState<KeyKind>("pass");
  const [key, setKey] = useState("");
  const [iv, setIv] = useState("");
  const [plain, setPlain] = useState("");
  const [cipher, setCipher] = useState("");
  const [encFmt, setEncFmt] = useState("base64");
  const [error, setError] = useState("");

  const parseKey = (): Uint8Array => {
    const bytes = keyKind === "b64" ? base64ToBytes(key.trim()) : hexToBytes(key.trim());
    if (!bytes || bytes.length === 0) {
      throw new Error(keyKind === "b64" ? "无效的 Base64 密钥" : "无效的 Hex 密钥");
    }
    if (bytes.length !== 16 && bytes.length !== 24 && bytes.length !== 32) {
      throw new Error(
        "AES 密钥长度需为 16 / 24 / 32 字节（AES-128 / 192 / 256），当前 " + bytes.length + " 字节",
      );
    }
    return bytes;
  };

  const parseIv = (): Uint8Array => {
    const bytes = hexToBytes(iv.trim());
    if (!bytes || bytes.length !== 16) throw new Error("IV 需为 16 字节（32 位 Hex 字符）");
    return bytes;
  };

  /** 密文解析：Hex 或 Base64 自动识别 */
  const parseSealed = (text: string): Uint8Array => {
    const isHex = /^[0-9a-fA-F]+$/.test(text) && text.length % 2 === 0;
    const bytes = isHex ? hexToBytes(text) : base64ToBytes(text);
    if (!bytes || bytes.length === 0) throw new Error("密文格式无效（应为 Hex 或 Base64）");
    return bytes;
  };

  const encrypt = () => {
    try {
      if (!plain) throw new Error("请输入明文");
      let payload: Uint8Array;
      if (keyKind === "pass") {
        if (!key) throw new Error("请输入口令");
        payload = aesOpenSslEncrypt(plain, key);
      } else {
        if (!key) throw new Error("请输入密钥");
        const ivBytes = mode === "ECB" ? undefined : parseIv();
        payload = aesEncryptWithKey(utf8ToBytes(plain), parseKey(), mode, ivBytes);
      }
      setCipher(encFmt === "hex" ? bytesToHex(payload) : bytesToBase64(payload));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const decrypt = () => {
    try {
      const text = cipher.trim();
      if (!text) throw new Error("请输入密文");
      const sealed = parseSealed(text);
      let result: string;
      if (keyKind === "pass") {
        if (!key) throw new Error("请输入口令");
        result = bytesToUtf8(aesOpenSslDecrypt(sealed, key));
      } else {
        const ivBytes = mode === "ECB" ? undefined : parseIv();
        result = bytesToUtf8(aesDecryptWithKey(sealed, parseKey(), mode, ivBytes));
      }
      setPlain(result);
      setError("");
    } catch (e) {
      setPlain("");
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const randomHex = (n: number) => bytesToHex(crypto.getRandomValues(new Uint8Array(n)));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Field label="模式">
          <select className={selectCls + " w-full"} value={mode} onChange={(e) => setMode(e.target.value as AesMode)}>
            <option value="CBC">CBC</option>
            <option value="ECB">ECB</option>
            <option value="CTR">CTR</option>
          </select>
        </Field>
        <Field label="密钥类型">
          <select
            className={selectCls + " w-full"}
            value={keyKind}
            onChange={(e) => setKeyKind(e.target.value as KeyKind)}
          >
            <option value="pass">口令（EVP_BytesToKey，AES-256）</option>
            <option value="b64">Base64 密钥</option>
            <option value="hex">Hex 密钥</option>
          </select>
        </Field>
        <Field label="密文输出编码">
          <select className={selectCls + " w-full"} value={encFmt} onChange={(e) => setEncFmt(e.target.value)}>
            <option value="base64">Base64</option>
            <option value="hex">Hex</option>
          </select>
        </Field>
        {mode !== "ECB" ? (
          <Field label="IV（16 字节 Hex）">
            <div className="flex gap-2">
              <Input type="text" value={iv} onChange={(e) => setIv(e.target.value)} placeholder="32 位 Hex" />
              <button type="button" className={btnGhost + " shrink-0"} onClick={() => setIv(randomHex(16))}>
                随机
              </button>
            </div>
          </Field>
        ) : (
          <div className="flex items-end pb-1 text-xs text-amber-600 dark:text-amber-500">ECB 模式无 IV，安全性较低</div>
        )}
      </div>
      <Field label={keyKind === "pass" ? "口令" : "密钥" + (keyKind === "b64" ? "（Base64）" : "（Hex）")}>
        <div className="flex gap-2">
          <Input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={keyKind === "pass" ? "加密 / 解密口令…" : "16 / 24 / 32 字节（AES-128 / 192 / 256）"}
          />
          {keyKind !== "pass" && (
            <button
              type="button"
              className={btnGhost + " shrink-0"}
              onClick={() => {
                const bytes = crypto.getRandomValues(new Uint8Array(16));
                setKey(keyKind === "hex" ? bytesToHex(bytes) : bytesToBase64(bytes));
              }}
            >
              随机
            </button>
          )}
        </div>
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">明文</div>
          <TextArea rows={5} placeholder={"输入要加密的文本…"} value={plain} onChange={(e) => setPlain(e.target.value)} />
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">密文</div>
          <TextArea rows={5} placeholder={"加密结果 / 待解密文本…"} value={cipher} onChange={(e) => setCipher(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          onClick={encrypt}
        >
          加密 →
        </button>
        <button
          type="button"
          className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          onClick={decrypt}
        >
          ← 解密
        </button>
      </div>
      <ErrorBox msg={error} />
      <p className="text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
        说明：口令模式为标准 OpenSSL 格式（EVP_BytesToKey + CBC + PKCS#7，密文自带随机 Salt，输出为 Base64
        或带 Salt 头的 Hex），可与 `openssl enc -aes-256-cbc -md md5` 互操作。全部运算在浏览器本地完成，
        仅供开发测试，勿用于安全敏感场景。
      </p>
    </div>
  );
}
