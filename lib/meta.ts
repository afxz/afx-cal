/**
 * 工具注册元数据 —— 纯数据，供主页、侧边栏、路由与 generateMetadata 使用。
 */

export interface Category {
  id: string;
  title: string;
  icon: string;
  blurb: string;
}

export interface ToolMeta {
  id: string;
  category: string;
  name: string;
  desc: string;
  keywords: string;
}

export const CATEGORIES: Category[] = [
  { id: "encode", title: "编解码", icon: "🔣", blurb: "Base64 / URL / Hex / Unicode / HTML 实体" },
  { id: "format", title: "格式化", icon: "📐", blurb: "JSON / XML / SQL / CSS / JS" },
  { id: "crypto", title: "加密哈希", icon: "🔐", blurb: "MD5 / SHA / HMAC / AES" },
  { id: "dev", title: "开发辅助", icon: "🛠️", blurb: "JWT / 正则 / 时间戳 / UUID / 二维码" },
  { id: "color", title: "颜色 / 单位", icon: "🎨", blurb: "HEX / RGB / HSL、px/rem、进制" },
  { id: "math", title: "数学", icon: "🧮", blurb: "科学计算 / 位运算 / 百分比 / 分数" },
  { id: "datetime", title: "日期时间", icon: "📅", blurb: "间隔 / 年龄 / 工作日 / 时区" },
  { id: "units", title: "单位换算", icon: "📏", blurb: "长度 / 重量 / 温度 / 面积 / 体积 / 存储" },
  { id: "life", title: "生活", icon: "🏠", blurb: "BMI / 房贷 / 利息 / 个税" },
];

