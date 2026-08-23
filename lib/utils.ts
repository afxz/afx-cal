/**
 * 纯函数工具库 —— 无 DOM 依赖，可在 Node 中直接测试。
 */

// ---------- 字节与编码 ----------

export function utf8ToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

export function bytesToUtf8(b: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(b);
  } catch {
    return "";
  }
}

export function bytesToHex(b: Uint8Array): string {
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex: string): Uint8Array | null {
  const h = hex.replace(/0x/gi, "").replace(/[\s,:_-]/g, "");
  if (h.length % 2 !== 0) return null;
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) {
    const byte = parseInt(h.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(byte)) return null;
    out[i] = byte;
  }
  return out;
}

export function bytesToBase64(b: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < b.length; i += chunk) {
    bin += String.fromCharCode(...b.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export function base64ToBytes(s: string): Uint8Array | null {
  const clean = s.replace(/\s+/g, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 === 1) return null;
  try {
    const bin = atob(clean);
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

export function bytesToBase64Url(b: Uint8Array): string {
  return bytesToBase64(b).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlToBytes(s: string): Uint8Array | null {
  const clean = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = clean.length % 4 === 0 ? "" : "=".repeat(4 - (clean.length % 4));
  return base64ToBytes(clean + pad);
}

// ---------- HTML 实体 ----------

const HTML_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  nbsp: "\u00a0", copy: "©", reg: "®", trade: "™", hellip: "…",
  mdash: "—", ndash: "–", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
  middot: "·", times: "×", divide: "÷", plusmn: "±", deg: "°",
  micro: "µ", para: "¶", sect: "§", euro: "€", pound: "£", yen: "¥",
  cent: "¢", alpha: "α", beta: "β", gamma: "γ", delta: "δ",
  infin: "∞", le: "≤", ge: "≥", ne: "≠", asymp: "≈", radic: "√",
  sum: "∑", prod: "∏", int: "∫", larr: "←", rarr: "→", uarr: "↑", darr: "↓",
  pi: "π", sigma: "σ", omega: "ω", phi: "φ", thetasym: "θ",
};

function escapeChar(c: string): string {
  switch (c) {
    case "&": return "&amp;";
    case "<": return "&lt;";
    case ">": return "&gt;";
    case '"': return "&quot;";
    case "'": return "&#39;";
    default: return c;
  }
}

/** 仅转义 HTML 特殊字符 */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, escapeChar);
}

/** 所有非 ASCII 字符都转成数字实体 */
export function escapeHtmlAll(s: string): string {
  return Array.from(s, (c) => {
    const cp = c.codePointAt(0)!;
    return cp > 127 ? `&#${cp};` : escapeChar(c);
  }).join("");
}

export function unescapeHtml(s: string): string {
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, e: string) => {
    if (e[0] === "#") {
      const isHex = e[1].toLowerCase() === "x";
      const code = parseInt(isHex ? e.slice(2) : e.slice(1), isHex ? 16 : 10);
      if (Number.isFinite(code) && code >= 0 && code <= 0x10ffff) {
        try {
          return String.fromCodePoint(code);
        } catch {
          return m;
        }
      }
      return m;
    }
    return HTML_ENTITIES[e] ?? m;
  });
}

// ---------- Unicode 转义 ----------

/** \uXXXX（代理对拆开）或 \u{...}（码点形式） */
export function unicodeEscape(s: string, style: "short" | "brace" = "short"): string {
  let out = "";
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    if (cp < 0x20 || cp > 0x7e) {
      if (style === "brace") {
        out += `\\u{${cp.toString(16)}}`;
      } else if (cp <= 0xffff) {
        out += `\\u${cp.toString(16).padStart(4, "0")}`;
      } else {
        // 代理对：先减去 BMP 偏移 0x10000
        const v = cp - 0x10000;
        const hi = 0xd800 + Math.floor(v / 0x400);
        const lo = 0xdc00 + (v % 0x400);
        out += `\\u${hi.toString(16)}\\u${lo.toString(16)}`;
      }
    } else {
      out += ch;
    }
  }
  return out;
}

export function unicodeUnescape(s: string): string {
  return s.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g, (_m, a: string, b: string) => {
    const code = parseInt(a ?? b, 16);
    try {
      return String.fromCodePoint(code);
    } catch {
      return _m;
    }
  });
}

