"use client";

import { useMemo, useState } from "react";

// ---------- 表达式解析 ----------

type Token = { t: "num" | "op" | "ident" | "lparen" | "rparen" | "end"; v?: string };

function tokenize(s: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === " " || c === "，") { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      if ((s[j] === "e" || s[j] === "E") && /[0-9+-]/.test(s[j + 1] ?? "")) {
        let k = j + 1;
        if (s[k] === "+" || s[k] === "-") k++;
        if (/[0-9]/.test(s[k] ?? "")) {
          while (k < s.length && /[0-9]/.test(s[k])) k++;
          j = k;
        }
      }
      const num = s.slice(i, j);
      if ((num.match(/\./g) || []).length > 1) throw new Error("数字格式错误：" + num);
      tokens.push({ t: "num", v: num });
      i = j;
      continue;
    }
    if (/[a-zA-Zπ]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Zπ]/.test(s[j])) j++;
      tokens.push({ t: "ident", v: s.slice(i, j) });
      i = j;
      continue;
    }
    if ("+-*/%^!".includes(c)) { tokens.push({ t: "op", v: c }); i++; continue; }
    if (c === "(") { tokens.push({ t: "lparen" }); i++; continue; }
    if (c === ")") { tokens.push({ t: "rparen" }); i++; continue; }
    throw new Error("无法识别的字符：" + c);
  }
  tokens.push({ t: "end" });
  return tokens;
}

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new Error("阶乘仅支持非负整数");
  if (n > 170) throw new Error("阶乘过大");
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

class Parser {
  private pos = 0;
  constructor(
    private tokens: Token[],
    private deg: boolean,
  ) {}

  private peek(): Token {
    return this.tokens[this.pos];
  }
  private next(): Token {
    return this.tokens[this.pos++];
  }

  parse(): number {
    const v = this.parseExpr();
    if (this.peek().t !== "end") throw new Error("表达式不完整");
    return v;
  }

  private parseExpr(): number {
    let v = this.parseTerm();
    for (;;) {
      const t = this.peek();
      if (t.t === "op" && (t.v === "+" || t.v === "-")) {
        this.next();
        const r = this.parseTerm();
        v = t.v === "+" ? v + r : v - r;
      } else return v;
    }
  }

  private parseTerm(): number {
    let v = this.parseFactor();
    for (;;) {
      const t = this.peek();
      if (t.t === "op" && (t.v === "*" || t.v === "/" || t.v === "%")) {
        this.next();
        const r = this.parseFactor();
        if (t.v === "*") v *= r;
        else {
          if (r === 0) throw new Error("除以零");
          v = t.v === "/" ? v / r : v % r;
        }
      } else return v;
    }
  }

  private parseFactor(): number {
    const t = this.peek();
    if (t.t === "op" && (t.v === "+" || t.v === "-")) {
      this.next();
      const v = this.parseFactor();
      return t.v === "-" ? -v : v;
    }
    return this.parsePower();
  }

  private parsePower(): number {
    const base = this.parsePostfix();
    const t = this.peek();
    if (t.t === "op" && t.v === "^") {
      this.next();
      const exp = this.parseFactor(); // 右结合
      return Math.pow(base, exp);
    }
    return base;
  }

  private parsePostfix(): number {
    let v = this.parseAtom();
    for (;;) {
      const t = this.peek();
      if (t.t === "op" && t.v === "!") { this.next(); v = factorial(v); }
      else if (t.t === "op" && t.v === "%") { this.next(); v /= 100; }
      else return v;
    }
  }

  private parseAtom(): number {
    const t = this.next();
    let v: number;
    if (t.t === "num") {
      v = parseFloat(t.v!);
    } else if (t.t === "lparen") {
      v = this.parseExpr();
      if (this.next().t !== "rparen") throw new Error("缺少右括号");
    } else if (t.t === "ident") {
      v = this.applyIdent(t.v!);
    } else {
      throw new Error("表达式错误");
    }
    // 隐式乘法：2π、3(4+1)、(2)(3)
    const nt = this.peek();
    if (nt.t === "num" || nt.t === "ident" || nt.t === "lparen") {
      v *= this.parseAtom();
    }
    return v;
  }

  private applyIdent(name: string): number {
    const n = name.toLowerCase();
    if (n === "pi" || n === "π") return Math.PI;
    if (n === "e") return Math.E;
    const nt = this.next();
    if (nt.t !== "lparen") throw new Error(`函数 ${name} 需要括号参数`);
    const arg = this.parseExpr();
    if (this.next().t !== "rparen") throw new Error("缺少右括号");
    const toRad = (x: number) => (this.deg ? (x * Math.PI) / 180 : x);
    const toDeg = (x: number) => (this.deg ? (x * 180) / Math.PI : x);
    switch (n) {
      case "sin": return Math.sin(toRad(arg));
      case "cos": return Math.cos(toRad(arg));
      case "tan": return Math.tan(toRad(arg));
      case "asin": return toDeg(Math.asin(arg));
      case "acos": return toDeg(Math.acos(arg));
      case "atan": return toDeg(Math.atan(arg));
      case "sinh": return Math.sinh(arg);
      case "cosh": return Math.cosh(arg);
      case "tanh": return Math.tanh(arg);
      case "ln": return Math.log(arg);
      case "log": return Math.log10(arg);
      case "sqrt": return Math.sqrt(arg);
      case "cbrt": return Math.cbrt(arg);
      case "exp": return Math.exp(arg);
      case "abs": return Math.abs(arg);
      case "floor": return Math.floor(arg);
      case "ceil": return Math.ceil(arg);
      case "round": return Math.round(arg);
      case "sign": return Math.sign(arg);
      default: throw new Error("未知函数：" + name);
    }
  }
}

