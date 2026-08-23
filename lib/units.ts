/**
 * 单位换算定义 —— 每组单位换算到基准单位（线性因子），温度/存储特殊处理。
 */

export interface UnitDef {
  id: string;
  name: string;
  /** 换算到基准单位的乘数 */
  factor: number;
}

export interface UnitSystem {
  id: string;
  title: string;
  baseSymbol: string;
  units: UnitDef[];
  toBase(v: number, from: string): number;
  fromBase(v: number, to: string): number;
}

function linear(factorOf: Record<string, number>): Pick<UnitSystem, "toBase" | "fromBase"> {
  return {
    toBase: (v, from) => v * (factorOf[from] ?? 1),
    fromBase: (v, to) => v / (factorOf[to] ?? 1),
  };
}

export const UNIT_SYSTEMS: UnitSystem[] = [
  {
    id: "length",
    title: "长度",
    baseSymbol: "m",
    units: [
      { id: "km", name: "千米 km", factor: 1000 },
      { id: "m", name: "米 m", factor: 1 },
      { id: "dm", name: "分米 dm", factor: 0.1 },
      { id: "cm", name: "厘米 cm", factor: 0.01 },
      { id: "mm", name: "毫米 mm", factor: 0.001 },
      { id: "um", name: "微米 µm", factor: 1e-6 },
      { id: "nm", name: "纳米 nm", factor: 1e-9 },
      { id: "mi", name: "英里 mi", factor: 1609.344 },
      { id: "yd", name: "码 yd", factor: 0.9144 },
      { id: "ft", name: "英尺 ft", factor: 0.3048 },
      { id: "in", name: "英寸 in", factor: 0.0254 },
      { id: "nmi", name: "海里 nmi", factor: 1852 },
      { id: "li", name: "市里", factor: 500 },
      { id: "zhang", name: "丈", factor: 10 / 3 },
      { id: "chi", name: "尺", factor: 1 / 3 },
      { id: "cun", name: "寸", factor: 1 / 30 },
    ],
    ...linear({
      km: 1000, m: 1, dm: 0.1, cm: 0.01, mm: 0.001, um: 1e-6, nm: 1e-9,
      mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254, nmi: 1852,
      li: 500, zhang: 10 / 3, chi: 1 / 3, cun: 1 / 30,
    }),
  },
  {
    id: "weight",
    title: "重量",
    baseSymbol: "kg",
    units: [
      { id: "t", name: "吨 t", factor: 1000 },
      { id: "kg", name: "千克 kg", factor: 1 },
      { id: "g", name: "克 g", factor: 0.001 },
      { id: "mg", name: "毫克 mg", factor: 1e-6 },
      { id: "lb", name: "磅 lb", factor: 0.45359237 },
      { id: "oz", name: "盎司 oz", factor: 0.028349523125 },
      { id: "st", name: "英石 st", factor: 6.35029318 },
      { id: "jin", name: "市斤", factor: 0.5 },
      { id: "liang", name: "两", factor: 0.05 },
      { id: "qian", name: "钱", factor: 0.005 },
    ],
    ...linear({
      t: 1000, kg: 1, g: 0.001, mg: 1e-6, lb: 0.45359237, oz: 0.028349523125,
      st: 6.35029318, jin: 0.5, liang: 0.05, qian: 0.005,
    }),
  },
  {
    id: "temp",
    title: "温度",
    baseSymbol: "°C",
    units: [
      { id: "c", name: "摄氏度 °C", factor: 1 },
      { id: "f", name: "华氏度 °F", factor: 1 },
      { id: "k", name: "开尔文 K", factor: 1 },
      { id: "r", name: "兰氏度 °R", factor: 1 },
    ],
    toBase: (v, from) => {
      switch (from) {
        case "f": return ((v - 32) * 5) / 9;
        case "k": return v - 273.15;
        case "r": return ((v - 491.67) * 5) / 9;
        default: return v;
      }
    },
    fromBase: (v, to) => {
      switch (to) {
        case "f": return (v * 9) / 5 + 32;
        case "k": return v + 273.15;
        case "r": return (v + 273.15) * 9 / 5;
        default: return v;
      }
    },
  },
  {
    id: "area",
    title: "面积",
    baseSymbol: "m²",
    units: [
      { id: "km2", name: "平方千米 km²", factor: 1e6 },
      { id: "ha", name: "公顷 ha", factor: 10000 },
      { id: "m2", name: "平方米 m²", factor: 1 },
      { id: "dm2", name: "平方分米 dm²", factor: 0.01 },
      { id: "cm2", name: "平方厘米 cm²", factor: 0.0001 },
      { id: "mm2", name: "平方毫米 mm²", factor: 1e-6 },
      { id: "acre", name: "英亩 acre", factor: 4046.8564224 },
      { id: "ft2", name: "平方英尺 ft²", factor: 0.09290304 },
      { id: "in2", name: "平方英寸 in²", factor: 0.00064516 },
      { id: "mu", name: "亩", factor: 2000 / 3 },
      { id: "fen", name: "分", factor: 200 / 3 },
      { id: "qing", name: "顷", factor: 200000 / 3 },
    ],
    ...linear({
      km2: 1e6, ha: 10000, m2: 1, dm2: 0.01, cm2: 0.0001, mm2: 1e-6,
      acre: 4046.8564224, ft2: 0.09290304, in2: 0.00064516,
      mu: 2000 / 3, fen: 200 / 3, qing: 200000 / 3,
    }),
  },
  {
    id: "volume",
    title: "体积",
    baseSymbol: "L",
    units: [
      { id: "m3", name: "立方米 m³", factor: 1000 },
      { id: "l", name: "升 L", factor: 1 },
      { id: "ml", name: "毫升 mL", factor: 0.001 },
      { id: "cm3", name: "立方厘米 cm³", factor: 0.001 },
      { id: "gal", name: "美制加仑 gal", factor: 3.785411784 },
      { id: "galuk", name: "英制加仑 gal(UK)", factor: 4.54609 },
      { id: "qt", name: "夸脱 qt", factor: 0.946352946 },
      { id: "pt", name: "品脱 pt", factor: 0.473176473 },
      { id: "cup", name: "杯 cup", factor: 0.2365882365 },
      { id: "floz", name: "液量盎司 fl oz", factor: 0.02957352956 },
      { id: "tbsp", name: "汤匙 tbsp", factor: 0.01478676478 },
      { id: "tsp", name: "茶匙 tsp", factor: 0.004928921594 },
    ],
    ...linear({
      m3: 1000, l: 1, ml: 0.001, cm3: 0.001, gal: 3.785411784, galuk: 4.54609,
      qt: 0.946352946, pt: 0.473176473, cup: 0.2365882365, floz: 0.02957352956,
      tbsp: 0.01478676478, tsp: 0.004928921594,
    }),
  },
  {
    id: "data",
    title: "数据存储",
    baseSymbol: "B",
    units: [
      { id: "bit", name: "比特 bit", factor: 0.125 },
      { id: "b", name: "字节 B", factor: 1 },
      { id: "kb", name: "千字节 KB (1000)", factor: 1e3 },
      { id: "mb", name: "兆字节 MB (1000²)", factor: 1e6 },
      { id: "gb", name: "吉字节 GB (1000³)", factor: 1e9 },
      { id: "tb", name: "太字节 TB (1000⁴)", factor: 1e12 },
      { id: "pb", name: "拍字节 PB (1000⁵)", factor: 1e15 },
      { id: "kib", name: "千字节 KiB (1024)", factor: 1024 },
      { id: "mib", name: "兆字节 MiB (1024²)", factor: 1048576 },
      { id: "gib", name: "吉字节 GiB (1024³)", factor: 1073741824 },
      { id: "tib", name: "太字节 TiB (1024⁴)", factor: 1099511627776 },
      { id: "pib", name: "拍字节 PiB (1024⁵)", factor: 1125899906842624 },
    ],
    ...linear({
      bit: 0.125, b: 1, kb: 1e3, mb: 1e6, gb: 1e9, tb: 1e12, pb: 1e15,
      kib: 1024, mib: 1048576, gib: 1073741824, tib: 1099511627776, pib: 1125899906842624,
    }),
  },
];