// ---------- 数字与格式化 ----------

export function round(n: number, digits = 2): number {
  const f = Math.pow(10, digits);
  return Math.round((n + Number.EPSILON) * f) / f;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function lcm(a: number, b: number): number {
  return Math.abs(Math.round(a) * Math.round(b)) / gcd(a, b);
}

/** 千分位格式化，最多保留 maxFrac 位小数（自动去掉尾零） */
export function formatNumber(n: number, maxFrac = 6): string {
  if (!Number.isFinite(n)) return String(n);
  const neg = n < 0;
  const abs = Math.abs(n);
  const s = abs.toFixed(maxFrac).replace(/\.?0+$/, "");
  const [int, frac] = s.split(".");
  const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "-" : "") + intFmt + (frac ? "." + frac : "");
}

export function formatMoney(n: number): string {
  return formatNumber(n, 2);
}

// ---------- 分数 ----------

export interface Frac {
  num: number;
  den: number;
}

export function fracReduce(f: Frac): Frac {
  const n = Math.round(f.num);
  const d = Math.round(f.den);
  if (d === 0) return { num: 0, den: 1 };
  const g = gcd(n, d);
  const sign = d < 0 ? -1 : 1;
  return { num: (sign * n) / g, den: (sign * d) / g };
}

/** 小数 -> 分数（连分数法） */
export function fracFromDecimal(x: number, maxDen = 100000): Frac {
  if (!Number.isFinite(x) || x === 0) return { num: 0, den: 1 };
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = x;
  for (let i = 0; i < 64; i++) {
    const a = Math.floor(b);
    [h1, h2] = [a * h1 + h2, h1];
    [k1, k2] = [a * k1 + k2, k1];
    if (k1 > maxDen) break;
    const r = x - h1 / k1;
    if (Math.abs(r) < 1e-12) break;
    b = 1 / (b - a);
    if (!Number.isFinite(b)) break;
  }
  return fracReduce({ num: sign * h1, den: k1 });
}

/** 分数 -> 字符串（可显示带分数） */
export function fracToString(f: Frac, mixed = true): string {
  f = fracReduce(f);
  if (f.den === 1) return String(f.num);
  if (mixed && Math.abs(f.num) > f.den) {
    const whole = Math.trunc(f.num / f.den);
    const rest = Math.abs(f.num % f.den);
    return `${whole} ${rest}/${f.den}`.trim();
  }
  return `${f.num}/${f.den}`;
}

export function fracToDecimal(f: Frac): number {
  return f.den === 0 ? NaN : f.num / f.den;
}

export function fracAdd(a: Frac, b: Frac): Frac {
  return fracReduce({ num: a.num * b.den + b.num * a.den, den: a.den * b.den });
}
export function fracSub(a: Frac, b: Frac): Frac {
  return fracReduce({ num: a.num * b.den - b.num * a.den, den: a.den * b.den });
}
export function fracMul(a: Frac, b: Frac): Frac {
  return fracReduce({ num: a.num * b.num, den: a.den * b.den });
}
export function fracDiv(a: Frac, b: Frac): Frac {
  if (b.num === 0) return { num: 0, den: 1 };
  return fracReduce({ num: a.num * b.den, den: a.den * b.num });
}

// ---------- 大整数进制 ----------

export function digitValue(c: string): number {
  if (c >= "0" && c <= "9") return c.charCodeAt(0) - 48;
  if (c >= "a" && c <= "z") return c.charCodeAt(0) - 87;
  if (c >= "A" && c <= "Z") return c.charCodeAt(0) - 55;
  return -1;
}

export function digitChar(v: number): string {
  return v < 10 ? String(v) : String.fromCharCode(87 + v);
}

/** 任意进制字符串 -> BigInt（radix 2..36，支持前导负号），非法返回 null */
export function baseToBigInt(s: string, radix: number): bigint | null {
  if (radix < 2 || radix > 36) return null;
  const str = s.trim();
  if (!str) return null;
  const neg = str[0] === "-";
  const body = neg ? str.slice(1) : str;
  if (!body) return null;
  let v = 0n;
  for (const c of body) {
    const d = digitValue(c);
    if (d < 0 || d >= radix) return null;
    v = v * BigInt(radix) + BigInt(d);
  }
  return neg ? -v : v;
}