export function evaluateExpr(expr: string, deg: boolean): number {
  return new Parser(tokenize(expr), deg).parse();
}

export function formatResult(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-9 && n !== 0)) return n.toExponential(10).replace(/\.?0+e/, "e");
  const s = n.toPrecision(12);
  return String(parseFloat(s));
}

// ---------- UI ----------

const KEYS: { label: string; insert: string }[][] = [
  [{ label: "AC", insert: "__clear" }, { label: "⌫", insert: "__back" }, { label: "%", insert: "%" }, { label: "÷", insert: "/" }],
  [{ label: "7", insert: "7" }, { label: "8", insert: "8" }, { label: "9", insert: "9" }, { label: "×", insert: "*" }],
  [{ label: "4", insert: "4" }, { label: "5", insert: "5" }, { label: "6", insert: "6" }, { label: "−", insert: "-" }],
  [{ label: "1", insert: "1" }, { label: "2", insert: "2" }, { label: "3", insert: "3" }, { label: "+", insert: "+" }],
  [{ label: "0", insert: "0" }, { label: ".", insert: "." }, { label: "(", insert: "(" }, { label: ")", insert: ")" }],
  [{ label: "sin", insert: "sin(" }, { label: "cos", insert: "cos(" }, { label: "tan", insert: "tan(" }, { label: "ln", insert: "ln(" }],
  [{ label: "log", insert: "log(" }, { label: "√", insert: "sqrt(" }, { label: "^", insert: "^" }, { label: "!", insert: "!" }],
  [{ label: "asin", insert: "asin(" }, { label: "acos", insert: "acos(" }, { label: "atan", insert: "atan(" }, { label: "Ans", insert: "__ans" }],
  [{ label: "π", insert: "π" }, { label: "e", insert: "e" }],
];

export default function CalcTool() {
  const [expr, setExpr] = useState("");
  const [deg, setDeg] = useState(true);
  const [ans, setAns] = useState<number | null>(null);

  const result = useMemo(() => {
    if (!expr.trim()) return null;
    try {
      return { ok: true as const, v: evaluateExpr(expr, deg), s: formatResult(evaluateExpr(expr, deg)) };
    } catch (e) {
      return { ok: false as const, msg: e instanceof Error ? e.message : String(e) };
    }
  }, [expr, deg]);

  const insert = (s: string) => {
    if (s === "__clear") { setExpr(""); return; }
    if (s === "__back") { setExpr((p) => p.slice(0, -1)); return; }
    if (s === "__ans") {
      if (ans === null) return;
      const v = formatResult(ans);
      setExpr((p) => p + (p && /[0-9)\]]$/.test(p) ? "*" : "") + v);
      return;
    }
    setExpr((p) => p + s);
  };

  const submit = () => {
    if (result && result.ok) setAns(result.v);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          {[["deg", "DEG"], ["rad", "RAD"]].map(([v, label]) => (
            <button
              key={v}
              type="button"
              className={
                "rounded-md px-3 py-1 text-xs font-medium transition " +
                (deg === (v === "deg")
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-zinc-500 dark:text-zinc-400")
              }
              onClick={() => setDeg(v === "deg")}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500">支持 + − × ÷ % ^ ! 与隐式乘法</div>
      </div>
      <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
        <input
          type="text"
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="输入表达式，如 sin(30)+2^3"
          spellCheck={false}
          className="w-full bg-transparent font-mono text-lg text-zinc-900 outline-none dark:text-zinc-100"
        />
        <div className={"mt-1 min-h-6 text-right font-mono text-sm " + (result && result.ok ? "text-indigo-600 dark:text-indigo-400" : "text-red-500")}>
          {result ? (result.ok ? "= " + result.s : result.msg) : "= ?"}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {KEYS.map((row, ri) => (
          <div key={ri} className={"contents"}>
            {row.map((k) => (
              <button
                key={k.label}
                type="button"
                onClick={() => insert(k.insert)}
                className={
                  "rounded-lg py-2.5 text-sm font-medium transition active:scale-[.97] " +
                  (k.insert === "__clear" || k.insert === "__back"
                    ? "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    : k.insert === "(" || k.insert === ")" || k.insert === "π" || k.insert === "e"
                      ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                      : /[0-9.]/.test(k.insert)
                        ? "bg-white text-zinc-900 shadow-sm hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60")
                }
              >
                {k.label}
              </button>
            ))}
            {row.length < 4 && Array.from({ length: 4 - row.length }, (_, i) => <div key={"pad" + i} className="contents" />)}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
        onClick={submit}
      >
        = 计算
      </button>
    </div>
  );
}