export const TOOLS: ToolMeta[] = [
  // 编解码
  { id: "base64", category: "encode", name: "Base64", desc: "Base64 编码 / 解码，支持 UTF-8 与 URL-safe 变体", keywords: "base64 encode decode 编码 解码 utf8 urlsafe" },
  { id: "url", category: "encode", name: "URL 编码 / 解码", desc: "URL Encode / Decode，可选择空格编码方式", keywords: "url encode decode 编码 解码 percent" },
  { id: "hex", category: "encode", name: "Hex", desc: "文本与十六进制互转，支持 UTF-8", keywords: "hex 十六进制 binary 二进制 编码 解码" },
  { id: "unicode", category: "encode", name: "Unicode 转义", desc: "文本与 \\uXXXX / \\u{...} 转义互转", keywords: "unicode escape 转义 编码 解码" },
  { id: "html", category: "encode", name: "HTML 实体", desc: "HTML 实体编码 / 解码，支持全部转数字实体", keywords: "html entity 实体 编码 解码 escape" },
  // 格式化
  { id: "json", category: "format", name: "JSON 格式化", desc: "JSON 格式化 / 压缩，可排序键与选择缩进", keywords: "json format minify 格式化 压缩" },
  { id: "xml", category: "format", name: "XML 美化", desc: "XML 缩进美化", keywords: "xml format 美化 格式化 pretty" },
  { id: "sql", category: "format", name: "SQL 格式化", desc: "SQL 美化，支持十余种常见方言", keywords: "sql format 格式化 mysql postgresql oracle" },
  { id: "beautify", category: "format", name: "CSS / JS 美化", desc: "JavaScript / CSS / HTML 代码美化", keywords: "js css html beautify 美化 格式化" },
  // 加密哈希
  { id: "hash", category: "crypto", name: "MD5 / SHA", desc: "MD5、SHA-1/256/384/512 哈希计算", keywords: "md5 sha1 sha256 sha512 hash 哈希 摘要" },
  { id: "hmac", category: "crypto", name: "HMAC", desc: "HMAC-MD5 / HMAC-SHA 消息认证码", keywords: "hmac md5 sha 签名 mac" },
  { id: "aes", category: "crypto", name: "AES 加解密", desc: "AES 加解密（CBC / ECB / CTR），口令或密钥模式", keywords: "aes encrypt decrypt 加密 解密 openssl" },
  // 开发辅助
  { id: "jwt", category: "dev", name: "JWT 解码", desc: "JWT 解码，支持 HS256/384/512 签名校验", keywords: "jwt token 解码 decode verify 校验" },
  { id: "regex", category: "dev", name: "正则测试", desc: "正则表达式实时匹配、高亮与捕获组查看", keywords: "regex 正则 匹配 测试" },
  { id: "timestamp", category: "dev", name: "时间戳转换", desc: "Unix 时间戳与日期时间互转", keywords: "timestamp 时间戳 unix 转换" },
  { id: "uuid", category: "dev", name: "UUID 生成", desc: "UUID v4 批量生成", keywords: "uuid guid 生成" },
  { id: "qrcode", category: "dev", name: "二维码生成", desc: "文本 / 链接生成二维码，支持 PNG / SVG 下载", keywords: "qrcode 二维码 生成" },
  // 颜色 / 单位
  { id: "color", category: "color", name: "HEX / RGB / HSL", desc: "颜色格式互转、亮度与对比度", keywords: "color hex rgb hsl 颜色 转换" },
  { id: "pxrem", category: "color", name: "px / rem 换算", desc: "px 与 rem 互转，可自定义基准字号", keywords: "px rem 换算 字号 font-size" },
  { id: "baseconv", category: "color", name: "进制转换", desc: "2–36 任意进制转换，BigInt 精度，支持补码", keywords: "进制 转换 binary hex decimal oct bigint 补码" },
  // 数学
  { id: "calc", category: "math", name: "科学计算器", desc: "科学计算器，支持三角函数、对数、阶乘等", keywords: "计算器 calculator 科学 sin cos log" },
  { id: "procalc", category: "math", name: "进制计算器", desc: "位运算：AND / OR / XOR / NOT / 移位，按位宽解释", keywords: "位运算 进制 and or xor 移位 calculator" },
  { id: "percent", category: "math", name: "百分比计算", desc: "比例、变化率、增减后数值计算", keywords: "百分比 percent 比例 计算" },
  { id: "fraction", category: "math", name: "分数 / 小数", desc: "分数与小数互转、分数四则运算", keywords: "分数 fraction 小数 运算" },
  // 日期时间
  { id: "interval", category: "datetime", name: "日期间隔", desc: "两个日期的差值，或日期加减天数", keywords: "日期 间隔 相差 加减 days" },
  { id: "age", category: "datetime", name: "年龄计算", desc: "周岁年龄、总天数与下一个生日", keywords: "年龄 生日 周岁 age" },
  { id: "workday", category: "datetime", name: "工作日计算", desc: "区间工作日统计，支持节假日与调休", keywords: "工作日 workday 上班 加班 调休 节假日" },
  { id: "tz", category: "datetime", name: "时区转换", desc: "IANA 时区互转与世界时钟", keywords: "时区 timezone 转换 utc gmt" },
  // 单位换算
  { id: "length", category: "units", name: "长度换算", desc: "米 / 公里 / 英里 / 市里等长度单位换算", keywords: "长度 米 公里 英里 英寸 length" },
  { id: "weight", category: "units", name: "重量换算", desc: "千克 / 磅 / 市斤 / 两等单位换算", keywords: "重量 千克 斤 磅 克 weight" },
  { id: "temp", category: "units", name: "温度换算", desc: "摄氏度 / 华氏度 / 开尔文互转", keywords: "温度 摄氏 华氏 开尔文 temperature" },
  { id: "area", category: "units", name: "面积换算", desc: "平方米 / 公顷 / 亩 / 英亩等面积换算", keywords: "面积 平方米 亩 公顷 area" },
  { id: "volume", category: "units", name: "体积换算", desc: "升 / 毫升 / 加仑 / 立方米等体积换算", keywords: "体积 升 毫升 加仑 volume" },
  { id: "data", category: "units", name: "存储换算", desc: "bit / B / KB / MB / GB，含 1024 进制", keywords: "存储 数据 data 字节 bit 硬盘" },
  // 生活
  { id: "bmi", category: "life", name: "BMI 计算", desc: "身体质量指数与健康体重范围", keywords: "bmi 体重 身高 健康 指数" },
  { id: "loan", category: "life", name: "房贷 / 车贷", desc: "等额本息 / 等额本金月供与还款明细", keywords: "房贷 车贷 贷款 月供 等额本息 等额本金 loan" },
  { id: "interest", category: "life", name: "利息计算", desc: "单利 / 复利 / 定投收益计算", keywords: "利息 复利 单利 定投 收益 interest" },
  { id: "tax", category: "life", name: "个税估算", desc: "年度综合所得个税估算（2024 税率）", keywords: "个税 税 工资 收入 五险一金 tax" },
];

export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

export const TOOL_MAP: Record<string, ToolMeta> = Object.fromEntries(
  TOOLS.map((t) => [t.id, t]),
);

export function toolsOfCategory(catId: string): ToolMeta[] {
  return TOOLS.filter((t) => t.category === catId);
}