export function bigIntToBase(v: bigint, radix: number): string {
  if (radix < 2 || radix > 36) return "";
  if (v === 0n) return "0";
  const neg = v < 0n;
  let n = neg ? -v : v;
  let out = "";
  while (n > 0n) {
    out = digitChar(Number(n % BigInt(radix))) + out;
    n /= BigInt(radix);
  }
  return (neg ? "-" : "") + out;
}

/** 取模到指定位宽（无符号） */
export function maskToBits(v: bigint, bits: number): bigint {
  const m = (1n << BigInt(bits)) - 1n;
  const r = v & m;
  return r;
}

/** 按指定位宽解释为有符号数 */
export function toSigned(v: bigint, bits: number): bigint {
  const m = maskToBits(v, bits);
  const half = 1n << BigInt(bits - 1);
  return m >= half ? m - (1n << BigInt(bits)) : m;
}

// ---------- 日期时间 ----------

const pad2 = (n: number) => String(n).padStart(2, "0");

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** 解析 YYYY-MM-DD 为本地日期，非法返回 null */
export function parseDateLocal(s: string): Date | null {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s.trim());
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

/** 解析 YYYY-MM-DDTHH:mm 为本地时间，非法返回 null */
export function parseDateTimeLocal(s: string): Date | null {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})[T ](\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3], h = +m[4], mi = +m[5];
  const dt = new Date(y, mo - 1, d, h, mi);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

