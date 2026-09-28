/**
 * 加密原语封装 —— 基于 @noble/hashes + @noble/ciphers
 * （替代已停止维护的 crypto-js；noble 经安全审计、零依赖、可按需打包）
 *
 * 纯函数、无 DOM 依赖，可在 Node 中直接测试。
 * 保持与旧版 crypto-js 产物字节级兼容：
 * - AES 口令模式 = OpenSSL EVP_BytesToKey(MD5) + CBC + PKCS#7 + `Salted__` 头
 * - AES 各模式（含 CTR）均使用 PKCS#7 填充
 */
import { md5, sha1 } from "@noble/hashes/legacy.js";
import { sha256, sha384, sha512 } from "@noble/hashes/sha2.js";
import { hmac } from "@noble/hashes/hmac.js";
import { concatBytes, randomBytes } from "@noble/hashes/utils.js";
import { cbc, ctr, ecb } from "@noble/ciphers/aes.js";

/** 保持模块零相对依赖，便于 Node 直接运行测试 */
const utf8ToBytes = (s: string): Uint8Array => new TextEncoder().encode(s);

// ---------- 哈希 ----------

export const HASH_ALGOS = {
  MD5: md5,
  SHA1: sha1,
  SHA256: sha256,
  SHA384: sha384,
  SHA512: sha512,
} as const;

export type HashAlgo = keyof typeof HASH_ALGOS;

export function hashBytes(algo: HashAlgo, data: Uint8Array): Uint8Array {
  return HASH_ALGOS[algo](data);
}

/** 文本哈希（UTF-8 编码） */
export function hashText(algo: HashAlgo, text: string): Uint8Array {
  return hashBytes(algo, utf8ToBytes(text));
}

// ---------- HMAC ----------

export function hmacBytes(algo: HashAlgo, key: Uint8Array, data: Uint8Array): Uint8Array {
  return hmac(HASH_ALGOS[algo], key, data);
}

/** HMAC（密钥与消息均按 UTF-8 编码） */
export function hmacText(algo: HashAlgo, key: string, text: string): Uint8Array {
  return hmacBytes(algo, utf8ToBytes(key), utf8ToBytes(text));
}

// ---------- PKCS#7 填充 ----------

const BLOCK_SIZE = 16;

export function pkcs7Pad(data: Uint8Array, blockSize = BLOCK_SIZE): Uint8Array {
  const pad = blockSize - (data.length % blockSize);
  const out = new Uint8Array(data.length + pad);
  out.set(data);
  out.fill(pad, data.length);
  return out;
}

/** 去除 PKCS#7 填充；填充非法时抛错（可用于识别错误密钥） */
export function pkcs7Unpad(data: Uint8Array, blockSize = BLOCK_SIZE): Uint8Array {
  if (data.length === 0 || data.length % blockSize !== 0) throw new Error("密文长度不是块的整数倍");
  const pad = data[data.length - 1];
  if (pad < 1 || pad > blockSize || pad > data.length) throw new Error("解密失败：填充无效（密钥或 IV 错误）");
  for (let i = data.length - pad; i < data.length; i++) {
    if (data[i] !== pad) throw new Error("解密失败：填充无效（密钥或 IV 错误）");
  }
  return data.slice(0, data.length - pad);
}

// ---------- OpenSSL / CryptoJS 兼容的密钥派生 ----------

/** EVP_BytesToKey（MD5，单次迭代）—— 与 OpenSSL `enc -md md5` 及 crypto-js 一致 */
export function evpBytesToKey(
  password: string,
  salt: Uint8Array,
  keyLen = 32,
  ivLen = BLOCK_SIZE,
): { key: Uint8Array; iv: Uint8Array } {
  const pass = utf8ToBytes(password);
  const chunks: Uint8Array[] = [];
  let prev = new Uint8Array(0);
  let total = 0;
  while (total < keyLen + ivLen) {
    prev = md5(concatBytes(prev, pass, salt));
    chunks.push(prev);
    total += prev.length;
  }
  const all = concatBytes(...chunks);
  return { key: all.slice(0, keyLen), iv: all.slice(keyLen, keyLen + ivLen) };
}

// ---------- AES ----------

export type AesMode = "CBC" | "ECB" | "CTR";

const SALTED_PREFIX = utf8ToBytes("Salted__");

function aesCipher(key: Uint8Array, mode: AesMode, iv?: Uint8Array) {
  if (mode === "CBC") {
    if (!iv || iv.length !== BLOCK_SIZE) throw new Error("CBC 模式需要 16 字节 IV");
    return cbc(key, iv);
  }
  if (mode === "CTR") {
    if (!iv || iv.length !== BLOCK_SIZE) throw new Error("CTR 模式需要 16 字节 IV");
    return ctr(key, iv);
  }
  return ecb(key);
}

/** 原始密钥加密（CBC / ECB 由 noble 内建 PKCS#7，CTR 在此手动补齐以保持旧产物兼容） */
export function aesEncryptWithKey(
  plain: Uint8Array,
  key: Uint8Array,
  mode: AesMode,
  iv?: Uint8Array,
): Uint8Array {
  return aesCipher(key, mode, iv).encrypt(mode === "CTR" ? pkcs7Pad(plain) : plain);
}

export function aesDecryptWithKey(
  sealed: Uint8Array,
  key: Uint8Array,
  mode: AesMode,
  iv?: Uint8Array,
): Uint8Array {
  const decrypted = aesCipher(key, mode, iv).decrypt(sealed);
  return mode === "CTR" ? pkcs7Unpad(decrypted) : decrypted;
}

/** 口令模式加密：`Salted__` + 8 字节 salt + CBC 密文（OpenSSL 格式） */
export function aesOpenSslEncrypt(plain: string, password: string, salt?: Uint8Array): Uint8Array {
  const s = salt ?? randomBytes(8);
  if (s.length !== 8) throw new Error("Salt 需为 8 字节");
  const { key, iv } = evpBytesToKey(password, s);
  const ciphertext = cbc(key, iv).encrypt(utf8ToBytes(plain));
  return concatBytes(SALTED_PREFIX, s, ciphertext);
}

/** 口令模式解密：输入为完整的 OpenSSL 格式载荷（含 `Salted__` 头） */
export function aesOpenSslDecrypt(payload: Uint8Array, password: string): Uint8Array {
  if (payload.length <= 16 || !SALTED_PREFIX.every((b, i) => payload[i] === b)) {
    throw new Error("口令模式需要 OpenSSL 格式密文（含 Salted__ 头）");
  }
  const salt = payload.slice(8, 16);
  const { key, iv } = evpBytesToKey(password, salt);
  return cbc(key, iv).decrypt(payload.slice(16));
}
