"use client";

import { useState } from "react";
import { js_beautify, css_beautify, html_beautify } from "js-beautify";
import { TextArea, ResultBox, ErrorBox, selectCls, Field } from "@/components/ui";

type Kind = "js" | "css" | "html";

export default function BeautifyTool() {
  const [kind, setKind] = useState<Kind>("js");
  const [indent, setIndent] = useState("2");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const run = () => {
    try {
      const opts = { indent_size: Number(indent), end_with_newline: true };
      let out = "";
      if (kind === "js") out = js_beautify(input, opts);
      else if (kind === "css") out = css_beautify(input, opts);
      else out = html_beautify(input, { ...opts, indent_inner_html: true, unformatted: ["code", "pre"] });
      setOutput(out);
      setError("");
    } catch (e) {
      setOutput("");
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Field label="类型">
          <select
            className={selectCls + " w-full"}
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as Kind);
              setOutput("");
              setError("");
            }}
          >
            <option value="js">JavaScript</option>
            <option value="css">CSS</option>
            <option value="html">HTML</option>
          </select>
        </Field>
        <Field label="缩进宽度">
          <select className={selectCls + " w-full"} value={indent} onChange={(e) => setIndent(e.target.value)}>
            <option value="2">2 空格</option>
            <option value="4">4 空格</option>
          </select>
        </Field>
      </div>
      <TextArea rows={8} placeholder={`粘贴 ${kind.toUpperCase()} 代码…`} value={input} onChange={(e) => setInput(e.target.value)} />
      <button
        type="button"
        className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        onClick={run}
      >
        美化
      </button>
      <ErrorBox msg={error} />
      <ResultBox value={output} rows={8} />
    </div>
  );
}
