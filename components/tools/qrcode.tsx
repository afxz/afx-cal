"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { TextArea, Input, ErrorBox, selectCls, Field, btnGhost } from "@/components/ui";
import { toast } from "@/lib/toast";

const EC_LEVELS = [
  ["L", "L（7%）"],
  ["M", "M（15%）"],
  ["Q", "Q（25%）"],
  ["H", "H（30%）"],
] as const;

export default function QrcodeTool() {
  const [text, setText] = useState("");
  const [level, setLevel] = useState("M");
  const [width, setWidth] = useState("320");
  const [url, setUrl] = useState("");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (!text.trim()) {
      setUrl("");
      setSvg("");
      setError("");
      return;
    }
    timer.current = window.setTimeout(async () => {
      try {
        const dataUrl = await QRCode.toDataURL(text, {
          errorCorrectionLevel: level as never,
          margin: 2,
          width: Number(width) || 320,
        });
        setUrl(dataUrl);
        setSvg(await QRCode.toString(text, { errorCorrectionLevel: level as never, type: "svg", margin: 2 }));
        setError("");
      } catch (e) {
        setUrl("");
        setSvg("");
        setError(e instanceof Error ? e.message : String(e));
      }
    }, 300);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [text, level, width]);

  const download = (href: string, ext: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = `qrcode-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
      <div className="space-y-3">
        <TextArea rows={5} placeholder={"输入文本或链接…"} value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex flex-wrap items-end gap-3">
          <Field label="容错级别">
            <select className={selectCls} value={level} onChange={(e) => setLevel(e.target.value)}>
              {EC_LEVELS.map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="像素宽度">
            <Input
              type="number"
              min={128}
              max={1024}
              step={16}
              className="w-28"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </Field>
        </div>
        <ErrorBox msg={error} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnGhost} disabled={!url} onClick={() => download(url, "png")}>
            ⬇ 下载 PNG
          </button>
          <button
            type="button"
            className={btnGhost}
            disabled={!svg}
            onClick={() => {
              const blob = new Blob([svg], { type: "image/svg+xml" });
              const href = URL.createObjectURL(blob);
              download(href, "svg");
              setTimeout(() => URL.revokeObjectURL(href), 1000);
            }}
          >
            ⬇ 下载 SVG
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        {url ? (
          <img src={url} alt="QR Code" className="rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800" />
        ) : (
          <div className="flex h-64 w-64 items-center justify-center rounded-xl border border-dashed border-zinc-300 text-sm text-zinc-400 dark:border-zinc-700">
            输入内容后自动生成
          </div>
        )}
      </div>
    </div>
  );
}
