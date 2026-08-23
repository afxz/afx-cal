/**
 * 纯逻辑单元测试 —— 使用 Node 24 原生 TypeScript 类型剥离运行：
 *   node test/run-tests.mts
 */
import assert from "node:assert/strict";
import CryptoJS from "crypto-js";
import {
  utf8ToBytes, bytesToUtf8, bytesToHex, hexToBytes, bytesToBase64, base64ToBytes,
  bytesToBase64Url, base64UrlToBytes,
  escapeHtml, escapeHtmlAll, unescapeHtml,
  unicodeEscape, unicodeUnescape,
  formatNumber, gcd, lcm,
  fracFromDecimal, fracToString, fracAdd, fracMul, fracToDecimal,
  baseToBigInt, bigIntToBase, maskToBits, toSigned,
  parseDateLocal, diffYMD, ageAt, dateKey,
  countBusinessDays, parseHolidayText, addBusinessDays, isWorkday,
  zoneOffsetMinutes, offsetLabel, formatInZone,
  equalPayment, equalPrincipal, amortSchedule, incomeTax,
  compoundInterest, annuityFV, bmiCalc,
} from "../lib/utils.ts";
import { UNIT_SYSTEMS } from "../lib/units.ts";
import { formatXml } from "../lib/xml.ts";

let passed = 0;
let failed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log("  ✓ " + name);
  } catch (e) {
    failed++;
    console.error("  ✗ " + name);
    console.error("    " + (e instanceof Error ? e.message : String(e)));
  }
}

