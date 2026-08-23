"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";
import { TextArea, ResultBox, ErrorBox, selectCls, Field, Input, btnGhost } from "@/components/ui";
import { hexToBytes, bytesToHex } from "@/lib/utils";

type KeyKind = "pass" | "b64" | "hex";

const SALTED_PREFIX = "53616c7465645f5f"; // "Salted__"

function bytesOf(wa: CryptoJS.lib.WordArray): Uint8Array {
  const hex = wa.toString(CryptoJS.enc.Hex);
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function randomHexBytes(n: number): string {
  const b = crypto.getRandomValues(new Uint8Array(n));
  return bytesToHex(b);
}

type AesCfg = NonNullable<Parameters<typeof CryptoJS.AES.encrypt>[2]>;

export default function AesTool() {
  const [mode, setMode] = useState("CBC");
  const [keyKind, setKeyKind] = useState<KeyKind>("pass");
  const [key, setKey] = useState("");
  const [iv, setIv] = useState("");
  const [plain, setPlain] = useState("");
  const [cipher, setCipher] = useState("");
  const [encFmt, setEncFmt] = useState("base64");
  const [error, setError] = useState("");

  const modeObj = mode === "ECB" ? CryptoJS.mode.ECB : mode === "CTR" ? CryptoJS.mode.CTR : CryptoJS.mode.CBC;

  const parseKey = (): CryptoJS.lib.WordArray => {
    if (keyKind === "b64") {
      const wa = CryptoJS.enc.Base64.parse(key.trim());
      if (!wa.sigBytes) throw new Error("无效的 Base64 密钥");
      return wa;
    }
    if (keyKind === "hex") {
      const bytes = hexToBytes(key.trim());
      if (!bytes) throw new Error("无效的 Hex 密钥");
      return CryptoJS.enc.Hex.parse(bytesToHex(bytes));
    }
    throw new Error("未选择密钥类型");
  };

  const parseIv = (): CryptoJS.lib.WordArray => {
    const bytes = hexToBytes(iv.trim());
    if (!bytes || bytes.length !== 16) throw new Error("IV 需为 16 字节（32 位 Hex 字符）");
    return CryptoJS.enc.Hex.parse(bytesToHex(bytes));
  };

  const encrypt = () => {
    try {
      if (!plain) throw new Error("请输入明文");
      let cp: CryptoJS.lib.CipherParams;
      if (keyKind === "pass") {
        if (!key) throw new Error("请输入口令");
        cp = CryptoJS.AES.encrypt(plain, key);
      } else {
        if (!key) throw new Error("请输入密钥");
        const cfg: AesCfg = { mode: modeObj, padding: CryptoJS.pad.Pkcs7 };
        if (mode !== "ECB") cfg.iv = parseIv();
        const keyWa = parseKey();
        const kb = keyWa.sigBytes;
        if (kb !== 16 && kb !== 24 && kb !== 32) {
          throw new Error("AES 密钥长度需为 16 / 24 / 32 字节（AES-128 / 192 / 256），当前 " + kb + " 字节");
        }
        cp = CryptoJS.AES.encrypt(plain, keyWa, cfg);
      }
      const out =
        keyKind === "pass"
          ? encFmt === "hex"
            ? SALTED_PREFIX + bytesToHex(bytesOf(cp.salt!)) + cp.ciphertext.toString(CryptoJS.enc.Hex)
            : cp.toString()
          : encFmt === "hex"
            ? cp.ciphertext.toString(CryptoJS.enc.Hex)
            : cp.toString();
      setCipher(out);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const decrypt = () => {
    try {
      if (!cipher.trim()) throw new Error("请输入密文");
      const t = cipher.trim();
      let result: string;
      if (keyKind === "pass") {
        if (!key) throw new Error("请输入口令");
        const isHex = /^[0-9a-fA-F]+$/.test(t) && t.length % 2 === 0;
        let params: CryptoJS.lib.CipherParams;
        if (isHex) {
          const bytes = hexToBytes(t)!;
          if (bytes.length <= 16 || bytesToHex(bytes.slice(0, 8)).toLowerCase() !== SALTED_PREFIX) {
            throw new Error("口令模式需要 OpenSSL 格式密文（含 Salt 头，可用「加密」得到）");
          }
          params = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Hex.parse(bytesToHex(bytes.slice(16))),
            salt: CryptoJS.enc.Hex.parse(bytesToHex(bytes.slice(8, 16))),
          });
        } else {
          if (!t.startsWith("Salted__")) {
            throw new Error("口令模式需要 OpenSSL 格式密文（含 Salt 头）");
          }
          params = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(t.slice(8)) });
        }
        result = CryptoJS.AES.decrypt(params, key, { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
      } else {
        const isHex = /^[0-9a-fA-F]+$/.test(t) && t.length % 2 === 0;
        const cfg: AesCfg = { mode: modeObj, padding: CryptoJS.pad.Pkcs7 };
        if (mode !== "ECB") cfg.iv = parseIv();
        const wa = isHex ? CryptoJS.enc.Hex.parse(t) : CryptoJS.enc.Base64.parse(t);
        if (!wa.sigBytes) throw new Error("无效的密文");
        result = CryptoJS.AES.decrypt(CryptoJS.lib.CipherParams.create({ ciphertext: wa }), parseKey(), cfg).toString(CryptoJS.enc.Utf8);
      }
      setPlain(result);
      setError(result ? "" : "解密结果为空，请检查密钥 / IV / 模式");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Field label="模式">
          <select className={selectCls + " w-full"} value={mode} onChange={(e) => setMode(e.target.value)}>
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
            <option value="pass">口令（PBKDF2 派生，AES-256）</option>
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
              <button type="button" className={btnGhost + " shrink-0"} onClick={() => setIv(randomHexBytes(16))}>
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
                const b = crypto.getRandomValues(new Uint8Array(16));
                setKey(keyKind === "hex" ? bytesToHex(b) : CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(bytesToHex(b))));
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
        说明：口令模式使用 CryptoJS 的 OpenSSL 格式（密文自带随机 Salt，输出为 Base64 或带 Salt 头的 Hex）。
        全部运算在浏览器本地完成，仅供开发测试，勿用于安全敏感场景。
      </p>
    </div>
  );
}