export function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** 日期加减月份（月末钳制：1/31 + 1 个月 = 2/28 或 2/29） */
export function edate(d: Date, months: number): Date {
  const dim = new Date(d.getFullYear(), d.getMonth() + months + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth() + months, Math.min(d.getDate(), dim));
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function addMonths(d: Date, n: number): Date {
  return edate(d, n);
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * 两个日期的日历差（a <= b），按 EDATE 语义计算完整月份数，
 * 剩余天数不超过目标月天数。返回年月日及总天数。
 */
export function diffYMD(a: Date, b: Date): { y: number; m: number; d: number; totalDays: number } {
  const s = startOfDay(a);
  const e = startOfDay(b);
  let months = 0;
  while (edate(s, months + 1).getTime() <= e.getTime()) months++;
  const base = edate(s, months);
  const d = Math.round((e.getTime() - base.getTime()) / 86400000);
  const totalDays = Math.round((e.getTime() - s.getTime()) / 86400000);
  return { y: Math.floor(months / 12), m: months % 12, d, totalDays };
}

export interface AgeResult {
  y: number;
  m: number;
  d: number;
  totalDays: number;
  /** 距离下一个生日还有多少天 */
  nextBirthdayDays: number;
  nextBirthday: Date;
}

/** 计算 ageAt(birth) 的年龄，含下一个生日倒计时 */
export function ageAt(birth: Date, at: Date = new Date()): AgeResult {
  const { y, m, d, totalDays } = diffYMD(birth, at);
  // 下一个生日（考虑 2/29）
  let nb = new Date(at.getFullYear(), birth.getMonth(), birth.getDate());
  if (nb.getDate() !== birth.getDate()) nb = new Date(at.getFullYear(), birth.getMonth() + 1, 0);
  if (nb.getTime() <= startOfDay(at).getTime()) {
    nb = new Date(at.getFullYear() + 1, birth.getMonth(), birth.getDate());
    if (nb.getDate() !== birth.getDate()) nb = new Date(at.getFullYear() + 1, birth.getMonth() + 1, 0);
  }
  const nextBirthdayDays = Math.round((startOfDay(nb).getTime() - startOfDay(at).getTime()) / 86400000);
  return { y, m, d, totalDays, nextBirthdayDays, nextBirthday: nb };
}

// ---------- 工作日 ----------

export interface BusinessResult {
  total: number;
  weekends: number;
  holidays: number;
  extras: number;
  workdays: number;
}

function keySet(lines: string): Set<string> {
  const set = new Set<string>();
  for (const raw of lines.split(/\r?\n/)) {
    const t = raw.trim();
    const m = /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/.exec(t) || /^(\d{1,2})[-\/](\d{1,2})$/.exec(t);
    if (m && m.length === 4) set.add(`${m[1]}-${pad2(+m[2])}-${pad2(+m[3])}`);
    else if (m) set.add(`*--${pad2(+m[1])}-${pad2(+m[2])}`);
  }
  return set;
}

function isHoliday(d: Date, holidays: Set<string>, extras: Set<string>): boolean {
  const k = dateKey(d);
  if (extras.has(k)) return false;
  if (holidays.has(k)) return true;
  if (holidays.has(`*--${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`)) return true;
  return false;
}

export function isWorkday(d: Date, holidays: Set<string> = new Set(), extras: Set<string> = new Set()): boolean {
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return extras.has(dateKey(d));
  return !isHoliday(d, holidays, extras);
}

/** 解析节假日 / 调休文本（每行一个日期） */
export function parseHolidayText(text: string): Set<string> {
  return keySet(text);
}

/** 区间内工作日统计（含首尾） */
export function countBusinessDays(
  start: Date,
  end: Date,
  holidays: Set<string> = new Set(),
  extras: Set<string> = new Set(),
): BusinessResult {
  const s = startOfDay(start);
  const e = startOfDay(end);
  const res: BusinessResult = { total: 0, weekends: 0, holidays: 0, extras: 0, workdays: 0 };
  if (s.getTime() > e.getTime()) return res;
  for (let d = new Date(s); d.getTime() <= e.getTime(); d.setDate(d.getDate() + 1)) {
    res.total++;
    const dow = d.getDay();
    if (dow === 0 || dow === 6) {
      res.weekends++;
      if (extras.has(dateKey(d))) {
        res.extras++;
        res.workdays++;
      }
    } else if (isHoliday(d, holidays, extras)) {
      res.holidays++;
    } else {
      res.workdays++;
    }
  }
  return res;
}

/** 从 start 起第 n 个工作日（含起始日，n 可负，向前推） */
export function addBusinessDays(
  start: Date,
  n: number,
  holidays: Set<string> = new Set(),
  extras: Set<string> = new Set(),
): Date | null {
  let d = startOfDay(start);
  if (n === 0) return d;
  if (!isWorkday(d, holidays, extras)) {
    d = addDays(d, n >= 0 ? 1 : -1);
  }
  let step = n >= 0 ? 1 : -1;
  let left = Math.abs(n);
  while (left > 0) {
    if (isWorkday(d, holidays, extras)) left--;
    if (left > 0) d = addDays(d, step);
  }
  return d;
}

// ---------- 时区 ----------

const FALLBACK_ZONES = [
  "Asia/Shanghai", "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney",
  "Europe/London", "Europe/Berlin", "America/New_York", "America/Los_Angeles",
];

export function getTimeZones(): string[] {
  try {
    const zones = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone");
    if (zones && zones.length) return zones as string[];
  } catch {
    /* ignore */
  }
  return FALLBACK_ZONES;
}

/** 计算某时区相对 UTC 的偏移分钟数 */
export function zoneOffsetMinutes(d: Date, zone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: zone, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = dtf.formatToParts(d);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  const asUTC = Date.UTC(
    +map.year, +map.month - 1, +map.day,
    +map.hour % 24, +map.minute, +map.second,
  );
  return Math.round((asUTC - d.getTime()) / 60000);
}

/** 偏移标签，如 "GMT+8"、"GMT-4:30" */
export function offsetLabel(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `GMT${sign}${h}${m ? ":" + pad2(m) : ""}`;
}

export function formatInZone(d: Date, zone: string, opts: Intl.DateTimeFormatOptions = {}): string {
  const dtf = new Intl.DateTimeFormat("zh-CN", {
    timeZone: zone, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    ...opts,
  });
  return dtf.format(d);
}

/** 人性化相对时间 */
export function relativeTime(d: Date, now: Date = new Date()): string {
  const sec = Math.round((now.getTime() - d.getTime()) / 1000);
  const abs = Math.abs(sec);
  if (abs < 60) return sec >= 0 ? "刚刚" : "即将";
  if (abs < 3600) return `${Math.round(sec / 60)} 分钟${sec >= 0 ? "前" : "后"}`;
  if (abs < 86400) return `${Math.round(sec / 3600)} 小时${sec >= 0 ? "前" : "后"}`;
  if (abs < 86400 * 30) return `${Math.round(sec / 86400)} 天${sec >= 0 ? "前" : "后"}`;
  if (abs < 86400 * 365) return `${Math.round(sec / (86400 * 30))} 个月前`;
  return `${Math.round(sec / (86400 * 365))} 年前`;
}

// ---------- 金融 ----------

export function equalPayment(p: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 100 / 12;
  const monthly = r === 0 ? p / months : (p * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const totalPayment = monthly * months;
  return { monthly, totalInterest: totalPayment - p, totalPayment };
}

export function equalPrincipal(p: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 100 / 12;
  const principal = p / months;
  const first = principal + p * r;
  const last = principal + principal * r;
  const totalInterest = (r * p * (months + 1)) / 2;
  return { first, last, totalInterest, totalPayment: p + totalInterest };
}

export interface AmortRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

/** 等额本息还款明细（最多 maxRows 行，附总数行信息） */
export function amortSchedule(p: number, annualRatePct: number, months: number, maxRows = 360): {
  rows: AmortRow[]; truncated: boolean; totalInterest: number; totalPayment: number;
} {
  const r = annualRatePct / 100 / 12;
  const rows: AmortRow[] = [];
  let balance = p;
  const monthly = r === 0 ? p / months : (p * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const cap = Math.min(months, maxRows);
  for (let k = 1; k <= cap; k++) {
    const interest = balance * r;
    let principal = monthly - interest;
    if (k === months) principal = balance;
    balance = Math.max(0, balance - principal);
    rows.push({ month: k, payment: monthly, interest, principal, balance });
  }
  const totalPayment = monthly * months;
  return { rows, truncated: months > maxRows, totalInterest: totalPayment - p, totalPayment };
}

// 年度综合所得税率表（2024，单位：元）：[上限, 税率, 速算扣除数]
const TAX_BRACKETS: Array<[number, number, number]> = [
  [36000, 0.03, 0],
  [144000, 0.10, 2520],
  [300000, 0.20, 16920],
  [420000, 0.25, 31920],
  [660000, 0.30, 52920],
  [960000, 0.35, 85920],
  [Infinity, 0.45, 181920],
];

export const TAX_BRACKETS_VIEW = TAX_BRACKETS.map(([up, rate, quick], i) => ({
  low: i === 0 ? 0 : TAX_BRACKETS[i - 1][0] + 1,
  up: Number.isFinite(up) ? up : null,
  rate,
  quick,
}));

export function incomeTax(annualTaxable: number): { tax: number; rate: number; quick: number } {
  if (annualTaxable <= 0) return { tax: 0, rate: 0, quick: 0 };
  for (const [up, rate, quick] of TAX_BRACKETS) {
    if (annualTaxable <= up) return { tax: annualTaxable * rate - quick, rate, quick };
  }
  return { tax: 0, rate: 0, quick: 0 };
}

export function compoundInterest(p: number, ratePct: number, years: number, perYear: number): number {
  if (perYear <= 0) return p;
  const r = ratePct / 100 / perYear;
  return p * Math.pow(1 + r, perYear * years);
}

export function annuityFV(pmt: number, ratePct: number, years: number, perYear: number): number {
  const r = ratePct / 100 / perYear;
  const n = perYear * years;
  if (r === 0) return pmt * n;
  return pmt * ((Math.pow(1 + r, n) - 1) / r);
}

// ---------- BMI ----------

export function bmiCalc(heightCm: number, weightKg: number) {
  const h = heightCm / 100;
  const bmi = weightKg / (h * h);
  let category = "";
  let level: "low" | "ok" | "high" = "ok";
  if (bmi < 18.5) { category = "偏瘦"; level = "low"; }
  else if (bmi < 24) { category = "正常"; level = "ok"; }
  else if (bmi < 28) { category = "超重"; level = "high"; }
  else { category = "肥胖"; level = "high"; }
  const healthyMin = 18.5 * h * h;
  const healthyMax = 23.9 * h * h;
  return { bmi, category, level, healthyMin, healthyMax };
}