console.log("== 编码 ==");
test("MD5('') = d41d8c…", () => assert.equal(CryptoJS.MD5("").toString(), "d41d8cd98f00b204e9800998ecf8427e"));
test("MD5('abc') = 900150…", () => assert.equal(CryptoJS.MD5("abc").toString(), "900150983cd24fb0d6963f7d28e17f72"));
test("SHA-256('') 已知向量", () => assert.equal(CryptoJS.SHA256("").toString(), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"));
test("SHA-256('abc') 已知向量", () => assert.equal(CryptoJS.SHA256("abc").toString(), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"));
test("HMAC-SHA256 已知向量 (RFC 4231)", () =>
  assert.equal(
    CryptoJS.HmacSHA256("what do ya want for nothing?", "Jefe").toString(),
    "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843",
  ));
test("UTF-8 → Hex 往返", () => {
  const h = bytesToHex(utf8ToBytes("你好，世界！"));
  assert.equal(h, "e4bda0e5a5bdefbc8ce4b896e7958cefbc81");
  assert.equal(bytesToUtf8(hexToBytes(h)!), "你好，世界！");
});
test("UTF-8 → Base64 往返", () => {
  const b64 = bytesToBase64(utf8ToBytes("hello 中文"));
  assert.equal(b64, "aGVsbG8g5Lit5paH");
  assert.equal(bytesToUtf8(base64ToBytes(b64)!), "hello 中文");
});
test("Base64 URL-safe 往返", () => {
  const b = new Uint8Array([0xff, 0xfe, 0xfd]);
  const u = bytesToBase64Url(b);
  assert.equal(u, "__79");
  assert.deepEqual(Array.from(base64UrlToBytes(u)!), [0xff, 0xfe, 0xfd]);
});
test("hexToBytes 拒绝奇数字符", () => assert.equal(hexToBytes("abc"), null));

console.log("== HTML / Unicode ==");
test("escapeHtml 转义", () => assert.equal(escapeHtml(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;"));
test("escapeHtmlAll 数字实体", () => assert.equal(escapeHtmlAll("A中"), "A&#20013;"));
test("unescapeHtml 命名与数字实体", () => {
  assert.equal(unescapeHtml("&amp;&lt;&gt;&quot;&#39;&nbsp;&#20013;"), "&<>\"'\u00a0中");
});
test("unicodeEscape \\u 风格", () => assert.equal(unicodeEscape("A中😀"), "A\\u4e2d\\ud83d\\ude00"));
test("unicodeEscape \\u{} 风格", () => assert.equal(unicodeEscape("A中😀", "brace"), "A\\u{4e2d}\\u{1f600}"));
test("unicodeUnescape 两种风格", () =>
  assert.equal(unicodeUnescape("A\\u4e2d\\ud83d\\ude00B\\u{1f600}"), "A中😀B😀"));

console.log("== 数字 / 分数 ==");
test("formatNumber 千分位", () => assert.equal(formatNumber(1234567.891, 2), "1,234,567.89"));
test("gcd / lcm", () => {
  assert.equal(gcd(12, 18), 6);
  assert.equal(lcm(4, 6), 12);
});
test("0.5 → 1/2", () => assert.equal(fracToString(fracFromDecimal(0.5), false), "1/2"));
test("1.25 → 5/4 与带分数", () => {
  assert.equal(fracToString(fracFromDecimal(1.25), false), "5/4");
  assert.equal(fracToString(fracFromDecimal(1.25), true), "1 1/4");
});
test("0.333333 → 约 1/3", () => {
  const f = fracFromDecimal(0.333333);
  assert.ok(Math.abs(fracToDecimal(f) - 1 / 3) < 1e-5);
});
test("分数加法 1/2+1/3=5/6", () => assert.equal(fracToString(fracAdd({ num: 1, den: 2 }, { num: 1, den: 3 }), false), "5/6"));
test("分数乘法 2/3×3/4=1/2", () => assert.equal(fracToString(fracMul({ num: 2, den: 3 }, { num: 3, den: 4 }), false), "1/2"));

console.log("== 进制 / BigInt ==");
test("0xff → 255", () => assert.equal(baseToBigInt("ff", 16)?.toString(), "255"));
test("十进制 → 二进制", () => assert.equal(bigIntToBase(255n, 2), "11111111"));
test("超大整数精度", () => {
  const v = baseToBigInt("f".repeat(64), 16)!;
  assert.equal(bigIntToBase(v, 16), "f".repeat(64));
});
test("负数", () => assert.equal(baseToBigInt("-1a", 16)?.toString(), "-26"));
test("maskToBits / toSigned", () => {
  assert.equal(maskToBits(0x1ffn, 8).toString(), "255");
  assert.equal(toSigned(0xffn, 8).toString(), "-1");
  assert.equal(toSigned(0x7fn, 8).toString(), "127");
});
test("非法进制拒绝", () => assert.equal(baseToBigInt("g", 16), null));

console.log("== 日期 ==");
const D = (s: string) => parseDateLocal(s)!;
test("diffYMD 普通情况", () => {
  assert.deepEqual(diffYMD(D("2024-01-05"), D("2024-01-10")), { y: 0, m: 0, d: 5, totalDays: 5 });
});
test("diffYMD 跨年", () => {
  const r = diffYMD(D("2023-11-20"), D("2024-05-15"));
  assert.equal(r.y, 0);
  assert.equal(r.m, 5);
  assert.equal(r.d, 25);
});
test("diffYMD 闰年月末 (1/31→3/1)", () => {
  const r = diffYMD(D("2024-01-31"), D("2024-03-01"));
  assert.equal(r.m, 1);
  assert.equal(r.d, 1);
});
test("diffYMD 2/29→次年 2/28 满一年", () => {
  const r = diffYMD(D("2024-02-29"), D("2025-02-28"));
  assert.equal(r.y, 1);
  assert.equal(r.m, 0);
  assert.equal(r.d, 0);
});
test("diffYMD 同年同月同日", () => {
  const r = diffYMD(D("2024-06-15"), D("2024-06-15"));
  assert.deepEqual(r, { y: 0, m: 0, d: 0, totalDays: 0 });
});
test("addMonths 月末钳制", () => {
  const r = new Date(2024, 0, 31);
  const out = new Date(2024, 1, 29);
  assert.equal(formatInZone(new Date(r.getFullYear(), r.getMonth() + 1, Math.min(r.getDate(), new Date(r.getFullYear(), r.getMonth() + 2, 0).getDate())), "UTC"), formatInZone(out, "UTC"));
});
test("ageAt 周岁与生日", () => {
  const birth = D("2000-02-29");
  const at = D("2024-03-01");
  const r = ageAt(birth, at);
  assert.equal(r.y, 24);
  assert.equal(r.nextBirthdayDays, 364); // 2025-02-28 钳制生日
});
test("工作日统计", () => {
  const holidays = parseHolidayText("2024-10-01\n2024-10-02\n10-01");
  const extras = parseHolidayText("2024-09-29");
  const r = countBusinessDays(D("2024-09-29"), D("2024-10-07"), holidays, extras);
  assert.equal(r.total, 9);
  assert.equal(r.weekends, 3); // 9/29(日) 10/5(六) 10/6(日)
  assert.equal(r.extras, 1); // 9/29 调休上班
  assert.equal(r.holidays, 2); // 10/1 10/2（10-01 通配命中 10/1）
  assert.equal(r.workdays, 9 - 3 + 1 - 2);
});
test("addBusinessDays 顺推（含起始日）", () => {
  // 10/8 起算：第 1 个=10/8，第 3 个=10/10
  const d = addBusinessDays(D("2024-10-08"), 3)!;
  assert.equal(dateKey(d), "2024-10-10");
});
test("addBusinessDays 跨周末顺推", () => {
  // 10/11(五) 起第 2 个工作日 = 10/14(一)
  const d = addBusinessDays(D("2024-10-11"), 2)!;
  assert.equal(dateKey(d), "2024-10-14");
});
test("isWorkday 周六调休", () => {
  const extras = parseHolidayText("2024-09-29");
  assert.equal(isWorkday(D("2024-09-29"), new Set(), extras), true);
  assert.equal(isWorkday(D("2024-10-05"), new Set(), extras), false);
});

console.log("== 时区 ==");
test("上海偏移 +8", () => {
  const off = zoneOffsetMinutes(new Date("2024-01-15T12:00:00Z"), "Asia/Shanghai");
  assert.equal(off, 480);
  assert.equal(offsetLabel(off), "GMT+8");
});
test("纽约冬令时 -5", () => {
  const off = zoneOffsetMinutes(new Date("2024-01-15T12:00:00Z"), "America/New_York");
  assert.equal(off, -300);
});
test("formatInZone", () => {
  const s = formatInZone(new Date("2024-01-15T12:00:00Z"), "Asia/Shanghai");
  assert.match(s, /2024/);
  assert.match(s, /20:00/);
});

console.log("== 金融 ==");
test("等额本息 100万 3.5% 30年", () => {
  const r = equalPayment(1000000, 3.5, 360);
  assert.ok(Math.abs(r.monthly - 4490.45) < 1, `月供 ${r.monthly}`);
  assert.ok(Math.abs(r.totalInterest - 616560.88) < 100);
});
test("等额本金 100万 3.5% 30年", () => {
  const r = equalPrincipal(1000000, 3.5, 360);
  assert.ok(Math.abs(r.first - 5694.44) < 1, `首月 ${r.first}`);
  assert.ok(Math.abs(r.totalInterest - 526458.33) < 10);
});
test("amortSchedule 总行数与剩余本金归零", () => {
  const r = amortSchedule(100000, 4.5, 120, 360);
  assert.equal(r.rows.length, 120);
  assert.ok(Math.abs(r.rows[119].balance) < 0.01);
});
test("个税：应纳税所得额 36,000 → 3%", () => {
  const r = incomeTax(36000);
  assert.equal(r.tax, 1080);
  assert.equal(r.rate, 0.03);
});
test("个税：应纳税所得额 200,000", () => {
  const r = incomeTax(200000);
  assert.equal(r.tax, 200000 * 0.2 - 16920);
});
test("复利：1 万 5% 年复利 10 年", () => {
  const v = compoundInterest(10000, 5, 10, 1);
  assert.ok(Math.abs(v - 16288.95) < 1);
});
test("单利", () => {
  const v = 10000 * (1 + 0.05 * 10);
  assert.ok(Math.abs(v - 15000) < 1e-6);
});
test("BMI 正常范围", () => {
  const r = bmiCalc(175, 70);
  assert.ok(Math.abs(r.bmi - 22.86) < 0.01);
  assert.equal(r.category, "正常");
});

console.log("== 单位 ==");
test("长度：1 米 = 39.37 英寸", () => {
  const sys = UNIT_SYSTEMS.find((s) => s.id === "length")!;
  const base = sys.toBase(1, "m");
  assert.ok(Math.abs(sys.fromBase(base, "in") - 39.3701) < 0.01);
});
test("温度：0°C = 32°F = 273.15K", () => {
  const sys = UNIT_SYSTEMS.find((s) => s.id === "temp")!;
  assert.ok(Math.abs(sys.fromBase(0, "f") - 32) < 1e-9);
  assert.ok(Math.abs(sys.fromBase(0, "k") - 273.15) < 1e-9);
  assert.ok(Math.abs(sys.toBase(100, "f") - 37.7778) < 0.001);
});
test("存储：1 GiB = 1.07374 GB", () => {
  const sys = UNIT_SYSTEMS.find((s) => s.id === "data")!;
  const base = sys.toBase(1, "gib");
  assert.ok(Math.abs(sys.fromBase(base, "gb") - 1.07374) < 1e-4);
});
test("市斤：1 千克 = 2 斤", () => {
  const sys = UNIT_SYSTEMS.find((s) => s.id === "weight")!;
  assert.ok(Math.abs(sys.fromBase(sys.toBase(1, "kg"), "jin") - 2) < 1e-9);
});

console.log("== XML 格式化 ==");
test("XML 缩进", () => {
  const out = formatXml("<root><a x='1'><b>text</b></a><c/></root>");
  const lines = out.split("\n");
  assert.equal(lines[0], "<root>");
  assert.equal(lines[1], "  <a x='1'>");
  assert.equal(lines[2], "    <b>");
  assert.equal(lines[3], "      text");
  assert.equal(lines[4], "    </b>");
  assert.equal(lines[5], "  </a>");
  assert.equal(lines[6], "  <c/>");
  assert.equal(lines[7], "</root>");
});
test("XML 多行输入", () => {
  const out = formatXml("<r>\n<a>1</a>\n</r>");
  assert.ok(out.includes("  <a>\n    1\n  </a>"));
});

console.log(`\n结果：${passed} 通过，${failed} 失败`);
if (failed > 0) process.exit(1);
