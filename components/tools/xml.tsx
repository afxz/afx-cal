"use client";

import { useState } from "react";
import { TextArea, ResultBox, ErrorBox } from "@/components/ui";
import { formatXml } from "@/lib/xml";

export default function XmlTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const run = () => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      setOutput(formatXml(input));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-3">
      <TextArea rows={8} placeholder={"粘贴 XML…"} value={input} onChange={(e) => setInput(e.target.value)} />
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
