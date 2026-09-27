# Afx Cal

面向开发与日常编码的**计算器 / 工具箱**。基于 **Next.js 16 + React 19 + Tailwind CSS 4**，每个工具都是独立的页面路径，主页导航统一入口，全部计算在浏览器本地完成。

## 功能一览（9 大分类 · 38 个工具）

### 🔣 编解码
- Base64 编码 / 解码（UTF-8、URL-safe 变体）
- URL Encode / Decode（空格可编码为 `%20` 或 `+`）
- Hex 编码 / 解码（空格 / `0x` 前缀输出）
- Unicode 转义（`\uXXXX` / `\u{...}` 两种风格）
- HTML 实体编码 / 解码（可全部转数字实体）

### 📐 格式化
- JSON 格式化 / 压缩（缩进、键排序）
- XML 美化
- SQL 格式化（支持 MySQL、PostgreSQL、SQLite、TSQL 等十余种方言）
- CSS / JS / HTML 美化（js-beautify）

### 🔐 加密哈希
- MD5、SHA-1 / 256 / 384 / 512（Hex / Base64 / URL-safe 输出）
- HMAC-MD5 / HMAC-SHA 系列
- AES 加解密（CBC / ECB / CTR；口令模式为 OpenSSL 格式，或 Base64 / Hex 原始密钥）

### 🛠️ 开发辅助
- JWT 解码（含 HS256 / 384 / 512 签名校验）
- 正则测试（实时高亮、捕获组列表）
- 时间戳转换（秒 / 毫秒自动识别）
- UUID v4 批量生成
- 二维码生成（PNG / SVG 下载）

### 🎨 颜色 / 单位
- HEX / RGB / HSL 互转（色块、亮度、对比度）
- px / rem 换算（自定义基准字号 + 常用值速查）
- 进制转换（2–36 任意进制，BigInt 精度，支持补码）

### 🧮 数学
- 科学计算器（表达式解析，支持三角 / 对数 / 阶乘 / 隐式乘法）
- 进制计算器（AND / OR / XOR / NOT / 移位，8–64 位字长）
- 百分比计算（占比、变化率、增减）
- 分数 / 小数互转与分数四则运算

### 📅 日期时间
- 日期间隔（EDATE 语义的月差）与日期加减
- 年龄计算（周岁、下一个生日倒计时）
- 工作日计算（节假日 / 调休支持）
- 时区转换（IANA 时区 + 世界时钟）

### 📏 单位换算
- 长度 / 重量 / 温度 / 面积 / 体积 / 数据存储（含市制单位：斤、亩、里等，存储含 1000 与 1024 两种进制）

### 🏠 生活
- BMI 计算（公制 / 英制，健康体重范围）
- 房贷 / 车贷（等额本息 / 等额本金，含还款明细表）
- 利息计算（单利 / 复利 / 定投）
- 个税估算（年度综合所得，2024 税率表）

## 路由结构

所有对外访问的路由都从根级 `/` 开始：

- `/` — 主页导航（分类卡片 + 搜索）
- `/base64`、`/json`、`/aes` … — 每个工具一个独立根级路径（共 38 个）
- 未知路径返回 404（`dynamicParams = false`，仅预渲染存在的工具）

## 快速开始

项目使用 [pnpm](https://pnpm.io/) 管理依赖：

```bash
pnpm install       # 安装依赖
pnpm dev           # 开发模式 http://localhost:3000
pnpm build         # 生产构建（全部页面静态预渲染）
pnpm start         # 生产服务
pnpm test          # 纯逻辑单元测试（Node 原生 TS 运行）
pnpm typecheck     # TypeScript 类型检查
pnpm run audit:online  # 依赖安全审计（走官方 registry）
```

## 目录结构

```
├── app/
│   ├── layout.tsx          # 根布局（侧边栏 + 主题 + Toast）
│   ├── page.tsx            # 主页
│   ├── globals.css         # Tailwind v4 全局样式
│   └── [id]/page.tsx         # 工具路由（generateStaticParams + metadata）
├── components/
│   ├── Sidebar.tsx         # 分组导航侧边栏（移动端抽屉）
│   ├── HomePage.tsx        # 主页导航（分类卡片 + 搜索）
│   ├── ToolShell.tsx       # 工具页壳（面包屑、上下工具切换）
│   ├── ToolPageClient.tsx  # 工具页客户端实现（组件查表）
│   ├── ThemeToggle.tsx     # 深色 / 浅色 / 跟随系统切换
│   ├── UnitConverter.tsx   # 单位换算通用组件
│   ├── ui.tsx              # 共享 UI（表单、转换器、结果框、表格）
│   └── tools/              # 38 个工具组件（各工具独立文件）
├── lib/
│   ├── meta.ts             # 工具注册元数据（分类、描述、关键词）
│   ├── registry.tsx        # 工具组件注册表
│   ├── utils.ts            # 纯函数库（编码、进制、日期、金融、BMI…）
│   ├── units.ts            # 单位换算表
│   └── xml.ts              # XML 格式化器
├── scripts/
│   └── build-standalone.mjs # standalone 产物构建（自动补全静态资源）
└── test/run-tests.mts      # 单元测试（56 用例）
```

## 技术栈

- **Next.js 16.3**（App Router，Turbopack 默认构建）+ **React 19.2**
- **Tailwind CSS 4**（`@custom-variant dark` 深色模式）
- **TypeScript 5.9**（strict）
- **pnpm** 管理依赖

## 技术要点

- **Next.js 16 App Router**：每个工具独立根级路径 `/[id]`（如 `/base64`），`generateStaticParams` 全量静态预渲染
- **Tailwind CSS 4**：`@custom-variant dark` 实现深色模式（跟随系统 / 手动切换）
- **纯函数分层**：`lib/utils.ts` 等无 DOM 依赖，可用 Node 直接做单元测试
- 依赖库：CryptoJS（哈希 / HMAC / AES）、js-beautify、sql-formatter、qrcode

## 部署

支持 [Vercel](https://vercel.com/) 及任意 Node 托管：

```bash
# Vercel（推荐）—— 由 Vercel 自动处理构建产物
vercel

# 自托管：常规产物
pnpm build && pnpm start

# 自托管：standalone 精简产物（Docker 等，会自动补齐静态资源）
pnpm build:standalone && pnpm start:standalone
```

`next.config.ts` 默认生成常规产物（`next start` 官方支持）；仅当 `NEXT_OUTPUT=standalone` 时生成 standalone 产物，此时应使用 `node .next/standalone/server.js` 启动（该组合下 `next start` 不受支持并会告警）。

> 注意：加密类工具仅供开发调试使用，全部运算在浏览器本地完成，不适用于安全敏感场景。

## License

[MIT](LICENSE)
