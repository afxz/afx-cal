"use client";

import { useMemo, useState } from "react";
import { format, supportedDialects } from "sql-formatter";
import { TextArea, ResultBox, ErrorBox, selectCls, Field } from "@/components/ui";

const DIALECT_LABELS: Record<string, string> = {
  sql: "标准 SQL",
  bigquery: "BigQuery",
  db2: "DB2",
  hive: "Hive",
  mariadb: "MariaDB",
  mysql: "MySQL",
  n1ql: "N1QL (Couchbase)",
  plsql: "PL/SQL (Oracle)",
  postgresql: "PostgreSQL",
  redshift: "Redshift",
  singlestoredb: "SingleStore",
  snowflake: "Snowflake",
  spark: "Spark",
  sqlite: "SQLite",
  transactsql: "Transact-SQL",
  tsql: "TSQL",
  trino: "Trino",
};

export default function SqlTool() {
  const [input, setInput] = useState("");
  const [dialect, setDialect] = useState("mysql");
  const [keywordCase, setKeywordCase] = useState("upper");
  const [tabWidth, setTabWidth] = useState("2");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const dialects = useMemo(() => {
    const list = Array.isArray(supportedDialects) ? (supportedDialects as string[]) : ["sql", "mysql", "postgresql", "sqlite", "tsql"];
    return [...new Set([...list, "sql", "mysql", "postgresql", "sqlite", "tsql"])].sort();
  }, []);

  const run = () => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      setOutput(
        format(input, {
          language: dialect as never,
          keywordCase: keywordCase as never,
          tabWidth: Number(tabWidth),
          linesBetweenQueries: 2,
        }),
      );
      setError("");
    } catch (e) {
      setOutput("");
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Field label="方言">
          <select className={selectCls + " w-full"} value={dialect} onChange={(e) => setDialect(e.target.value)}>
            {dialects.map((d) => (
              <option key={d} value={d}>
                {DIALECT_LABELS[d] ?? d}
              </option>
            ))}
          </select>
        </Field>
        <Field label="关键字大小写">
          <select
            className={selectCls + " w-full"}
            value={keywordCase}
            onChange={(e) => setKeywordCase(e.target.value)}
          >
            <option value="upper">UPPER</option>
            <option value="lower">lower</option>
            <option value="preserve">保持原样</option>
          </select>
        </Field>
        <Field label="缩进宽度">
          <select className={selectCls + " w-full"} value={tabWidth} onChange={(e) => setTabWidth(e.target.value)}>
            <option value="2">2 空格</option>
            <option value="4">4 空格</option>
          </select>
        </Field>
      </div>
      <TextArea rows={8} placeholder={"粘贴 SQL…"} value={input} onChange={(e) => setInput(e.target.value)} />
      <button
        type="button"
        className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        onClick={run}
      >
        格式化
      </button>
      <ErrorBox msg={error} />
      <ResultBox value={output} rows={8} />
    </div>
  );
}
