"use client";

import { useMemo, useState } from "react";
import { Input, KeyValue } from "@/components/ui";

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{8})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return null;
  return [r, g, b];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0")).join("");
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360 / 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    t = ((t % 1) + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255)];
}

export function luminance(r: number, g: number, b: number): number {
  const f = (c: number) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a: [number, number, number], b: [number, number, number]): number {
  const l1 = luminance(...a);
  const l2 = luminance(...b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export default function ColorTool() {
  const [hex, setHex] = useState("#4f46e5");

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => (rgb ? rgbToHsl(...rgb) : [0, 0, 0]), [rgb]);
  const [h, s, l] = hsl;

  const setRgb = (r: number, g: number, b: number) => setHex(rgbToHex(r, g, b));
  const setHsl = (hh: number, ss: number, ll: number) => {
    const [r, g, b] = hslToRgb(hh, ss, ll);
    setHex(rgbToHex(r, g, b));
  };

  const lum = rgb ? luminance(...rgb) : 0;
  const cWhite = rgb ? contrast(rgb, [255, 255, 255]) : 0;
  const cBlack = rgb ? contrast(rgb, [0, 0, 0]) : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="color"
          className="h-16 w-24 cursor-pointer rounded-lg border border-zinc-300 bg-white p-1 dark:border-zinc-700"
          value={rgbToHex(rgb ? rgb[0] : 0, rgb ? rgb[1] : 0, rgb ? rgb[2] : 0)}
          onChange={(e) => setHex(e.target.value)}
        />
        <div className="flex-1 space-y-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">HEX</span>
            <Input type="text" value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#4f46e5" spellCheck={false} className="font-mono" />
          </label>
          {!rgb && <p className="text-xs text-red-500">无效的 HEX 颜色（支持 #rgb / #rrggbb / #rrggbbaa）</p>}
        </div>
      </div>
      {rgb && (
        <>
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mb-3 h-14 rounded-lg border border-zinc-200 dark:border-zinc-700" style={{ background: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` }} />
            <div className="grid grid-cols-3 gap-3">
              {(["R", "G", "B"] as const).map((ch, i) => (
                <label key={ch} className="block">
                  <span className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">{ch}</span>
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    className="font-mono"
                    value={rgb[i]}
                    onChange={(e) => {
                      const vals = [...rgb];
                      vals[i] = clamp(parseInt(e.target.value) || 0, 0, 255);
                      setRgb(vals[0], vals[1], vals[2]);
                    }}
                  />
                </label>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">H（0-360）</span>
                <Input type="number" min={0} max={360} className="font-mono" value={Math.round(h * 10) / 10} onChange={(e) => setHsl(parseFloat(e.target.value) || 0, s, l)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">S %</span>
                <Input type="number" min={0} max={100} className="font-mono" value={Math.round(s * 10) / 10} onChange={(e) => setHsl(h, parseFloat(e.target.value) || 0, l)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">L %</span>
                <Input type="number" min={0} max={100} className="font-mono" value={Math.round(l * 10) / 10} onChange={(e) => setHsl(h, s, parseFloat(e.target.value) || 0)} />
              </label>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="px-4">
              <KeyValue k="CSS RGB" v={`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`} mono />
              <KeyValue k="HSL" v={`hsl(${Math.round(h * 10) / 10}, ${Math.round(s * 10) / 10}%, ${Math.round(l * 10) / 10}%)`} mono />
              <KeyValue k="相对亮度" v={lum.toFixed(4)} mono />
              <KeyValue k="对比度 · 白底" v={cWhite.toFixed(2)} mono />
              <KeyValue k="对比度 · 黑底" v={cBlack.toFixed(2)} mono />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
