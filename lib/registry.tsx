"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * 工具组件注册表。
 * 曾尝试用 next/dynamic 为每个工具单独分包（38 个异步块），
 * 但在 SSR 预渲染阶段出现非确定的“Element type is invalid (undefined)”竞态，
 * 且 webpack 对动态导入有“必须内联字面量 / 不可循环生成”的限制。
 * 改为静态导入：一个共享块包含全部工具，本地工具集场景下可接受，且完全确定。
 */

import Base64Tool from "@/components/tools/base64";
import UrlTool from "@/components/tools/url";
import HexTool from "@/components/tools/hex";
import UnicodeTool from "@/components/tools/unicode";
import HtmlTool from "@/components/tools/html";
import JsonTool from "@/components/tools/json";
import XmlTool from "@/components/tools/xml";
import SqlTool from "@/components/tools/sql";
import BeautifyTool from "@/components/tools/beautify";
import HashTool from "@/components/tools/hash";
import HmacTool from "@/components/tools/hmac";
import AesTool from "@/components/tools/aes";
import JwtTool from "@/components/tools/jwt";
import RegexTool from "@/components/tools/regex";
import TimestampTool from "@/components/tools/timestamp";
import UuidTool from "@/components/tools/uuid";
import QrcodeTool from "@/components/tools/qrcode";
import ColorTool from "@/components/tools/colorconvert";
import PxRemTool from "@/components/tools/pxrem";
import BaseConvTool from "@/components/tools/baseconv";
import CalcTool from "@/components/tools/calc";
import ProCalcTool from "@/components/tools/procalc";
import PercentTool from "@/components/tools/percent";
import FractionTool from "@/components/tools/fraction";
import IntervalTool from "@/components/tools/interval";
import AgeTool from "@/components/tools/age";
import WorkdayTool from "@/components/tools/workday";
import TzTool from "@/components/tools/tz";
import LengthTool from "@/components/tools/length";
import WeightTool from "@/components/tools/weight";
import TempTool from "@/components/tools/temp";
import AreaTool from "@/components/tools/area";
import VolumeTool from "@/components/tools/volume";
import DataTool from "@/components/tools/data";
import BmiTool from "@/components/tools/bmi";
import LoanTool from "@/components/tools/loan";
import InterestTool from "@/components/tools/interest";
import TaxTool from "@/components/tools/tax";

export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  base64: Base64Tool,
  url: UrlTool,
  hex: HexTool,
  unicode: UnicodeTool,
  html: HtmlTool,
  json: JsonTool,
  xml: XmlTool,
  sql: SqlTool,
  beautify: BeautifyTool,
  hash: HashTool,
  hmac: HmacTool,
  aes: AesTool,
  jwt: JwtTool,
  regex: RegexTool,
  timestamp: TimestampTool,
  uuid: UuidTool,
  qrcode: QrcodeTool,
  color: ColorTool,
  pxrem: PxRemTool,
  baseconv: BaseConvTool,
  calc: CalcTool,
  procalc: ProCalcTool,
  percent: PercentTool,
  fraction: FractionTool,
  interval: IntervalTool,
  age: AgeTool,
  workday: WorkdayTool,
  tz: TzTool,
  length: LengthTool,
  weight: WeightTool,
  temp: TempTool,
  area: AreaTool,
  volume: VolumeTool,
  data: DataTool,
  bmi: BmiTool,
  loan: LoanTool,
  interest: InterestTool,
  tax: TaxTool,
};
